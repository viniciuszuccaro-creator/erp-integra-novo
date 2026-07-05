import React from "react";
import { Label } from "@/components/ui/label";
import { TrendingUp } from "lucide-react";

export default function RegiaoTabMetricas({ formData }) {
  return (
    <div className="space-y-4 mt-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800"><TrendingUp className="w-4 h-4 inline mr-2" />As métricas são calculadas automaticamente pela IA com base nas vendas e entregas realizadas nesta região.</p>
      </div>
      {formData.metricas && (
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-3"><Label className="text-xs text-slate-500">Total de Clientes</Label><p className="text-2xl font-bold">{formData.metricas.total_clientes || 0}</p></div>
          <div className="border rounded-lg p-3"><Label className="text-xs text-slate-500">Pedidos/Mês</Label><p className="text-2xl font-bold">{formData.metricas.total_pedidos_mes || 0}</p></div>
          <div className="border rounded-lg p-3"><Label className="text-xs text-slate-500">Vendido/Mês</Label><p className="text-2xl font-bold">R$ {(formData.metricas.valor_vendido_mes || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
          <div className="border rounded-lg p-3"><Label className="text-xs text-slate-500">Ticket Médio</Label><p className="text-2xl font-bold">R$ {(formData.metricas.ticket_medio || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</p></div>
          <div className="border rounded-lg p-3"><Label className="text-xs text-slate-500">Tempo Médio Entrega</Label><p className="text-2xl font-bold">{formData.metricas.tempo_medio_entrega_dias || 0} dias</p></div>
          <div className="border rounded-lg p-3"><Label className="text-xs text-slate-500">Taxa Sucesso Entregas</Label><p className="text-2xl font-bold">{formData.metricas.taxa_sucesso_entregas_percentual || 0}%</p></div>
        </div>
      )}
    </div>
  );
}