import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

    // === PREVENÇÃO DE DUPLICIDADE (Regra-Mãe §5c: validação dupla em ações sensíveis) ===
    // Só executa em eventos de criação (não em update) e apenas para entidades do Cadastro Gerais
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

    if (event.type === 'create' && CADASTRO_GERAIS_ENTITIES.has(event.entity_name)) {
      try {
        const api = base44.asServiceRole.entities[event.entity_name];
        if (api) {
          // Extrai chaves de duplicidade do registro recém-criado
          const cnpjRaw = data?.cnpj ? String(data.cnpj).replace(/\D/g, '') : '';
          const cpfRaw = data?.cpf ? String(data.cpf).replace(/\D/g, '') : '';
          const placa = data?.placa ? String(data.placa).toUpperCase().trim() : '';
          const codigo = String(data?.codigo || data?.codigo_banco || data?.sigla || '').toLowerCase().trim();
          const nomeRaw = String(data?.nome || data?.nome_completo || data?.razao_social || data?.nome_fantasia ||
            data?.descricao || data?.nome_marca || data?.nome_segmento || data?.nome_regiao ||
            data?.nome_perfil || data?.nome_rota || data?.nome_banco || data?.nome_kit ||
            data?.nome_grupo || data?.nome_setor || data?.nome_canal || data?.nome_intent ||
            data?.nome_job || data?.nome_webhook || data?.nome_api || data?.nome_gateway ||
            data?.nome_conta || data?.nome_cargo || data?.nome_modelo || data?.nome_condicao ||
            data?.nome_turno || data?.nome_departamento || data?.nome_rota || data?.nome_regra || '').toLowerCase().trim();

          // Constrói filtro OR para buscar duplicatas
          const orConditions = [];
          if (cnpjRaw.length >= 14) orConditions.push({ cnpj: data.cnpj });
          if (cpfRaw.length >= 11) orConditions.push({ cpf: data.cpf });
          if (placa.length >= 3) orConditions.push({ placa: data.placa });

          let existingDup = null;
          if (orConditions.length > 0) {
            const filter = orConditions.length > 1 ? { $or: orConditions } : orConditions[0];
            const results = await api.filter(filter, 'created_date', 10) || [];
            existingDup = results.find(r => r.id !== event.entity_id);
          }

          // Se não encontrou por documento, busca por codigo+nome (mesmo escopo)
          if (!existingDup && codigo && nomeRaw && nomeRaw.length >= 3) {
            const nameFilter = { codigo };
            const results = await api.filter(nameFilter, 'created_date', 10) || [];
            existingDup = results.find(r =>
              r.id !== event.entity_id &&
              String(r.nome || r.nome_completo || r.razao_social || r.descricao || '').toLowerCase().trim() === nomeRaw
            );
          }

          if (existingDup) {
            // Duplicata detectada: o registro atual é o mais novo (já foi criado).
            // Re-referencia dependentes para o registro original, depois hard-delete o duplicado.
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

            // Auditoria
            try {
              await base44.asServiceRole.entities.AuditLog.create({
                usuario: 'Sistema (sanitizeOnWrite)',
                acao: 'Exclusão', modulo: 'Cadastros', tipo_auditoria: 'seguranca',
                entidade: event.entity_name, registro_id: event.entity_id,
                descricao: `Duplicata bloqueada e removida: registro "${nomeRaw}" (${event.entity_id}) era duplicata de ${existingDup.id}.`,
                empresa_id: data?.empresa_id || null,
                group_id: data?.group_id || null,
                dados_anteriores: { id: event.entity_id, nome: nomeRaw, codigo },
                dados_novos: { kept_id: existingDup.id, action: 'auto_purged_duplicate' },
                data_hora: new Date().toISOString(),
              });
            } catch {}

            return Response.json({ ok: true, action: 'duplicate_blocked', deleted_id: event.entity_id, kept_id: existingDup.id });
          }
        }
      } catch { /* não bloqueia se a verificação falhar */ }
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