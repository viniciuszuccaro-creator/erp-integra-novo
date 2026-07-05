import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * Hook extraído de TimelineCliente.jsx
 * Gerencia filtros e busca de eventos do histórico do cliente
 */
export function useTimelineCliente({ clienteId, limitarModulo, limitarReferencia, limite }) {
  const [filtroModulo, setFiltroModulo] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [busca, setBusca] = useState("");
  const [limiteState, setLimite] = useState(limite || 20);

  const { data: eventos = [], isLoading } = useQuery({
    queryKey: ['historico-cliente', clienteId, limiteState],
    queryFn: async () => {
      let query = { cliente_id: clienteId };
      if (limitarModulo) query.modulo_origem = limitarModulo;
      if (limitarReferencia) query.referencia_id = limitarReferencia;
      return await base44.entities.HistoricoCliente.filter(query, '-data_evento', limiteState);
    },
    enabled: !!clienteId
  });

  const eventosFiltrados = eventos.filter(evento => {
    const matchModulo = filtroModulo === "todos" || evento.modulo_origem === filtroModulo;
    const matchTipo = filtroTipo === "todos" || evento.tipo_evento === filtroTipo;
    const matchBusca = busca === "" ||
      evento.titulo_evento?.toLowerCase().includes(busca.toLowerCase()) ||
      evento.descricao_detalhada?.toLowerCase().includes(busca.toLowerCase()) ||
      evento.referencia_numero?.toLowerCase().includes(busca.toLowerCase());
    return matchModulo && matchTipo && matchBusca;
  });

  return {
    filtroModulo, setFiltroModulo, filtroTipo, setFiltroTipo,
    busca, setBusca, limite: limiteState, setLimite,
    eventosFiltrados, isLoading
  };
}

/**
 * Hook para registrar evento no histórico do cliente
 */
export function useRegistrarEvento() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  return async (evento) => {
    try {
      await base44.entities.HistoricoCliente.create({
        ...evento,
        group_id: evento.group_id || grupoAtual?.id || empresaAtual?.group_id || null,
        empresa_id: evento.empresa_id || empresaAtual?.id || null,
        data_evento: evento.data_evento || new Date().toISOString()
      });
    } catch (error) {
      console.error("Erro ao registrar evento no histórico:", error);
    }
  };
}