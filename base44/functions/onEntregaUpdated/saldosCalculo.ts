// Projeção somente leitura das fontes proprietárias. Não altera saldos ou status.
const qtd = (v) => v !== null && v !== '' && Number.isFinite(Number(v)) && Number(v) >= 0 ? Number(v) : null;
const arredondar = (v) => Math.round(v * 1e6) / 1e6;
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