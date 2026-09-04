import { base44 } from "@/api/base44Client";
import { getUsuarioAtual, auditar } from './auditHelper';

/**
 * Fase 8: Baixa material consumido na produção
 * Regra-Mãe: Produto é cadastro único compartilhado do grupo — busca por ID (sem filtro empresa_id)
 */
async function baixarMaterialProducao(material, op, empresaId) {
  const produtoId = material.produto_id || material.bitola_id;
  if (!produtoId) return null;

  // F8: cadastro único compartilhado (empresas_compartilhadas_ids) — ID é globalmente único
  const produtos = await base44.entities.Produto.filter({ id: produtoId });
  const produto = produtos?.[0];
  if (!produto) return null;

  const quantidade = Number(material.quantidade_kg ?? material.quantidade_prevista ?? 0);
  if (quantidade <= 0) return null;

  const novoEstoque = (produto.estoque_atual || 0) - quantidade;
  const user = await getUsuarioAtual();

  const movConsumo = await base44.entities.MovimentacaoEstoque.create({
    empresa_id: empresaId,
    group_id: op.group_id,
    tipo_movimento: "saida",
    origem_movimento: "producao",
    origem_documento_id: op.id,
    produto_id: produto.id,
    produto_descricao: material.produto_descricao || material.descricao || produto.descricao,
    quantidade: quantidade,
    unidade_medida: material.unidade || "KG",
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

  return movConsumo;
}

/**
 * Fase 8 — Concluir OP (integração Produção → Estoque/Expedição):
 * 1. Baixa matéria-prima consumida do estoque (materia_prima_prevista — campo do schema)
 * 2. Atualiza status para "Pronto para Expedição" (status válido do enum OrdemProducao)
 * 3. Atualiza pedido vinculado para "Pronto para Faturar"
 * Regra-Mãe 5: multiempresa, auditoria e cadastro único preservados
 */
export async function concluirOPCompleto(op, empresaId) {
  const resultados = { baixasMaterial: [], erros: [] };

  try {
    const user = await getUsuarioAtual();

    // F8: campo correto do schema (materia_prima_prevista); legado materiais_necessarios como fallback
    const materiais = op.materia_prima_prevista || op.materiais_necessarios || [];
    const materiaisAtualizados = [];

    for (const material of materiais) {
      try {
        const mov = await baixarMaterialProducao(material, op, empresaId);
        if (mov) {
          resultados.baixasMaterial.push(mov.id);
          materiaisAtualizados.push({
            ...material,
            quantidade_consumida: Number(material.quantidade_consumida || 0) + Number(material.quantidade_kg ?? material.quantidade_prevista ?? 0)
          });
        } else {
          materiaisAtualizados.push(material);
        }
      } catch (error) {
        resultados.erros.push(`Material ${material.produto_descricao || material.descricao || ''}: ${error.message}`);
        materiaisAtualizados.push(material);
      }
    }

    const pesoProduzido = Number(op.progresso_fisico_kg || op.peso_total_kg || 0);

    await base44.entities.OrdemProducao.update(op.id, {
      status: "Pronto para Expedição",
      data_conclusao_real: new Date().toISOString(),
      progresso_fisico_percentual: 100,
      progresso_fisico_kg: pesoProduzido,
      ...(materiaisAtualizados.length ? { materia_prima_prevista: materiaisAtualizados } : {}),
      historico_mudancas_status: [
        ...(op.historico_mudancas_status || []),
        {
          status_anterior: op.status,
          status_novo: "Pronto para Expedição",
          data_hora: new Date().toISOString(),
          usuario: (user?.full_name || user?.email || "Sistema"),
          motivo: "OP concluída - materiais baixados do estoque e liberados para expedição"
        }
      ]
    });

    await auditar("Produção", "OrdemProducao", "update", op.id,
      `OP ${op.numero_op} pronta para expedição — ${resultados.baixasMaterial.length} baixa(s) de estoque`,
      empresaId,
      { status: op.status },
      { status: "Pronto para Expedição", baixas_estoque: resultados.baixasMaterial.length }
    );

    if (op.pedido_id) {
      await base44.entities.Pedido.update(op.pedido_id, { status: "Pronto para Faturar" });
      await auditar("Comercial", "Pedido", "update", op.pedido_id,
        `Pedido ${op.numero_pedido || ''} pronto para faturar (via OP ${op.numero_op})`,
        empresaId, { status: op.status }, { status: "Pronto para Faturar" });
    }
  } catch (error) {
    resultados.erros.push(`Erro ao concluir OP: ${error.message}`);
  }

  return resultados;
}