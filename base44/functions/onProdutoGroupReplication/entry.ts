import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * P2.3: Handler bidirecional para Produto
 * Grupo → Empresas: replica produto/catálogo do grupo para empresas
 * Empresa → Grupo: sincroniza preços e estoque para consolidação
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity_id, event_type, data } = body;

    if (!entity_id) {
      return Response.json({ error: 'entity_id obrigatório' }, { status: 400 });
    }

    const produto = data || await base44.asServiceRole.entities.Produto.get(entity_id);
    if (!produto) {
      return Response.json({ error: `Produto ${entity_id} não encontrado` }, { status: 404 });
    }

    // Anti-loop
    if (produto.e_replicado === true) {
      return Response.json({ success: false, reason: 'anti-loop: e_replicado' });
    }

    const isGroupLevel = !!produto.group_id && !produto.empresa_id;

    // === DOWN: Grupo → Empresas (catálogo compartilhado) ===
    if (isGroupLevel && (event_type === 'create' || event_type === 'update')) {
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: produto.group_id });
      const empresasArr = Array.isArray(empresas) ? empresas : [];

      const resultados = await Promise.allSettled(empresasArr.map(async (emp) => {
        const existing = await base44.asServiceRole.entities.Produto.filter({
          group_id: produto.group_id,
          empresa_id: emp.id,
          codigo: produto.codigo,
          e_replicado: true
        }, undefined, 1);

        const payload = {
          ...produto,
          id: undefined,
          created_date: undefined,
          updated_date: undefined,
          empresa_id: emp.id,
          group_id: produto.group_id,
          e_replicado: true,
          documento_grupo_id: entity_id,
          // Estoques ficam zerados na empresa — serão gerenciados por movimentações
          estoque_atual: 0,
          estoque_reservado: 0,
          estoque_disponivel: 0,
        };

        if (Array.isArray(existing) && existing.length > 0) {
          // Só atualiza campos de catálogo (não estoque)
          const catalogPatch = { descricao: payload.descricao, preco_venda: payload.preco_venda, custo_aquisicao: payload.custo_aquisicao, unidade_medida: payload.unidade_medida, ncm: payload.ncm, grupo_produto_id: payload.grupo_produto_id, tipo_item: payload.tipo_item, status: payload.status };
          return base44.asServiceRole.entities.Produto.update(existing[0].id, catalogPatch);
        }
        return base44.asServiceRole.entities.Produto.create(payload);
      }));

      const ok = resultados.filter(r => r.status === 'fulfilled').length;
      const fail = resultados.filter(r => r.status === 'rejected').length;

      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email, usuario_id: user.id,
          modulo: 'Estoque', entidade: 'Produto', acao: 'Propagação Grupo→Empresas',
          tipo_auditoria: 'sistema', registro_id: entity_id, group_id: produto.group_id,
          descricao: `Produto ${produto.codigo} - ${produto.descricao} propagado para ${ok} empresas`,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}

      return Response.json({ success: true, direction: 'down', ok, fail });
    }

    // === UP: Empresa → Grupo (preços e dados comerciais) ===
    if (produto.empresa_id && produto.documento_grupo_id) {
      const patch = {};
      const syncFields = ['preco_venda', 'custo_aquisicao', 'preco_venda_minimo', 'margem_lucro_percentual', 'status'];
      syncFields.forEach(f => { if (produto[f] !== undefined) patch[f] = produto[f]; });

      if (Object.keys(patch).length > 0) {
        await base44.asServiceRole.entities.Produto.update(produto.documento_grupo_id, patch);
      }

      return Response.json({ success: true, direction: 'up', synced_fields: Object.keys(patch) });
    }

    return Response.json({ success: false, reason: 'Sem direção de propagação identificada' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});