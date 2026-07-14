import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// RBAC + Multiempresa helpers para backend functions (biblioteca de referência)
// A lógica aqui é inlined em entityGuard e outras funções — este endpoint expõe health-check

async function getUserAndPerfil(base44) {
  const user = await base44.auth.me().catch(() => null);
  let perfil = null;
  try {
    if (user?.perfil_acesso_id) {
      perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id);
    }
  } catch (e) {
    console.error('[guard] Falha ao carregar perfil de acesso:', e?.message || e);
  }
  return { user, perfil };
}

const normalize = (a) => {
  if (!a) return 'visualizar';
  const s = String(a).toLowerCase();
  const map = {
    ver: 'visualizar', view: 'visualizar', read: 'visualizar', listar: 'visualizar', status: 'visualizar',
    delete: 'excluir', remove: 'excluir', destroy: 'excluir', apagar: 'excluir',
    cancel: 'cancelar', cancelar: 'cancelar',
    create: 'criar', add: 'criar', emitir: 'criar', enviar: 'criar',
    update: 'editar', edit: 'editar', carta: 'editar', corrigir: 'editar',
    approve: 'aprovar', aprovar: 'aprovar',
    export: 'exportar', exportar: 'exportar'
  };
  return map[s] || s;
};

export function backendHasPermission(perfil, moduleName, section, action = 'visualizar', userRole = null) {
  if (userRole === 'admin') return true;
  const perms = perfil?.permissoes;
  if (!perms) return false;
  const desired = normalize(action);
  const modNode = perms[moduleName];
  if (!modNode) return false;

  if (!section) {
    return Object.values(modNode).some((node) => {
      if (Array.isArray(node)) return node.includes(desired) || (desired === 'visualizar' && node.includes('ver'));
      if (node && typeof node === 'object') {
        return Object.values(node).some((v) => Array.isArray(v) && (v.includes(desired) || (desired === 'visualizar' && v.includes('ver'))));
      }
      return false;
    });
  }

  const path = Array.isArray(section) ? section : String(section).split('.').filter(Boolean);
  let cursor = modNode;
  for (let i = 0; i < path.length; i++) {
    const key = path[i];
    if (cursor == null) return false;
    cursor = cursor[key];
  }
  if (!cursor) return false;
  const actionSynonyms = ACTION_SYNONYMS[desired] || [desired];
  if (Array.isArray(cursor)) {
    return actionSynonyms.some((s) => cursor.includes(s)) || (desired === 'visualizar' && cursor.includes('ver'));
  }
  if (typeof cursor === 'object') {
    const stack = [cursor];
    while (stack.length) {
      const node = stack.pop();
      if (Array.isArray(node)) {
        if (actionSynonyms.some((s) => node.includes(s)) || (desired === 'visualizar' && node.includes('ver'))) return true;
      } else if (node && typeof node === 'object') {
        Object.values(node).forEach((v) => stack.push(v));
      }
    }
  }
  return false;
}

export async function assertPermission(base44, { user, perfil }, moduleName, section, action) {
  const allowed = backendHasPermission(perfil, moduleName, section, action, user?.role || null);
  if (!allowed) {
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        acao: 'Bloqueio', modulo: moduleName, entidade: Array.isArray(section) ? section.join('.') : (section || '-'),
        descricao: `Ação negada no backend: ${moduleName}/${section || '-'} → ${action}`,
        data_hora: new Date().toISOString(),
      });
    } catch (e) {
      console.error('[guard] Falha ao auditar bloqueio de permissão:', e?.message || e);
      // Vol 3.6: Alerta visível quando auditoria de bloqueio falha
      try {
        await base44.asServiceRole.entities.AlertaPerformance.create({
          timestamp: new Date().toISOString(), data_hora: new Date().toISOString(),
          tipo_alerta: 'Erro Crítico', severidade: 'Critical', modulo: moduleName || 'Sistema',
          funcionalidade: 'Auditoria: Bloqueio de Permissão',
          descricao: `Falha ao auditar bloqueio — ${moduleName}/${section || '-'} → ${action}: ${e?.message || e}`,
          impacto_estimado: 'Alto', status: 'Novo', automaticamente_criado: true,
          empresa_id: user?.group_id || null,
        });
      } catch (_) { /* best-effort */ }
    }
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Bloqueio SoD em tempo real: se houver conflito registrado para o módulo/ação, negar
  try {
    const conflicts = perfil?.conflitos_sod_detectados || [];
    const act = normalize(action);
    const modLc = String(moduleName || '').toLowerCase();
    const hasConflict = conflicts.some((c) => {
      const tipo = String(c?.tipo_conflito || '').toLowerCase();
      return tipo.startsWith(modLc + ':') && tipo.includes(act);
    });
    if (hasConflict) {
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || 'Usuário',
          usuario_id: user?.id,
          acao: 'Bloqueio', modulo: moduleName, entidade: Array.isArray(section) ? section.join('.') : (section || '-'),
          descricao: `Bloqueio SoD: ${moduleName}/${section || '-'} → ${action}`,
          data_hora: new Date().toISOString(),
        });
      } catch (e) {
        console.error('[guard] Falha ao auditar bloqueio SoD:', e?.message || e);
        try {
          await base44.asServiceRole.entities.AlertaPerformance.create({
            timestamp: new Date().toISOString(), data_hora: new Date().toISOString(),
            tipo_alerta: 'Erro Crítico', severidade: 'Critical', modulo: moduleName || 'Sistema',
            funcionalidade: 'Auditoria: Bloqueio SoD',
            descricao: `Falha ao auditar bloqueio SoD — ${moduleName}/${section || '-'} → ${action}: ${e?.message || e}`,
            impacto_estimado: 'Alto', status: 'Novo', automaticamente_criado: true,
            empresa_id: user?.group_id || null,
          });
        } catch (_) { /* best-effort */ }
      }
      return Response.json({ error: 'Forbidden: Bloqueado por regra SoD' }, { status: 403 });
    }
  } catch (e) {
    console.error('[guard] Falha na verificação SoD:', e?.message || e);
  }

  return null;
}

export function assertContextPresence({ empresa_id, group_id }, requireEmpresa = true) {
  if (requireEmpresa) {
    if (!empresa_id && !group_id) {
      return Response.json({ error: 'Contexto multiempresa obrigatório (empresa_id ou group_id)' }, { status: 400 });
    }
  }
  return null;
}

// Extrai metadados úteis para auditoria/telemetria a partir da requisição
export function extractRequestMeta(req) {
  try {
    const headers = req?.headers || new Headers();
    const ipHeader = headers.get('x-forwarded-for') || headers.get('x-real-ip') || headers.get('cf-connecting-ip');
    const ip = ipHeader ? String(ipHeader).split(',')[0].trim() : null;
    const user_agent = headers.get('user-agent') || null;
    const request_id = headers.get('x-request-id') || headers.get('cf-ray') || null;
    return { ip, user_agent, request_id };
  } catch (_) {
    return { ip: null, user_agent: null, request_id: null };
  }
}

export async function ensureContextFields(base44, data, requireEmpresa = true, verifyUserAccess = false) {
  try {
    if (!data) return data;
    let enriched = { ...data };
    if (requireEmpresa && !enriched.empresa_id && !enriched.group_id) {
      return Response.json({ error: 'Contexto multiempresa obrigatório (empresa_id ou group_id)' }, { status: 400 });
    }
    if (!enriched.group_id && enriched.empresa_id) {
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ id: enriched.empresa_id }, undefined, 1);
      const emp = Array.isArray(empresas) ? empresas[0] : null;
      if (emp?.group_id) enriched.group_id = emp.group_id;
    }
    // Vol 3.5: Verifica se o usuário tem relação real com o grupo/empresa informado
    if (verifyUserAccess && (enriched.empresa_id || enriched.group_id)) {
      const user = await base44.auth.me().catch(() => null);
      if (user && user.role !== 'admin') {
        const userGroupId = user.group_id || user.grupo_id;
        if (enriched.group_id && userGroupId && enriched.group_id !== userGroupId) {
          return Response.json({ error: 'Acesso negado: grupo não pertence ao usuário' }, { status: 403 });
        }
        if (enriched.empresa_id && userGroupId) {
          const userEmpresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: userGroupId }, undefined, 100);
          const empresaIds = Array.isArray(userEmpresas) ? userEmpresas.map((e) => e.id) : [];
          if (!empresaIds.includes(enriched.empresa_id)) {
            return Response.json({ error: 'Acesso negado: empresa não pertence ao grupo do usuário' }, { status: 403 });
          }
        }
      }
    }
    return enriched;
  } catch (e) {
    console.error('[guard] Falha em ensureContextFields:', e?.message || e);
    return data;
  }
}

async function audit(base44, user, { acao = 'Ação', modulo = 'Sistema', entidade = '-', registro_id = null, descricao = '', dados_novos = null, empresa_id = null, empresa_nome = null, duracao_ms = null }, meta = null) {
  try {
    const payloadDados = (dados_novos && typeof dados_novos === 'object') ? { ...dados_novos } : {};
    if (meta) payloadDados._meta = meta; // ip, user_agent, request_id
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user?.full_name || user?.email || 'Sistema',
      usuario_id: user?.id,
      acao, modulo, entidade, registro_id, descricao,
      empresa_id: empresa_id || null,
      empresa_nome: empresa_nome || null,
      duracao_ms: typeof duracao_ms === 'number' ? duracao_ms : null,
      dados_novos: Object.keys(payloadDados).length ? payloadDados : null,
      data_hora: new Date().toISOString(),
    });
  } catch (e) {
    console.error('[guard] Falha ao registrar auditoria:', e?.message || e);
    // Vol 3.6: Gera alerta visível no monitoramento quando a fila de auditoria falha
    try {
      await base44.asServiceRole.entities.AlertaPerformance.create({
        timestamp: new Date().toISOString(),
        data_hora: new Date().toISOString(),
        tipo_alerta: 'Erro Crítico',
        severidade: 'Critical',
        modulo: modulo || 'Sistema',
        funcionalidade: `Auditoria: ${acao}`,
        descricao: `Falha ao registrar auditoria — ${entidade} / ${acao}: ${e?.message || e}`,
        impacto_estimado: 'Alto',
        acao_recomendada: 'Verificar conectividade do banco e integridade da fila de auditoria',
        status: 'Novo',
        automaticamente_criado: true,
        frequencia: 'Única',
        quantidade_ocorrencias: 1,
        primeira_ocorrencia: new Date().toISOString(),
        ultima_ocorrencia: new Date().toISOString(),
        empresa_id: empresa_id || null,
      });
    } catch (_) { /* best-effort — não propagar erro de alerta */ }
  }
}

// Health-check endpoint — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    // Suporta chamada de verificação de permissão via invoke
    if (body?.module && body?.action) {
      const { user, perfil } = await getUserAndPerfil(base44);
      if (!user) return Response.json({ allowed: false, error: 'Unauthorized' }, { status: 401 });
      const allowed = backendHasPermission(perfil, body.module, body.section, body.action, user?.role);
      return Response.json({ allowed, _via: '_lib/guard' });
    }
    return Response.json({ ok: true, status: 'healthy', module: '_lib/guard' });
  } catch (err) {
    return Response.json({ ok: false, error: err?.message || 'Internal error' }, { status: 500 });
  }
});