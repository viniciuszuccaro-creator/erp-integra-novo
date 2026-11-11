// Cálculos puros das fontes proprietárias. Este arquivo não grava saldos nem status.
const qtd = (v) => v !== null && v !== '' && Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : null;
const arredondar = (v) => Math.round(v * 1e6) / 1e6;

// A conclusão usa a cobertura da OP, nunca o status global de uma entrega ou o peso em KG.
export function avaliarConclusaoOP(pedido, op, entregas = [], linhas = []) {
  const negar = (motivo) => ({ pode_concluir: false, motivo });
  const positivo = (v) => ['number', 'string'].includes(typeof v) && v !== '' && Number.isFinite(Number(v)) && Number(v) > 0;
  const contexto = (r) => r.group_id === pedido.group_id && r.empresa_id === pedido.empresa_id;
  if (!contexto(op) || op.pedido_id !== pedido.id || op.status !== 'Pronto para Expedição' || ['Cancelado', 'Rejeitado'].includes(pedido.status)) return negar('OP ou pedido fora do contexto/situação permitidos.');
  if (!Array.isArray(op.itens_vinculados) || !op.itens_vinculados.length) return negar('OP sem vínculo verificável por item.');
  const canonicos = itensCanonicos(pedido), previstos = new Map(), recebidos = new Map();
  for (const vinculo of op.itens_vinculados) {
    const item = resolverItem(canonicos, vinculo);
    if ((vinculo.pedido_id && vinculo.pedido_id !== pedido.id) || !item || item.origem === 'revenda' || !vinculo.unidade || !positivo(vinculo.quantidade) || !positivo(item.quantidade)) return negar('Item, pedido, unidade ou quantidade da OP sem vínculo verificável.');
    const total = arredondar((previstos.get(item.chave) || 0) + Number(vinculo.quantidade));
    if (total > item.quantidade + 0.000001) return negar('Quantidade da OP excede o item do pedido.');
    previstos.set(item.chave, total);
  }
  const confirmadas = new Map(entregas.filter((e) => contexto(e) && e.pedido_id === pedido.id && e.status === 'Entregue').map((e) => [e.id, e]));
  for (const linha of linhas) {
    const entrega = confirmadas.get(linha.entrega_id);
    if (!entrega || !contexto(linha) || (linha.op_id !== op.id && entrega.op_id !== op.id)) continue;
    if ((linha.op_id && linha.op_id !== op.id) || (entrega.op_id && entrega.op_id !== op.id) || (linha.pedido_id && linha.pedido_id !== pedido.id)) return negar('Vínculos conflitantes entre entrega, OP e pedido.');
    const item = resolverItem(canonicos, linha);
    if (!item || !previstos.has(item.chave) || !linha.unidade || !positivo(linha.quantidade)) return negar('Entrega da OP com item, unidade ou quantidade não verificável.');
    recebidos.set(item.chave, arredondar((recebidos.get(item.chave) || 0) + Number(linha.quantidade)));
  }
  for (const [chave, quantidade] of previstos) {
    const entregue = recebidos.get(chave) || 0;
    if (entregue > quantidade + 0.000001) return negar('Quantidade entregue excede a quantidade vinculada à OP.');
    if (entregue < quantidade - 0.000001) return negar('Atendimento parcial: ainda há quantidade da OP a entregar/retirar.');
  }
  return { pode_concluir: true, motivo: 'Todos os itens da OP foram atendidos em entregas/retiradas confirmadas e vinculadas.' };
}
const origens = [['itens_revenda', 'revenda'], ['itens_armado_padrao', 'armado'], ['itens_corte_dobra', 'corte']];
export function itensCanonicos(pedido) {
  return origens.flatMap(([campo, prefixo]) => (pedido[campo] || []).map((item, i) => ({
    chave: `${prefixo}-${i}`, id_original: item.id || null, origem: prefixo,
    produto_id: item.produto_id || null, unidade: item.unidade || 'UN',
    quantidade: qtd(item.quantidade), faturada: Object.hasOwn(item, 'quantidade_faturada') ? qtd(item.quantidade_faturada) : null,
  })));
}
const candidatos = (itens, registro) => {
  const tipo = registro.origem_item || registro.tipo_item;
  return itens.filter((i) => !tipo || (tipo === 'revenda' ? i.origem === 'revenda' : ['producao', 'fabricacao'].includes(tipo) ? i.origem !== 'revenda' : tipo === 'armado_padrao' ? i.origem === 'armado' : tipo === 'corte_dobra' ? i.origem === 'corte' : true));
};
export function resolverItem(itens, registro) {
  const lista = candidatos(itens, registro);
  const id = registro.pedido_item_id || registro.item_pedido_id || registro.item_id;
  const encontrados = id ? lista.filter((i) => i.chave === id || i.id_original === id)
    : registro.produto_id ? lista.filter((i) => i.produto_id === registro.produto_id) : [];
  if (encontrados.length !== 1) return null;
  const item = encontrados[0];
  if (registro.produto_id && item.produto_id !== registro.produto_id) return null;
  if (registro.unidade && registro.unidade.toUpperCase() !== item.unidade.toUpperCase()) return null;
  return item;
}
function acumulador(itens) {
  const valores = new Map(itens.map((i) => [i.chave, 0]));
  const incertos = new Set();
  const adicionar = (registro, quantidade) => {
    const item = resolverItem(itens, registro); const valor = qtd(quantidade);
    if (!item || valor === null) {
      for (const candidato of item ? [item] : candidatos(itens, registro)) incertos.add(candidato.chave);
      return;
    }
    valores.set(item.chave, arredondar(valores.get(item.chave) + valor));
  };
  return { adicionar, valor: (chave) => incertos.has(chave) ? null : valores.get(chave), marcar: (lista) => lista.forEach((i) => incertos.add(i.chave)) };
}
export function calcularSaldosPedido(pedido, fontes = {}, permissoes = {}) {
  const itens = itensCanonicos(pedido);
  const separada = acumulador(itens), conferida = acumulador(itens), produzida = acumulador(itens);
  const entregue = acumulador(itens), retirada = acumulador(itens);
  if (permissoes.separacao) for (const registro of fontes.separacoes || []) {
    if (!['concluido', 'com_divergencia'].includes(registro.status)) continue;
    for (const item of registro.itens || []) {
      if (registro.tipo === 'separacao') separada.adicionar(item, item.quantidade_separada);
      if (registro.tipo === 'conferencia') conferida.adicionar(item, item.quantidade_conferida);
    }
  }
  if (permissoes.producao) for (const op of fontes.ops || []) {
    if (op.status === 'Cancelada') continue;
    const vinculados = (op.itens_vinculados || []).filter((i) => !i.pedido_id || i.pedido_id === pedido.id);
    if (!vinculados.length) { produzida.marcar(itens.filter((i) => i.origem !== 'revenda')); continue; }
    if (['Pronto para Expedição', 'Concluída'].includes(op.status)) {
      for (const item of vinculados) produzida.adicionar(item, item.quantidade);
    } else if (Number(op.progresso_fisico_kg) > 0 || (op.apontamentos_producao || []).length) {
      // KG e percentual da OP não provam quantidade concluída por item.
      produzida.marcar(vinculados.flatMap((i) => resolverItem(itens, i) || candidatos(itens, i)));
    }
  }
  if (permissoes.entregas) {
    const linhas = fontes.itensEntrega || [];
    for (const entrega of fontes.entregas || []) {
      if (entrega.status !== 'Entregue') continue;
      const recebidos = linhas.filter((i) => i.entrega_id === entrega.id);
      const destino = ['Retira', 'Retirada'].includes(entrega.tipo_frete) ? retirada : entregue;
      if (!recebidos.length) destino.marcar(itens);
      for (const item of recebidos) destino.adicionar(item, item.quantidade);
    }
    // Status global legado sem evidência por item não significa 100% atendido.
    if (pedido.status === 'Entregue' && !(fontes.entregas || []).some((e) => e.status === 'Entregue')) {
      entregue.marcar(itens); retirada.marcar(itens);
    }
  }
  return itens.map((item) => {
    const e = permissoes.entregas ? entregue.valor(item.chave) : null;
    const r = permissoes.entregas ? retirada.valor(item.chave) : null;
    const f = permissoes.fiscal ? item.faturada : null;
    const atendida = e === null || r === null ? null : arredondar(e + r);
    const saldo = (valor) => item.quantidade === null || valor === null ? null : arredondar(Math.max(0, item.quantidade - valor));
    return {
      chave: item.chave, unidade: item.unidade, pedida: item.quantidade,
      separada: permissoes.separacao ? separada.valor(item.chave) : null,
      conferida: permissoes.separacao ? conferida.valor(item.chave) : null,
      produzida: permissoes.producao && item.origem !== 'revenda' ? produzida.valor(item.chave) : null,
      entregue: e, retirada: r, faturada: f, saldo_atender: saldo(atendida), saldo_faturar: saldo(f),
      divergencia: item.quantidade === null || [e, r, f, atendida, permissoes.separacao ? separada.valor(item.chave) : null, permissoes.separacao ? conferida.valor(item.chave) : null, permissoes.producao ? produzida.valor(item.chave) : null].some((v) => v !== null && v > item.quantidade + 0.000001),
    };
  });
}