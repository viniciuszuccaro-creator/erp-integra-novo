import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// propagateGroupConfigs — propagação bidirecional Grupo ↔ Empresas
// Suporta: chamada direta (admin), automação agendada (service role)
// Body: { group_id?, empresa_id?, direction?, entidades?, strategy?, empresas_ids? }
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user = null;
    try { user = await base44.auth.me(); } catch (_) { console.error('[propagateGroupConfigs] catch:', _); }
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    let raw = {};
    try {
      const text = await req.text();
      raw = text ? JSON.parse(text) : {};
    } catch (_) { raw = {}; }
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
      // Sistema & Configurações
      'ConfiguracaoSistema', 'IAConfig', 'EventoNotificacao', 'ModeloDocumento',
    ];
    entidades = Array.isArray(entidades) && entidades.length ? entidades : DEFAULT_ENTIDADES;
    strategy = strategy || 'merge'; // 'skip' | 'merge' | 'override'

    // Regra-Mãe 9 — CADASTROS ÚNICOS: propagação por COMPARTILHAMENTO (empresas_compartilhadas_ids),
    // nunca por duplicação de registros por empresa (alinhado ao syncBidirectional CATALOG_UNIQUE).
    const CATALOG_UNIQUE = new Set([
      'ConfiguracaoSistema', 'PerfilAcesso', 'FormaPagamento', 'PlanoDeContas', 'CentroCusto',
      'TabelaPreco', 'TabelaPrecoItem', 'CondicaoComercial', 'TipoDespesa', 'Banco',
      'Produto', 'GrupoProduto', 'Marca', 'SetorAtividade', 'UnidadeMedida',
      'LocalEstoque', 'KitProduto', 'Cliente', 'Fornecedor', 'Transportadora', 'Representante',
      'Colaborador', 'ContatoB2B', 'SegmentoCliente', 'RegiaoAtendimento',
      'Departamento', 'Cargo', 'Turno', 'Veiculo', 'Motorista', 'TipoFrete', 'RotaPadrao',
      'TabelaNCM', // schema: ncm/descricao "único por grupo" — cadastro compartilhado, nunca duplicar
    ]);
    // Subset com o campo empresas_compartilhadas_ids no schema (compartilhamento explícito)
    const CATALOG_SHARED = new Set([
      'Cliente', 'Fornecedor', 'Transportadora', 'Representante', 'Produto', 'RegiaoAtendimento',
    ]);

    if (!groupId && empresaId) {
      const emp = await base44.asServiceRole.entities.Empresa.filter({ id: empresaId }, undefined, 1).then(r => r?.[0]).catch(() => null);
      groupId = emp?.group_id || null;
    }

    // Automação agendada não recebe group_id — busca o primeiro GrupoEmpresarial ativo automaticamente
    if (!groupId) {
      const grupo = await base44.asServiceRole.entities.GrupoEmpresarial
        .filter({ status: 'Ativo' }, undefined, 1)
        .then(r => r?.[0])
        .catch(() => null);
      groupId = grupo?.id || null;
    }

    // Último fallback: pega qualquer grupo existente
    if (!groupId) {
      const grupo = await base44.asServiceRole.entities.GrupoEmpresarial
        .list(undefined, 1)
        .then(r => r?.[0])
        .catch(() => null);
      groupId = grupo?.id || null;
    }

    if (!groupId) return Response.json({ error: 'group_id obrigatório — nenhum GrupoEmpresarial encontrado' }, { status: 400 });

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
        TabelaFiscal: ['nome_regra', 'cfop'],
        ConfiguracaoNFe: ['ambiente', 'serie_nfe'],
        TabelaNCM: ['ncm'],
        ConfiguracaoSistema: ['chave'],
        IAConfig: ['chave'],
        EventoNotificacao: ['nome_evento'],
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
      if (!targetEmpresas.length) return { entity: entityName, created: 0, updated: 0, skipped: 0, total_source: 0, direction: 'grupo_to_empresas' };
      // Busca registros do grupo — inclui legacy (group_id: null) para ConfiguracaoSistema e IAConfig
      const isConfigEntity = entityName === 'ConfiguracaoSistema' || entityName === 'IAConfig';
      let baseRegs = await base44.asServiceRole.entities[entityName].filter({ group_id: groupId }, undefined, 5000).catch(() => []);
      if (isConfigEntity && !baseRegs.length) {
        baseRegs = await base44.asServiceRole.entities[entityName].filter({ group_id: null, empresa_id: null }, undefined, 5000).catch(() => []);
      }
      if (!baseRegs.length) return { entity: entityName, created: 0, updated: 0, skipped: 0, total_source: 0, direction: 'grupo_to_empresas' };

      // Regra-Mãe 9 — CADASTROS ÚNICOS: nunca duplicar cadastro por empresa.
      // Compartilha via empresas_compartilhadas_ids no registro canônico do grupo (idempotente).
      if (CATALOG_UNIQUE.has(entityName)) {
        let sharedUpdated = 0;
        if (CATALOG_SHARED.has(entityName) && targetEmpresas.length) {
          const empresaIds = targetEmpresas.map(e => e.id).filter(Boolean);
          const toShare = [];
          for (const r of baseRegs) {
            const atuais = Array.isArray(r.empresas_compartilhadas_ids) ? r.empresas_compartilhadas_ids.filter(Boolean) : [];
            const merged = Array.from(new Set([...atuais, ...empresaIds]));
            if (merged.length !== atuais.length) {
              const patch = { empresas_compartilhadas_ids: merged };
              if (entityName === 'Produto') patch.compartilhado_grupo = true;
              toShare.push({ id: r.id, patch });
            }
          }
          for (const { id, patch } of toShare) {
            try { await base44.asServiceRole.entities[entityName].update(id, patch); sharedUpdated++; } catch (e) { console.error('[propagateGroupConfigs] share:', e); }
          }
        }
        return { entity: entityName, mode: 'cadastro_unico_compartilhado', created: 0, updated: sharedUpdated, skipped: baseRegs.length, total_source: baseRegs.length, direction: 'grupo_to_empresas' };
      }

      const keys = keyFieldsByEntity(entityName);
      let created = 0, updated = 0, skipped = 0;

      // BATCH: busca registros existentes em paralelo (uma chamada por empresa)
      const existingByEmpresa = new Map(); // key: `${empresaId}:${keyVal}` → record
      await Promise.all(targetEmpresas.map(async (emp) => {
        const regs = await base44.asServiceRole.entities[entityName]
          .filter({ empresa_id: emp.id }, undefined, 5000).catch(() => []);
        for (const ex of (Array.isArray(regs) ? regs : [])) {
          const keyField = keys.find(k => ex?.[k]);
          if (keyField) {
            existingByEmpresa.set(`${emp.id}:${String(ex[keyField])}`, ex);
          }
        }
      }));

      const toCreate = [];
      const toUpdate = [];
      for (const emp of targetEmpresas) {
        for (const r of baseRegs) {
          const payload = sanitize(isConfigEntity
            ? { ...r, empresa_id: emp.id }
            : { ...r, group_id: undefined, empresa_id: emp.id });
          const keyField = keys.find(k => r?.[k]);
          const keyVal = keyField ? String(r[keyField]) : null;
          if (!keyVal) { skipped++; continue; } // sem campo-chave: nunca copiar (evita duplicação a cada execução)
          const existing = existingByEmpresa.get(`${emp.id}:${keyVal}`);
          if (existing) {
            if (strategy === 'override') {
              toUpdate.push({ id: existing.id, payload });
            } else if (strategy === 'merge') {
              const patch = {};
              for (const [k, v] of Object.entries(payload)) if (existing[k] == null) patch[k] = v;
              if (Object.keys(patch).length) toUpdate.push({ id: existing.id, payload: patch });
              else skipped++;
            } else { skipped++; }
          } else {
            toCreate.push(payload);
          }
        }
      }
      // Bulk create (lotes de 100 para evitar timeout)
      for (let i = 0; i < toCreate.length; i += 100) {
        const chunk = toCreate.slice(i, i + 100);
        try { await base44.asServiceRole.entities[entityName].bulkCreate(chunk); created += chunk.length; } catch (_) { console.error('[propagateGroupConfigs] catch:', _); }
      }
      // Bulk update (up to 500 per call) — deduplica por ID para evitar "Duplicate entity IDs"
      const updateById = new Map();
      for (const { id, payload: patch } of toUpdate) {
        if (!updateById.has(id)) {
          updateById.set(id, { id, ...patch });
        } else {
          // Merge patches para o mesmo ID
          const existing = updateById.get(id);
          Object.assign(existing, patch);
        }
      }
      const bulkUpdatePayload = [...updateById.values()];
      for (let i = 0; i < bulkUpdatePayload.length; i += 500) {
        const chunk = bulkUpdatePayload.slice(i, i + 500);
        try { await base44.asServiceRole.entities[entityName].bulkUpdate(chunk); updated += chunk.length; } catch (_) { console.error('[propagateGroupConfigs] catch:', _); }
      }
      return { entity: entityName, created, updated, skipped, total_source: baseRegs.length, direction: 'grupo_to_empresas' };
    };

    const copyEmpresaToGroup = async (entityName, empresaOrigemId) => {
      if (!base44.asServiceRole.entities?.[entityName]) return { entity: entityName, skipped: 'not-found' };
      // Regra-Mãe 9 — CADASTROS ÚNICOS: o registro canônico vive no grupo; cópias por empresa
      // são legacy e NUNCA propagam UP por duplicação (evita duplicar o cadastro no grupo).
      if (CATALOG_UNIQUE.has(entityName)) {
        return { entity: entityName, mode: 'cadastro_unico_compartilhado', created: 0, updated: 0, skipped: 'catalog-unico', total_source: 0, direction: 'empresa_to_grupo' };
      }
      const baseRegs = await base44.asServiceRole.entities[entityName].filter({ empresa_id: empresaOrigemId }, undefined, 5000).catch(() => []);
      if (!baseRegs.length) return { entity: entityName, created: 0, updated: 0, skipped: 0, total_source: 0, direction: 'empresa_to_grupo' };
      const keys = keyFieldsByEntity(entityName);
      // Inclui registros legacy (group_id: null) para ConfiguracaoSistema
      const isConfigEntity = entityName === 'ConfiguracaoSistema' || entityName === 'IAConfig';
      let groupRegs = await base44.asServiceRole.entities[entityName].filter({ group_id: groupId }, undefined, 5000).catch(() => []);
      if (isConfigEntity && !groupRegs.length) {
        groupRegs = await base44.asServiceRole.entities[entityName].filter({ group_id: null, empresa_id: null }, undefined, 5000).catch(() => []);
      }
      const groupKeyMap = new Map();
      for (const gr of groupRegs) {
        const keyField = keys.find(k => gr?.[k]);
        if (keyField) groupKeyMap.set(String(gr[keyField]), gr);
      }
      let created = 0, updated = 0, skipped = 0;
      const toCreate = [];
      const toUpdate = [];
      for (const r of baseRegs) {
        // Para ConfiguracaoSistema: cria cópia no nível do grupo (sem empresa_id)
        const isConfigEntity = entityName === 'ConfiguracaoSistema' || entityName === 'IAConfig';
        const payload = sanitize(isConfigEntity
          ? { ...r, empresa_id: undefined, group_id: groupId }
          : { ...r, empresa_id: undefined, group_id: groupId });
        const keyField = keys.find(k => r?.[k]);
        const keyVal = keyField ? String(r[keyField]) : null;
        if (!keyVal) { skipped++; continue; } // sem campo-chave: nunca copiar (evita duplicação a cada execução)
        const existing = groupKeyMap.get(keyVal);
        if (existing) {
          if (strategy === 'override') {
            toUpdate.push({ id: existing.id, payload });
          } else if (strategy === 'merge') {
            const patch = {};
            for (const [k, v] of Object.entries(payload)) if (existing[k] == null) patch[k] = v;
            if (Object.keys(patch).length) toUpdate.push({ id: existing.id, payload: patch });
            else skipped++;
          } else { skipped++; }
        } else {
          toCreate.push(payload);
        }
      }
      // Bulk create missing records (lotes de 100)
      for (let i = 0; i < toCreate.length; i += 100) {
        const chunk = toCreate.slice(i, i + 100);
        try { await base44.asServiceRole.entities[entityName].bulkCreate(chunk); created += chunk.length; } catch (_) { console.error('[propagateGroupConfigs] catch:', _); }
      }
      // Bulk update (up to 500 per call) — deduplica por ID
      const updateById2 = new Map();
      for (const { id, payload: patch } of toUpdate) {
        if (!updateById2.has(id)) {
          updateById2.set(id, { id, ...patch });
        } else {
          Object.assign(updateById2.get(id), patch);
        }
      }
      const bulkUpdatePayload2 = [...updateById2.values()];
      for (let i = 0; i < bulkUpdatePayload2.length; i += 500) {
        const chunk = bulkUpdatePayload2.slice(i, i + 500);
        try { await base44.asServiceRole.entities[entityName].bulkUpdate(chunk); updated += chunk.length; } catch (_) { console.error('[propagateGroupConfigs] catch:', _); }
      }
      return { entity: entityName, created, updated, skipped, total_source: baseRegs.length, direction: 'empresa_to_grupo' };
    };

    const results = [];

    // "ambos" executa as duas direções sequencialmente
    const runDown = direction === 'grupo_to_empresas' || direction === 'ambos' || direction === 'both';
    const runUp = direction === 'empresa_to_grupo' || direction === 'ambos' || direction === 'both';

    if (runDown) {
      for (const en of entidades) {
        try { results.push(await copyGroupToEmpresas(en)); } catch (e) { results.push({ entity: en, error: e.message }); }
        await sleep(50);
      }
    }

    if (runUp) {
      const ids = Array.isArray(empresas_ids) && empresas_ids.length ? empresas_ids : (empresaId ? [empresaId] : []);
      if (!ids.length && !runDown) {
        return Response.json({ error: 'empresa_id ou empresas_ids obrigatório para empresa_to_grupo' }, { status: 400 });
      }
      for (const eid of ids) {
        for (const en of entidades) {
          try { results.push(await copyEmpresaToGroup(en, eid)); } catch (e) { results.push({ entity: en, error: e.message }); }
          await sleep(50);
        }
      }
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
    } catch (e) { console.error('[propagateGroupConfigs] catch:', e); }

    return Response.json({ ok: true, group_id: groupId, empresa_id: empresaId || null, direction, strategy, results });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});