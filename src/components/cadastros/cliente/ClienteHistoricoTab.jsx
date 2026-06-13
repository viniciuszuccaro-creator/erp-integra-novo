import React, { Suspense } from "react";
import { Clock } from "lucide-react";

const HistoricoOrigemCliente = React.lazy(() => import("@/components/comercial/HistoricoOrigemCliente"));
const TimelineCliente = React.lazy(() => import("@/components/cliente/TimelineCliente").then(m => ({ default: m.default || m.TimelineCliente })));
const ResumoHistorico = React.lazy(() => import("@/components/cliente/TimelineCliente").then(m => ({ default: m.ResumoHistorico })));

export default function ClienteHistoricoTab({ cliente }) {
  if (!cliente?.id) {
    return (
      <div className="text-center py-12 text-slate-500">
        <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
        <p>Salve o cliente primeiro para ver o histórico</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}>
        <ResumoHistorico clienteId={cliente.id} />
      </Suspense>
      <Suspense fallback={<div className="h-16 animate-pulse bg-slate-100 rounded" />}>
        <HistoricoOrigemCliente clienteId={cliente.id} compact={false} />
      </Suspense>
      <Suspense fallback={<div className="h-24 rounded-xl bg-white/40 backdrop-blur animate-pulse" />}>
        <TimelineCliente clienteId={cliente.id} showFilters={true} />
      </Suspense>
    </div>
  );
}