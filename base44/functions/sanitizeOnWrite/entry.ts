import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Entidades de catálogo global que NÃO precisam de escopo empresa/grupo
const SIMPLE_CATALOG = new Set([
  'Banco','FormaPagamento','TipoDespesa','MoedaIndice','TipoFrete',
  'UnidadeMedida','Departamento','Cargo','Turno','GrupoProduto','Marca',
  'SetorAtividade','LocalEstoque','TabelaFiscal','CentroResultado',
  'OperadorCaixa','RotaPadrao','ModeloDocumento','KitProduto','CatalogoWeb',
  'Servico','CondicaoComercial','TabelaPreco','PerfilAcesso',
  'ConfiguracaoNFe','ConfiguracaoBoletos','ConfiguracaoWhatsApp',
  'GatewayPagamento','ApiExterna','Webhook','ChatbotIntent','ChatbotCanal',
  'JobAgendado','EventoNotificacao','SegmentoCliente','RegiaoAtendimento',
  'ContatoB2B','CentroCusto','PlanoDeContas','PlanoContas',
  'Veiculo','Motorista','Representante','GrupoEmpresarial','Empresa',
  'TabelaPrecoItem','CentroOperacao','ConfiguracaoDespesaRecorrente',
  'AuditLog','Notificacao','ConfiguracaoSistema',
]);

// Sanitização genérica de entradas para entidades críticas (previne XSS e payloads suspeitos)
// Acionado por automações de entidade em events: create/update
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    let payload = {};
    try { payload = await req.json(); } catch { payload = {}; }

    const event = payload?.event;
    const data = payload?.data;
    const oldData = payload?.old_data;

    if (!event || !event.entity_name || !event.entity_id || !data) {
      return Response.json({ ok: true, skipped: true, reason: 'Payload incompleto' });
    }

    // Função de sanitização simples: remove tags <script>, eventos inline e URLs javascript:
    const sanitizeString = (s) => {
      let out = String(s);
      out = out.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '');
      out = out.replace(/on[a-z]+\s*=\s*"[^"]*"/gi, '');
      out = out.replace(/on[a-z]+\s*=\s*'[^']*'/gi, '');
      out = out.replace(/javascript:\s*/gi, '');
      return out;
    };

    const sanitizeValue = (v) => {
      if (typeof v === 'string') return sanitizeString(v);
      if (Array.isArray(v)) return v.map((x) => sanitizeValue(x));
      if (v && typeof v === 'object') {
        const o = {};
        for (const [k, val] of Object.entries(v)) o[k] = sanitizeValue(val);
        return o;
      }
      return v;
    };

    const sanitized = sanitizeValue(data);

    // === TRAVA GLOBAL DE UNICIDADE (Regra-Mãe §5c: validação dupla em ações sensíveis) ===
    // Executa em create E update para entidades do Cadastro Gerais
    const CADASTRO_GERAIS_ENTITIES = new Set([
      'Cliente','Fornecedor','Transportadora','Colaborador','Representante','ContatoB2B',
      'SegmentoCliente','RegiaoAtendimento','Produto','Servico','SetorAtividade','GrupoProduto',
      'Marca','TabelaPreco','KitProduto','CatalogoWeb','UnidadeMedida','Banco','FormaPagamento',
      'PlanoDeContas','CentroCusto','CentroResultado','TipoDespesa','MoedaIndice','OperadorCaixa',
      'ConfiguracaoDespesaRecorrente','TabelaFiscal','CondicaoComercial','Veiculo','Motorista',
      'TipoFrete','LocalEstoque','RotaPadrao','ModeloDocumento','Empresa','GrupoEmpresarial',
      'Departamento','Cargo','Turno','PerfilAcesso','ApiExterna','ChatbotCanal','ChatbotIntent',
      'JobAgendado','Webhook','ConfiguracaoNFe','GatewayPagamento','EventoNotificacao',
    ]);

    if ((event.type === 'create' || event.type === 'update') && CADASTRO_GERAIS_ENTITIES.has(event.entity_name)) {
      try {
        const api = base44.asServiceRole.entities[event.entity_name];
        if (api) {
          // Extrai chaves de duplicidade do registro
          const cnpjRaw = data?.cnpj ? String(data.cnpj).replace(/\D/g, '') : '';
          const cpfRaw = data?.cpf ? String(data.cpf).replace(/\D/g, '') : '';
          const placa = data?.placa ? String(data.placa).toUpperCase().trim() : '';
          // Mapeamento entidade → campo de código único (Regra-Mãe §5c)
          const CODE_FIELD_MAP = {
            Banco: 'codigo_banco', Servico: 'codigo_servico', KitProduto: 'codigo_kit',
            OperadorCaixa: 'codigo_operador',
          };
          const codeField = CODE_FIELD_MAP[event.entity_name] || 'codigo';
          const codigo = String(data?.[codeField] || '').toLowerCase().trim();

          // Mapeamento entidade → campo de nome/descrição principal
          const NAME_FIELD_MAP = {
            Produto: 'descricao', Servico: 'descricao', TabelaPreco: 'nome',
            UnidadeMedida: 'nome_completo', PlanoDeContas: 'nome_conta', CentroCusto: 'descricao',
            Banco: 'nome_banco', Veiculo: 'placa', ModeloDocumento: 'nome_modelo',
            Marca: 'nome_marca', SegmentoCliente: 'nome_segmento', RegiaoAtendimento: 'nome_regiao',
            GrupoProduto: 'nome_grupo', KitProduto: 'nome_kit', SetorAtividade: 'nome',
            PerfilAcesso: 'nome_perfil', Cargo: 'nome_cargo', Departamento: 'nome_departamento',
            Turno: 'nome_turno', CondicaoComercial: 'nome_condicao', Empresa: 'razao_social',
            GrupoEmpresarial: 'nome_do_grupo', TipoFrete: 'nome', LocalEstoque: 'nome',
            RotaPadrao: 'nome_rota', TipoDespesa: 'nome', MoedaIndice: 'nome',
            OperadorCaixa: 'usuario_nome', FormaPagamento: 'descricao', TabelaFiscal: 'nome_regra',
            CentroResultado: 'nome', ConfiguracaoDespesaRecorrente: 'descricao',
            ApiExterna: 'nome_integracao', ChatbotCanal: 'nome_canal', ChatbotIntent: 'nome_intent',
            JobAgendado: 'nome_job', Webhook: 'nome_webhook', GatewayPagamento: 'nome',
            EventoNotificacao: 'nome_evento', ConfiguracaoNFe: 'provedor', CatalogoWeb: 'produto_id',
            Representante: 'nome', ContatoB2B: 'nome_completo', Motorista: 'nome_completo',
            Transportadora: 'razao_social', Fornecedor: 'nome', Cliente: 'nome', Colaborador: 'nome_completo',
          };
          const nameField = NAME_FIELD_MAP[event.entity_name] || 'nome';
          const nomeRaw = String(data?.[nameField] || '').toLowerCase().trim();

          // Constrói filtro OR para buscar duplicatas por documento/placa
          const orConditions = [];
          if (cnpjRaw.length >= 14) orConditions.push({ cnpj: data.cnpj });
          if (cpfRaw.length >= 11) orConditions.push({ cpf: data.cpf });
          if (placa.length >= 3) orConditions.push({ placa: data.placa });

          let existingDup = null;

          // 1. Busca por documento/placa
          if (orConditions.length > 0) {
            const filter = orConditions.length > 1 ? { $or: orConditions } : orConditions[0];
            const results = await api.filter(filter, 'created_date', 10) || [];
            existingDup = results.find(r => r.id !== event.entity_id);
          }

          // 2. Busca por código (usando campo específico da entidade) — Regra-Mãe §5c
          if (!existingDup && codigo) {
            const results = await api.filter({ [codeField]: String(data[codeField]) }, 'created_date', 10) || [];
            existingDup = results.find(r => r.id !== event.entity_id);
          }

          // 3. Busca por nome/descrição exato (case-insensitive) — Regra-Mãe: cadastros únicos
          if (!existingDup && nomeRaw && nomeRaw.length >= 2) {
            const results = await api.filter({ [nameField]: { $regex: `^${nomeRaw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }, 'created_date', 10) || [];
            existingDup = results.find(r => r.id !== event.entity_id);
          }

          if (existingDup) {
            if (event.type === 'create') {
              // CREATE: duplicata detectada pós-criação — re-referencia dependentes e hard-delete
              const REF_MAP = {
                Cliente: [{ entity: 'Pedido', field: 'cliente_id' }, { entity: 'ContaReceber', field: 'cliente_id' }],
                Fornecedor: [{ entity: 'OrdemCompra', field: 'fornecedor_id' }, { entity: 'ContaPagar', field: 'fornecedor_id' }],
                Produto: [{ entity: 'MovimentacaoEstoque', field: 'produto_id' }],
                Transportadora: [{ entity: 'Entrega', field: 'transportadora_id' }],
                Colaborador: [{ entity: 'ApontamentoProducao', field: 'colaborador_id' }],
                Veiculo: [{ entity: 'Entrega', field: 'veiculo_id' }],
                Motorista: [{ entity: 'Entrega', field: 'motorista_id' }],
                FormaPagamento: [{ entity: 'ContaReceber', field: 'forma_pagamento_id' }],
              };
              const refs = REF_MAP[event.entity_name] || [];
              for (const ref of refs) {
                try {
                  const refApi = base44.asServiceRole.entities[ref.entity];
                  if (!refApi) continue;
                  const depRecords = await refApi.filter({ [ref.field]: event.entity_id }, '-id', 200) || [];
                  for (const r of depRecords) {
                    try { await refApi.update(r.id, { [ref.field]: existingDup.id }); } catch {}
                  }
                } catch {}
              }
              // Hard-delete o duplicado recém-criado
              try { await api.delete(event.entity_id); } catch {}
            }

            // Auditoria (create: bloqueio+remoção; update: alerta)
            try {
              await base44.asServiceRole.entities.AuditLog.create({
                usuario: 'Sistema (sanitizeOnWrite)',
                acao: event.type === 'create' ? 'Exclusão' : 'Bloqueio',
                modulo: 'Cadastros', tipo_auditoria: 'seguranca',
                entidade: event.entity_name, registro_id: event.entity_id,
                descricao: event.type === 'create'
                  ? `Duplicata bloqueada e removida: registro "${nomeRaw}" (${event.entity_id}) era duplicata de ${existingDup.id}.`
                  : `Alerta de duplicidade em update: registro "${nomeRaw}" (${event.entity_id}) colide com ${existingDup.id}. Verificação frontend pode ter falhado — investigar.`,
                empresa_id: data?.empresa_id || null,
                group_id: data?.group_id || null,
                dados_anteriores: { id: event.entity_id, nome: nomeRaw, codigo },
                dados_novos: event.type === 'create'
                  ? { kept_id: existingDup.id, action: 'auto_purged_duplicate' }
                  : { conflict_id: existingDup.id, action: 'duplicate_alert_update' },
                data_hora: new Date().toISOString(),
              });
            } catch {}

            if (event.type === 'create') {
              return Response.json({ ok: true, action: 'duplicate_blocked', deleted_id: event.entity_id, kept_id: existingDup.id });
            }
          }
        }
      } catch (dupError) {
        // Loga falha de verificação para auditoria — não bloqueia o fluxo, mas registra para investigação
        try {
          await base44.asServiceRole.entities.AuditLog.create({
            usuario: 'Sistema (sanitizeOnWrite)',
            acao: 'Visualização', modulo: 'Sistema', tipo_auditoria: 'seguranca',
            entidade: event.entity_name, registro_id: event.entity_id,
            descricao: `Falha na verificação de duplicidade (${event.type}): ${dupError?.message || 'erro desconhecido'}. Registro pode ser duplicata — verifique manualmente.`,
            empresa_id: data?.empresa_id || null,
            group_id: data?.group_id || null,
            data_hora: new Date().toISOString(),
          });
        } catch {}
      }
    }

    // Enriquecimento de contexto: se faltar group_id mas houver empresa_id, obtém do cadastro da empresa
    let enriched = sanitized;
    const isCatalog = SIMPLE_CATALOG.has(event.entity_name);

    if (!isCatalog) {
      try {
        if (!enriched?.group_id && data?.empresa_id) {
          const empresas = await base44.asServiceRole.entities.Empresa.filter({ id: data.empresa_id });
          const emp = Array.isArray(empresas) ? empresas[0] : null;
          if (emp?.group_id) {
            enriched = { ...enriched, group_id: emp.group_id };
          }
        }
      } catch {}

      // Enforce multiempresa apenas para entidades não-catálogo
      if (!enriched?.empresa_id && !enriched?.group_id) {
        try {
          await base44.asServiceRole.entities.AuditLog.create({
            usuario: 'Sistema',
            acao: 'Bloqueio',
            modulo: 'Sistema',
            tipo_auditoria: 'seguranca',
            entidade: event.entity_name,
            registro_id: event.entity_id,
            descricao: 'Registro sem escopo multiempresa (bloqueado pela sanitização)',
            dados_novos: { entity_id: event.entity_id },
            data_hora: new Date().toISOString(),
          });
        } catch {}
        return Response.json({ error: 'escopo_multiempresa_obrigatorio' }, { status: 400 });
      }
    }

    // Criptografia de campos sensíveis (AES-GCM com BACKUP_ENCRYPTION_KEY)
    async function getCryptoKey() {
      const secret = Deno.env.get('BACKUP_ENCRYPTION_KEY');
      if (!secret) return null;
      const enc = new TextEncoder();
      const raw = await crypto.subtle.digest('SHA-256', enc.encode(secret));
      return await crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt']);
    }
    const b64 = (buf) => {
      const bytes = new Uint8Array(buf);
      let bin = '';
      for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
      return btoa(bin);
    };
    async function encryptValue(plain, key) {
      const enc = new TextEncoder();
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(String(plain)));
      return { enc: 'gcm/v1', iv: b64(iv), data: b64(cipher) };
    }
    async function encryptSensitive(obj, entity) {
      const key = await getCryptoKey();
      if (!key) return obj;
      const SENSITIVE_EXACT = new Set(['numero_autorizacao','pix_chave','conta','agencia','cartao','linha_digitavel','codigo_barras','pix_qrcode','pix_copia_cola','cpf','cnpj','rg','inscricao_estadual','inscricao_municipal','cliente_cpf_cnpj','favorecido_cpf_cnpj']);
      const isPIIKey = (k) => {
        const s = String(k || '').toLowerCase();
        return SENSITIVE_EXACT.has(s) || s.includes('email') || s.includes('telefone') || s.includes('whatsapp');
      };
      const walk = async (val, parentKey = '') => {
        if (Array.isArray(val)) {
          const out = [];
          for (const item of val) out.push(await walk(item, parentKey));
          return out;
        }
        if (val && typeof val === 'object') {
          const out = {};
          for (const [k, v] of Object.entries(val)) {
            if ((typeof v === 'string' || typeof v === 'number') && isPIIKey(k)) {
              out[k] = await encryptValue(v, key);
            } else {
              out[k] = await walk(v, k);
            }
          }
          return out;
        }
        return val;
      };
      // Escopos conhecidos: detalhes_pagamento, dados_bancarios, contatos/emails/telefones e campos de cobrança (ContaReceber)
      let out = { ...obj };
      if (out?.detalhes_pagamento) {
        out = { ...out, detalhes_pagamento: await walk(out.detalhes_pagamento) };
      }
      if (Array.isArray(out?.dados_bancarios)) {
        out = { ...out, dados_bancarios: await walk(out.dados_bancarios) };
      }
      // PII comuns por entidade
      if (entity === 'Cliente' || entity === 'Fornecedor' || entity === 'Transportadora' || entity === 'Colaborador') {
        out = await walk(out);
      }
      if (entity === 'ContaReceber') {
        const topKeys = ['linha_digitavel','codigo_barras','pix_qrcode','pix_copia_cola'];
        for (const k of topKeys) {
          if (typeof out[k] === 'string' || typeof out[k] === 'number') {
            out[k] = await encryptValue(out[k], key);
          }
        }
      }
      return out;
    }

    const secured = await encryptSensitive(enriched, event.entity_name);

    // Construir patch somente com campos alterados (ignorar built-ins)
    const BUILT_INS = new Set(['id', 'created_date', 'updated_date', 'created_by']);

    const diffPatch = (orig, clean) => {
      const patch = {};
      for (const [k, v] of Object.entries(clean)) {
        if (BUILT_INS.has(k)) continue;
        const ov = orig?.[k];
        const same = JSON.stringify(ov) === JSON.stringify(v);
        if (!same) patch[k] = v;
      }
      return patch;
    };

    const patch = diffPatch(data, secured);

    if (Object.keys(patch).length > 0) {
      await base44.asServiceRole.entities[event.entity_name].update(event.entity_id, patch);

      // Auditoria
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: 'Sistema',
          acao: 'Edição',
          modulo: 'Sistema',
          entidade: event.entity_name,
          registro_id: event.entity_id,
          descricao: 'Sanitização automática aplicada (prevenção XSS/injeções).',
          empresa_id: enriched?.empresa_id || data?.empresa_id || null,
          dados_anteriores: oldData || null,
          dados_novos: { ...patch, group_id: enriched?.group_id || data?.group_id || null },
          data_hora: new Date().toISOString(),
        });
      } catch {}
    }

    return Response.json({ ok: true, changed: Object.keys(patch).length });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});