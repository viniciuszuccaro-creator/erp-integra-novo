import { useQuery } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * Hook: cálculo de rentabilidade por cliente
 * P2: Multi-tenant via filterInContext (contexto explícito grupo/empresa)
 * P4: Dados derivados separados da UI
 */
export default function useRentabilidadeCliente({ empresaId, periodo = 12 }) {
  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', contextoKey],
    queryFn: () => filterInContext('Cliente', {}, 'nome', 999),
    enabled: !!contexto,
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', contextoKey],
    queryFn: () => filterInContext('Pedido', {}, '-data_pedido', 999),
    enabled: !!contexto,
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber', contextoKey],
    queryFn: () => filterInContext('ContaReceber', {}, '-created_date', 999),
    enabled: !!contexto,
  });

  const calcularRentabilidade = () => {
    const hoje = new Date();
    const dataCorte = new Date(hoje.getFullYear(), hoje.getMonth() - periodo, hoje.getDate());
    const porCliente = {};

    pedidos
      .filter(p => {
        const dataPedido = new Date(p.data_pedido);
        return p.status !== 'Cancelado' &&
               dataPedido >= dataCorte &&
               (!empresaId || p.empresa_id === empresaId);
      })
      .forEach(p => {
        const key = p.cliente_id || p.cliente_nome;
        if (!key) return;
        if (!porCliente[key]) {
          const cliente = clientes.find(c => c.id === p.cliente_id);
          porCliente[key] = {
            cliente_id: p.cliente_id,
            cliente_nome: p.cliente_nome,
            classificacao_abc: cliente?.classificacao_abc || 'Novo',
            regiao: cliente?.regiao_atendimento || 'Nacional',
            faturamento: 0, custos: 0, margem_valor: 0, margem_percentual: 0,
            quantidade_pedidos: 0, ticket_medio: 0, frequencia_dias: 0,
            primeira_compra: null, ultima_compra: null,
            dias_cliente: 0, status_pagamento: 'OK', dias_atraso_medio: 0,
          };
        }
        porCliente[key].faturamento += p.valor_total || 0;
        porCliente[key].custos += p.custo_total || 0;
        porCliente[key].quantidade_pedidos += 1;
        if (!porCliente[key].primeira_compra || new Date(p.data_pedido) < new Date(porCliente[key].primeira_compra)) {
          porCliente[key].primeira_compra = p.data_pedido;
        }
        if (!porCliente[key].ultima_compra || new Date(p.data_pedido) > new Date(porCliente[key].ultima_compra)) {
          porCliente[key].ultima_compra = p.data_pedido;
        }
      });

    contasReceber
      .filter(c => c.status === 'Atrasado' || (c.status === 'Pendente' && new Date(c.data_vencimento) < hoje))
      .forEach(c => {
        const key = c.cliente_id || c.cliente;
        if (porCliente[key]) {
          const diasAtraso = Math.floor((hoje - new Date(c.data_vencimento)) / (1000 * 60 * 60 * 24));
          porCliente[key].dias_atraso_medio = (porCliente[key].dias_atraso_medio || 0) + diasAtraso;
          porCliente[key].status_pagamento = diasAtraso > 30 ? 'Crítico' : 'Alerta';
        }
      });

    return Object.values(porCliente)
      .map(c => {
        c.margem_valor = c.faturamento - c.custos;
        c.margem_percentual = c.faturamento > 0 ? ((c.margem_valor / c.faturamento) * 100) : 0;
        c.ticket_medio = c.quantidade_pedidos > 0 ? c.faturamento / c.quantidade_pedidos : 0;
        if (c.primeira_compra && c.ultima_compra) {
          const diasAtivo = Math.floor((new Date(c.ultima_compra) - new Date(c.primeira_compra)) / (1000 * 60 * 60 * 24));
          c.dias_cliente = diasAtivo;
          c.frequencia_dias = c.quantidade_pedidos > 1 ? diasAtivo / (c.quantidade_pedidos - 1) : diasAtivo;
        }
        c.score_relacionamento = Math.max(0, Math.min(100,
          (c.quantidade_pedidos * 5) +
          (c.margem_percentual * 0.5) +
          (c.dias_cliente / 20) -
          (c.dias_atraso_medio || 0)
        ));
        return c;
      })
      .sort((a, b) => b.margem_valor - a.margem_valor);
  };

  const dados = calcularRentabilidade();
  const top20 = dados.slice(0, 20);
  const top5Rentaveis = dados.slice(0, 5);

  const totalFaturamento = dados.reduce((sum, c) => sum + c.faturamento, 0);
  const totalMargem = dados.reduce((sum, c) => sum + c.margem_valor, 0);
  const margemMedia = totalFaturamento > 0 ? (totalMargem / totalFaturamento) * 100 : 0;
  const ticketMedioGeral = dados.length > 0 ? dados.reduce((sum, c) => sum + c.ticket_medio, 0) / dados.length : 0;

  const distribuicaoABC = ['A', 'B', 'C', 'Novo'].map(classe => {
    const clientesClasse = dados.filter(c => c.classificacao_abc === classe);
    return {
      classe,
      quantidade: clientesClasse.length,
      faturamento: clientesClasse.reduce((sum, c) => sum + c.faturamento, 0),
      margem: clientesClasse.reduce((sum, c) => sum + c.margem_valor, 0),
    };
  }).filter(item => item.quantidade > 0);

  return {
    dados, top20, top5Rentaveis,
    totalFaturamento, totalMargem, margemMedia, ticketMedioGeral,
    distribuicaoABC
  };
}