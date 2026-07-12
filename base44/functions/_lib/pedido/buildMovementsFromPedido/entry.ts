import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Inlined from _lib/orderReservationUtils
const ITEM_KEYS = ['itens_revenda','itens_armado_padrao','itens_corte_dobra'];

async function updateProdutoReservado(base44, produto, quantidade) {
  const novoReservado = Number(produto?.estoque_reservado || 0) + Number(quantidade || 0);
  await base44.asServiceRole.entities.Produto.update(produto.id, { estoque_reservado: novoReservado });
}

function buildReservaMov(produto, item, data, user) {
  const quantidade = Number(item?.quantidade || 0);
  return {
    origem_movimento: 'pedido',
    tipo_movimento: 'reserva',
    produto_id: item?.produto_id,
    produto_descricao: produto?.descricao,
    quantidade,
    unidade_medida: item?.unidade || produto?.unidade_estoque || 'UN',
    empresa_id: data?.empresa_id || null,
    group_id: data?.group_id || null,
    data_movimentacao: new Date().toISOString(),
    motivo: `Reserva para Pedido ${data?.numero_pedido || data?.id}`,
    valor_total: 0,
    responsavel: user?.full_name || user?.email,
    responsavel_id: user?.id,
  };
}

async function processReservas(base44, data, user) {
  const movimentos = [];
  for (const key of ITEM_KEYS) {
    const itens = Array.isArray(data?.[key]) ? data[key] : [];
    for (const it of itens) {
      const produtoId = it?.produto_id;
      const quantidade = Number(it?.quantidade || 0);
      if (!produtoId || quantidade <= 0) continue;

      const [produto] = await base44.asServiceRole.entities.Produto.filter({ id: produtoId });
      const podeSomar = produto && (produto.unidade_estoque === it?.unidade || !it?.unidade);

      if (podeSomar) {
        await updateProdutoReservado(base44, produto, quantidade);
      }

      const movRecord = buildReservaMov(produto, it, data, user);
      const mov = await base44.asServiceRole.entities.MovimentacaoEstoque.create(movRecord);
      if (mov?.id) movimentos.push(mov.id);
    }
  }
  return movimentos;
}

// Pequeno helper: converte Pedido em movimentos/reservas (reutilizável)
async function buildMovementsFromPedido(base44, pedido, user) {
  const movimentos = await processReservas(base44, pedido, user);
  return movimentos || [];
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/pedido/buildMovementsFromPedido' });
});