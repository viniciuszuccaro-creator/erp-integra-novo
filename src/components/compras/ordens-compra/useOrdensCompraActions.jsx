import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useUser } from "@/components/lib/UserContext";
import { base44 } from "@/api/base44Client";

/**
 * Hook extraído de OrdensCompraTab.jsx
 * Todas as mutations de OC: criar, atualizar, aprovar, enviar, receber, avaliar.
 */
export default function useOrdensCompraActions({ fornecedores, authUser }) {
  const { createInContext, updateInContext, filterInContext } = useContextoVisual();
  const [ocSelecionada, setOcSelecionada] = useState(null);

  const createMutation = useMutation({ mutationFn: (data) => createInContext('OrdemCompra', data) });

  const updateMutation = useMutation({ mutationFn: ({ id, data }) => updateInContext('OrdemCompra', id, data) });

  const aprovarMutation = useMutation({
    mutationFn: async ({ id, oc }) => {
      const hoje = new Date().toISOString().split('T')[0];
      await updateInContext('OrdemCompra', id, {
        status: 'Aprovada', data_aprovacao: hoje,
        historico: [...(oc.historico || []), { data: new Date().toISOString(), status_anterior: oc.status, status_novo: 'Aprovada', usuario: (authUser?.full_name || authUser?.email || 'Sistema'), observacao: 'Ordem de compra aprovada' }]
      });
    },
    onSuccess: async () => {
      try { await base44.entities.AuditLog.create({ acao: 'Aprovação', modulo: 'Compras', entidade: 'OrdemCompra', usuario: authUser?.email, usuario_id: authUser?.id, descricao: 'OC aprovada', data_hora: new Date().toISOString() }); } catch (_) { console.error('[ordens-compra] catch:', _); }
    }
  });

  const enviarFornecedorMutation = useMutation({
    mutationFn: async ({ id, oc }) => {
      const hoje = new Date().toISOString().split('T')[0];
      await updateInContext('OrdemCompra', id, {
        status: 'Enviada ao Fornecedor', data_envio_fornecedor: hoje,
        historico: [...(oc.historico || []), { data: new Date().toISOString(), status_anterior: oc.status, status_novo: 'Enviada ao Fornecedor', usuario: (authUser?.full_name || authUser?.email || 'Sistema'), observacao: 'Ordem enviada ao fornecedor' }]
      });
    },
    onSuccess: async () => {
      try { await base44.entities.AuditLog.create({ acao: 'Edição', modulo: 'Compras', entidade: 'OrdemCompra', usuario: authUser?.email, usuario_id: authUser?.id, descricao: 'OC enviada ao fornecedor', data_hora: new Date().toISOString() }); } catch (_) { console.error('[ordens-compra] catch:', _); }
    }
  });

  const receberMutation = useMutation({
    mutationFn: async ({ id, oc, dados }) => {
      const dataEnvio = new Date(oc.data_envio_fornecedor);
      const dataRecebimento = new Date(dados.data_entrega_real);
      const leadTimeReal = Math.floor((dataRecebimento - dataEnvio) / (1000 * 60 * 60 * 24));

      await updateInContext('OrdemCompra', id, {
        status: 'Recebida', data_entrega_real: dados.data_entrega_real, nota_fiscal_entrada: dados.nota_fiscal_entrada, lead_time_real: leadTimeReal,
        historico: [...(oc.historico || []), { data: new Date().toISOString(), status_anterior: oc.status, status_novo: 'Recebida', usuario: (authUser?.full_name || authUser?.email || 'Sistema'), observacao: `Recebida. Lead time: ${leadTimeReal} dias` }]
      });

      const fornecedor = fornecedores.find(f => f.id === oc.fornecedor_id);
      if (fornecedor) {
        const qtdCompras = (fornecedor.quantidade_compras || 0) + 1;
        const valorTotal = (fornecedor.valor_total_compras || 0) + (oc.valor_total || 0);
        const leadTimesAnteriores = fornecedor.lead_time_medio ? [fornecedor.lead_time_medio] : [];
        const leadTimes = [...leadTimesAnteriores, leadTimeReal];
        const leadTimeMedio = leadTimes.reduce((sum, lt) => sum + lt, 0) / leadTimes.length;
        const prazoAcordado = oc.prazo_entrega_acordado || fornecedor.prazo_entrega_padrao || 0;
        const noPrazo = leadTimeReal <= prazoAcordado;
        const totalEntregasPrazo = (fornecedor.percentual_entregas_prazo || 0) * (qtdCompras - 1);
        const novoPercentual = ((totalEntregasPrazo + (noPrazo ? 1 : 0)) / qtdCompras) * 100;
        await updateInContext('Fornecedor', fornecedor.id, { quantidade_compras: qtdCompras, valor_total_compras: valorTotal, ultima_compra: dados.data_entrega_real, lead_time_medio: Math.round(leadTimeMedio), percentual_entregas_prazo: Math.round(novoPercentual) });
      }

      if (oc.itens && oc.itens.length > 0) {
        for (const item of oc.itens) {
          await createInContext('MovimentacaoEstoque', { produto_id: item.produto_id, produto_descricao: item.descricao, tipo_movimentacao: 'Entrada', quantidade: item.quantidade_solicitada, data_movimentacao: dados.data_entrega_real, documento: `OC-${oc.numero_oc}`, motivo: `Recebimento de Ordem de Compra`, valor_unitario: item.valor_unitario, valor_total: item.valor_total, responsavel: 'Sistema', observacoes: dados.observacoes });
          if (item.produto_id) {
            const produto = await filterInContext('Produto', { id: item.produto_id });
            if (produto && produto.length > 0) { const produtoAtual = produto[0]; await updateInContext('Produto', item.produto_id, { estoque_atual: (produtoAtual.estoque_atual || 0) + item.quantidade_solicitada }); }
          }
        }
      }
      return { leadTimeReal, fornecedorNome: oc.fornecedor_nome };
    },
    onSuccess: async ({ leadTimeReal }) => {
      try { await base44.entities.AuditLog.create({ acao: 'Edição', modulo: 'Compras', entidade: 'OrdemCompra', usuario: authUser?.email, usuario_id: authUser?.id, descricao: 'Recebimento registrado', dados_novos: { lead_time_real: leadTimeReal }, data_hora: new Date().toISOString() }); } catch (_) { console.error('[ordens-compra] catch:', _); }
    }
  });

  const avaliarFornecedorMutation = useMutation({
    mutationFn: async ({ oc, avaliacao }) => {
      const notaMedia = (avaliacao.qualidade + avaliacao.prazo + avaliacao.preco + avaliacao.atendimento) / 4;
      await base44.entities.OrdemCompra.update(oc.id, {
        avaliacao_fornecedor: { realizada: true, data: new Date().toISOString(), nota: notaMedia, criterios: { qualidade: avaliacao.qualidade, prazo: avaliacao.prazo, preco: avaliacao.preco, atendimento: avaliacao.atendimento }, comentario: avaliacao.comentario }
      });
      const fornecedor = fornecedores.find(f => f.id === oc.fornecedor_id);
      if (fornecedor) {
        const novasAvaliacoes = [...(fornecedor.avaliacoes || []), { data: new Date().toISOString(), nota: notaMedia, criterios: { qualidade: avaliacao.qualidade, prazo: avaliacao.prazo, preco: avaliacao.preco, atendimento: avaliacao.atendimento }, ordem_compra_id: oc.id, avaliador: authUser?.email || 'Sistema', comentario: avaliacao.comentario }];
        const somaNotas = novasAvaliacoes.reduce((sum, av) => sum + av.nota, 0);
        const notaMediaFornecedor = somaNotas / novasAvaliacoes.length;
        await updateInContext('Fornecedor', fornecedor.id, { avaliacoes: novasAvaliacoes, nota_media: parseFloat(notaMediaFornecedor.toFixed(2)) });
      }
      return { notaMedia, fornecedorNome: oc.fornecedor_nome };
    }
  });

  return { createMutation, updateMutation, aprovarMutation, enviarFornecedorMutation, receberMutation, avaliarFornecedorMutation, ocSelecionada, setOcSelecionada };
}