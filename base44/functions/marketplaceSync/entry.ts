import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * Marketplace Sync Bidirecional (Ciclo 10)
 * Mercado Livre, Amazon, Shopee — pedidos ↔ estoque
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') return Response.json({ error: 'Admin only' }, { status: 403 });

    const { marketplace, action = 'sync_pedidos', empresa_id, group_id } = await req.json().catch(() => ({}));
    // Invocacao agendada sem marketplace especifico → executa todos os marketplaces suportados
    const VALID = ['mercado_livre', 'amazon', 'shopee'];
    const marketplaces = marketplace ? [marketplace] : VALID;
    if (marketplaces.some(m => !VALID.includes(m))) {
      return Response.json({ error: 'Marketplace desconhecido' }, { status: 400 });
    }

    const scope = { ...(group_id && { group_id }), ...(empresa_id && { empresa_id }) };

    // TODO: Integrar com APIs reais do marketplace
    // Por enquanto, simulamos a sincronização

    const resultados = [];
    for (const mp of marketplaces) {
      const resultado = {
        marketplace: mp,
        action,
        timestamp: new Date().toISOString(),
        empresa_id,
        group_id,
        pedidos_sincronizados: 0,
        produtos_atualizados: 0,
        erros: []
      };

      if (action === 'sync_pedidos') {
        // Buscar pedidos pendentes e importar do marketplace
        resultado.pedidos_sincronizados = Math.floor(Math.random() * 10);
      } else if (action === 'sync_estoque') {
        // Atualizar estoque dos produtos no marketplace
        const produtos = await base44.entities.Produto?.filter?.(scope, '-updated_date', 50) || [];
        resultado.produtos_atualizados = produtos.length;
      }
      resultados.push(resultado);
    }

    return Response.json(marketplace ? resultados[0] : { resultados });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});