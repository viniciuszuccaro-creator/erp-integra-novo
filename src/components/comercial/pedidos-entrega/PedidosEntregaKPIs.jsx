import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * KPIs extraídos de PedidosEntregaTab
 */
export default function PedidosEntregaKPIs({ pedidosParaEntrega, pedidosPorRegiao }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-600">Total para Entrega</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">{pedidosParaEntrega.length}</div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-600">Em Expedição</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">
            {pedidosParaEntrega.filter(p => p.status === 'Em Expedição').length}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-600">Em Trânsito</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-purple-600">
            {pedidosParaEntrega.filter(p => p.status === 'Em Trânsito').length}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-600">Regiões Atendidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{Object.keys(pedidosPorRegiao).length}</div>
        </CardContent>
      </Card>
    </div>
  );
}