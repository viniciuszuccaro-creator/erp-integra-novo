const texto = (v, max = 2000) => String(v || '').replace(/<[^>]*>/g, '').replace(/javascript\s*:/gi, '').trim().slice(0, max);
export const assinaturaOrigem = (r) => JSON.stringify([r.numero_orcamento, r.status, r.cliente_id, r.cliente_nome, r.itens, r.valor_total, r.condicoes_pagamento, r.prazo_entrega, r.data_validade, r.pedido_gerado_id]);
export const totalItens = (itens) => Math.round(itens.reduce((s, i) => s + i.valor_total, 0) * 100) / 100;

// Só usa os itens persistidos, nunca preços, quantidades ou contexto enviados pelo navegador.
export function montarDerivacao(registro, user, acao, indices) {
  if (!['duplicar', 'desmembrar'].includes(acao)) throw new Error('Ação de derivação inválida.');
  if (acao === 'desmembrar' && (registro.status !== 'Pendente' || registro.pedido_gerado_id || registro.conversao_pedido)) throw new Error('Somente orçamento pendente e sem conversão pode ser desmembrado.');
  const originais = registro.itens;
  if (!Array.isArray(originais) || !originais.length || originais.length > 300) throw new Error('O orçamento precisa ter entre 1 e 300 itens salvos.');
  const escolhidos = acao === 'duplicar' ? originais.map((_, i) => i) : indices;
  if (!Array.isArray(escolhidos) || !escolhidos.length || escolhidos.some((i) => !Number.isInteger(i) || i < 0 || i >= originais.length) || new Set(escolhidos).size !== escolhidos.length) throw new Error('Seleção de itens inválida. Reabra a seleção.');
  const itens = originais.map((item) => {
    const quantidade = Number(item.quantidade), valor = Number(item.valor_unitario), bruto = quantidade * valor;
    const desconto = Number(item.desconto_percentual ?? (bruto > 0 && item.valor_total != null ? (1 - Number(item.valor_total) / bruto) * 100 : 0));
    if (![quantidade, valor, desconto, bruto].every(Number.isFinite) || quantidade <= 0 || valor < 0 || desconto < -0.000001 || desconto > 100.000001) throw new Error('Há quantidades, preços ou descontos inválidos. Corrija o orçamento antes de continuar.');
    const percentual = Math.max(0, Math.min(100, desconto));
    if (item.tipo && !['revenda', 'fabricacao', 'servico'].includes(item.tipo)) throw new Error('Tipo de item inválido no orçamento de origem.');
    return { ...(item.produto_id ? { produto_id: String(item.produto_id) } : {}), descricao: texto(item.descricao, 500), unidade: texto(item.unidade || 'UN', 30), tipo: item.tipo || 'revenda', quantidade, valor_unitario: valor, desconto_percentual: percentual, valor_total: Math.round(bruto * (1 - percentual / 100) * 100) / 100 };
  });
  const selecao = new Set(escolhidos);
  const mover = itens.filter((_, i) => selecao.has(i));
  const manter = itens.filter((_, i) => !selecao.has(i));
  const agora = new Date(), validade = new Date(agora.getTime() + 7 * 86400000);
  const dia = (d) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  return { indices: [...escolhidos].sort((a, b) => a - b), manter, payload: {
    group_id: registro.group_id, empresa_id: registro.empresa_id, cliente_id: registro.cliente_id,
    cliente_nome: texto(registro.cliente_nome, 200), cliente_email: texto(registro.cliente_email, 254),
    vendedor_responsavel: texto(user.full_name || user.email, 200), vendedor_responsavel_id: user.id,
    data_criacao: dia(agora), data_validade: dia(validade), itens: mover, valor_total: totalItens(mover),
    condicoes_pagamento: texto(registro.condicoes_pagamento || 'À Vista', 300), prazo_entrega: texto(registro.prazo_entrega || '7 dias úteis', 300),
    observacoes: `${acao === 'duplicar' ? 'Duplicado' : 'Desmembrado'} do orçamento ${texto(registro.numero_orcamento, 80)}. Preços copiados da origem, sujeitos à validação no fechamento.`, status: 'Pendente',
  } };
}