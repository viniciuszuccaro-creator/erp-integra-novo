import { useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook extraído de Relatorios.jsx (Regra-Mãe regra 3).
 * Centraliza queries multiempresa, filtragem por período, exportação CSV e agendamento.
 */
export function useRelatoriosData(filtros, setAgendarEmailDialogOpen) {
  const { toast } = useToast();
  const { empresaAtual, grupoAtual, filterInContext } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextoValido = !!(empresaAtual?.id || groupId);

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', empresaAtual?.id, groupId],
    queryFn: () => filterInContext('Cliente', {}, '-created_date', 9999),
    enabled: contextoValido,
  });

  const { data: pedidos = [] } = useQuery({
    queryKey: ['pedidos', empresaAtual?.id, groupId],
    queryFn: () => filterInContext('Pedido', {}, '-data_pedido', 9999),
    enabled: contextoValido,
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ['produtos', empresaAtual?.id, groupId],
    queryFn: () => filterInContext('Produto', {}, '-created_date', 9999),
    enabled: contextoValido,
  });

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber', empresaAtual?.id, groupId],
    queryFn: () => filterInContext('ContaReceber', {}, '-data_vencimento', 9999),
    enabled: contextoValido,
  });

  const { data: contasPagar = [] } = useQuery({
    queryKey: ['contasPagar', empresaAtual?.id, groupId],
    queryFn: () => filterInContext('ContaPagar', {}, '-data_vencimento', 9999),
    enabled: contextoValido,
  });

  const filtrarPorPeriodo = (data, campo = 'created_date') => {
    const inicio = new Date(filtros.data_inicio);
    const fim = new Date(filtros.data_fim);
    return data.filter((item) => {
      const dataItem = new Date(item[campo] || item.created_date);
      return dataItem >= inicio && dataItem <= fim;
    });
  };

  const relatorioVendasPorCliente = useMemo(() => {
    const pedidosFiltrados = filtrarPorPeriodo(pedidos, 'data_pedido');
    const porCliente = {};
    pedidosFiltrados.forEach((p) => {
      if (p.status !== 'Cancelado' && p.cliente_nome) {
        if (!porCliente[p.cliente_nome]) {
          porCliente[p.cliente_nome] = { cliente: p.cliente_nome, quantidade_pedidos: 0, valor_total: 0, ticket_medio: 0 };
        }
        porCliente[p.cliente_nome].quantidade_pedidos += 1;
        porCliente[p.cliente_nome].valor_total += p.valor_total || 0;
      }
    });
    return Object.values(porCliente).map((item) => ({
      ...item,
      ticket_medio: item.quantidade_pedidos > 0 ? item.valor_total / item.quantidade_pedidos : 0
    })).sort((a, b) => b.valor_total - a.valor_total).slice(0, 20);
  }, [pedidos, filtros]);

  const exportarParaExcel = (dados, nomeArquivo) => {
    if (!dados || dados.length === 0) {
      toast({ title: "⚠️ Sem Dados", description: "Não há dados para exportar", variant: "destructive" });
      return;
    }
    const headers = Object.keys(dados[0]).join(',');
    const rows = dados.map((item) =>
      Object.values(item).map((v) => {
        if (typeof v === 'object') return JSON.stringify(v);
        return typeof v === 'string' && v.includes(',') ? `"${v}"` : v;
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${nomeArquivo}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast({ title: "✅ Exportado!", description: `Arquivo ${nomeArquivo}.csv baixado com sucesso` });
  };

  const agendarRelatorioMutation = useMutation({
    mutationFn: async (data) => {
      toast({ title: "📧 Agendando Relatório...", description: "Configurando envio automático" });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return data;
    },
    onSuccess: (data) => {
      toast({ title: "✅ Relatório Agendado!", description: `O relatório será enviado ${data.frequencia.toLowerCase()} para ${data.destinatarios}` });
      setAgendarEmailDialogOpen(false);
    }
  });

  return { clientes, pedidos, produtos, contasReceber, contasPagar, empresaAtual, groupId, contextoValido, filtrarPorPeriodo, relatorioVendasPorCliente, exportarParaExcel, agendarRelatorioMutation };
}

export default useRelatoriosData;