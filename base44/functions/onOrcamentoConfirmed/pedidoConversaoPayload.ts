const texto = (v, max = 2000) => String(v ?? '').replace(/<[^>]*>/g, '').replace(/javascript\s*:/gi, '').trim().slice(0, max);
const dinheiro = (v) => Math.round(v * 100) / 100;
export const referenciaOrcamento = (id) => `OrcamentoCliente:${id}`;
export function condicaoPedido(condicao) {
  const permitidas = ['À Vista', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto', 'Parcelado', 'PIX', 'Transferência', 'Dinheiro'];
  return permitidas.includes(condicao) ? condicao : 'Parcelado';
}
function assinatura(item, tipo) {
  const q = Number(item.quantidade), p = Number(item.valor_unitario ?? item.preco_unitario);
  const d = Number(item.desconto_percentual ?? (q * p > 0 && item.valor_total != null ? (1 - Number(item.valor_total) / (q * p)) * 100 : 0));
  return JSON.stringify([tipo, item.produto_id || '', texto(item.descricao || item.produto_descricao), q, texto(item.unidade || 'UN'), p, Number(d.toFixed(6))]);
}
export function montarPedidoConversao(registro, user, destino, formulario = null) {
  if (!['producao', 'entrega', 'retira'].includes(destino)) throw new Error('Selecione Produção, Entrega ou Retira.');
  const itens = registro.itens || [];
  if (!itens.length) throw new Error('Orçamento sem itens para converter.');
  const grupos = { itens_revenda: [], itens_armado_padrao: [], itens_corte_dobra: [] };
  let total = 0;
  for (const item of itens) {
    const q = Number(item.quantidade), p = Number(item.valor_unitario);
    const d = Number(item.desconto_percentual ?? (q * p > 0 && item.valor_total != null ? (1 - Number(item.valor_total) / (q * p)) * 100 : 0));
    if (![q, p, d].every(Number.isFinite) || q <= 0 || p <= 0 || d < 0 || d > 100) throw new Error('Revalide quantidades, preços e descontos na negociação.');
    const valor = dinheiro(q * p * (1 - d / 100));
    total += valor;
    const grupo = item.tipo === 'fabricacao' ? 'itens_armado_padrao' : 'itens_revenda';
    grupos[grupo].push({
      produto_id: item.produto_id || undefined, descricao: texto(item.descricao), produto_descricao: texto(item.descricao),
      quantidade: q, quantidade_faturada: 0, unidade: texto(item.unidade || 'UN', 20),
      preco_unitario: p, valor_unitario: p, desconto_percentual: d, desconto_valor: dinheiro(q * p - valor),
      valor_total: valor, valor_item: valor, preco_venda_total: valor,
    });
  }
  if (formulario) {
    if (formulario.group_id !== registro.group_id || formulario.empresa_id !== registro.empresa_id || formulario.cliente_id !== registro.cliente_id) throw new Error('Cliente, grupo e empresa devem ser os mesmos do orçamento aprovado.');
    const esperado = itens.map((i) => assinatura(i, i.tipo === 'fabricacao' ? 'fabricacao' : 'revenda')).sort();
    const recebido = Object.entries(grupos).flatMap(([campo]) => {
      if (!Array.isArray(formulario[campo])) throw new Error('Grupos de itens inválidos.');
      return formulario[campo].map((i) => assinatura(i, campo === 'itens_revenda' ? 'revenda' : 'fabricacao'));
    }).sort();
    if (JSON.stringify(esperado) !== JSON.stringify(recebido) || formulario.itens_corte_dobra.length) throw new Error('Itens, quantidades, tipos e preços devem permanecer iguais à proposta aprovada. Ajuste a negociação antes de converter.');
    if (Number(formulario.valor_frete || 0) !== 0 || Number(formulario.desconto_geral_pedido_valor || 0) !== 0 || Number(formulario.desconto_geral_pedido_percentual || 0) !== 0 || formulario.forma_pagamento !== condicaoPedido(registro.condicoes_pagamento)) throw new Error('Frete, desconto geral e pagamento não podem alterar o valor aprovado na conversão.');
  }
  const form = formulario || {};
  const endereco = {};
  for (const campo of ['cep', 'logradouro', 'numero', 'complemento', 'bairro', 'cidade', 'estado', 'contato_nome', 'contato_telefone', 'contato_whatsapp', 'contato_email', 'instrucoes_entrega', 'horario_inicio', 'horario_fim']) {
    if (form.endereco_entrega_principal?.[campo] != null) endereco[campo] = texto(form.endereco_entrega_principal[campo], 300);
  }
  for (const [campo, limite] of [['latitude', 90], ['longitude', 180]]) {
    const v = form.endereco_entrega_principal?.[campo];
    if (v != null) { if (typeof v !== 'number' || !Number.isFinite(v) || Math.abs(v) > limite) throw new Error('Coordenadas de entrega inválidas.'); endereco[campo] = v; }
  }
  const data = form.data_prevista_entrega;
  if (data && (!/^\d{4}-\d{2}-\d{2}$/.test(data) || !Number.isFinite(Date.parse(data)))) throw new Error('Data prevista de entrega inválida.');
  const obs = `Originado do orçamento ${texto(registro.numero_orcamento, 80)}. Destino: ${destino}. Condição aprovada: ${texto(registro.condicoes_pagamento, 200)}. Prazo: ${texto(registro.prazo_entrega, 200)}.`;
  return {
    numero_pedido: 'Gerado ao confirmar', tipo: 'Pedido', origem_pedido: 'Manual', origem_externa_id: referenciaOrcamento(registro.id),
    group_id: registro.group_id, empresa_id: registro.empresa_id, empresa_dona_id: registro.empresa_id,
    cliente_id: registro.cliente_id, cliente_nome: texto(registro.cliente_nome, 200),
    vendedor: texto(registro.vendedor_responsavel || user.full_name || user.email, 160), vendedor_id: registro.vendedor_responsavel_id || user.id,
    data_pedido: new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()),
    status: 'Aguardando Aprovação', status_aprovacao: 'pendente',
    tipo_pedido: grupos.itens_armado_padrao.length ? (grupos.itens_revenda.length ? 'Misto' : 'Produção Sob Medida') : 'Revenda',
    ...grupos, valor_produtos: dinheiro(total), valor_total: dinheiro(total), valor_pendente_faturamento: dinheiro(total), valor_faturado: 0,
    desconto_geral_pedido_valor: 0, desconto_geral_pedido_percentual: 0, valor_frete: 0,
    forma_pagamento: condicaoPedido(registro.condicoes_pagamento), tipo_frete: destino === 'retira' ? 'Retirada' : destino === 'producao' && ['CIF', 'FOB', 'Retirada'].includes(form.tipo_frete) ? form.tipo_frete : 'CIF',
    prioridade: ['Baixa', 'Normal', 'Alta', 'Urgente'].includes(form.prioridade) ? form.prioridade : 'Normal',
    ...(data ? { data_prevista_entrega: data } : {}), endereco_entrega_principal: endereco,
    obra_destino_id: texto(form.obra_destino_id, 100), obra_destino_nome: texto(form.obra_destino_nome, 200),
    observacoes_publicas: `${obs}\n${texto(form.observacoes_publicas)}`, observacoes_internas: texto(form.observacoes_internas),
  };
}