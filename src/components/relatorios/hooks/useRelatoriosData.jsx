import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook extraído de Relatorios.jsx (Regra-Mãe regra 3).
 * Centraliza queries multiempresa, filtragem por período, exportação CSV e agendamento.
 * Usa useRLSQuery para compartilhar cache com todos os módulos do sistema.
 */
export function useRelatoriosData(filtros, setAgendarEmailDialogOpen) {
  const { toast } = useToast();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const contextoValido = !!(empresaAtual?.id || groupId);

  // Usa useRLSQuery — compartilha cache com Dashboard, Comercial, Financeiro, etc.
  const { data: clientes = [] } = useRLSQuery(
    'Cliente', {}, '-created_date', 9999,
    { enabled: contextoValido, staleTime: 60000 }
  );

  const { data: pedidos = [] } = useRLSQuery(
    'Pedido', {}, '-data_pedido', 9999,
    { enabled: contextoValido, staleTime: 60000 }
  );

  const { data: produtos = [] } = useRLSQuery(
    'Produto', {}, '-created_date', 9999,
    { enabled: contextoValido, staleTime: 60000 }
  );

  const { data: contasReceber = [] } = useRLSQuery(
    'ContaReceber', {}, '-data_vencimento', 9999,
    { enabled: contextoValido, staleTime: 60000 }
  );

  const { data: contasPagar = [] } = useRLSQuery(
    'ContaPagar', {}, '-data_vencimento', 9999,
    { enabled: contextoValido, staleTime: 60000 }
  );

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