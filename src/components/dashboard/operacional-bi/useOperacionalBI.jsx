import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

const MESES_NOMES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

function buildQueryConfig(filterInContext, empresaAtual, estaNoGrupo) {
  const enabled = !!empresaAtual?.id || estaNoGrupo;
  const baseQueryFn = (entity, sort) =>
    enabled ? filterInContext(entity, {}, sort, 9999) : Promise.resolve([]);
  return { enabled, baseQueryFn };
}

export default function useOperacionalBI() {
  const [periodoFiltro, setPeriodoFiltro] = useState("mes");
  const queryClient = useQueryClient();
  const { empresaAtual, estaNoGrupo, filtrarPorContexto, filterInContext } =
    useContextoVisual();

  const { enabled, baseQueryFn } = buildQueryConfig(
    filterInContext,
    empresaAtual,
    estaNoGrupo
  );

  const queryOpts = {
    initialData: [],
    staleTime: 120000,
    gcTime: 600000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: false,
    enabled,
  };

  const { data: pedidos = [], isError: errPedidos } = useQuery({
    queryKey: ["bi-pedidos", empresaAtual?.id, estaNoGrupo],
    queryFn: () => baseQueryFn("Pedido", "-created_date"),
    ...queryOpts,
  });

  const { data: ops = [], isError: errOps } = useQuery({
    queryKey: ["bi-ordens-producao", empresaAtual?.id, estaNoGrupo],
    queryFn: () => baseQueryFn("OrdemProducao", "-data_emissao"),
    ...queryOpts,
  });

  const { data: entregas = [], isError: errEntregas } = useQuery({
    queryKey: ["bi-entregas", empresaAtual?.id, estaNoGrupo],
    queryFn: () => baseQueryFn("Entrega", "-created_date"),
    ...queryOpts,
  });

  const { data: contasReceber = [], isError: errCR } = useQuery({
    queryKey: ["bi-contasReceber", empresaAtual?.id, estaNoGrupo],
    queryFn: () => baseQueryFn("ContaReceber", "-data_vencimento"),
    ...queryOpts,
  });

  const { data: clientes = [], isError: errClientes } = useQuery({
    queryKey: ["bi-clientes", empresaAtual?.id, estaNoGrupo],
    queryFn: () => baseQueryFn("Cliente", "-created_date"),
    ...queryOpts,
  });

  // Filtrar por contexto
  const pedidosFiltrados = filtrarPorContexto(pedidos, "empresa_id");
  const opsFiltradas = filtrarPorContexto(ops, "empresa_id");
  const entregasFiltradas = filtrarPorContexto(entregas, "empresa_id");
  const clientesFiltrados = filtrarPorContexto(clientes, "empresa_id");
  const contasReceberFiltradas = filtrarPorContexto(contasReceber, "empresa_id");

  // KPIs essenciais (5)
  const totalVendas = pedidosFiltrados.reduce((acc, p) => acc + (p.valor_total || 0), 0);
  const pedidosAbertos = pedidosFiltrados.filter(
    (p) => p.status !== "Entregue" && p.status !== "Cancelado"
  ).length;
  const opsEmProducao = opsFiltradas.filter(
    (op) => op.status !== "Concluída" && op.status !== "Cancelada"
  ).length;
  const entregasPendentes = entregasFiltradas.filter(
    (e) => e.status !== "Entregue"
  ).length;
  const contasAtrasadas = contasReceberFiltradas.filter(
    (c) => c.status === "Atrasado"
  ).length;

  // Tendência de vendas
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const pedidosMesAtual = pedidosFiltrados.filter((p) => {
    const d = new Date(p.data_pedido);
    return d.getMonth() === mesAtual;
  });
  const pedidosMesAnterior = pedidosFiltrados.filter((p) => {
    const d = new Date(p.data_pedido);
    return d.getMonth() === mesAtual - 1;
  });
  const valorAtual = pedidosMesAtual.reduce((s, p) => s + (p.valor_total || 0), 0);
  const valorAnterior = pedidosMesAnterior.reduce((s, p) => s + (p.valor_total || 0), 0);
  const crescimentoVendas =
    valorAnterior > 0
      ? parseFloat(((valorAtual - valorAnterior) / valorAnterior * 100).toFixed(1))
      : 0;

  const clientesComRiscoChurn = clientesFiltrados.filter(
    (c) => c.risco_churn === "Alto" || c.risco_churn === "Crítico"
  ).length;

  const semDados =
    [pedidosFiltrados, opsFiltradas, entregasFiltradas, clientesFiltrados, contasReceberFiltradas].every(
      (arr) => (arr?.length || 0) === 0
    );
  const erroGeral = errPedidos || errOps || errEntregas || errCR || errClientes;

  // Dados de vendas por mês (6 meses)
  const dadosVendasMes = MESES_NOMES.slice(0, 6).map((mes, idx) => {
    const pedidosMes = pedidosFiltrados.filter((p) => {
      const d = new Date(p.data_pedido);
      return d.getMonth() === idx;
    });
    return { mes, valor: pedidosMes.reduce((s, p) => s + (p.valor_total || 0), 0) };
  });

  // Dados de evolução de OPs (6 meses)
  const dadosOpsEvolucao = MESES_NOMES.slice(0, 6).map((mes, idx) => {
    const opsMes = opsFiltradas.filter((op) => {
      const d = new Date(op.data_emissao || op.created_date);
      return d.getMonth() === idx;
    });
    return { mes, ops: opsMes.length };
  });

  return {
    periodoFiltro,
    setPeriodoFiltro,
    empresaAtual,
    estaNoGrupo,
    queryClient,
    pedidosFiltrados,
    opsFiltradas,
    entregasFiltradas,
    clientesFiltrados,
    contasReceberFiltradas,
    kpis: {
      totalVendas,
      pedidosAbertos,
      opsEmProducao,
      entregasPendentes,
      contasAtrasadas,
      crescimentoVendas,
      clientesComRiscoChurn,
    },
    semDados,
    erroGeral,
    dadosVendasMes,
    dadosOpsEvolucao,
  };
}