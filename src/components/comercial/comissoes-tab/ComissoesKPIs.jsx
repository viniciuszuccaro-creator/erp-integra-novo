import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, CheckCircle2, DollarSign, TrendingUp } from "lucide-react";

/**
 * KPIs de Comissões (extraído de ComissoesTab)
 */
export default function ComissoesKPIs({ pendentes, aprovadas, totalPendente, totalPago }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Pendentes</CardTitle>
          <Calendar className="w-5 h-5 text-yellow-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-yellow-600">{pendentes}</div>
          <p className="text-xs text-slate-500 mt-1">aguardando aprovação</p>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Aprovadas</CardTitle>
          <CheckCircle2 className="w-5 h-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-600">{aprovadas}</div>
          <p className="text-xs text-slate-500 mt-1">prontas para pagamento</p>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">A Pagar</CardTitle>
          <DollarSign className="w-5 h-5 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-orange-600">R$ {totalPendente.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-slate-500 mt-1">valor pendente</p>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-md">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-slate-600">Total Pago</CardTitle>
          <TrendingUp className="w-5 h-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600">R$ {totalPago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          <p className="text-xs text-slate-500 mt-1">no período</p>
        </CardContent>
      </Card>
    </div>
  );
}