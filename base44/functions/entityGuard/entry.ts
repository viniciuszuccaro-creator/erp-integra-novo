import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// Rate-limit por IP
const __RL = globalThis.__egRate || (globalThis.__egRate = new Map());
const __WINDOW_MS = 30_000;
const __MAX_REQ = 120;

// Cache de permissões por usuário (evita chamar auth.me() a cada request)
const __PERM_CACHE = globalThis.__egPermCache || (globalThis.__egPermCache = new Map());
const __DECISION_CACHE = globalThis.__egDecisionCache || (globalThis.__egDecisionCache = new Map());
let __BACKEND_PAUSED_UNTIL = globalThis.__egBackendPausedUntil || 0;
const __PERM_TTL = 900_000; // 15 min
const __DECISION_TTL = 300_000; // 5 min

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Ping de automação
    if (!body || Object.keys(body).length === 0 || body._automation === true) {
      return Response.json({ ok: true, status: 'healthy' });
    }

    if (Date.now() < __BACKEND_PAUSED_UNTIL) {
      // Fail-open apenas para leitura; fail-closed para escrita durante cooldown
      const fallbackAction = normalize(body?.action || 'visualizar');
      const isRead = ['visualizar', 'ver', 'view', 'read', 'listar', 'consultar'].includes(fallbackAction);
      return Response.json({ allowed: isRead, _fallback: true, reason: 'entityGuard em cooldown por rate-limit' });
    }

    // Rate limit por IP
    try {
      const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
      const now = Date.now();
      const list = __RL.get(ip) || [];
      const kept = list.filter((t) => now - t < __WINDOW_MS);
      kept.push(now);
      __RL.set(ip, kept);
      if (kept.length > __MAX_REQ) {
        return Response.json({ allowed: false, error: 'rate_limited' }, { status: 429 });
      }
    } catch {}

    // Autenticação — usa cache para não consumir créditos a cada chamada
    let user = null;
    try {
      const authToken = req.headers.get('authorization') || '';
      const cacheKey = authToken.slice(-32); // últimos 32 chars do token como chave
      const cached = __PERM_CACHE.get(cacheKey);
      if (cached && Date.now() - cached.ts < __PERM_TTL) {
        user = cached.user;
      } else {
        user = await base44.auth.me();
        if (user && cacheKey) {
          __PERM_CACHE.set(cacheKey, { user, ts: Date.now() });
          // Limpa entradas antigas (max 500)
          if (__PERM_CACHE.size > 500) {
            const oldest = __PERM_CACHE.keys().next().value;
            __PERM_CACHE.delete(oldest);
          }
        }
      }
    } catch {}

    if (!user) return Response.json({ allowed: false, error: 'Unauthorized' }, { status: 401 });

    // Admin sempre tem acesso
    if (user?.role === 'admin') {
      return Response.json({ allowed: true });
    }

    // Módulo Sistema é exclusivo de admin para ações de escrita/configuração
    if (moduleName === 'Sistema' && !['visualizar', 'ver'].includes(desired)) {
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email || 'Usuário',
          usuario_id: user.id,
          acao: 'Bloqueio',
          modulo: 'Sistema',
          tipo_auditoria: 'seguranca',
          entidade: body?.entity_name || section || 'Sistema',
          descricao: `RBAC: não-admin tentou ${desired} no módulo Sistema`,
          empresa_id: body?.empresa_id || null,
          group_id: body?.group_id || null,
          data_hora: new Date().toISOString(),
        });
      } catch {}
      return Response.json({ allowed: false, reason: 'Módulo Sistema requer perfil admin' }, { status: 403 });
    }

    const normalize = (a) => {
      if (!a) return 'visualizar';
      const s = String(a).toLowerCase();
      const map = {
        ver: 'visualizar', view: 'visualizar', read: 'visualizar', listar: 'visualizar',
        delete: 'excluir', remove: 'excluir', apagar: 'excluir',
        create: 'criar', add: 'criar', update: 'editar', edit: 'editar',
        approve: 'aprovar', aprovar: 'aprovar', export: 'exportar', exportar: 'exportar'
      };
      return map[s] || s;
    };

    const normalizeModule = (s) => {
      if (!s) return 'Sistema';
      const norm = String(s).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');
      const aliases = {
        financeiro: 'Financeiro', financeiroecontabil: 'Financeiro',
        compras: 'Compras', comprasesuprimentos: 'Compras',
        comercial: 'Comercial', comercialevendas: 'Comercial',
        estoque: 'Estoque', estoqueealmoxarifado: 'Estoque',
        expedicao: 'Expedição', expedicaologistica: 'Expedição',
        producao: 'Produção', crm: 'CRM', fiscal: 'Fiscal',
        rh: 'RH', recursoshumanos: 'RH',
        dashboard: 'Dashboard', relatorios: 'Relatórios',
        agenda: 'Agenda', cadastros: 'Cadastros', cadastrosgerais: 'Cadastros',
        contratos: 'Contratos', administracao: 'Sistema', sistema: 'Sistema',
      };
      return aliases[norm] || s || 'Sistema';
    };

    const moduleName = normalizeModule(body?.module || 'Sistema');
    const section = body?.section || null;
    const desired = normalize(body?.action || 'visualizar');

    const normalizeKey = (value) => String(value || '')
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const sectionAliases = {
      controledeacesso: 'acessos', gestaoacessos: 'acessos', acessos: 'acessos', perfis: 'acessos', usuarios: 'acessos',
      configuracoesgerais: 'configuracoes', configuracoes: 'configuracoes', integracoes: 'integracoes', ia: 'ia', seguranca: 'seguranca', auditoria: 'auditoria'
    };

    const findNode = (root, key) => {
      if (!root || typeof root !== 'object') return undefined;
      const target = sectionAliases[normalizeKey(key)] || normalizeKey(key);
      const found = Object.keys(root).find((candidate) => normalizeKey(candidate) === target || sectionAliases[normalizeKey(candidate)] === target);
      return found ? root[found] : undefined;
    };

    const decisionKey = JSON.stringify({ u: user?.id, r: user?.role, m: body?.module, s: body?.section, a: body?.action, e: body?.entity_name });
    const decisionCached = __DECISION_CACHE.get(decisionKey);
    if (decisionCached && Date.now() - decisionCached.ts < __DECISION_TTL) {
      return Response.json({ allowed: decisionCached.allowed, _cached: true });
    }

    // Proteção de entidades críticas
    const targetEntity = body?.entity_name;
    if (targetEntity === 'AuditLog') {
      if (['criar', 'editar', 'excluir'].includes(desired)) {
        __DECISION_CACHE.set(decisionKey, { allowed: false, ts: Date.now() });
        return Response.json({ allowed: false, reason: 'AuditLog é imutável' }, { status: 403 });
      }
    }
    // Entidades de controle de acesso: só admin pode criar/editar/excluir
    const ADMIN_ONLY_WRITE = new Set(['PerfilAcesso', 'User', 'ConfiguracaoSeguranca', 'ConfiguracaoSistema']);
    if (ADMIN_ONLY_WRITE.has(targetEntity) && ['criar', 'editar', 'excluir'].includes(desired) && user?.role !== 'admin') {
      __DECISION_CACHE.set(decisionKey, { allowed: false, ts: Date.now() });
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email || 'Usuário',
          usuario_id: user.id,
          acao: 'Bloqueio',
          modulo: moduleName,
          tipo_auditoria: 'seguranca',
          entidade: targetEntity,
          descricao: `RBAC: não-admin tentou ${desired} em entidade protegida ${targetEntity}`,
          empresa_id: body?.empresa_id || null,
          group_id: body?.group_id || null,
          data_hora: new Date().toISOString(),
        });
      } catch {}
      return Response.json({ allowed: false, reason: `${targetEntity} requer perfil admin` }, { status: 403 });
    }

    // Verifica perfil de acesso (fail-closed para escrita sem perfil)
    const isReadOnly = ['visualizar', 'ver', 'view', 'read', 'listar', 'consultar'].includes(desired);
    let allowed = false;
    try {
      if (user?.perfil_acesso_id) {
        const perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id);
        const perms = perfil?.permissoes;
        if (perms) {
          const modNode = findNode(perms, moduleName);
          if (modNode) {
            if (!section) {
              allowed = Object.values(modNode).some((node) => {
                if (Array.isArray(node)) return node.includes(desired) || (isReadOnly && node.includes('visualizar'));
                if (node && typeof node === 'object') return Object.values(node).some((v) => Array.isArray(v) && (v.includes(desired) || (isReadOnly && v.includes('visualizar'))));
                return false;
              });
            } else {
              const path = Array.isArray(section) ? section : String(section).split('.').filter(Boolean);
              let cursor = modNode;
              for (const seg of path) { if (!cursor) break; cursor = findNode(cursor, seg); }
              if (Array.isArray(cursor)) allowed = cursor.includes(desired) || (isReadOnly && cursor.includes('visualizar'));
              else if (cursor && typeof cursor === 'object') {
                const stack = [cursor];
                while (stack.length && !allowed) {
                  const node = stack.pop();
                  if (Array.isArray(node)) { if (node.includes(desired) || (isReadOnly && node.includes('visualizar'))) allowed = true; }
                  else if (node && typeof node === 'object') Object.values(node).forEach(v => stack.push(v));
                }
              }
            }
          }
        }
      } else {
        // Sem perfil configurado: fail-open apenas para leitura, fail-closed para escrita
        allowed = isReadOnly;
      }
    } catch {
      // Erro ao buscar perfil: fail-open apenas para leitura, fail-closed para escrita
      allowed = isReadOnly;
    }

    // RLS de escopo multiempresa: se a action é escrita sensível e há empresa_id/group_id no payload,
    // verificar se o usuário tem acesso ao escopo solicitado (evita escalada horizontal)
    if (allowed && ['criar','editar','excluir'].includes(desired)) {
      const reqEmpresaId = body?.empresa_id || null;
      const reqGroupId = body?.group_id || null;
      // Usuário com perfil que tem empresa_id diferente do escopo solicitado → bloquear
      if (reqEmpresaId && user?.empresa_id && reqEmpresaId !== user.empresa_id && user.role !== 'admin') {
        // só bloqueia se o usuário não tem company match ou group match
        const userGroupId = user?.group_id || null;
        if (!reqGroupId || !userGroupId || reqGroupId !== userGroupId) {
          allowed = false;
          try {
            await base44.asServiceRole.entities.AuditLog.create({
              usuario: user.full_name || user.email || 'Usuário',
              usuario_id: user.id,
              acao: 'Bloqueio',
              modulo: moduleName,
              tipo_auditoria: 'seguranca',
              entidade: targetEntity || moduleName,
              descricao: `RLS: acesso negado ao escopo empresa ${reqEmpresaId} por usuário de empresa ${user.empresa_id}`,
              empresa_id: reqEmpresaId,
              group_id: reqGroupId,
              data_hora: new Date().toISOString(),
            });
          } catch {}
        }
      }
    }

    __DECISION_CACHE.set(decisionKey, { allowed, ts: Date.now() });
    if (__DECISION_CACHE.size > 1000) {
      const oldest = __DECISION_CACHE.keys().next().value;
      __DECISION_CACHE.delete(oldest);
    }
    return Response.json({ allowed });

  } catch (err) {
    const status = err?.status || err?.response?.status;
    if (status === 429 || status === 502 || (typeof status === 'number' && status >= 500)) {
      __BACKEND_PAUSED_UNTIL = Date.now() + 120000;
      globalThis.__egBackendPausedUntil = __BACKEND_PAUSED_UNTIL;
    }
    // Fail-closed para escrita em exceções; fail-open apenas para leitura
    const fallbackAction = normalize(body?.action || 'visualizar');
    const isRead = ['visualizar', 'ver', 'view', 'read', 'listar', 'consultar'].includes(fallbackAction);
    return Response.json({ allowed: isRead, _fallback: true });
  }
});