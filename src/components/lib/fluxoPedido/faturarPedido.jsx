import { base44 } from "@/api/base44Client";
import { getUsuarioAtual, auditar } from './auditHelper';

/**
 * Baixa estoque de item (liberação de reserva no faturamento)
 * Vol 5.2: Suporta quantidade parcial — baixa apenas a quantidade faturada nesta etapa
 */
async function baixarEstoqueItem(item, pedido, empresaId, quantidadeFaturar) {
  const produtos = await base44.entities.Produto.filter({ id: item.produto_id, empresa_id: empresaId });
  const produto = produtos[0];

  if (!produto) {
    throw new Error("Produto não encontrado");
  }

  // Vol 5.2: Usa quantidade específica para faturamento parcial; fallback para quantidade total
  const qtdBaixar = quantidadeFaturar != null ? quantidadeFaturar : item.quantidade;

  const novoReservado = Math.max(0, (produto.estoque_reservado || 0) - qtdBaixar);
  const novoEstoque = (produto.estoque_atual || 0) - qtdBaixar;

  if (novoEstoque < 0) {
    throw new Error(`Estoque insuficiente para ${produto.descricao}`);
  }

  const user = await getUsuarioAtual();
  const movimentacao = await base44.entities.MovimentacaoEstoque.create({
    empresa_id: empresaId,
    group_id: pedido.group_id,
    tipo_movimento: "liberacao_reserva",
    origem_movimento: "pedido",
    origem_documento_id: pedido.id,
    produto_id: item.produto_id,
    produto_descricao: item.descricao,
    codigo_produto: item.codigo_sku,
    quantidade: qtdBaixar,
    unidade_medida: item.unidade,
    estoque_anterior: produto.estoque_atual,
    estoque_atual: novoEstoque,
    reservado_anterior: produto.estoque_reservado || 0,
    reservado_atual: novoReservado,
    data_movimentacao: new Date().toISOString(),
    documento: pedido.numero_pedido,
    motivo: `Baixa por faturamento ${quantidadeFaturar != null ? 'parcial' : 'total'} - NF-e`,
    responsavel: (user?.full_name || user?.email || "Sistema"),
    responsavel_id: user?.id
  });

  await base44.entities.Produto.update(item.produto_id, {
    estoque_atual: novoEstoque,
    estoque_reservado: novoReservado
  });

  await auditar("Estoque", "MovimentacaoEstoque", "create", movimentacao.id,
    `Baixa por faturamento ${quantidadeFaturar != null ? 'parcial' : 'total'} - Pedido ${pedido.numero_pedido}`,
    empresaId, null, movimentacao);
  return movimentacao;
}

/**
 * Vol 5.2: Calcula saldo pendente de faturamento por item
 * Retorna { itensPendentes, valorPendente, valorFaturado, totalmenteFaturado }
 */
export function calcularSaldoFaturamento(pedido) {
  const tiposItem = ['itens_revenda', 'itens_armado_padrao', 'itens_corte_dobra'];
  let valorFaturado = 0;
  let valorPendente = 0;
  let totalmenteFaturado = true;

  for (const tipo of tiposItem) {
    const itens = pedido?.[tipo] || [];
    for (const item of itens) {
      const qtdTotal = item.quantidade || 0;
      const qtdFaturada = item.quantidade_faturada || 0;
      const qtdPendente = qtdTotal - qtdFaturada;
      const valorUnitario = item.valor_unitario || item.preco_unitario || 0;
      valorFaturado += qtdFaturada * valorUnitario;
      valorPendente += qtdPendente * valorUnitario;
      if (qtdPendente > 0.001) totalmenteFaturado = false;
    }
  }

  return { valorFaturado, valorPendente, totalmenteFaturado };
}

/**
 * Faturar pedido: baixa estoque + cria entrega
 * Vol 5.2: Suporta faturamento PARCIAL via itensParaFaturar = [{ item_id, quantidade }]
 *   - Se itensParaFaturar for fornecido, fatura apenas os itens/quantidades selecionados
 *   - Mantém saldo não faturado no pedido original
 *   - Status: "Faturamento Parcial" (se há saldo) ou "Faturado" (se total)
 *   - Registra antes/depois em auditoria
 */
export async function faturarPedidoCompleto(pedido, nfe, empresaId, itensParaFaturar) {
  const resultados = { baixasEstoque: [], entrega: null, erros: [], faturamentoParcial: false, valorFaturado: 0, valorPendente: 0 };

  // Vol 5.2/Regra-Mãe: Faturamento deve ocorrer na empresa, nunca no grupo.
  if (!empresaId) {
    resultados.erros.push('Faturamento bloqueado: empresa_id é obrigatório. NF-e só pode ser emitida na empresa, não no grupo.');
    return resultados;
  }
  if (!pedido?.group_id) {
    resultados.erros.push('Faturamento bloqueado: pedido sem group_id (multiempresa).');
    return resultados;
  }

  // Snapshot antes (para auditoria antes/depois)
  const pedidoAntes = JSON.parse(JSON.stringify({
    itens_revenda: pedido.itens_revenda,
    itens_armado_padrao: pedido.itens_armado_padrao,
    itens_corte_dobra: pedido.itens_corte_dobra,
    status: pedido.status,
    valor_faturado: pedido.valor_faturado,
    valor_pendente_faturamento: pedido.valor_pendente_faturamento,
    peso_faturado_kg: pedido.peso_faturado_kg
  }));

  try {
    const user = await getUsuarioAtual();
    const ehParcial = Array.isArray(itensParaFaturar) && itensParaFaturar.length > 0;

    // Mapeia itens por ID para lookup rápido
    const mapaItens = {};
    const tiposItem = [
      { key: 'itens_revenda', itens: pedido.itens_revenda },
      { key: 'itens_armado_padrao', itens: pedido.itens_armado_padrao },
      { key: 'itens_corte_dobra', itens: pedido.itens_corte_dobra },
    ];
    for (const { key, itens } of tiposItem) {
      if (!itens) continue;
      itens.forEach((item, idx) => {
        const itemId = item.produto_id || `${key}_${idx}`;
        mapaItens[itemId] = { item, tipoKey: key, idx };
      });
    }

    // Determina quais itens/quantidades faturar
    const itensProcessar = [];
    if (ehParcial) {
      for (const sel of itensParaFaturar) {
        const found = mapaItens[sel.item_id];
        if (!found) {
          resultados.erros.push(`Item não encontrado: ${sel.item_id}`);
          continue;
        }
        const qtdFaturadaAtual = found.item.quantidade_faturada || 0;
        const qtdPendente = (found.item.quantidade || 0) - qtdFaturadaAtual;
        // Vol 5.2: Impedir faturamento superior ao saldo do item
        if (sel.quantidade > qtdPendente + 0.001) {
          resultados.erros.push(`Quantidade a faturar (${sel.quantidade}) excede saldo pendente (${qtdPendente}) do item ${found.item.descricao || found.item.produto_descricao}`);
          continue;
        }
        itensProcessar.push({ ...found, quantidadeFaturar: sel.quantidade });
      }
    } else {
      // Faturamento total: processa todos os itens com saldo pendente
      for (const itemId of Object.keys(mapaItens)) {
        const found = mapaItens[itemId];
        const qtdFaturadaAtual = found.item.quantidade_faturada || 0;
        const qtdPendente = (found.item.quantidade || 0) - qtdFaturadaAtual;
        if (qtdPendente > 0.001) {
          itensProcessar.push({ ...found, quantidadeFaturar: qtdPendente });
        }
      }
    }

    if (itensProcessar.length === 0) {
      resultados.erros.push('Nenhum item com saldo pendente para faturar.');
      return resultados;
    }

    // Baixa estoque dos itens selecionados
    for (const proc of itensProcessar) {
      try {
        const baixa = await baixarEstoqueItem(proc.item, pedido, empresaId, proc.quantidadeFaturar);
        resultados.baixasEstoque.push(baixa);
        // Atualiza quantidade_faturada no item
        proc.item.quantidade_faturada = (proc.item.quantidade_faturada || 0) + proc.quantidadeFaturar;
      } catch (error) {
        resultados.erros.push(`Erro ao baixar ${proc.item.descricao || proc.item.produto_descricao}: ${error.message}`);
      }
    }

    // Calcula saldos após faturamento
    const tiposAtualizados = [
      { key: 'itens_revenda', itens: pedido.itens_revenda },
      { key: 'itens_armado_padrao', itens: pedido.itens_armado_padrao },
      { key: 'itens_corte_dobra', itens: pedido.itens_corte_dobra },
    ];
    let valorFaturadoTotal = 0;
    let valorPendenteTotal = 0;
    let pesoFaturadoTotal = 0;
    for (const { itens } of tiposAtualizados) {
      if (!itens) continue;
      for (const item of itens) {
        const qtdFat = item.quantidade_faturada || 0;
        const qtdPend = (item.quantidade || 0) - qtdFat;
        const valorUnit = item.valor_unitario || item.preco_unitario || 0;
        valorFaturadoTotal += qtdFat * valorUnit;
        valorPendenteTotal += qtdPend * valorUnit;
      }
    }

    const totalmenteFaturado = valorPendenteTotal < 0.01;

    // Cria entrega
    const entrega = await base44.entities.Entrega.create({
      empresa_id: empresaId,
      group_id: pedido.group_id,
      pedido_id: pedido.id,
      numero_pedido: pedido.numero_pedido,
      nfe_id: nfe?.id,
      cliente_id: pedido.cliente_id,
      cliente_nome: pedido.cliente_nome,
      endereco_entrega_completo: pedido.endereco_entrega_principal,
      contato_entrega: pedido.contatos_cliente?.[0] || {},
      data_previsao: pedido.data_prevista_entrega,
      transportadora: pedido.transportadora,
      tipo_frete: pedido.tipo_frete,
      volumes: pedido.volumes,
      peso_total_kg: pedido.peso_total_kg,
      valor_mercadoria: totalmenteFaturado ? pedido.valor_total : valorFaturadoTotal,
      status: "Pronto para Expedir",
      prioridade: pedido.prioridade || "Normal",
      usuario_responsavel: (user?.full_name || user?.email || 'Sistema'),
      usuario_responsavel_id: user?.id,
      qr_code: `ENT-${Date.now()}`,
      historico_status: [{
        status: "Pronto para Expedir",
        data_hora: new Date().toISOString(),
        usuario: (user?.full_name || user?.email || "Sistema"),
        observacao: `Entrega criada no faturamento ${totalmenteFaturado ? 'total' : 'parcial'}`
      }]
    });

    await auditar("Logística", "Entrega", "create", entrega.id,
      `Entrega criada do Pedido ${pedido.numero_pedido} (${totalmenteFaturado ? 'total' : 'parcial'})`,
      empresaId, null, entrega);
    resultados.entrega = entrega;
    resultados.faturamentoParcial = !totalmenteFaturado;
    resultados.valorFaturado = valorFaturadoTotal;
    resultados.valorPendente = valorPendenteTotal;

    // Atualiza pedido com saldos e status
    const novoStatus = totalmenteFaturado ? "Faturado" : "Faturamento Parcial";
    const updateData = {
      status: novoStatus,
      ordem_expedicao_id: entrega.id,
      data_entrega_realizada: totalmenteFaturado ? new Date().toISOString().split('T')[0] : null,
      valor_faturado: valorFaturadoTotal,
      valor_pendente_faturamento: valorPendenteTotal,
      peso_faturado_kg: pesoFaturadoTotal,
      itens_revenda: pedido.itens_revenda,
      itens_armado_padrao: pedido.itens_armado_padrao,
      itens_corte_dobra: pedido.itens_corte_dobra,
    };

    await base44.entities.Pedido.update(pedido.id, updateData);

    // Vol 5.2: Auditoria com antes/depois
    await auditar("Comercial", "Pedido", "update", pedido.id,
      `Pedido ${pedido.numero_pedido} ${totalmenteFaturado ? 'faturado totalmente' : 'faturado parcialmente'} - R$ ${valorFaturadoTotal.toFixed(2)}`,
      empresaId,
      { status: pedidoAntes.status, valor_faturado: pedidoAntes.valor_faturado, valor_pendente: pedidoAntes.valor_pendente_faturamento },
      { status: novoStatus, valor_faturado: valorFaturadoTotal, valor_pendente: valorPendenteTotal, itens_atualizados: itensProcessar.length }
    );
  } catch (error) {
    resultados.erros.push(`Erro no faturamento: ${error.message}`);
  }

  return resultados;
}