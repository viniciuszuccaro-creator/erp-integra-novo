// Fontes controladas dos testes de conversão; nunca acessam registros reais.
export function criarFonteConversao({ converterPedido, base, user, entrada }) {
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const path = (r, k) => k.split('.').reduce((v, f) => v?.[f], r);
  const matches = (r, q) => Object.entries(q).every(([k, v]) => {
    if (k === '$or') return v.some((n) => matches(r, n));
    const atual = path(r, k);
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if ('$exists' in v) return (atual !== undefined) === v.$exists;
      if ('$in' in v) return v.$in.includes(atual);
    }
    return v === null ? atual == null : JSON.stringify(atual) === JSON.stringify(v);
  });
  return function criarFonte(opcoes = {}) {
    const estado = { orcamento: clone(base), empresa: { id: base.empresa_id, group_id: base.group_id }, pedidos: [], logs: [], versao: 1, posts: 0, validacoes: 0 };
    const fonte = (nome) => nome === 'OrcamentoCliente' ? [estado.orcamento] : nome === 'Empresa' ? [estado.empresa] : nome === 'Pedido' ? estado.pedidos : [];
    const api = {};
    for (const nome of ['OrcamentoCliente', 'Empresa', 'Pedido']) {
      api[nome] = {
        filter: async (q) => ({ items: clone(fonte(nome).filter((r) => matches(r, q))) }),
        count: async (q) => fonte(nome).filter((r) => matches(r, q)).length,
        updateMany: async (q, patch) => {
          if (nome === 'Empresa' && opcoes.falharNumero) { opcoes.falharNumero = false; throw new Error('Indisponível antes do POST'); }
          const r = fonte(nome).find((i) => matches(i, q));
          if (!r) return { updated: 0 };
          Object.assign(r, clone(patch.$set), { updated_date: `v${++estado.versao}` });
          return { updated: 1 };
        },
      };
    }
    api.Pedido.create = async (dados) => {
      estado.posts++;
      if (opcoes.falharSemCriar) throw new Error('Resposta perdida sem confirmação');
      const pedido = { ...clone(dados), id: '888888888888888888888888' };
      estado.pedidos.push(pedido);
      if (opcoes.alterarOrigem) estado.orcamento.itens[0].quantidade = 100;
      if (opcoes.perderResposta) throw new Error('Resposta perdida depois de criar');
      return clone(pedido);
    };
    api.AuditLog = { create: async (v) => { estado.logs.push(clone(v)); return v; } };
    api.Cliente = { filter: async () => ({ items: [{ id: base.cliente_id, group_id: base.group_id, empresa_id: base.empresa_id, status: 'Ativo', cpf: '52998224725', endereco_principal: { logradouro: 'Rua', cidade: 'Cidade', estado: 'SP', numero: '1' }, condicao_comercial: { tabela_preco_nome: 'Padrão' }, configuracao_fiscal: { tipo_contribuinte: 'Não Contribuinte', contribuinte_icms: false } }] }) };
    api.Produto = { filter: async () => ({ items: base.itens.map((i) => ({ id: i.produto_id, group_id: base.group_id, empresa_id: base.empresa_id, descricao: i.descricao, preco_venda: i.valor_unitario, estoque_disponivel: 100, custo_medio: 1 })) }) };
    api.ContaReceber = { aggregate: async () => ({ rows: opcoes.vencidos ? [{ status: 'Atrasado', count: 1, sum_valor: 100, sum_valor_recebido: 0 }] : [] }) };
    api.SolicitacaoAprovacao = { filter: async () => ({ items: [] }) };
    const client = { entities: api, asServiceRole: { entities: api }, auth: { me: async () => estado.usuario === null ? null : estado.usuario || user } };
    const validar = async () => { estado.validacoes++; return Response.json({ ok: true }); };
    const auditar = async (_b, _u, r, acao, descricao, depois) => api.AuditLog.create({ group_id: r.group_id, empresa_id: r.empresa_id, acao, descricao, dados_anteriores: r, dados_novos: depois });
    const executar = (body = entrada, registro = estado.orcamento) => converterPedido(client, { user }, clone(body), clone(registro), validar, auditar);
    return { client, estado, executar };
  };
}