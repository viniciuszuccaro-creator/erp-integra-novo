// Regra-Mãe 3: Extraído de src/pages/Comercial.jsx — consultas RLS, assinaturas realtime e métricas derivadas do módulo Comercial
import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useRLSQuery from "@/components/lib/useRLSQuery";
import useComercialDerivedData from "@/components/comercial/hooks/useComercialDerivedData";
import useCountEntitiesOptimized from "@/components/lib/useCountEntitiesOptimized";
import {
  COMERCIAL_COMPANY_LIMIT,
  COMERCIAL_EXTERNAL_LIMIT,
  COMERCIAL_LIST_LIMIT,
  COMERCIAL_SHORT_LIMIT,
} from "@/components/comercial/config/comercialQueryConfig";

export default function useComercialPageData({ canSeeComercial }) {
  const { empresaAtual, grupoAtual, estaNoGrupo } = useContextoVisual();
  const queryClient = useQueryClient();

  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  // P2: contexto válido inclui grupo explícito (não só empresa)
  const contextoValido = !!(empresaAtual?.id || groupId);
  const bloqueadoSemEmpresa = !contextoValido;

  const { data: clientes = [] } = useRLSQuery(
    'Cliente', {}, '-created_date', COMERCIAL_LIST_LIMIT,
    { staleTime: 30000, enabled: contextoValido && canSeeComercial }
  );

  const { data: pedidos = [], refetch: refetchPedidos } = useRLSQuery(
    'Pedido', {}, '-created_date', COMERCIAL_LIST_LIMIT,
    { staleTime: 30000, enabled: contextoValido && canSeeComercial }
  );

  useEffect(() => {
    if (!(empresaAtual?.id || estaNoGrupo)) return;
    if (!base44.entities?.Pedido?.subscribe) return;
    const un = base44.entities.Pedido.subscribe(() => {
      try { queryClient.invalidateQueries({ queryKey: ['Pedido'] }); } catch (_) {}
    });
    return () => { try { un?.(); } catch (_) {} };
  }, [empresaAtual?.id, grupoAtual?.id, estaNoGrupo, queryClient]);

  // Realtime adicional: Comissões e NF-e
  useEffect(() => {
    if (!(empresaAtual?.id || estaNoGrupo)) return;
    const unsubs = [];
    if (base44.entities?.Comissao?.subscribe) {
      unsubs.push(base44.entities.Comissao.subscribe(() => {
        try { queryClient.invalidateQueries({ queryKey: ['comissoes'] }); } catch (_) {}
      }));
    }
    if (base44.entities?.NotaFiscal?.subscribe) {
      unsubs.push(base44.entities.NotaFiscal.subscribe(() => {
        try { queryClient.invalidateQueries({ queryKey: ['notasFiscais'] }); } catch (_) {}
      }));
    }
    return () => { unsubs.forEach(u => { try { u && u(); } catch (_) {} }); };
  }, [empresaAtual?.id, grupoAtual?.id, estaNoGrupo]);

  const { data: comissoes = [] } = useRLSQuery(
    'Comissao', {}, '-created_date', COMERCIAL_SHORT_LIMIT,
    { staleTime: 30000, enabled: contextoValido && canSeeComercial }
  );

  const { data: notasFiscais = [] } = useRLSQuery(
    'NotaFiscal', {}, '-created_date', COMERCIAL_SHORT_LIMIT,
    { staleTime: 30000, enabled: contextoValido && canSeeComercial }
  );

  const { data: tabelasPreco = [] } = useRLSQuery(
    'TabelaPreco', {}, '-updated_date', COMERCIAL_SHORT_LIMIT,
    { staleTime: 30000, enabled: contextoValido && canSeeComercial }
  );

  const { data: empresas = [] } = useRLSQuery(
    'Empresa', {}, '-created_date', COMERCIAL_COMPANY_LIMIT,
    { staleTime: 30000, enabled: Boolean(canSeeComercial && contextoValido) }
  );

  const { data: pedidosExternos = [] } = useRLSQuery(
    'PedidoExterno', {}, '-created_date', COMERCIAL_EXTERNAL_LIMIT,
    { staleTime: 30000, enabled: contextoValido && canSeeComercial }
  );

  const derived = useComercialDerivedData({ pedidos, clientes, pedidosExternos });

  // Vol 3.3: Contagens server-side precisas (não limitadas pelo batch carregado)
  const { counts: serverCounts } = useCountEntitiesOptimized(['Pedido', 'Cliente']);
  const totalPedidosServer = serverCounts?.Pedido ?? pedidos.length;
  const totalClientesServer = serverCounts?.Cliente ?? clientes.length;

  return {
    empresaAtual,
    grupoAtual,
    groupId,
    contextoValido,
    bloqueadoSemEmpresa,
    clientes,
    pedidos,
    refetchPedidos,
    comissoes,
    notasFiscais,
    tabelasPreco,
    empresas,
    pedidosExternos,
    derived,
    totalPedidosServer,
    totalClientesServer,
  };
}