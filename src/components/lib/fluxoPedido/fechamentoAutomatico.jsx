import { base44 } from "@/api/base44Client";
import { getUsuarioAtual, auditar } from './auditHelper';
import { baixarEstoqueItemAprovacao } from './aprovarPedido';

/**
 * Executa fechamento automático completo do pedido (V21.6)
 * Baixa estoque + gera contas a receber + cria logística + atualiza status
 */
export async function executarFechamentoCompleto(pedido, empresaId, callbacks = {}) {
  const {
    onProgresso = () => {},
    onLog = () => {},
    onEtapaConcluida = () => {},
    onComplete = () => {},
    onError = () => {}
  } = callbacks;

  const resultados = {
    estoque: { sucesso: false, itens: [], erros: [] },
    financeiro: { sucesso: false, contas: [], erros: [] },
    logistica: { sucesso: false, entrega: null, erros: [] },
    status: { sucesso: false, erros: [] }
  };

  try {
    onLog('🚀 Iniciando fechamento automático...', 'info');
    onProgresso(0);

    // ETAPA 1: Baixar Estoque
    onLog('📦 Processando baixa de estoque...', 'info');
    try {
      const itens = [
        ...(pedido.itens_revenda || []),
        ...(pedido.itens_armado_padrao || []),
        ...(pedido.itens_corte_dobra || [])
      ];

      for (const item of itens) {
        if (item.produto_id) {
          try {
            const baixa = await baixarEstoqueItemAprovacao(item, pedido, empresaId);
            resultados.estoque.itens.push(baixa);
            onLog(`✅ ${item.descricao}: ${item.quantidade} ${item.unidade} baixado(s)`, 'success');
          } catch (error) {
            resultados.estoque.erros.push(error.message);
            onLog(`⚠️ ${item.descricao}: ${error.message}`, 'warning');
          }
        }
      }

      resultados.estoque.sucesso = true;
      onEtapaConcluida('estoque', true);
      onProgresso(25);
    } catch (error) {
      resultados.estoque.erros.push(error.message);
      onLog(`❌ Erro na baixa de estoque: ${error.message}`, 'error');
    }

    // ETAPA 2: Gerar Financeiro
    onLog('💰 Gerando contas a receber...', 'info');
    try {
      const numeroParcelas = pedido.numero_parcelas || 1;
      const valorParcela = pedido.valor_total / numeroParcelas;
      const dataEmissao = new Date();

      for (let i = 1; i <= numeroParcelas; i++) {
        const dataVencimento = new Date(dataEmissao);
        const intervalo = pedido.intervalo_parcelas || 30;
        dataVencimento.setDate(dataVencimento.getDate() + (i * intervalo));

        const conta = await base44.entities.ContaReceber.create({
          empresa_id: empresaId,
          group_id: pedido.group_id,
          origem_tipo: 'pedido',
          descricao: `Venda - Pedido ${pedido.numero_pedido} - Parcela ${i}/${numeroParcelas}`,
          cliente: pedido.cliente_nome,
          cliente_id: pedido.cliente_id,
          pedido_id: pedido.id,
          valor: valorParcela,
          data_emissao: dataEmissao.toISOString().split('T')[0],
          data_vencimento: dataVencimento.toISOString().split('T')[0],
          status: 'Pendente',
          forma_recebimento: pedido.forma_pagamento || 'À Vista',
          numero_documento: pedido.numero_pedido,
          numero_parcela: `${i}/${numeroParcelas}`,
          visivel_no_portal: true
        });

        await auditar("Financeiro", "ContaReceber", "create", conta.id, `CR gerada do Pedido ${pedido.numero_pedido} - Parcela ${i}/${numeroParcelas}`, empresaId, null, conta);
        resultados.financeiro.contas.push(conta);
        onLog(`✅ Parcela ${i}/${numeroParcelas}: R$ ${valorParcela.toFixed(2)} - Venc: ${dataVencimento.toLocaleDateString('pt-BR')}`, 'success');
      }

      resultados.financeiro.sucesso = true;
      onEtapaConcluida('financeiro', true);
      onProgresso(50);
    } catch (error) {
      resultados.financeiro.erros.push(error.message);
      onLog(`❌ Erro ao gerar financeiro: ${error.message}`, 'error');
    }

    // ETAPA 3: Criar Logística
    onLog('🚚 Criando registro de logística...', 'info');
    try {
      const tipoFrete = pedido.tipo_frete || 'CIF';

      if (tipoFrete === 'Retirada') {
        await base44.entities.Pedido.update(pedido.id, {
          observacoes_internas: (pedido.observacoes_internas || '') + '\n[AUTOMAÇÃO] Cliente irá retirar na loja.'
        });
        onLog(`✅ Pedido marcado para RETIRADA`, 'success');
      } else {
        const user = await getUsuarioAtual();
        const entrega = await base44.entities.Entrega.create({
          empresa_id: empresaId,
          group_id: pedido.group_id,
          pedido_id: pedido.id,
          numero_pedido: pedido.numero_pedido,
          cliente_id: pedido.cliente_id,
          cliente_nome: pedido.cliente_nome,
          endereco_entrega_completo: pedido.endereco_entrega_principal || {},
          contato_entrega: {
            nome: pedido.cliente_nome,
            telefone: pedido.contatos_cliente?.[0]?.valor || ''
          },
          data_previsao: pedido.data_prevista_entrega || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          tipo_frete: tipoFrete,
          valor_mercadoria: pedido.valor_total,
          valor_frete: pedido.valor_frete || 0,
          peso_total_kg: pedido.peso_total_kg || 0,
          volumes: 1,
          status: 'Aguardando Separação',
          prioridade: pedido.prioridade || 'Normal',
          usuario_responsavel: (user?.full_name || user?.email || 'Sistema'),
          usuario_responsavel_id: user?.id
        });

        await auditar("Expedição", "Entrega", "create", entrega.id, `Entrega criada do Pedido ${pedido.numero_pedido}`, empresaId, null, entrega);
        resultados.logistica.entrega = entrega;
        onLog(`✅ Entrega criada - Previsão: ${pedido.data_prevista_entrega || 'A definir'}`, 'success');
      }

      resultados.logistica.sucesso = true;
      onEtapaConcluida('logistica', true);
      onProgresso(75);
    } catch (error) {
      resultados.logistica.erros.push(error.message);
      onLog(`❌ Erro ao criar logística: ${error.message}`, 'error');
    }

    // ETAPA 4: Atualizar Status
    onLog('📝 Atualizando status do pedido...', 'info');
    try {
      await base44.entities.Pedido.update(pedido.id, {
        status: 'Pronto para Faturar',
        observacoes_internas: (pedido.observacoes_internas || '') +
          `\n[AUTOMAÇÃO ${new Date().toLocaleString('pt-BR')}] Fluxo automático concluído com sucesso.`
      });
      await auditar("Comercial", "Pedido", "update", pedido.id, `Pedido ${pedido.numero_pedido} pronto para faturar (fechamento automático)`, empresaId, null, { status: 'Pronto para Faturar' });

      resultados.status.sucesso = true;
      onEtapaConcluida('status', true);
      onProgresso(100);
      onLog(`✅ Pedido atualizado para: PRONTO PARA FATURAR`, 'success');
      onLog(`🎉 AUTOMAÇÃO CONCLUÍDA COM SUCESSO!`, 'success');
      onComplete(resultados);
    } catch (error) {
      resultados.status.erros.push(error.message);
      onLog(`❌ Erro ao atualizar status: ${error.message}`, 'error');
      onError(error);
    }
  } catch (error) {
    onLog(`❌ Erro crítico: ${error.message}`, 'error');
    onError(error);
  }

  return resultados;
}

/**
 * Valida estoque antes de fechar pedido
 */
export async function validarEstoqueCompleto(pedido, empresaId) {
  const itens = [
    ...(pedido.itens_revenda || []),
    ...(pedido.itens_armado_padrao || []),
    ...(pedido.itens_corte_dobra || [])
  ];

  const resultados = { valido: true, itensInsuficientes: [], itensOK: [] };

  for (const item of itens) {
    if (item.produto_id) {
      const produtos = await base44.entities.Produto.filter({ id: item.produto_id, empresa_id: empresaId });
      const produto = produtos[0];
      if (produto) {
        const estoqueAtual = produto.estoque_atual || 0;
        const quantidadeNecessaria = item.quantidade || 0;

        if (estoqueAtual >= quantidadeNecessaria) {
          resultados.itensOK.push({
            produto: item.descricao,
            estoque: estoqueAtual,
            necessario: quantidadeNecessaria,
            sobra: estoqueAtual - quantidadeNecessaria
          });
        } else {
          resultados.valido = false;
          resultados.itensInsuficientes.push({
            produto: item.descricao,
            estoque: estoqueAtual,
            necessario: quantidadeNecessaria,
            falta: quantidadeNecessaria - estoqueAtual
          });
        }
      }
    }
  }

  return resultados;
}

/**
 * Estatísticas de automação dos últimos N dias
 */
export async function obterEstatisticasAutomacao(empresaId = null, diasRetroativos = 7) {
  const dataLimite = new Date();
  dataLimite.setDate(dataLimite.getDate() - diasRetroativos);

  const filtro = empresaId ? { empresa_id: empresaId } : {};
  const pedidos = await base44.entities.Pedido.filter(filtro);

  const pedidosRecentes = pedidos.filter(p => new Date(p.created_date) >= dataLimite);
  const pedidosFechados = pedidosRecentes.filter(p =>
    p.status === 'Pronto para Faturar' || p.status === 'Faturado' || p.status === 'Em Expedição'
  );
  const pedidosComAutomacao = pedidosFechados.filter(p => p.observacoes_internas?.includes('[AUTOMAÇÃO'));
  const taxaAutomacao = pedidosFechados.length > 0
    ? (pedidosComAutomacao.length / pedidosFechados.length) * 100
    : 0;

  return {
    totalPedidos: pedidosRecentes.length,
    pedidosFechados: pedidosFechados.length,
    pedidosAutomaticos: pedidosComAutomacao.length,
    taxaAutomacao,
    diasAnalise: diasRetroativos,
    empresaId
  };
}