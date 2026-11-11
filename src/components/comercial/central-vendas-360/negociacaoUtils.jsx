/**
 * Central de Vendas 360 — normalização de orçamentos e pedidos para a mesa de trabalho.
 * Nenhuma regra de negócio nova: apenas leitura/visão unificada dos registros canônicos.
 */

export const GRUPOS_NEGOCIACAO = [
  { id: 'todas', label: 'Todas' },
  { id: 'aberto', label: 'Abertos' },
  { id: 'aguardando', label: 'Aguardando cliente' },
  { id: 'aprovacao', label: 'Em aprovação' },
  { id: 'producao', label: 'Produção' },
  { id: 'entrega', label: 'Entrega' },
  { id: 'retira', label: 'Retira' },
  { id: 'acompanhamento', label: 'Em execução' },
  { id: 'entregue', label: 'Entregues' },
  { id: 'fechado', label: 'Finalizados / Convertidos' },
  { id: 'encerrado', label: 'Vencidos / Encerrados' },
  { id: 'cancelado', label: 'Cancelados' },
];

export const SITUACAO_ESTILO = {
  aberto: 'bg-slate-100 text-slate-700 border-slate-200',
  aguardando: 'bg-amber-100 text-amber-800 border-amber-200',
  aprovacao: 'bg-purple-100 text-purple-800 border-purple-200',
  producao: 'bg-orange-100 text-orange-800 border-orange-200',
  entrega: 'bg-sky-100 text-sky-800 border-sky-200',
  retira: 'bg-teal-100 text-teal-800 border-teal-200',
  acompanhamento: 'bg-blue-100 text-blue-800 border-blue-200',
  fechado: 'bg-green-100 text-green-800 border-green-200',
  entregue: 'bg-green-100 text-green-800 border-green-200',
  encerrado: 'bg-slate-100 text-slate-700 border-slate-200',
  cancelado: 'bg-red-100 text-red-800 border-red-200',
};

const GRUPO_ORCAMENTO = {
  Pendente: 'aberto',
  Aprovado: 'aguardando',
  Convertido: 'fechado',
  Rejeitado: 'encerrado',
  Expirado: 'encerrado',
};

const GRUPO_PEDIDO = {
  Rascunho: 'aberto',
  'Aguardando Aprovação': 'aprovacao',
  Aprovado: 'acompanhamento',
  'Em Produção': 'producao',
  'Pronto para Faturar': 'acompanhamento',
  'Faturamento Parcial': 'acompanhamento',
  Faturado: 'entrega',
  'Pronto para Retirada': 'retira',
  'Em Expedição': 'entrega',
  'Em Trânsito': 'entrega',
  Entregue: 'entregue',
  Cancelado: 'cancelado',
};

const numero = (valor) => Number(valor || 0);

export const brl = (valor) =>
  numero(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export const dataCurta = (valor) => {
  if (!valor) return '—';
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? String(valor) : d.toLocaleDateString('pt-BR');
};

const itemNormalizado = (item, tipo, indice) => {
  const quantidade = numero(item.quantidade);
  const valorUnitario = numero(item.valor_unitario ?? item.preco_unitario);
  return {
    id: item.id || `${tipo}-${indice}`,
    produto_id: item.produto_id || null,
    descricao: item.descricao || item.produto_descricao || 'Item',
    quantidade,
    unidade: item.unidade || 'UN',
    valor_unitario: valorUnitario,
    desconto_percentual: item.desconto_percentual != null ? numero(item.desconto_percentual)
      : quantidade * valorUnitario > 0 && item.valor_total != null
        ? Math.max(0, (1 - numero(item.valor_total) / (quantidade * valorUnitario)) * 100) : 0,
    valor_total: item.valor_total != null ? numero(item.valor_total)
      : quantidade * valorUnitario * (1 - numero(item.desconto_percentual) / 100),
    tipo: ['servico', 'fabricacao'].includes(item.tipo) ? item.tipo : tipo,
  };
};

export function orcamentoParaNegociacao(orcamento) {
  const itens = (orcamento.itens || []).map((item, i) => itemNormalizado(item, 'revenda', i));
  const totais = totalizarItens(itens);
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
  const vencido = orcamento.status === 'Pendente' && orcamento.data_validade && orcamento.data_validade.slice(0, 10) < hoje;
  const grupo = vencido ? 'encerrado' : GRUPO_ORCAMENTO[orcamento.status] || 'aberto';
  return {
    chave: `orc-${orcamento.id}`,
    origem: 'orcamento',
    registro: orcamento,
    numero: orcamento.numero_orcamento || 'Sem número',
    cliente_id: orcamento.cliente_id || null,
    cliente_nome: orcamento.cliente_nome || 'Cliente não informado',
    vendedor: orcamento.vendedor_responsavel || '—',
    obra: null,
    canal: 'Balcão',
    situacao: vencido ? 'Vencido' : orcamento.status || 'Pendente',
    grupo,
    data: orcamento.data_criacao || orcamento.created_date,
    validade: orcamento.data_validade,
    itens,
    condicao_pagamento: orcamento.condicoes_pagamento || '—',
    prazo: orcamento.prazo_entrega || '—',
    totais: { ...totais, total: orcamento.valor_total != null ? numero(orcamento.valor_total) : totais.total },
    editavel: orcamento.status === 'Pendente',
  };
}

export function pedidoParaNegociacao(pedido) {
  const itens = [
    ...(pedido.itens_revenda || []).map((item, i) => itemNormalizado(item, 'revenda', i)),
    ...(pedido.itens_armado_padrao || []).map((item, i) => itemNormalizado(item, 'fabricacao', `a${i}`)),
    ...(pedido.itens_corte_dobra || []).map((item, i) => itemNormalizado(item, 'fabricacao', `c${i}`)),
  ];
  const grupo = GRUPO_PEDIDO[pedido.status] || 'aberto';
  return {
    chave: `ped-${pedido.id}`,
    origem: 'pedido',
    registro: pedido,
    numero: pedido.numero_pedido || 'Sem número',
    cliente_id: pedido.cliente_id || null,
    cliente_nome: pedido.cliente_nome || 'Cliente não informado',
    vendedor: pedido.vendedor || '—',
    obra: pedido.obra_destino_nome || null,
    canal: pedido.origem_pedido || pedido.canal_preferencial || 'Balcão',
    situacao: pedido.status || 'Rascunho',
    grupo,
    data: pedido.data_pedido || pedido.created_date,
    validade: pedido.data_validade,
    itens,
    condicao_pagamento: pedido.forma_pagamento || '—',
    prazo: dataCurta(pedido.data_prevista_entrega),
    totais: {
      produtos: numero(pedido.valor_produtos),
      desconto: numero(pedido.desconto_geral_pedido_valor),
      frete: numero(pedido.valor_frete),
      total: numero(pedido.valor_total),
    },
    // Pedido tem fonte única de edição: o formulário completo (PedidoFormCompleto).
    // Na mesa ele é leitura + "Abrir pedido", evitando gravação em entidade errada.
    editavel: false,
  };
}

export function proximaAcao(negociacao) {
  if (!negociacao) return '—';
  if (negociacao.origem === 'orcamento') {
    if (negociacao.grupo === 'aberto') return 'Concluir orçamento e enviar ao cliente';
    if (negociacao.grupo === 'aguardando') return 'Aguardando cliente aceitar a proposta';
    if (negociacao.grupo === 'fechado') return 'Convertido em pedido';
    return 'Proposta encerrada';
  }
  if (negociacao.grupo === 'aprovacao') return 'Aguardando aprovação comercial';
  if (negociacao.grupo === 'acompanhamento') return `Execução: ${negociacao.situacao}`;
  if (negociacao.grupo === 'aberto') return 'Rascunho do pedido';
  return negociacao.situacao;
}

export function totalizarItens(itens = []) {
  return itens.reduce(
    (acc, item) => {
      const bruto = numero(item.quantidade) * numero(item.valor_unitario);
      const desconto = (bruto * numero(item.desconto_percentual)) / 100;
      acc.produtos += bruto;
      acc.desconto += desconto;
      acc.total += bruto - desconto;
      return acc;
    },
    { produtos: 0, desconto: 0, frete: 0, total: 0 }
  );
}