import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, ShoppingBag, Truck, DollarSign, MessageSquare } from "lucide-react";
import { useTimelineCliente, useRegistrarEvento } from "./timeline-cliente/useTimelineCliente";
import TimelineFilters from "./timeline-cliente/TimelineFilters";
import TimelineEventCard from "./timeline-cliente/TimelineEventCard";

/**
 * Timeline de eventos do cliente — Refatorado em hook + 2 sub-componentes (Regra-Mãe)
 */
export default function TimelineCliente({ clienteId, limitarModulo = null, limitarReferencia = null, showFilters = true }) {
  const {
    filtroModulo, setFiltroModulo, filtroTipo, setFiltroTipo,
    busca, setBusca, limite, setLimite, eventosFiltrados, isLoading
  } = useTimelineCliente({ clienteId, limitarModulo, limitarReferencia });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4 w-full h-full overflow-y-auto">
      {showFilters && (
        <TimelineFilters
          busca={busca} setBusca={setBusca}
          filtroModulo={filtroModulo} setFiltroModulo={setFiltroModulo}
          filtroTipo={filtroTipo} setFiltroTipo={setFiltroTipo}
        />
      )}

      <div className="space-y-3">
        {eventosFiltrados.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nenhum evento encontrado</p>
          </div>
        )}

        {eventosFiltrados.map((evento, index) => (
          <TimelineEventCard key={evento.id || index} evento={evento} isLast={index === eventosFiltrados.length - 1} />
        ))}
      </div>

      {eventosFiltrados.length >= limite && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={() => setLimite(limite + 20)}>
            Carregar mais eventos
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * Componente para resumo rápido do histórico
 */
export function ResumoHistorico({ clienteId }) {
  const { data: eventos = [] } = useQuery({
    queryKey: ['historico-resumo', clienteId],
    queryFn: () => base44.entities.HistoricoCliente.filter({ cliente_id: clienteId }, '-data_evento', 50),
    enabled: !!clienteId
  });

  const totalPedidos = eventos.filter(e => e.modulo_origem === "Comercial" && e.tipo_evento === "Criacao").length;
  const totalEntregas = eventos.filter(e => e.modulo_origem === "Expedicao" && e.tipo_evento === "Entrega").length;
  const totalPagamentos = eventos.filter(e => e.modulo_origem === "Financeiro" && e.tipo_evento === "Pagamento").length;
  const totalComunicacoes = eventos.filter(e => e.whatsapp_envio || e.email_envio).length;

  const ultimoEvento = eventos[0];
  const diasDesdeUltimo = ultimoEvento
    ? Math.floor((new Date() - new Date(ultimoEvento.data_evento)) / (1000 * 60 * 60 * 24))
    : null;

  const stats = [
    { label: "Pedidos", value: totalPedidos, color: "text-blue-600", Icon: ShoppingBag },
    { label: "Entregas", value: totalEntregas, color: "text-green-600", Icon: Truck },
    { label: "Pagamentos", value: totalPagamentos, color: "text-purple-600", Icon: DollarSign },
    { label: "Comunicações", value: totalComunicacoes, color: "text-cyan-600", Icon: MessageSquare }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((s) => (
        <Card key={s.label} className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </div>
              <s.Icon className="w-8 h-8 opacity-40" />
            </div>
          </CardContent>
        </Card>
      ))}

      {diasDesdeUltimo !== null && (
        <Card className="col-span-2 md:col-span-4 border-0 bg-slate-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-slate-500" />
              <div>
                <p className="text-sm font-medium text-slate-700">
                  Última interação há <strong>{diasDesdeUltimo}</strong> dia(s)
                </p>
                <p className="text-xs text-slate-500">{ultimoEvento.titulo_evento}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}