import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Bolt, TrendingUp, ShoppingCart, Activity } from "lucide-react";

export default function CanaisKPIs({ canaisAtivos, totalGeralPedidos, totalGeralValor }) {
  const conversaoMedia =
    canaisAtivos.length > 0
      ? (canaisAtivos.reduce((sum, m) => sum + m.taxaConversao, 0) / canaisAtivos.length).toFixed(0)
      : 0;

  const kpis = [
    { label: "Canais Ativos", value: canaisAtivos.length, icon: Bolt, color: "text-blue-600", bg: "bg-blue-600" },
    { label: "Total Pedidos", value: totalGeralPedidos, icon: ShoppingCart, color: "text-green-600", bg: "bg-green-600" },
    { label: "Valor Total", value: `R$ ${(totalGeralValor / 1000).toFixed(0)}k`, icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-600" },
    { label: "Taxa Conversão Média", value: `${conversaoMedia}%`, icon: Activity, color: "text-orange-600", bg: "bg-orange-600" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-600">{kpi.label}</p>
                  <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${kpi.color} opacity-20`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}