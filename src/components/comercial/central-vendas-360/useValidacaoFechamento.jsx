// Motor de validação de fechamento da Central 360° — cada regra devolve um resultado explicativo
// Somente leitura das entidades dos módulos proprietários (Cliente, Produto, Orçamento/Pedido).
import { useMemo } from 'react';
import useRLSQuery from '@/components/lib/useRLSQuery';

export const LIMITE_DESCONTO_SEM_APROVACAO = 15;
const DIAS_ALERTA_VALIDADE = 3;
const LIMITE_PRODUTOS = 300;

const numero = (valor) => {
  const n = Number(String(valor ?? 0).replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
};

const inicioDoDia = (valor) => {
  if (!valor) return null;
  const data = new Date(typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor) ? `${valor}T00:00:00` : valor);
  if (Number.isNaN(data.getTime())) return null;
  data.setHours(0, 0, 0, 0);
  return data;
};

export const diasAte = (valor) => {
  const alvo = inicioDoDia(valor);
  if (!alvo) return null;
  return Math.round((alvo - inicioDoDia(new Date())) / 86400000);
};

export default function useValidacaoFechamento({ negociacao, cliente }) {
  const itens = negociacao?.itens || [];

  const ids = useMemo(
    () => Array.from(new Set(itens.map((item) => item.produto_id).filter(Boolean))).slice(0, LIMITE_PRODUTOS),
    [itens]
  );

  const { data: produtos = [], isLoading } = useRLSQuery(
    'Produto',
    { id: { $in: ids } },
    undefined,
    ids.length || 1,
    { enabled: ids.length > 0, staleTime: 120000 }
  );

  const produtosPorId = useMemo(
    () => (produtos || []).reduce((acc, produto) => { acc[produto.id] = produto; return acc; }, {}),
    [produtos]
  );

  return useMemo(() => {
    const registro = negociacao?.registro || {};
    const checagens = [];
    const add = (chave, titulo, status, detalhe) => checagens.push({ chave, titulo, status, detalhe });

    // 1. Cliente
    const nomeCliente = negociacao?.cliente_nome || cliente?.nome || cliente?.razao_social || cliente?.nome_fantasia;
    const clienteHabilitado = !!negociacao?.cliente_id && !!nomeCliente && !['Inativo', 'Bloqueado'].includes(cliente?.status);
    add('cliente', 'Cliente identificado', clienteHabilitado ? 'ok' : 'erro',
      clienteHabilitado ? nomeCliente : 'Selecione um cliente ativo e habilitado para a negociação.');

    const documento = cliente?.cpf_cnpj || cliente?.cnpj || cliente?.cpf;
    add('documento', 'CPF/CNPJ', documento ? 'ok' : 'atencao',
      documento || 'Documento ausente no cadastro do cliente (necessário para nota fiscal).');

    const contato = [cliente?.celular, cliente?.telefone, cliente?.whatsapp, cliente?.email].filter(Boolean)[0];
    add('contato', 'Contato para retorno', contato ? 'ok' : 'atencao',
      contato || 'Sem telefone ou e-mail cadastrado para o follow-up.');

    // 2. Itens
    if (!itens.length) {
      add('itens', 'Itens da negociação', 'erro', 'Nenhum item informado na mesa.');
    } else {
      const semQuantidade = itens.filter((item) => numero(item.quantidade) <= 0).length;
      const semPreco = itens.filter((item) => numero(item.valor_unitario) <= 0).length;
      if (itens.some((item) => !String(item.descricao || '').trim() || !Number.isFinite(Number(item.quantidade)) || !Number.isFinite(Number(item.valor_unitario)))) {
        add('dados_itens', 'Dados dos itens', 'erro', 'Informe descrição e valores numéricos válidos em todos os itens.');
      }
      if (itens.some((item) => numero(item.desconto_percentual) < 0 || numero(item.desconto_percentual) > 100)) {
        add('limite_desconto', 'Faixa de desconto', 'erro', 'O desconto deve estar entre 0 e 100%.');
      }
      add('itens', 'Itens da negociação', 'ok', `${itens.length} item(ns) na mesa.`);
      if (semQuantidade > 0) {
        add('quantidade', 'Quantidades', 'erro', `${semQuantidade} item(ns) com quantidade zerada.`);
      }
      if (semPreco > 0) {
        add('preco', 'Preços unitários', 'erro', `${semPreco} item(ns) sem preço definido.`);
      }
    }

    // 3. Estoque (saldo oficial do cadastro de Produto)
    const itensComProduto = itens.filter((item) => item.produto_id);
    if (itensComProduto.length) {
      const semSaldo = itensComProduto.filter((item) => {
        const produto = produtosPorId[item.produto_id];
        if (!produto) return false;
        return numero(produto.estoque_atual) < numero(item.quantidade);
      });
      add('estoque', 'Disponibilidade em estoque', semSaldo.length ? 'atencao' : 'ok',
        semSaldo.length
          ? `${semSaldo.length} item(ns) sem saldo suficiente — a produção/compra precisa cobrir a venda.`
          : 'Saldo suficiente nos produtos vinculados.');
    }

    // 4. Desconto concedido
    const bruto = itens.reduce((soma, item) => soma + numero(item.quantidade) * numero(item.valor_unitario), 0);
    const liquido = itens.reduce((soma, item) => {
      const total = item.valor_total !== undefined && item.valor_total !== null
        ? numero(item.valor_total)
        : numero(item.quantidade) * numero(item.valor_unitario);
      return soma + total;
    }, 0);
    const descontoPercentual = bruto > 0
      ? Math.max(0, ((bruto - liquido) / bruto) * 100)
      : numero(registro.desconto_geral_pedido_percentual);
    const acimaDoLimite = descontoPercentual > LIMITE_DESCONTO_SEM_APROVACAO + 0.001;
    add('desconto', 'Desconto concedido', acimaDoLimite ? 'atencao' : 'ok',
      `${descontoPercentual.toFixed(1)}% sobre os itens` +
      (acimaDoLimite ? ` — acima de ${LIMITE_DESCONTO_SEM_APROVACAO}%, exige aprovação.` : '.'));

    // 5. Condição de pagamento
    const pagamento = negociacao?.condicao_pagamento || registro.condicoes_pagamento || registro.condicao_pagamento;
    add('pagamento', 'Condição de pagamento', pagamento && pagamento !== '—' ? 'ok' : 'erro',
      pagamento || 'Negociação sem condição de pagamento definida.');

    // 6. Validade (proposta)
    if (negociacao?.origem === 'orcamento') {
      const dias = diasAte(registro.data_validade);
      if (dias === null) {
        add('validade', 'Validade da proposta', 'erro', 'Proposta sem data de validade.');
      } else if (dias < 0) {
        add('validade', 'Validade da proposta', 'erro', `Vencida há ${Math.abs(dias)} dia(s) — revalide a proposta antes de fechar.`);
      } else if (dias <= DIAS_ALERTA_VALIDADE) {
        add('validade', 'Validade da proposta', 'atencao', `Vence em ${dias} dia(s).`);
      } else {
        add('validade', 'Validade da proposta', 'ok', `Válida por ${dias} dia(s).`);
      }
    }

    const erros = checagens.filter((c) => c.status === 'erro');
    const avisos = checagens.filter((c) => c.status === 'atencao');

    return {
      checagens,
      erros,
      avisos,
      ok: erros.length === 0,
      descontoPercentual,
      acimaDoLimite,
      carregando: isLoading,
    };
  }, [negociacao, cliente, itens, produtosPorId, isLoading]);
}