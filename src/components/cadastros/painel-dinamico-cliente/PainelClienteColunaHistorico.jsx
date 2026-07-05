import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import TimelineCliente, { ResumoHistorico } from "@/components/cliente/TimelineCliente";

/**
 * Coluna 2 do PainelDinamicoCliente (Regra-Mãe P1).
 * Timeline de atividades do cliente.
 */
export default function PainelClienteColunaHistorico({ clienteId }) {
  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-sm h-full">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            Histórico de Atividades
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-y-auto max-h-[480px]">
          <ResumoHistorico clienteId={clienteId} />
          <div className="mt-4">
            <TimelineCliente clienteId={clienteId} showFilters={false} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}