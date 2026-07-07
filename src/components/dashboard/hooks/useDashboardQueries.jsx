import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import useRLSQuery from "@/components/lib/useRLSQuery";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { DASHBOARD_LIST_LIMIT, DASHBOARD_REFETCH_INTERVAL_MS, dashboardQueryDefaults } from "@/components/dashboard/config/dashboardQueryConfig";

/**
 * Hook extraído de Dashboard.jsx (Regra-Mãe regra 3).
 * Centraliza todas as queries de dados do Dashboard, subscriptions realtime e métricas auxiliares.
 */
export function useDashboardQueries({ canSeeFinanceiro, canSeeCRM, canSeeComercial, canSeeEstoque, canSeeExpedicao, canSeeRH, canSeeProducao, canSeeFiscal, periodo, autoRefresh, empresaAtual, estaNoGrupo, grupoAtual, getFiltroContexto }) {
  const queryClient = useQueryClient();
  const { filterInContext } = useContextoVisual();
  const hasContextoAtivo = Boolean(empresaAtual?.id || estaNoGrupo || grupoAtual?.id);
  const refetchInterval = (empresaAtual?.id || estaNoGrupo) ? (autoRefresh ? DASHBOARD_REFETCH_INTERVAL_MS : false) : false;

  const { data: pedidos = [] } = useRLSQuery('Pedido', {}, '-created_date', DASHBOARD_LIST_LIMIT, { enabled: Boolean(canSeeComercial && hasContextoAtivo), ...dashboardQueryDefaults, refetchInterval });
  const { data: contasReceber = [] } = useRLSQuery('ContaReceber', {}, '-data_vencimento', DASHBOARD_LIST_LIMIT, { enabled: Boolean(canSeeFinanceiro && hasContextoAtivo), ...dashboardQueryDefaults, refetchInterval });
  const { data: contasPagar = [] } = useRLSQuery('ContaPagar', {}, '-data_vencimento', DASHBOARD_LIST_LIMIT, { enabled: Boolean(canSeeFinanceiro && hasContextoAtivo), ...dashboardQueryDefaults, refetchInterval });
  const { data: entregas = [] } = useRLSQuery('Entrega', {}, '-created_date', DASHBOARD_LIST_LIMIT, { enabled: Boolean(canSeeExpedicao && hasContextoAtivo), ...dashboardQueryDefaults, refetchInterval });
  const { data: colaboradores = [] } = useRLSQuery('Colaborador', {}, '-created_date', DASHBOARD_LIST_LIMIT, { enabled: Boolean(canSeeRH && hasContextoAtivo), ...dashboardQueryDefaults, refetchInterval });
  const { data: produtos = [] } = useRLSQuery('Produto', {}, '-created_date', DASHBOARD_LIST_LIMIT, { enabled: Boolean(canSeeEstoque && hasContextoAtivo), ...dashboardQueryDefaults, refetchInterval });
  const { data: clientes = [] } = useRLSQuery('Cliente', {}, '-created_date', DASHBOARD_LIST_LIMIT, { enabled: Boolean(canSeeCRM && hasContextoAtivo), ...dashboardQueryDefaults, refetchInterval });
  const { data: ordensProducao = [] } = useRLSQuery('OrdemProducao', {}, '-data_emissao', DASHBOARD_LIST_LIMIT, { enabled: Boolean(canSeeProducao && hasContextoAtivo), ...dashboardQueryDefaults, refetchInterval });
  const { data: notasFiscais = [] } = useRLSQuery('NotaFiscal', {}, '-created_date', DASHBOARD_LIST_LIMIT, { enabled: Boolean((canSeeFinanceiro || canSeeFiscal || canSeeComercial) && hasContextoAtivo), staleTime: 30000, refetchOnWindowFocus: false, refetchOnReconnect: false, retry: 1, refetchInterval });

  const { data: iaConsolidado = {}, isLoading: loadingAnomIA } = useQuery({
    queryKey: ['iaConsolidado', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return { details: [], previsoes: [] };
      const filtros = getFiltroContexto('empresa_id', true);
      const res = await base44.functions.invoke('iaFinanceAnomalyScan', { filtros, previsao_estoque: { enabled: true, horizon_days: 14 } });
      return res?.data || { details: [], previsoes: [] };
    },
    staleTime: 900000,
    enabled: Boolean((canSeeFinanceiro || canSeeEstoque) && hasContextoAtivo && autoRefresh)
  });

  const { data: ccMetrics = { errors: 0, funcs: 0, secAlerts: 0 } } = useQuery({
    enabled: Boolean(hasContextoAtivo && autoRefresh),
    queryKey: ['command-center', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
    queryFn: async () => {
      const since = Date.now() - 24 * 60 * 60 * 1000;
      const logs = await filterInContext('AuditLog', {}, '-data_hora', 200);
      const within = (logs || []).filter(l => new Date(l?.data_hora || l?.created_date || 0).getTime() >= since);
      const str = (l) => `${l?.descricao || ''} ${l?.mensagem_erro || ''} ${l?.acao || ''}`;
      return {
        errors: within.filter(l => /erro|error|failed|rejeit/i.test(str(l))).length,
        funcs: within.filter(l => l?.entidade === 'Function' && l?.acao === 'Execução').length,
        secAlerts: within.filter(l => (l?.tipo_auditoria || '').toLowerCase() === 'seguranca').length,
      };
    },
    staleTime: 300000,
  });

  const { data: botMetrics = { chats: 0, sla_ok: 0, sla_total: 0 } } = useQuery({
    enabled: Boolean(hasContextoAtivo && autoRefresh),
    queryKey: ['bot-metrics-24h', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      const since = Date.now() - 24 * 60 * 60 * 1000;
      const items = await filterInContext('ChatbotInteracao', {}, '-created_date', 200);
      const within = (items || []).filter(i => new Date(i?.created_date || 0).getTime() >= since);
      const sla = within.reduce((acc, i) => {
        const ms = Number(i?.tempo_primeira_resposta_ms || 0);
        if (!isNaN(ms)) { acc.total++; if (ms <= 60000) acc.ok++; }
        return acc;
      }, { ok: 0, total: 0 });
      return { chats: within.length, sla_ok: sla.ok, sla_total: sla.total };
    },
    staleTime: 300000,
  });

  useEffect(() => {
    if (!(empresaAtual?.id || estaNoGrupo || grupoAtual?.id)) return;
    const subs = [];
    const add = (api, key) => { if (!api?.subscribe) return; const un = api.subscribe(() => { try { queryClient.invalidateQueries({ queryKey: [key], exact: false }); } catch (_) {} }); subs.push(un); };
    add(base44.entities?.Pedido, 'Pedido');
    add(base44.entities?.ContaReceber, 'ContaReceber');
    add(base44.entities?.ContaPagar, 'ContaPagar');
    add(base44.entities?.Entrega, 'Entrega');
    add(base44.entities?.Produto, 'Produto');
    add(base44.entities?.Cliente, 'Cliente');
    add(base44.entities?.OrdemProducao, 'OrdemProducao');
    add(base44.entities?.NotaFiscal, 'NotaFiscal');
    return () => { subs.forEach(u => { try { u && u(); } catch (_) {} }); };
  }, [empresaAtual?.id, grupoAtual?.id, estaNoGrupo]);

  return { pedidos, contasReceber, contasPagar, entregas, colaboradores, produtos, clientes, ordensProducao, notasFiscais, iaConsolidado, loadingAnomIA, ccMetrics, botMetrics, hasContextoAtivo };
}

export default useDashboardQueries;