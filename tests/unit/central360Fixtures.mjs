// Fontes controladas e carregamento do código de produção; nunca acessam registros reais.
import { readFileSync } from 'fs';
import { join } from 'path';
export async function carregarCentral360(root) {
  const ler = (p) => readFileSync(join(root, 'base44/functions/onOrcamentoConfirmed', p), 'utf-8');
  const url = (s) => `data:text/javascript;base64,${Buffer.from(s).toString('base64')}`;
  const payloadUrl = url(ler('pedidoConversaoPayload.ts'));
  const numeroUrl = url(ler('numeracaoPedido.ts'));
  const derivacaoPayloadUrl = url(ler('derivacaoPayload.ts'));
  const conversaoUrl = url(ler('conversaoPedido.ts').replace("'./pedidoConversaoPayload.ts'", JSON.stringify(payloadUrl)).replace("'./numeracaoPedido.ts'", JSON.stringify(numeroUrl)));
  const derivacaoUrl = url(ler('derivacaoOrcamento.ts').replace("'./derivacaoPayload.ts'", JSON.stringify(derivacaoPayloadUrl)).replace("'./numeracaoPedido.ts'", JSON.stringify(numeroUrl)));
  const codigoEndpoint = ler('entry.ts').replace("import { createClientFromRequest } from 'npm:@base44/sdk@0.8.54';", 'const createClientFromRequest = () => globalThis.__central360Cliente;').replace("'./conversaoPedido.ts'", JSON.stringify(conversaoUrl)).replace("'./pedidoConversaoPayload.ts'", JSON.stringify(payloadUrl)).replace("'./derivacaoOrcamento.ts'", JSON.stringify(derivacaoUrl));
  return { ...(await import(payloadUrl)), ...(await import(numeroUrl)), ...(await import(conversaoUrl)), ...(await import(derivacaoPayloadUrl)), ...(await import(derivacaoUrl)), endpoint: (await import(url(codigoEndpoint))).default };
}

export function criarFonteDerivacao(base, user, opcoes = {}) {
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const estado = { orcamentos: [clone(base)], empresa: { id: base.empresa_id, group_id: base.group_id }, logs: [], posts: 0, versao: 1, usuario: user, perfil: null };
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
  const api = {};
  for (const nome of ['Empresa', 'OrcamentoCliente']) {
    const registros = () => nome === 'Empresa' ? [estado.empresa] : estado.orcamentos;
    api[nome] = {
      filter: async (q) => ({ items: clone(registros().filter((r) => matches(r, q))) }),
      count: async (q) => registros().filter((r) => matches(r, q)).length,
      updateMany: async (q, patch) => {
        if (nome === 'Empresa' && opcoes.falharNumero) { opcoes.falharNumero = false; throw new Error('Numeração temporariamente indisponível'); }
        if (patch.$set.origem_derivacao?.confirmada && opcoes.falharConfirmacao) { opcoes.falharConfirmacao = false; throw new Error('Falha ao confirmar destino'); }
        const r = registros().find((v) => matches(v, q));
        if (!r) return { updated: 0 };
        Object.assign(r, clone(patch.$set), { updated_date: `v${++estado.versao}` });
        return { updated: 1 };
      },
    };
  }
  api.OrcamentoCliente.create = async (dados) => {
    estado.posts++;
    if (opcoes.falharSemCriar) throw new Error('Resposta perdida');
    const criado = { ...clone(dados), id: String(8 + estado.posts).repeat(24).slice(0, 24), updated_date: `v${++estado.versao}` };
    estado.orcamentos.push(criado);
    if (opcoes.alterarOrigem) estado.orcamentos[0].itens[0].quantidade = 999;
    if (opcoes.perderResposta) throw new Error('Resposta perdida depois da criação');
    return clone(criado);
  };
  api.AuditLog = { create: async (v) => { estado.logs.push(clone(v)); return v; } };
  api.PerfilAcesso = { get: async () => estado.perfil };
  const client = { entities: api, asServiceRole: { entities: api }, auth: { me: async () => estado.usuario } };
  return { client, estado };
}

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