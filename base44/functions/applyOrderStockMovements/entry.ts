import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// === Inlined from _lib/guard (backend functions deploy independently — no relative imports) ===
async function getUserAndPerfil(base44) {
  const user = await base44.auth.me().catch(() => null);
  let perfil = null;
  try {
    if (user?.perfil_acesso_id) {
      perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id);
    }
  } catch (e) { console.error('[applyOrderStockMovements] catch:', e); }
  return { user, perfil };
}

const _normalize = (a) => {
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
  if (Array.isArray(cursor)) {
    return cursor.includes(desired) || (desired === 'visualizar' && cursor.includes('ver'));
  }
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

function assertContextPresence({ empresa_id, group_id }, requireEmpresa = true) {
  if (requireEmpresa) {
    if (!empresa_id && !group_id) {
      return Response.json({ error: 'Contexto multiempresa obrigatório (empresa_id ou group_id)' }, { status: 400 });
    }
  }
  return null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user, perfil } = await getUserAndPerfil(base44);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const userAgent = req.headers.get('user-agent') || '';
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || req.headers.get('x-real-ip') || '';

    const body = await req.json().catch(() => ({}));
    const pedido = body?.pedido;
    if (!pedido?.empresa_id) {
      return Response.json({ error: 'empresa_id obrigatório no pedido' }, { status: 400 });
    }

    // Multiempresa e RBAC
    const ctxErr = assertContextPresence(pedido || {}, true);
    if (ctxErr) return ctxErr;

    const allowed = backendHasPermission(perfil, 'Comercial', 'Pedido', 'editar', user.role);
    if (!allowed) {
      try {
        await base44.entities.AuditLog.create({
          usuario: user.full_name || user.email || 'Usuário',
          usuario_id: user.id,
          empresa_id: pedido.empresa_id || null,
          acao: 'Bloqueio',
          modulo: 'Comercial',
          tipo_auditoria: 'seguranca',
          entidade: 'Pedido',
          registro_id: pedido.id || null,
          descricao: 'RBAC: tentativa de baixa de estoque sem permissão (Comercial.Pedido.editar)',
          ip_address: ip,
          user_agent: userAgent,
          data_hora: new Date().toISOString(),
        });
      } catch (_) { console.error('[applyOrderStockMovements] catch:', _); }
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const itens = Array.isArray(pedido.itens_revenda) ? pedido.itens_revenda : [];
    let movimentos = 0;
    const movimentosDetalhes = [];

    for (const item of itens) {
      if (!item?.produto_id || !item?.quantidade) continue;

      const prods = await base44.entities.Produto.filter({ id: item.produto_id, empresa_id: pedido.empresa_id });
      const produto = prods?.[0];
      if (!produto) continue;

      const estoqueAtual = Number(produto.estoque_atual || 0);
      const qtd = Number(item.quantidade || 0);
      if (qtd <= 0) continue;

      // Vol 7.2: Não permitir estoque negativo sem permissão e justificativa
      const novoEstoque = estoqueAtual - qtd;
      if (novoEstoque < 0) {
        const permiteNegativo = backendHasPermission(perfil, 'Estoque', null, 'permitir_negativo', user.role);
        const justificativa = body?.justificativa_estoque_negativo;
        if (!permiteNegativo) {
          return Response.json({
            error: `Estoque insuficiente para ${produto.descricao || produto.codigo}: disponível ${estoqueAtual}, solicitado ${qtd}`,
            produto_id: item.produto_id,
            estoque_disponivel: estoqueAtual,
            quantidade_solicitada: qtd,
          }, { status: 400 });
        }
        if (!justificativa) {
          return Response.json({
            error: `Estoque negativo para ${produto.descricao || produto.codigo} exige justificativa`,
            produto_id: item.produto_id,
          }, { status: 400 });
        }
      }

      await base44.entities.MovimentacaoEstoque.create({
        empresa_id: pedido.empresa_id,
        group_id: pedido.group_id || null,
        tipo_movimento: 'saida',
        origem_movimento: 'pedido',
        origem_documento_id: pedido.id || `temp_${Date.now()}`,
        produto_id: item.produto_id,
        produto_descricao: item.descricao || item.produto_descricao || produto.descricao,
        codigo_produto: item.codigo_sku || produto.codigo,
        quantidade: qtd,
        unidade_medida: item.unidade || produto.unidade_medida || 'UN',
        estoque_anterior: estoqueAtual,
        estoque_atual: novoEstoque,
        data_movimentacao: new Date().toISOString(),
        documento: pedido.numero_pedido,
        motivo: novoEstoque < 0
          ? `Baixa automática (ESTOQUE NEGATIVO) - ${body?.justificativa_estoque_negativo || 'sem justificativa'}`
          : `Baixa automática - Pedido ${pedido.id ? 'atualizado' : 'criado'} aprovado`,
        responsavel: user.full_name || user.email || 'Usuário',
        aprovado: true,
      });

      await base44.entities.Produto.update(item.produto_id, { estoque_atual: novoEstoque });

      movimentosDetalhes.push({
        produto_id: item.produto_id,
        codigo_produto: item.codigo_sku || produto.codigo,
        estoque_anterior: estoqueAtual,
        quantidade: qtd,
        estoque_atual: novoEstoque,
      });

      movimentos += 1;
    }

    // Auditoria
    await base44.entities.AuditLog.create({
      usuario: user.full_name || user.email || 'Usuário',
      usuario_id: user.id,
      empresa_id: pedido.empresa_id,
      acao: 'Edição',
      modulo: 'Estoque',
      tipo_auditoria: 'entidade',
      entidade: 'MovimentacaoEstoque',
      registro_id: pedido.id || null,
      descricao: `Baixa de estoque por aprovação de pedido (#movimentos=${movimentos})`,
      dados_novos: { pedido_id: pedido.id, numero_pedido: pedido.numero_pedido, itens_processados: movimentos, movimentos: movimentosDetalhes },
      ip_address: ip,
      user_agent: userAgent,
      data_hora: new Date().toISOString(),
    });

    return Response.json({ ok: true, movimentos });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});