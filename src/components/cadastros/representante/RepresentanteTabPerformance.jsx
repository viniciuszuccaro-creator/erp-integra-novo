import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, TrendingUp, DollarSign } from "lucide-react";

/**
 * Sub-componente extraído de RepresentanteFormCompleto.jsx
 * Aba Performance: KPIs de vendas e comissões.
 */
export default function RepresentanteTabPerformance({ clientesIndicados, totais, formData, representante }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Target className="w-4 h-4 text-blue-600" />Clientes Indicados</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold text-blue-600">{clientesIndicados.length}</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-600" />Total em Vendas</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-green-600">R$ {totais.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p><p className="text-xs text-slate-500 mt-1">{totais.quantidadePedidos} pedidos</p></CardContent></Card>
        <Card><CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-purple-600" />Comissão Gerada</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold text-purple-600">R$ {totais.totalComissao.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></CardContent></Card>
      </div>
      {representante?.id && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader><CardTitle className="text-sm">Performance Detalhada</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><p className="text-slate-600">Total Vendas Indicadas:</p><p className="font-bold">R$ {(formData.total_vendas_indicadas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
              <div><p className="text-slate-600">Total Comissão Gerada:</p><p className="font-bold text-purple-600">R$ {(formData.total_comissao_gerada || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
              <div><p className="text-slate-600">Comissão Paga:</p><p className="font-bold text-green-600">R$ {(formData.total_comissao_paga || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
              <div><p className="text-slate-600">Comissão Pendente:</p><p className="font-bold text-orange-600">R$ {(formData.total_comissao_pendente || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}