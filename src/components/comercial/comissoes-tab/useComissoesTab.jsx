import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import useRLS from "@/components/lib/useRLS";
import useRLSQuery from "@/components/lib/useRLSQuery";
import { useConfirm } from "@/components/ui/confirm-dialog";

/**
 * Hook extraído de ComissoesTab.jsx (Regra-Mãe)
 * Gerencia mutations, filtros e KPIs de comissões
 */
export default function useComissoesTab({ comissoes, pedidos }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todas");

  const queryClient = useQueryClient();
  const { update: updateRLS, create: createRLS } = useRLS();
  const { data: comissoesBackend = [] } = useRLSQuery('Comissao', {}, '-data_venda', 200);
  const comissoesList = Array.isArray(comissoes) && comissoes.length ? comissoes : comissoesBackend;
  const { confirm, ConfirmDialog } = useConfirm();

  const aprovarComissaoMutation = useMutation({
    mutationFn: ({ id, aprovador }) => updateRLS('Comissao', id, {
      status: 'Aprovada', aprovador,
      data_aprovacao: new Date().toISOString().split('T')[0]
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Comissao'] }),
  });

  const recusarComissaoMutation = useMutation({
    mutationFn: ({ id, motivo, obs }) => updateRLS('Comissao', id, {
      status: 'Cancelada',
      observacoes: `${obs || ''}\n\nRecusada: ${motivo}`
    }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['Comissao'] }),
  });

  const pagarComissaoMutation = useMutation({
    mutationFn: async ({ id, comissao }) => {
      await updateRLS('Comissao', id, {
        status: 'Paga',
        data_pagamento: new Date().toISOString().split('T')[0]
      });
      await createRLS('ContaPagar', {
        descricao: `Comissão - ${comissao.vendedor}`,
        fornecedor: comissao.vendedor,
        categoria: 'Comissões',
        valor: comissao.valor_comissao,
        data_emissao: new Date().toISOString().split('T')[0],
        data_vencimento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'Pendente',
        forma_pagamento: 'Transferência',
        observacoes: `Referente à comissão de vendas. Pedidos: ${comissao.numero_pedido}`
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['Comissao'] });
      queryClient.invalidateQueries({ queryKey: ['ContaPagar'] });
    },
  });

  const handleAprovar = async (comissao) => {
    const user = await base44.auth.me();
    const ok = await confirm({
      title: 'Aprovar Comissão',
      description: `Deseja aprovar a comissão de ${comissao.vendedor}?\nValor: R$ ${comissao.valor_comissao?.toFixed(2)}\n\nVocê está aprovando como: ${user?.full_name || 'Sistema'}`,
      confirmText: 'Aprovar', variant: 'success'
    });
    if (ok) aprovarComissaoMutation.mutate({ id: comissao.id, aprovador: user?.full_name || 'Sistema' });
  };

  const handleRecusar = async (comissao) => {
    const ok = await confirm({
      title: 'Recusar Comissão',
      description: `Deseja recusar a comissão de ${comissao.vendedor}?\nValor: R$ ${comissao.valor_comissao?.toFixed(2)}`,
      confirmText: 'Recusar', variant: 'destructive'
    });
    if (ok) recusarComissaoMutation.mutate({ id: comissao.id, motivo: 'Recusado pelo usuário', obs: comissao.observacoes });
  };

  const handlePagar = async (comissao) => {
    const ok = await confirm({
      title: 'Gerar Pagamento',
      description: `Deseja gerar o pagamento da comissão?\n\nVendedor: ${comissao.vendedor}\nValor: R$ ${comissao.valor_comissao?.toFixed(2)}\n\nSerá criado um título no Financeiro.`,
      confirmText: 'Gerar Pagamento', variant: 'success'
    });
    if (ok) pagarComissaoMutation.mutate({ id: comissao.id, comissao });
  };

  const comissoesFiltradas = comissoesList.filter(c => {
    const s = searchTerm.toLowerCase();
    const matchSearch = c.vendedor?.toLowerCase().includes(s) || c.numero_pedido?.toLowerCase().includes(s) ||
      c.cliente?.toLowerCase().includes(s) || c.status?.toLowerCase().includes(s) ||
      c.observacoes?.toLowerCase().includes(s) || c.aprovador?.toLowerCase().includes(s);
    const matchStatus = statusFilter === "todas" || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const comissoesPendentes = comissoesList.filter(c => c.status === 'Pendente').length;
  const comissoesAprovadas = comissoesList.filter(c => c.status === 'Aprovada').length;
  const totalPendente = comissoesList.filter(c => c.status === 'Pendente').reduce((s, c) => s + (c.valor_comissao || 0), 0);
  const totalPago = comissoesList.filter(c => c.status === 'Paga').reduce((s, c) => s + (c.valor_comissao || 0), 0);

  const relatorioPorVendedor = () => {
    const porVendedor = {};
    comissoesList.forEach(c => {
      const v = c.vendedor || 'Sem Vendedor';
      if (!porVendedor[v]) porVendedor[v] = { vendedor: v, total_vendas: 0, total_comissao: 0, pendentes: 0, aprovadas: 0, pagas: 0 };
      porVendedor[v].total_vendas += c.valor_venda || 0;
      porVendedor[v].total_comissao += c.valor_comissao || 0;
      if (c.status === 'Pendente') porVendedor[v].pendentes++;
      if (c.status === 'Aprovada') porVendedor[v].aprovadas++;
      if (c.status === 'Paga') porVendedor[v].pagas++;
    });
    return Object.values(porVendedor);
  };

  return {
    searchTerm, setSearchTerm, statusFilter, setStatusFilter,
    comissoesFiltradas, comissoesPendentes, comissoesAprovadas, totalPendente, totalPago,
    relatorioPorVendedor, handleAprovar, handleRecusar, handlePagar, confirm, ConfirmDialog,
  };
}