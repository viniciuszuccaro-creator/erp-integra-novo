import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// propagateGroupConfigs — propagação bidirecional Grupo ↔ Empresas
// Suporta: chamada direta (admin), automação agendada (service role)
// Body: { group_id?, empresa_id?, direction?, entidades?, strategy?, empresas_ids? }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_) {}
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const raw = await req.json().catch(() => ({}));
    const event = raw?.event || null;
    const data = raw?.data || null;

    const input = event ? {
      group_id: data?.group_id ?? raw?.group_id ?? null,
      empresa_id: data?.empresa_id ?? raw?.empresa_id ?? null,
      direction: raw?.direction,
      entidades: raw?.entidades,
      strategy: raw?.strategy,
      empresas_ids: raw?.empresas_ids
    } : raw;

    let { group_id: groupId, empresa_id: empresaId, direction, entidades, strategy, empresas_ids } = input || {};
    direction = direction || (empresaId && !groupId ? 'empresa_to_grupo' : 'grupo_to_empresas');

    // Lista completa de entidades propagáveis (inclui transacionais e cadastros)
    const DEFAULT_ENTIDADES = [
      // Financeiro & Fiscal
      'PlanoDeContas', 'CentroCusto', 'CentroResultado', 'TipoDespesa', 'MoedaIndice',
      'FormaPagamento', 'CondicaoComercial', 'TabelaFiscal', 'Banco', 'ContaBancariaEmpresa',
      'GatewayPagamento', 'ConfiguracaoGatewayPagamento',
      // Produtos & Serviços ← inclui Produto e Fornecedor agora
      'GrupoProduto', 'Marca', 'SetorAtividade', 'UnidadeMedida', 'Servico',
      'Produto', 'Fornecedor',
      // Logística ← inclui Entrega
      'TipoFrete', 'LocalEstoque', 'RotaPadrao', 'Transportadora', 'Veiculo', 'Motorista',
      // Estrutura Organizacional
      'Cargo', 'Departamento', 'Turno', 'PerfilAcesso',
      // Comercial & CRM ← inclui Cliente e NotaFiscal
      'SegmentoCliente', 'RegiaoAtendimento', 'TabelaPreco', 'KitProduto',
      'Cliente',
      // Fiscal ← NF-e agora propagável DOWN
      'ConfiguracaoNFe', 'TabelaNCM',
      // Cadastros Gerais
      'ModeloDocumento', 'ContatoB2B', 'Representante',
      // Parâmetros
      'ParametroOrigemPedido', 'ParametroPortalCliente', 'ParametroRoteirizacao',
      'ParametroConciliacaoBancaria', 'ParametroCaixaDiario',
      // Chatbot & Templates
      'TemplateWhatsApp', 'ChatbotIntent',
    ];
    entidades = Array.isArray(entidades) && entidades.length ? entidades : DEFAULT_ENTIDADES;
    strategy = strategy || 'merge'; // 'skip' | 'merge' | 'override'

    if (!groupId && empresaId) {
      const emp = await base44.asServiceRole.entities.Empresa.filter({ id: empresaId }, undefined, 1).then(r => r?.[0]).catch(() => null);
      groupId = emp?.group_id || null;
    }
    if (!groupId) return Response.json({ error: 'group_id obrigatório' }, { status: 400 });

    const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, undefined, 500).catch(() => []);
    const targetEmpresas = Array.isArray(empresas_ids) && empresas_ids.length
      ? empresas.filter(e => empresas_ids.includes(e.id))
      : empresas;

    const sleep = (ms) => new Promise(r => setTimeout(r, ms));

    const keyFieldsByEntity = (en) => {
      const map = {
        Cliente: ['cnpj', 'cpf', 'nome', 'razao_social'],
        Fornecedor: ['cnpj', 'cpf', 'nome', 'razao_social'],
        Transportadora: ['cnpj', 'razao_social'],
        PlanoDeContas: ['codigo', 'descricao'],
        CentroCusto: ['codigo', 'descricao'],
        TabelaPreco: ['nome', 'codigo'],
        PerfilAcesso: ['nome_perfil'],
        Marca: ['nome_marca'],
        GrupoProduto: ['nome_grupo', 'codigo'],
        FormaPagamento: ['descricao', 'nome'],
        Banco: ['codigo', 'nome'],
        Cargo: ['nome_cargo'],
        Departamento: ['nome_departamento'],
        Turno: ['nome_turno'],
        SegmentoCliente: ['nome_segmento'],
        RegiaoAtendimento: ['nome_regiao', 'codigo_regiao'],
        ModeloDocumento: ['nome', 'tipo'],
      };
      return map[en] || ['codigo', 'descricao', 'nome', 'titulo'];
    };

    const sanitize = (obj) => {
      if (!obj || typeof obj !== 'object') return obj;
      const out = Array.isArray(obj) ? [] : {};
      for (const [k, v] of Object.entries(obj)) {
        if (['id','created_date','updated_date','created_by'].includes(k)) continue;
        out[k] = (v && typeof v === 'object') ? sanitize(v) : (typeof v === 'string' ? v.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi,'').replace(/javascript:\s*/gi,'') : v);
      }
      return out;
    };

    const copyGroupToEmpresas = async (entityName) => {
      if (!base44.asServiceRole.entities?.[entityName]) return { entity: entityName, skipped: 'not-found' };
      const baseRegs = await base44.asServiceRole.entities[entityName].filter({ group_id: groupId }, undefined, 5000).catch(() => []);
      if (!baseRegs.length) return { entity: entityName, created: 0, updated: 0, skipped: 0, total_source: 0, direction: 'grupo_to_empresas' };
      const keys = keyFieldsByEntity(entityName);
      let created = 0, updated = 0, skipped = 0;
      for (const emp of targetEmpresas) {
        for (let i = 0; i < baseRegs.length; i += 50) {
          const chunk = baseRegs.slice(i, i + 50);
          for (const r of chunk) {
            const payload = sanitize({ ...r, group_id: undefined, empresa_id: emp.id });
            const keyField = keys.find(k => r?.[k]);
            const filtro = { empresa_id: emp.id };
            if (keyField) filtro[keyField] = r[keyField];
            const existing = await base44.asServiceRole.entities[entityName].filter(filtro, undefined, 1).then(x => x?.[0]).catch(() => null);
            if (existing) {
              if (strategy === 'override') {
                await base44.asServiceRole.entities[entityName].update(existing.id, payload).catch(() => {});
                updated++;
              } else if (strategy === 'merge') {
                const patch = {};
                for (const [k, v] of Object.entries(payload)) if (existing[k] == null) patch[k] = v;
                if (Object.keys(patch).length) { await base44.asServiceRole.entities[entityName].update(existing.id, patch).catch(() => {}); updated++; } else { skipped++; }
              } else { skipped++; }
            } else {
              await base44.asServiceRole.entities[entityName].create(payload).catch(() => {});
              created++;
            }
          }
          if (i + 50 < baseRegs.length) await sleep(150);
        }
      }
      return { entity: entityName, created, updated, skipped, total_source: baseRegs.length, direction: 'grupo_to_empresas' };
    };

    const copyEmpresaToGroup = async (entityName, empresaOrigemId) => {
      if (!base44.asServiceRole.entities?.[entityName]) return { entity: entityName, skipped: 'not-found' };
      const baseRegs = await base44.asServiceRole.entities[entityName].filter({ empresa_id: empresaOrigemId }, undefined, 5000).catch(() => []);
      if (!baseRegs.length) return { entity: entityName, created: 0, updated: 0, skipped: 0, total_source: 0, direction: 'empresa_to_grupo' };
      const keys = keyFieldsByEntity(entityName);
      let created = 0, updated = 0, skipped = 0;
      for (const r of baseRegs) {
        const payload = sanitize({ ...r, empresa_id: undefined, group_id: groupId });
        const keyField = keys.find(k => r?.[k]);
        const filtro = { group_id: groupId };
        if (keyField) filtro[keyField] = r[keyField];
        const existing = await base44.asServiceRole.entities[entityName].filter(filtro, undefined, 1).then(x => x?.[0]).catch(() => null);
        if (existing) {
          if (strategy === 'override') {
            await base44.asServiceRole.entities[entityName].update(existing.id, payload).catch(() => {}); updated++;
          } else if (strategy === 'merge') {
            const patch = {};
            for (const [k, v] of Object.entries(payload)) if (existing[k] == null) patch[k] = v;
            if (Object.keys(patch).length) { await base44.asServiceRole.entities[entityName].update(existing.id, patch).catch(() => {}); updated++; } else { skipped++; }
          } else { skipped++; }
        } else {
          await base44.asServiceRole.entities[entityName].create(payload).catch(() => {}); created++;
        }
      }
      return { entity: entityName, created, updated, skipped, total_source: baseRegs.length, direction: 'empresa_to_grupo' };
    };

    const results = [];
    if (direction === 'grupo_to_empresas') {
      for (const en of entidades) results.push(await copyGroupToEmpresas(en));
    } else if (direction === 'empresa_to_grupo') {
      const ids = Array.isArray(empresas_ids) && empresas_ids.length ? empresas_ids : (empresaId ? [empresaId] : []);
      if (!ids.length) return Response.json({ error: 'empresa_id ou empresas_ids obrigatório para empresa_to_grupo' }, { status: 400 });
      for (const eid of ids) for (const en of entidades) results.push(await copyEmpresaToGroup(en, eid));
    }

    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user ? (user.full_name || user.email || 'Admin') : 'Sistema Agendado',
        usuario_id: user?.id || null,
        acao: 'Execução', modulo: 'Sistema', tipo_auditoria: 'sistema', entidade: 'PropagacaoGrupo',
        descricao: `Propagação ${direction} — ${entidades.length} entidades`,
        dados_novos: { group_id: groupId, empresa_id: empresaId || null, direction, strategy, total_entidades: entidades.length, results },
        data_hora: new Date().toISOString()
      });
    } catch {}

    return Response.json({ ok: true, group_id: groupId, empresa_id: empresaId || null, direction, strategy, results });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});