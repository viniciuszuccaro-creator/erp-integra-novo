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
  const { data: produtos = [] } = useRLSQuery('Produto', { status: 'Ativo', tipo_item: 'Revenda' }, '-created_date', 500, { enabled: Boolean(canSeeEstoque && hasContextoAtivo), ...dashboardQueryDefaults, refetchInterval });
  const { data: clientes = [] } = useRLSQuery('Cliente', {}, '-created_date', DASHBOARD_LIST_LIMIT, { enabled: Boolean(canSeeCRM && hasContextoAtivo), ...dashboardQueryDefaults, refetchInterval });
  const { data: ordensProducao = [] } = useRLSQuery('OrdemProducao', {}, '-data_emissao', DASHBOARD_LIST_LIMIT, { enabled: Boolean(canSeeProducao && hasContextoAtivo), ...dashboardQueryDefaults, refetchInterval });
  const { data: notasFiscais = [] } = useRLSQuery('NotaFiscal', {}, '-created_date', DASHBOARD_LIST_LIMIT, { enabled: Boolean((canSeeFinanceiro || canSeeFiscal || canSeeComercial) && hasContextoAtivo), staleTime: 15000, refetchOnWindowFocus: false, refetchOnReconnect: false, retry: 1, refetchInterval });

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

  // Contagens precisas via countEntities batch (não limitadas a 80 registros)
  const { data: cadastroCounts = {} } = useQuery({
    queryKey: ['dash-cadastro-counts', empresaAtual?.id, grupoAtual?.id, estaNoGrupo],
    queryFn: async () => {
      if (!hasContextoAtivo) return {};
      const scope = getFiltroContexto('empresa_id', true);
      const groupId = scope.group_id;
      const empresaId = scope.empresa_id;

      // Constrói filtros de contexto para cada entidade
      const buildFilter = (entityName) => {
        const orConds = [];
        if (groupId) orConds.push({ group_id: groupId });
        if (empresaId) {
          if (entityName === 'Cliente') {
            orConds.push({ empresa_id: empresaId }, { empresa_dona_id: empresaId }, { empresas_compartilhadas_ids: { $in: [empresaId] } });
          } else if (entityName === 'Colaborador') {
            orConds.push({ empresa_alocada_id: empresaId });
          } else if (entityName === 'Produto') {
            orConds.push({ empresa_id: empresaId }, { empresa_dona_id: empresaId }, { empresas_compartilhadas_ids: { $in: [empresaId] } }, { compartilhado_grupo: true });
          } else {
            orConds.push({ empresa_id: empresaId });
          }
        }
        return orConds.length ? { $or: orConds } : {};
      };

      // Contagem total (sem filtro de status)
      const entitiesPayload = [
        { entityName: 'Cliente', filter: buildFilter('Cliente') },
        { entityName: 'Colaborador', filter: buildFilter('Colaborador') },
        { entityName: 'Produto', filter: { ...buildFilter('Produto'), status: 'Ativo' } },
        { entityName: 'Fornecedor', filter: buildFilter('Fornecedor') },
      ];

      try {
        const res = await base44.functions.invoke("countEntities", { entities: entitiesPayload });
        const counts = res?.data?.counts || res?.counts || {};
        return {
          clientesTotal: counts['Cliente'] || 0,
          colaboradoresTotal: counts['Colaborador'] || 0,
          produtosAtivos: counts['Produto'] || 0,
          fornecedoresTotal: counts['Fornecedor'] || 0,
        };
      } catch (_) {
        return {};
      }
    },
    staleTime: 30000,
    enabled: Boolean(hasContextoAtivo),
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
    add(base44.entities?.Colaborador, 'Colaborador');
    add(base44.entities?.Fornecedor, 'Fornecedor');
    add(base44.entities?.OrdemProducao, 'OrdemProducao');
    add(base44.entities?.NotaFiscal, 'NotaFiscal');
    // Invalida contagens de cadastro quando entidades mudam
    const invCad = () => { try { queryClient.invalidateQueries({ queryKey: ['dash-cadastro-counts'], exact: false }); } catch (_) {} };
    if (base44.entities?.Cliente?.subscribe) subs.push(base44.entities.Cliente.subscribe(invCad));
    if (base44.entities?.Colaborador?.subscribe) subs.push(base44.entities.Colaborador.subscribe(invCad));
    if (base44.entities?.Produto?.subscribe) subs.push(base44.entities.Produto.subscribe(invCad));
    if (base44.entities?.Fornecedor?.subscribe) subs.push(base44.entities.Fornecedor.subscribe(invCad));
    return () => { subs.forEach(u => { try { u && u(); } catch (_) {} }); };
  }, [empresaAtual?.id, grupoAtual?.id, estaNoGrupo]);

  return { pedidos, contasReceber, contasPagar, entregas, colaboradores, produtos, clientes, ordensProducao, notasFiscais, iaConsolidado, loadingAnomIA, ccMetrics, botMetrics, hasContextoAtivo, cadastroCounts };
}

export default useDashboardQueries;