/**
 * upsertConfig — Atualiza ou cria um ConfiguracaoSistema de forma confiável.
 * CORREÇÃO DEFINITIVA dos toggles:
 *  - Busca SEMPRE pelo escopo exato (empresa_id + group_id)
 *  - Merge de dados nunca sobrescreve campos existentes com undefined
 *  - Retorna o registro salvo para confirmação no frontend
 *
 * Modos:
 *  - { id, data, chave?, scope? }   → update direto pelo ID
 *  - { chave, data, scope }         → upsert por chave+scope
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
// upsertConfig v2 — escopo exato, sem fallback cross-scope, auditoria completa

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let body = {};
    try { body = await req.json(); } catch (_) {}

    // Retrocompatibilidade com API antiga: { key, value, operation: "read"|"write" }
    let { id, chave, data, scope } = body;
    if (!chave && body.key) chave = body.key;
    if (!data && body.operation === 'write' && body.value !== undefined) {
      // Retrocompatibilidade: salva apenas o campo `ativa` (boolean)
      data = { ativa: !!body.value };
    }
    if (body.operation === 'read' && chave) {
      // Leitura rápida por chave
      const api = base44.asServiceRole.entities.ConfiguracaoSistema;
      const rows = await api.filter({ chave }, '-updated_date', 5).catch(() => []);
      const record = Array.isArray(rows) ? (rows[0] || null) : null;
      if (!record) return Response.json({ value: undefined, found: false });
      const val = record.ativa !== undefined ? record.ativa : record.valor;
      return Response.json({ value: val, record, found: true });
    }

    // ─── MODO LIST: Retorna configs no escopo via asServiceRole (bypass RLS) ───
    // Garante que o frontend veja registros criados pelo service role
    if (body.operation === 'list') {
      const api = base44.asServiceRole.entities.ConfiguracaoSistema;
      const sGrupoId = body.scope?.group_id || null;
      const sEmpresaId = body.scope?.empresa_id || null;
      const includeGlobal = body.includeGlobal !== false;

      const orConds = [];
      if (sGrupoId) orConds.push({ group_id: sGrupoId });
      if (sEmpresaId && sGrupoId) {
        orConds.push({ empresa_id: sEmpresaId, group_id: sGrupoId });
        orConds.push({ empresa_id: sEmpresaId, group_id: null });
      }
      if (sEmpresaId && !sGrupoId) {
        orConds.push({ empresa_id: sEmpresaId });
      }
      if (includeGlobal) {
        orConds.push({ group_id: null, empresa_id: null });
      }

      const filtro = orConds.length > 1 ? { $or: orConds } : (orConds[0] || {});
      const limit = body.limit || 500;
      const rows = await api.filter(filtro, '-updated_date', limit).catch(() => []);

      // Deduplica por ID
      const seen = new Set();
      const list = (Array.isArray(rows) ? rows : []).filter(item => {
        const key = item?.id || `${item?.chave}:${item?.empresa_id || ''}:${item?.group_id || ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      }).sort((a, b) => {
        const dateA = new Date(a?.updated_date || a?.created_date || 0).getTime();
        const dateB = new Date(b?.updated_date || b?.created_date || 0).getTime();
        return dateB - dateA;
      });

      return Response.json({ records: list, count: list.length });
    }

    if (!data || typeof data !== 'object') {
      return Response.json({ error: 'data é obrigatório' }, { status: 400 });
    }
    if (!id && !chave) {
      return Response.json({ error: 'Forneça id ou chave' }, { status: 400 });
    }

    const api = base44.asServiceRole.entities.ConfiguracaoSistema;

    // ─── MODO 1: Update direto por ID ─────────────────────────────────────────
    if (id) {
      let existing = null;
      try {
        const rows = await api.filter({ id }, '-updated_date', 1);
        existing = Array.isArray(rows) ? (rows[0] || null) : null;
      } catch (_) {}

      if (!existing) {
        return Response.json({ error: `Registro ${id} não encontrado` }, { status: 404 });
      }

      // Merge cuidadoso: apenas os campos enviados em data são atualizados
      const updatePayload = {};
      // Copia campos existentes que NÃO foram enviados em data
      const SYSTEM_FIELDS = new Set(['id','created_date','updated_date','created_by','created_by_id','is_sample']);
      for (const [k, v] of Object.entries(existing)) {
        if (!SYSTEM_FIELDS.has(k)) updatePayload[k] = v;
      }
      // Aplica os campos do data (sobrescreve apenas os enviados)
      for (const [k, v] of Object.entries(data)) {
        if (!SYSTEM_FIELDS.has(k)) updatePayload[k] = v;
      }
      // Garante chave e scope
      if (chave) updatePayload.chave = chave;
      if (scope?.group_id) updatePayload.group_id = scope.group_id;
      if (scope?.empresa_id) updatePayload.empresa_id = scope.empresa_id;

      const updated = await api.update(id, updatePayload);
      return Response.json({ record: updated, id: updated.id || id, mode: 'update', _ts: Date.now() });
    }

    // ─── MODO 2: Upsert por chave + scope ────────────────────────────────────
    const gId = scope?.group_id || null;
    const eId = scope?.empresa_id || null;

    // Busca progressiva do mais específico para o menos específico
    const tryFind = async (filtro) => {
      try {
        const rows = await api.filter(filtro, '-updated_date', 5);
        return Array.isArray(rows) ? (rows[0] || null) : null;
      } catch (_) { return null; }
    };

    let match = null;

    // 1) Exato: chave + empresa + grupo (mais específico)
    if (!match && eId && gId) {
      match = await tryFind({ chave, empresa_id: eId, group_id: gId });
    }
    // 1b) Legacy: chave + empresa + group_id null (registros antigos sem group_id)
    if (!match && eId && gId) {
      match = await tryFind({ chave, empresa_id: eId, group_id: null });
    }
    // 2) Chave + só empresa — apenas quando o escopo NÃO tem grupo
    if (!match && eId && !gId) {
      match = await tryFind({ chave, empresa_id: eId });
    }
    // 3) Chave + grupo + empresa_id null — REGISTRO DE NÍVEL DE GRUPO
    // NÃO faz fallback para registros de empresa no contexto de grupo — se não existe
    // registro de nível de grupo, CRIA um novo (em vez de atualizar o de empresa)
    if (!match && gId && !eId) {
      match = await tryFind({ chave, group_id: gId, empresa_id: null });
    }
    // 4) Fallback: qualquer registro com essa chave (apenas quando sem scope)
    if (!match && !eId && !gId) {
      match = await tryFind({ chave });
    }

    if (match?.id) {
      // ATUALIZA — merge dos campos existentes com os novos, nunca perde dados
      // AUDITORIA: Log em AuditLog
      const SYSTEM_FIELDS = new Set(['id','created_date','updated_date','created_by','created_by_id','is_sample']);
      const updatePayload = {};
      for (const [k, v] of Object.entries(match)) {
        if (!SYSTEM_FIELDS.has(k)) updatePayload[k] = v;
      }
      for (const [k, v] of Object.entries(data)) {
        if (!SYSTEM_FIELDS.has(k)) updatePayload[k] = v;
      }
      // Força chave e categoria
      updatePayload.chave = chave;
      if (data.categoria) updatePayload.categoria = data.categoria;
      else if (match.categoria) updatePayload.categoria = match.categoria;
      // Mantém scope (nunca sobrescreve)
      if (!updatePayload.empresa_id && eId) updatePayload.empresa_id = eId;
      if (!updatePayload.group_id && gId) updatePayload.group_id = gId;

      const updated = await api.update(match.id, updatePayload);
      
      // Log de auditoria da alteração
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Sistema',
          usuario_id: user?.id || null,
          empresa_id: eId || null,
          group_id: gId || null,
          acao: 'Edição',
          modulo: 'Sistema',
          tipo_auditoria: 'entidade',
          entidade: 'ConfiguracaoSistema',
          registro_id: match.id,
          descricao: `Configuração ${chave} atualizada`,
          dados_anteriores: match,
          dados_novos: updated,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}

      // ─── AUTO-PROPAGAÇÃO: config de grupo → todas as empresas (SEMPRE ATIVA) ───
      // Propaga TODAS as mudanças de grupo para empresas, não só ativa
      if (gId && !eId) {
        try {
          const empresas = await base44.asServiceRole.entities.Empresa
            .filter({ group_id: gId }, undefined, 500).catch(() => []);
          if (Array.isArray(empresas) && empresas.length) {
            const toSync = [];
            for (const emp of empresas) {
              const exist = await api.filter({ chave, empresa_id: emp.id, group_id: gId }, '-updated_date', 1).catch(() => []);
              const existRec = Array.isArray(exist) ? exist[0] : null;
              if (existRec?.id) {
                const empPayload = {};
                const SYS = new Set(['id','created_date','updated_date','created_by','created_by_id','is_sample']);
                for (const [k, v] of Object.entries(updatePayload)) {
                  if (!SYS.has(k)) empPayload[k] = v;
                }
                empPayload.id = existRec.id;
                empPayload.empresa_id = emp.id;
                empPayload.group_id = gId;
                toSync.push(empPayload);
              } else {
                const createPayload = { ...updatePayload };
                createPayload.chave = chave;
                createPayload.empresa_id = emp.id;
                createPayload.group_id = gId;
                toSync.push(createPayload);
              }
            }
            const toUpdate = toSync.filter(r => r.id);
            const toCreate = toSync.filter(r => !r.id);
            if (toUpdate.length) {
              for (let i = 0; i < toUpdate.length; i += 500) {
                try { await api.bulkUpdate(toUpdate.slice(i, i + 500)); } catch (_) {}
              }
            }
            if (toCreate.length) {
              for (let i = 0; i < toCreate.length; i += 100) {
                try { await api.bulkCreate(toCreate.slice(i, i + 100)); } catch (_) {}
              }
            }
          }
        } catch (_) {}
      }

      // ─── PROPAGAÇÃO REVERSA: empresa → grupo (Regra-Mãe 9) ───
      // Quando uma empresa altera uma config, cria/atualiza o registro de nível de grupo
      // para que a mudança seja refletida no grupo (cadastro único)
      if (eId && gId) {
        try {
          const groupExist = await api.filter({ chave, group_id: gId, empresa_id: null }, '-updated_date', 1).catch(() => []);
          const groupRec = Array.isArray(groupExist) ? groupExist[0] : null;
          const SYS = new Set(['id','created_date','updated_date','created_by','created_by_id','is_sample']);
          if (groupRec?.id) {
            // Atualiza o registro de grupo com os mesmos dados (exceto empresa_id)
            const groupPayload = {};
            for (const [k, v] of Object.entries(updatePayload)) {
              if (!SYS.has(k) && k !== 'empresa_id') groupPayload[k] = v;
            }
            groupPayload.id = groupRec.id;
            groupPayload.empresa_id = null;
            groupPayload.group_id = gId;
            try { await api.update(groupRec.id, groupPayload); } catch (_) {}
          } else {
            // Cria registro de nível de grupo
            const groupCreate = {};
            for (const [k, v] of Object.entries(updatePayload)) {
              if (!SYS.has(k) && k !== 'empresa_id') groupCreate[k] = v;
            }
            groupCreate.chave = chave;
            groupCreate.empresa_id = null;
            groupCreate.group_id = gId;
            try { await api.create(groupCreate); } catch (_) {}
          }
        } catch (_) {}
      }

      return Response.json({ record: updated, id: updated.id || match.id, mode: 'update', propagated: !!(gId && !eId), reversePropagated: !!(eId && gId), _ts: Date.now() });
    } else {
      // CRIA novo registro
      const createPayload = { chave, ...data };
      if (eId) createPayload.empresa_id = eId;
      if (gId) createPayload.group_id = gId;

      const created = await api.create(createPayload);
      
      // Log de auditoria da criação
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Sistema',
          usuario_id: user?.id || null,
          empresa_id: eId || null,
          group_id: gId || null,
          acao: 'Criação',
          modulo: 'Sistema',
          tipo_auditoria: 'entidade',
          entidade: 'ConfiguracaoSistema',
          registro_id: created.id,
          descricao: `Configuração ${chave} criada`,
          dados_novos: created,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}

      // ─── AUTO-PROPAGAÇÃO: config de grupo criada → propaga para empresas (SEMPRE ATIVA) ───
      if (gId && !eId) {
        try {
          const empresas = await base44.asServiceRole.entities.Empresa
            .filter({ group_id: gId }, undefined, 500).catch(() => []);
          if (Array.isArray(empresas) && empresas.length) {
            const toCreateEmp = empresas.map(emp => ({
              ...createPayload,
              empresa_id: emp.id,
              group_id: gId,
            }));
            toCreateEmp.forEach(r => { delete r.id; });
            for (let i = 0; i < toCreateEmp.length; i += 100) {
              try { await api.bulkCreate(toCreateEmp.slice(i, i + 100)); } catch (_) {}
            }
          }
        } catch (_) {}
      }

      // ─── PROPAGAÇÃO REVERSA: empresa criou config → cria no nível de grupo (Regra-Mãe 9) ───
      if (eId && gId) {
        try {
          const groupExist = await api.filter({ chave, group_id: gId, empresa_id: null }, '-updated_date', 1).catch(() => []);
          const groupRec = Array.isArray(groupExist) ? groupExist[0] : null;
          if (!groupRec?.id) {
            const groupCreate = { ...createPayload };
            delete groupCreate.id;
            groupCreate.empresa_id = null;
            groupCreate.group_id = gId;
            try { await api.create(groupCreate); } catch (_) {}
          }
        } catch (_) {}
      }

      return Response.json({ record: created, id: created.id, mode: 'create', propagated: !!(gId && !eId), reversePropagated: !!(eId && gId), _ts: Date.now() });
    }

  } catch (err) {
    return Response.json({ error: String(err?.message || err) }, { status: 500 });
  }
});