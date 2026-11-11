// Ações do orçamento na Central 360° — duplicar, desmembrar e importar itens de pedido anterior.
// Duplicação e desmembramento usam a autoridade de servidor do endpoint comercial existente.
import { useRef, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import useAcoesComerciais from './useAcoesComerciais';
import { pedidoParaNegociacao } from './negociacaoUtils';

const itemParaOrcamento = (item) => ({
  produto_id: item.produto_id || null,
  descricao: item.descricao,
  quantidade: Number(item.quantidade || 0),
  unidade: item.unidade || 'UN',
  valor_unitario: Number(item.valor_unitario || 0),
  desconto_percentual: Number(item.desconto_percentual || 0),
  tipo: item.tipo || 'revenda',
  valor_total: Number(item.valor_total || 0),
});

export default function useAcoesOrcamento({ negociacao, onAtualizar }) {
  const [executando, setExecutando] = useState(false);
  const [importando, setImportando] = useState(false);
  const [erroFechamento, setErroFechamento] = useState('');
  const [checagensServidor, setChecagensServidor] = useState([]);
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const acoes = useAcoesComerciais();
  const conversaoEmCurso = useRef(false);
  const derivacaoEmCurso = useRef(false);
  const tentativaDerivacao = useRef(null);

  const solicitarConversao = async (dados) => {
    if (!acoes.podeCriar) throw new Error('Sem permissão para criar pedidos.');
    if (conversaoEmCurso.current) throw new Error('Aguarde a confirmação em andamento.');
    conversaoEmCurso.current = true;
    setExecutando(true);
    setErroFechamento('');
    try {
      const { data } = await base44.functions.invoke('onOrcamentoConfirmed', {
        orcamento_id: negociacao.registro.id,
        group_id: negociacao.registro.group_id,
        empresa_id: negociacao.registro.empresa_id,
        ...dados,
      });
      if (!data?.ok) throw new Error(data?.error || 'Conversão não confirmada.');
      return data;
    } catch (erro) {
      const retorno = erro?.response?.data || erro?.data;
      const mensagem = retorno?.error || erro.message || 'Não foi possível converter a proposta.';
      setErroFechamento(mensagem);
      setChecagensServidor(retorno?.checagens || []);
      throw new Error(mensagem);
    } finally {
      conversaoEmCurso.current = false;
      setExecutando(false);
    }
  };
  const prepararConversao = (destino, versao) => solicitarConversao({ acao: 'validar', preparar_pedido: true, destino, versao });
  const converterPedido = (formulario, preparo, operacaoId) => solicitarConversao({
    acao: 'converter', formulario, destino: preparo.destino,
    versao: preparo.orcamento.conversao_pedido?.versao_origem || preparo.orcamento.updated_date,
    operacao_id: preparo.orcamento.conversao_pedido?.operacao_id || operacaoId,
    revisado: formulario.__conversao_revisada === true,
  });

  const executarFechamento = async (acao, itens, versao, dadosOrcamento = {}) => {
    if (executando) return null;
    setExecutando(true);
    setErroFechamento('');
    setChecagensServidor([]);
    try {
      const { data } = await base44.functions.invoke('onOrcamentoConfirmed', {
        acao, orcamento_id: negociacao.registro.id,
        group_id: grupoAtual?.id || negociacao.registro.group_id,
        empresa_id: empresaAtual?.id || negociacao.registro.empresa_id,
        versao: versao || negociacao.registro.updated_date,
        ...(acao !== 'validar' ? { itens: itens.map(itemParaOrcamento), dados_orcamento: dadosOrcamento } : {}),
      });
      if (!data?.ok) throw new Error(data?.error || 'Fechamento não confirmado pelo servidor.');
      setChecagensServidor(data.checagens || []);
      if (acao !== 'validar') {
        toast.success(acao === 'fechar' ? 'Orçamento fechado e validado no servidor.' : 'Orçamento salvo.');
        await onAtualizar?.();
      }
      return data.orcamento;
    } catch (erro) {
      const retorno = erro?.response?.data || erro?.data;
      const mensagem = retorno?.error || erro.message || 'Não foi possível validar o fechamento.';
      setChecagensServidor(retorno?.checagens || []);
      setErroFechamento(mensagem);
      return null;
    } finally {
      setExecutando(false);
    }
  };

  const derivar = async (acao, idsSelecionados = [], revisado = false) => {
    if (derivacaoEmCurso.current) return null;
    setErroFechamento('');
    if (!acoes.podeCriar || (acao === 'desmembrar' && !acoes.podeEditar) || !revisado) {
      setErroFechamento('Permissão e conferência explícita são obrigatórias para esta ação.');
      return null;
    }
    const registro = negociacao.registro;
    const controle = registro.derivacao_orcamento;
    const pendente = controle && controle.fase !== 'concluida';
    const indices = pendente ? controle.indices : acao === 'duplicar' ? [] : idsSelecionados.map((id) => negociacao.itens.findIndex((i) => i.id === id));
    const chave = JSON.stringify([registro.id, acao, indices, pendente ? controle.versao_origem : registro.updated_date]);
    if (!tentativaDerivacao.current || tentativaDerivacao.current.chave !== chave) tentativaDerivacao.current = { chave, id: pendente ? controle.operacao_id : crypto.randomUUID() };
    derivacaoEmCurso.current = true;
    setExecutando(true);
    try {
      const { data } = await base44.functions.invoke('onOrcamentoConfirmed', {
        acao, orcamento_id: registro.id, group_id: registro.group_id, empresa_id: registro.empresa_id,
        versao: pendente ? controle.versao_origem : registro.updated_date,
        operacao_id: tentativaDerivacao.current.id, indices, revisado,
      });
      if (!data?.ok) throw new Error(data?.error || 'Operação não confirmada.');
      toast.success(data.repetida ? 'Orçamento existente conciliado, sem duplicação.' : `Orçamento ${data.novo_orcamento.numero_orcamento} ${acao === 'duplicar' ? 'duplicado' : 'desmembrado'}.`);
      await onAtualizar?.();
      return data.novo_orcamento;
    } catch (erro) {
      setErroFechamento(erro?.response?.data?.error || erro?.data?.error || erro.message || 'Não foi possível concluir a operação.');
      return null;
    } finally {
      derivacaoEmCurso.current = false;
      setExecutando(false);
    }
  };
  const duplicar = (revisado) => derivar('duplicar', [], revisado);
  const desmembrar = async (ids, revisado) => Boolean(await derivar('desmembrar', ids, revisado));

  // Repetir pedido: copia os itens como base e revalida preço pelo cadastro oficial de Produto
  const importarItens = async (pedido) => {
    if (!acoes.podeEditar) {
      toast.error('Sem permissão para alterar os itens desta negociação.');
      return null;
    }
    const originais = pedidoParaNegociacao(pedido || {}).itens;
    if (!originais.length) {
      toast.error('O pedido selecionado não possui itens para importar.');
      return null;
    }
    setImportando(true);
    try {
      const ids = Array.from(new Set(originais.map((item) => item.produto_id).filter(Boolean)));
      if (!negociacao.registro?.group_id || !negociacao.registro?.empresa_id) throw new Error('Orçamento sem grupo e empresa definidos.');
      const produtos = ids.length
        ? await base44.entities.Produto.filter({
          id: { $in: ids }, group_id: negociacao.registro.group_id,
          $or: [
            { empresa_id: negociacao.registro.empresa_id },
            { empresas_compartilhadas_ids: negociacao.registro.empresa_id },
          ],
        }, { limit: ids.length })
        : [];
      const registros = Array.isArray(produtos) ? produtos : produtos.items || [];
      const porId = new Map(registros.map((produto) => [produto.id, produto]));
      return originais.map((item, indice) => {
        const produto = porId.get(item.produto_id);
        const precoAtual = Number(produto?.preco_venda || 0);
        const quantidade = Number(item.quantidade) || 0;
        // Sem preço oficial atual não reaproveita preço histórico silenciosamente.
        const valorUnitario = precoAtual > 0 ? precoAtual : 0;
        return {
          id: `imp-${Date.now()}-${indice}`,
          produto_id: item.produto_id || null,
          descricao: item.produto_descricao || item.descricao || produto?.descricao || 'Item',
          quantidade,
          unidade: item.unidade || 'UN',
          valor_unitario: valorUnitario,
          desconto_percentual: 0,
          valor_total: Number((quantidade * valorUnitario).toFixed(2)),
          tipo: item.tipo || 'revenda',
          preco_recalculado: precoAtual > 0,
        };
      });
    } catch (erro) {
      toast.error(`Erro ao importar itens: ${erro.message}`);
      return null;
    } finally {
      setImportando(false);
    }
  };

  return { duplicar, desmembrar, importarItens, executarFechamento, prepararConversao, converterPedido, executando, importando, erroFechamento, checagensServidor };
}