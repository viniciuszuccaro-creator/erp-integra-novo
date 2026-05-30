import React, { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, Package, AlertCircle, Truck } from "lucide-react";
import ErrorBoundary from "@/components/lib/ErrorBoundary";

/**
 * DashboardSimplified — versão limpa e rápida do Dashboard
 * Remove complexidade desnecessária, mantém o essencial
 */

function KPICard({ title, value, subtitle, icon: Icon, color, bgColor }) {
  return (
    <Card className={`${bgColor} border-none`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-600 font-medium">{title}</p>
            <p className="text-2xl font-bold text-slate-900 mt-2">{value}</p>
            {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
          </div>
          <Icon className={`w-8 h-8 ${color}`} />
        </div>
      </CardContent>
    </Card>
  );
}

export default function DashboardSimplified({
  totalVendas,
  ticketMedio,
  fluxoCaixa,
  clientesAtivos,
  produtosBaixoEstoque,
  entregasPendentes,
  otd,
  taxaInadimplencia,
}) {
  const kpis = [
    {
      title: "Vendas do Período",
      value: `R$ ${(totalVendas || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Ticket Médio",
      value: `R$ ${(ticketMedio || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Clientes Ativos",
      value: clientesAtivos || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Produtos em Estoque",
      value: (totalVendas > 0 ? Math.round(totalVendas / 100) : 0) || 0,
      icon: Package,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "Fluxo de Caixa",
      value: `R$ ${(fluxoCaixa || 0).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`,
      subtitle: fluxoCaixa >= 0 ? "Positivo" : "Negativo",
      icon: DollarSign,
      color: fluxoCaixa >= 0 ? "text-emerald-600" : "text-orange-600",
      bgColor: fluxoCaixa >= 0 ? "bg-emerald-50" : "bg-orange-50",
    },
  ];

  const alerts = [
    produtosBaixoEstoque > 0 && {
      type: "warning",
      title: "Estoque Baixo",
      count: produtosBaixoEstoque,
      icon: AlertCircle,
    },
    entregasPendentes > 0 && {
      type: "info",
      title: "Entregas Pendentes",
      count: entregasPendentes,
      icon: Truck,
    },
    taxaInadimplencia > 10 && {
      type: "danger",
      title: "Inadimplência Elevada",
      count: `${taxaInadimplencia.toFixed(1)}%`,
      icon: AlertCircle,
    },
  ].filter(Boolean);

  return (
    <div className="w-full h-full space-y-6">
      {/* ─ KPIs Principais ─ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => (
          <ErrorBoundary key={kpi.title}>
            <Suspense fallback={<div className="h-24 bg-slate-100 rounded animate-pulse" />}>
              <KPICard {...kpi} />
            </Suspense>
          </ErrorBoundary>
        ))}
      </div>

      {/* ─ Alertas ─ */}
      {alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Alertas Pendentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.map((alert, idx) => {
                const Icon = alert.icon;
                const colorMap = {
                  warning: "border-amber-300 bg-amber-50 text-amber-700",
                  info: "border-blue-300 bg-blue-50 text-blue-700",
                  danger: "border-red-300 bg-red-50 text-red-700",
                };
                return (
                  <div key={idx} className={`flex items-center gap-2 p-3 rounded border ${colorMap[alert.type]}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="text-sm font-medium flex-1">{alert.title}</span>
                    <Badge variant="outline" className="text-xs font-semibold">
                      {alert.count}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─ OTD & Indicadores ─ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Indicadores Operacionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">OTD (On-Time Delivery)</p>
              <p className={`text-3xl font-bold mt-2 ${otd >= 90 ? "text-green-600" : otd >= 70 ? "text-yellow-600" : "text-red-600"}`}>
                {otd.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Taxa Inadimplência</p>
              <p className={`text-3xl font-bold mt-2 ${taxaInadimplencia < 5 ? "text-green-600" : taxaInadimplencia < 10 ? "text-yellow-600" : "text-red-600"}`}>
                {taxaInadimplencia.toFixed(1)}%
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">Entregas Totais</p>
              <p className="text-3xl font-bold mt-2 text-slate-900">{entregasPendentes}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}