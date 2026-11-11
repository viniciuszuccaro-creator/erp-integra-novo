// Ações do orçamento na Central 360° — duplicar, desmembrar e importar itens de pedido anterior.
// Multiempresa: createInContext/updateInContext carimbam group_id/empresa_id e auditam.
import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import useAcoesComerciais from './useAcoesComerciais';
import { proximoNumeroOrcamento } from './useNovaNegociacao';
import { totalizarItens } from './negociacaoUtils';

const somarDias = (dias) => {
  const data = new Date();
  data.setDate(data.getDate() + dias);
  return data.toISOString().slice(0, 10);
};

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
  const { user } = useUser();
  const { createInContext, updateInContext, filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const acoes = useAcoesComerciais();

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

  const registrarAuditoria = (acao, descricao, registroId) => {
    void base44.entities.AuditLog.create({
      usuario: user?.full_name || user?.email || 'Usuário',
      usuario_id: user?.id || null,
      acao: acao === 'Duplicação' || acao === 'Desmembramento' ? 'Criação' : acao,
      modulo: 'Comercial',
      tipo_auditoria: 'entidade',
      entidade: 'OrcamentoCliente',
      registro_id: registroId || negociacao.registro?.id || null,
      descricao,
      empresa_id: empresaAtual?.id || negociacao.registro?.empresa_id || null,
      group_id: grupoAtual?.id || negociacao.registro?.group_id || null,
      data_hora: new Date().toISOString(),
    }).catch((erro) => { console.error('AuditLog falhou (ações do orçamento):', erro); });
  };

  const proximoNumero = async () => {
    const lista = await filterInContext('OrcamentoCliente', {}, '-created_date', 100);
    return proximoNumeroOrcamento(Array.isArray(lista) ? lista : []);
  };

  const criar = async ({ itens, observacoes }) => {
    const numero = await proximoNumero();
    const totais = totalizarItens(itens);
    return createInContext('OrcamentoCliente', {
      group_id: negociacao.registro.group_id,
      empresa_id: negociacao.registro.empresa_id,
      numero_orcamento: numero,
      cliente_id: negociacao.cliente_id,
      cliente_nome: negociacao.cliente_nome,
      cliente_email: negociacao.registro?.cliente_email || null,
      vendedor_responsavel: user?.full_name || user?.email || 'Usuário',
      vendedor_responsavel_id: user?.id || null,
      data_criacao: new Date().toISOString().slice(0, 10),
      data_validade: somarDias(7),
      itens: itens.map(itemParaOrcamento),
      valor_total: Number(totais.total.toFixed(2)),
      condicoes_pagamento: negociacao.registro?.condicoes_pagamento || 'À Vista',
      prazo_entrega: negociacao.registro?.prazo_entrega || '7 dias úteis',
      observacoes,
      status: 'Pendente',
    });
  };

  const duplicar = async () => {
    if (!acoes.podeCriar) {
      toast.error('Sem permissão para duplicar orçamentos.');
      return null;
    }
    setExecutando(true);
    try {
      const criado = await criar({
        itens: negociacao.itens,
        observacoes: `Duplicado do orçamento ${negociacao.numero}`,
      });
      registrarAuditoria(
        'Duplicação',
        `Orçamento ${negociacao.numero} duplicado em ${criado?.numero_orcamento}`,
        criado?.id
      );
      toast.success(`Orçamento ${criado?.numero_orcamento || ''} criado a partir de ${negociacao.numero}.`);
      await onAtualizar?.();
      return criado;
    } catch (erro) {
      toast.error(`Erro ao duplicar: ${erro.message}`);
      return null;
    } finally {
      setExecutando(false);
    }
  };

  const desmembrar = async (idsSelecionados = []) => {
    if (!acoes.podeEditar || !acoes.podeCriar) {
      toast.error('Sem permissão para desmembrar o orçamento.');
      return false;
    }
    const marcados = new Set(idsSelecionados);
    if (!marcados.size) {
      toast.error('Selecione ao menos um item para desmembrar.');
      return false;
    }
    const mover = negociacao.itens.filter((item) => marcados.has(item.id));
    const manter = negociacao.itens.filter((item) => !marcados.has(item.id));
    if (!mover.length) {
      toast.error('Os itens selecionados não estão mais na negociação.');
      return false;
    }
    setExecutando(true);
    try {
      const criado = await criar({
        itens: mover,
        observacoes: `Desmembrado do orçamento ${negociacao.numero}`,
      });
      const totaisManter = totalizarItens(manter);
      await updateInContext('OrcamentoCliente', negociacao.registro.id, {
        itens: manter.map(itemParaOrcamento),
        valor_total: Number(totaisManter.total.toFixed(2)),
      });
      registrarAuditoria(
        'Desmembramento',
        `${mover.length} item(ns) do orçamento ${negociacao.numero} movidos para ${criado?.numero_orcamento}`,
        criado?.id
      );
      toast.success(`Itens movidos para o novo orçamento ${criado?.numero_orcamento || ''}.`);
      await onAtualizar?.();
      return true;
    } catch (erro) {
      toast.error(`Erro ao desmembrar: ${erro.message}`);
      return false;
    } finally {
      setExecutando(false);
    }
  };

  // Repetir pedido: copia os itens como base e revalida preço pelo cadastro oficial de Produto
  const importarItens = async (pedido) => {
    if (!acoes.podeEditar) {
      toast.error('Sem permissão para alterar os itens desta negociação.');
      return null;
    }
    const originais = [
      ...(pedido?.itens_revenda || []),
      ...(pedido?.itens_armado_padrao || []),
      ...(pedido?.itens_corte_dobra || []),
    ];
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
        const valorUnitario = precoAtual > 0 ? precoAtual : Number(item.valor_unitario ?? item.preco_unitario) || 0;
        return {
          id: `imp-${Date.now()}-${indice}`,
          produto_id: item.produto_id || null,
          descricao: item.produto_descricao || item.descricao || produto?.descricao || 'Item',
          quantidade,
          unidade: item.unidade || 'UN',
          valor_unitario: valorUnitario,
          desconto_percentual: 0,
          valor_total: Number((quantidade * valorUnitario).toFixed(2)),
          tipo: item.tipo === 'servico' ? 'servico' : 'revenda',
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

  return { duplicar, desmembrar, importarItens, executarFechamento, executando, importando, erroFechamento, checagensServidor };
}