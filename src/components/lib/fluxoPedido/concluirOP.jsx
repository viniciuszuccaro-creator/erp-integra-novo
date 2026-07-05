import { base44 } from "@/api/base44Client";
import { getUsuarioAtual, auditar } from './auditHelper';

/**
 * Baixa material consumido na produção
 */
async function baixarMaterialProducao(material, op, empresaId) {
  const produtos = await base44.entities.Produto.filter({
    id: material.bitola_id || material.produto_id,
    empresa_id: empresaId
  });

  const produto = produtos[0];
  if (!produto) return;

  const novoEstoque = (produto.estoque_atual || 0) - material.quantidade_kg;
  const user = await getUsuarioAtual();

  const movConsumo = await base44.entities.MovimentacaoEstoque.create({
    empresa_id: empresaId,
    group_id: op.group_id,
    tipo_movimento: "saida",
    origem_movimento: "producao",
    origem_documento_id: op.id,
    produto_id: produto.id,
    produto_descricao: material.descricao,
    quantidade: material.quantidade_kg,
    unidade_medida: "KG",
    estoque_anterior: produto.estoque_atual,
    estoque_atual: novoEstoque,
    data_movimentacao: new Date().toISOString(),
    documento: op.numero_op,
    motivo: `Consumo na produção - OP ${op.numero_op}`,
    responsavel: (user?.full_name || user?.email || "Sistema"),
    responsavel_id: user?.id
  });

  await auditar("Estoque", "MovimentacaoEstoque", "create", movConsumo.id, `Consumo na produção - OP ${op.numero_op}`, empresaId, null, movConsumo);
  await base44.entities.Produto.update(produto.id, { estoque_atual: Math.max(0, novoEstoque) });
}

/**
 * Concluir OP: baixa materiais + atualiza status + atualiza pedido vinculado
 */
export async function concluirOPCompleto(op, empresaId) {
  const resultados = { baixasMaterial: [], entrega: null, erros: [] };

  try {
    if (op.materiais_necessarios?.length > 0) {
      for (const material of op.materiais_necessarios) {
        try {
          await baixarMaterialProducao(material, op, empresaId);
        } catch (error) {
          resultados.erros.push(`Material ${material.descricao}: ${error.message}`);
        }
      }
    }

    const user = await getUsuarioAtual();
    await base44.entities.OrdemProducao.update(op.id, {
      status: "Finalizada",
      data_conclusao_real: new Date().toISOString(),
      percentual_conclusao: 100,
      historico_status: [
        ...(op.historico_status || []),
        {
          status_anterior: op.status,
          status_novo: "Finalizada",
          data_hora: new Date().toISOString(),
          usuario: (user?.full_name || user?.email || "Sistema"),
          observacao: "OP concluída - material liberado para expedição"
        }
      ]
    });

    await auditar("Produção", "OrdemProducao", "update", op.id, `OP ${op.numero_op} finalizada`, empresaId, { status: op.status }, { status: "Finalizada" });

    if (op.pedido_id) {
      await base44.entities.Pedido.update(op.pedido_id, { status: "Pronto para Faturar" });
      await auditar("Comercial", "Pedido", "update", op.pedido_id, `Pedido ${op.numero_pedido || ''} pronto para faturar (via OP ${op.numero_op})`, empresaId, { status: op.status }, { status: "Pronto para Faturar" });
    }
  } catch (error) {
    resultados.erros.push(`Erro ao concluir OP: ${error.message}`);
  }

  return resultados;
}