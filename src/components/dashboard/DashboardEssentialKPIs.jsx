import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertTriangle, Package, DollarSign, Truck, Users } from "lucide-react";

export default function DashboardEssentialKPIs({
  totalVendas,
  inadimplencia,
  produtosBaixoEstoque,
  fluxoCaixaHoje,
  entregasAtraso,
  clientesAtivos,
  periodo = "mês",
}) {
  const kpis = [
    {
      label: "Vendas do Mês",
      value: `R$ ${(totalVendas || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: "bg-green-50 text-green-700",
      trend: "+12% vs mês anterior",
    },
    {
      label: "Inadimplência",
      value: `R$ ${(inadimplencia || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
      icon: AlertTriangle,
      color: "bg-red-50 text-red-700",
      trend: `${inadimplencia > 0 ? "⚠️ CRÍTICO" : "✅ OK"}`,
      critical: inadimplencia > 0,
    },
    {
      label: "Estoque Crítico",
      value: produtosBaixoEstoque,
      icon: Package,
      color: "bg-orange-50 text-orange-700",
      trend: `${produtosBaixoEstoque} produtos abaixo do mínimo`,
      critical: produtosBaixoEstoque > 0,
    },
    {
      label: "Caixa Hoje",
      value: `R$ ${(fluxoCaixaHoje || 0).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: "bg-blue-50 text-blue-700",
      trend: "Saldo em caixa",
    },
    {
      label: "Entregas em Atraso",
      value: entregasAtraso,
      icon: Truck,
      color: "bg-yellow-50 text-yellow-700",
      trend: `${entregasAtraso} entregas atrasadas`,
      critical: entregasAtraso > 0,
    },
    {
      label: "Clientes Ativos",
      value: clientesAtivos,
      icon: Users,
      color: "bg-purple-50 text-purple-700",
      trend: "Neste período",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <Card key={idx} className={`border-l-4 ${kpi.critical ? "border-l-red-500" : "border-l-blue-500"}`}>
            <CardContent className="p-4">
              <div className={`rounded-lg p-3 mb-3 ${kpi.color} w-fit`}>
                <Icon className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-600 font-medium uppercase mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-900 mb-2">{kpi.value}</p>
              <p className="text-xs text-slate-500">{kpi.trend}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}