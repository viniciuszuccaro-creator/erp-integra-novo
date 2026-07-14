import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// === Inlined from _lib/guard ===
async function getUserAndPerfil(base44) {
  const user = await base44.auth.me().catch(() => null);
  let perfil = null;
  try {
    if (user?.perfil_acesso_id) {
      perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id);
    }
  } catch {}
  return { user, perfil };
}

const _normalize = (a) => {
  if (!a) return 'visualizar';
  const s = String(a).toLowerCase();
  const map = {
    ver: 'visualizar', view: 'visualizar', read: 'visualizar', listar: 'visualizar',
    delete: 'excluir', remove: 'excluir', apagar: 'excluir',
    cancel: 'cancelar', cancelar: 'cancelar',
    create: 'criar', add: 'criar', emitir: 'criar', enviar: 'criar',
    update: 'editar', edit: 'editar', corrigir: 'editar',
    approve: 'aprovar', aprovar: 'aprovar',
    export: 'exportar', exportar: 'exportar'
  };
  return map[s] || s;
};

function backendHasPermission(perfil, moduleName, section, action = 'visualizar', userRole = null) {
  if (userRole === 'admin') return true;
  const perms = perfil?.permissoes;
  if (!perms) return false;
  const desired = _normalize(action);
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
    if (cursor == null) return false;
    cursor = cursor[path[i]];
  }
  if (!cursor) return false;
  if (Array.isArray(cursor)) return cursor.includes(desired) || (desired === 'visualizar' && cursor.includes('ver'));
  if (typeof cursor === 'object') {
    const stack = [cursor];
    while (stack.length) {
      const node = stack.pop();
      if (Array.isArray(node)) {
        if (node.includes(desired) || (desired === 'visualizar' && node.includes('ver'))) return true;
      } else if (node && typeof node === 'object') {
        Object.values(node).forEach((v) => stack.push(v));
      }
    }
  }
  return false;
}

async function assertPermission(base44, ctx, moduleName, section, action) {
  const { user, perfil } = ctx;
  const allowed = backendHasPermission(perfil, moduleName, section, action, user?.role || null);
  if (!allowed) {
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Usuário',
        usuario_id: user?.id,
        acao: 'Bloqueio', modulo: moduleName,
        entidade: Array.isArray(section) ? section.join('.') : (section || '-'),
        descricao: `Ação negada no backend: ${moduleName}/${section || '-'} → ${action}`,
        data_hora: new Date().toISOString(),
      });
    } catch {}
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  return null;
}

function assertContextPresence({ empresa_id, group_id }, requireEmpresa = true) {
  if (requireEmpresa && !empresa_id && !group_id) {
    return Response.json({ error: 'Contexto multiempresa obrigatório (empresa_id ou group_id)' }, { status: 400 });
  }
  return null;
}

function extractRequestMeta(req) {
  try {
    const headers = req?.headers || new Headers();
    const ipHeader = headers.get('x-forwarded-for') || headers.get('x-real-ip') || headers.get('cf-connecting-ip');
    return {
      ip: ipHeader ? String(ipHeader).split(',')[0].trim() : null,
      user_agent: headers.get('user-agent') || null,
      request_id: headers.get('x-request-id') || headers.get('cf-ray') || null,
    };
  } catch (_) {
    return { ip: null, user_agent: null, request_id: null };
  }
}

// === Inlined from _lib/validationUtils ===
function resolveEntityIdFromPayload(payload, keys = []) {
  if (!payload || typeof payload !== 'object') return null;
  for (const k of keys) {
    const v = payload?.[k];
    if (typeof v === 'string' && v) return v;
  }
  const data = payload?.data;
  const event = payload?.event;
  return data?.id || event?.entity_id || null;
}

function isApprovedStatus(data, field = 'status', approved = 'Aprovado') {
  if (!data) return true;
  const s = data?.[field];
  return !s || s === approved;
}

// === Inlined from _lib/inventoryUtils ===
function buildMovementRecord(inv, item, user) {
  const delta = Number(item.ajuste || 0);
  if (!item.produto_id || delta === 0) return null;
  return {
    origem_movimento: 'ajuste', tipo_movimento: 'ajuste',
    produto_id: item.produto_id, produto_descricao: item.produto_descricao,
    quantidade: delta, unidade_medida: item.unidade || 'UN',
    empresa_id: inv.empresa_id, group_id: inv.group_id || null,
    data_movimentacao: new Date().toISOString(),
    motivo: `Ajuste inventário ${inv.id || ''}`,
    responsavel: user?.full_name || user?.email, responsavel_id: user?.id,
  };
}

function computeMovements(inv, user) {
  if (!Array.isArray(inv?.itens)) return [];
  const movimentos = [];
  for (const item of inv.itens) {
    const rec = buildMovementRecord(inv, item, user);
    if (rec) movimentos.push(rec);
  }
  return movimentos;
}

async function persistMovements(base44, movimentos) {
  const produtoIds = [];
  for (const rec of movimentos) {
    await base44.asServiceRole.entities.MovimentacaoEstoque.create(rec);
    if (rec.produto_id) produtoIds.push(rec.produto_id);
  }
  return produtoIds;
}

function buildFinalizePatch(user) {
  return {
    status: 'Concluído',
    aprovado_por: user?.full_name || user?.email,
    aprovado_por_id: user?.id,
    data_aprovacao: new Date().toISOString(),
  };
}

// === Inlined from _lib/inventario/applyAdjustmentsHandler ===
async function handleApplyInventoryAdjustments(base44, ctx, inv, user) {
  const movimentoRecords = computeMovements(inv, user);
  if (!Array.isArray(movimentoRecords) || movimentoRecords.length === 0) {
    return { movimentos: [], movimentos_count: 0, skipped: true };
  }

  // Vol 7.2: Verificar estoque negativo em ajustes negativos sem permissão
  for (const rec of movimentoRecords) {
    if (Number(rec.quantidade) < 0) {
      const produtoId = rec.produto_id;
      const prods = await base44.asServiceRole.entities.Produto.filter({ id: produtoId }, undefined, 1);
      const produto = prods?.[0];
      if (produto) {
        const estoqueAtual = Number(produto.estoque_atual || 0);
        if (estoqueAtual + Number(rec.quantidade) < 0) {
          const permiteNegativo = backendHasPermission(ctx?.perfil, 'Estoque', null, 'permitir_negativo', user?.role);
          if (!permiteNegativo) {
            return {
              error: `Estoque insuficiente para ${produto.descricao || produto.codigo}: disponível ${estoqueAtual}, ajuste ${rec.quantidade}`,
              produto_id: produtoId,
            };
          }
        }
      }
    }
  }

  const produtoIds = await persistMovements(base44, movimentoRecords);
  await base44.asServiceRole.entities.Inventario.update(inv.id, buildFinalizePatch(user));

  try {
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user?.full_name || user?.email || 'Sistema',
      usuario_id: user?.id,
      acao: 'Edição', modulo: 'Estoque', entidade: 'Inventario',
      registro_id: inv.id, descricao: 'Aplicação de ajustes de inventário',
      dados_novos: { movimentos: produtoIds },
      data_hora: new Date().toISOString(),
    });
  } catch {}

  return { movimentos: produtoIds, movimentos_count: produtoIds.length, skipped: false };
}

// === Inlined from _lib/estoque/auditUtils ===
async function stockAudit(base44, user, { acao, entidade, registro_id, descricao, empresa_id = null, dados_novos = null, duracao_ms = null }, meta = null) {
  try {
    const merged = dados_novos && typeof dados_novos === 'object' ? { ...dados_novos } : {};
    if (meta) merged._meta = meta;
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user?.full_name || user?.email || 'Sistema',
      usuario_id: user?.id,
      acao, modulo: 'Estoque', entidade, registro_id, descricao,
      empresa_id: empresa_id || null,
      duracao_ms: typeof duracao_ms === 'number' ? duracao_ms : null,
      dados_novos: Object.keys(merged).length ? merged : null,
      data_hora: new Date().toISOString(),
    });
  } catch (auditErr) { console.error('applyInventoryAdjustments: AuditLog falhou:', auditErr); }
}

// === Inlined from _lib/notificationService ===
async function notify(base44, notif) {
  const { titulo, mensagem, tipo = 'alerta', categoria = 'Sistema', prioridade = 'Normal', empresa_id = null, dados = null } = notif || {};
  try {
    if (base44?.asServiceRole?.entities?.Notificacao?.create) {
      await base44.asServiceRole.entities.Notificacao.create({ titulo, mensagem, tipo, categoria, prioridade, empresa_id, dados });
    }
  } catch (notifErr) { console.error('applyInventoryAdjustments: Notificação falhou:', notifErr); }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const meta = extractRequestMeta(req);

    const payload = await req.json();
    const event = payload?.event;
    const data = payload?.data;
    const inventario_id = resolveEntityIdFromPayload({ ...payload, data, event }, ['inventario_id']);
    if (!inventario_id) return Response.json({ error: 'inventario_id é obrigatório' }, { status: 400 });

    if (!isApprovedStatus(data)) {
      return Response.json({ ok: true, skipped: true });
    }

    const perm = await assertPermission(base44, ctx, 'Estoque', 'Inventario', 'editar');
    if (perm) return perm;

    const inv = await base44.asServiceRole.entities.Inventario.get(inventario_id);
    if (!inv) return Response.json({ error: 'Inventário não encontrado' }, { status: 404 });
    {
      const ctxErr = assertContextPresence(inv, true);
      if (ctxErr) return ctxErr;
    }

    const result = await handleApplyInventoryAdjustments(base44, ctx, { ...inv, id: inventario_id }, user);
    if (result?.error) return Response.json({ error: result.error, produto_id: result.produto_id }, { status: 400 });
    if (result.skipped) return Response.json({ ok: true, skipped: true });

    await stockAudit(base44, user, {
      acao: 'Edição', entidade: 'Inventario', registro_id: inventario_id,
      descricao: 'Ajustes de inventário aplicados',
      empresa_id: inv?.empresa_id || null, dados_novos: { movimentos_count: result.movimentos_count }
    }, meta);

    await notify(base44, {
      titulo: 'Inventário: Ajustes Aplicados',
      mensagem: `${result.movimentos_count} movimentação(ões) de estoque geradas a partir do inventário`,
      tipo: 'info', categoria: 'Estoque', prioridade: 'Normal',
      empresa_id: inv?.empresa_id || null,
      dados: { inventario_id, movimentos_count: result.movimentos_count }
    });

    try {
      if (payload?.optimize_routes === true && inv?.empresa_id) {
        await base44.functions.invoke('optimizeDeliveryRoute', {
          empresa_id: inv.empresa_id, group_id: inv.group_id || null,
          entrega_ids: payload?.entrega_ids || []
        });
      }
    } catch (_) {}

    return Response.json({ ok: true, movimentos_count: result.movimentos_count });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});