/**
 * DashboardEssentialKPIs — 5 KPIs essenciais, limpos, no topo do Dashboard.
 * Substitui blocos duplicados. Clicável para drill-down.
 */
import React from "react";
import { DollarSign, TrendingUp, Truck, Package, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { useNavigate } from "react-router-dom";

function KPICard({ icon: Icon, label, value, sub, color, bgColor, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border bg-white w-full text-left hover:shadow-md transition-all group`}
    >
      <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}>
        <Icon className={`w-5 h-5 ${color}`} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500 truncate">{label}</div>
        <div className="text-lg font-bold text-slate-900 leading-tight truncate">{value}</div>
        {sub && <div className="text-xs text-slate-400 truncate">{sub}</div>}
      </div>
    </button>
  );
}

export default function DashboardEssentialKPIs({
  totalVendas = 0,
  taxaInadimplencia = 0,
  valorVencido = 0,
  entregasPendentes = 0,
  produtosBaixoEstoque = 0,
  otd = 0,
}) {
  const navigate = useNavigate();
  const fmt = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const kpis = [
    {
      icon: DollarSign,
      label: "Vendas do Período",
      value: fmt(totalVendas),
      sub: "receita total",
      color: "text-green-600",
      bgColor: "bg-green-50",
      url: createPageUrl("Comercial"),
    },
    {
      icon: TrendingUp,
      label: "OTD — Entregas no Prazo",
      value: `${otd}%`,
      sub: `${entregasPendentes} pendentes`,
      color: otd >= 90 ? "text-green-600" : otd >= 70 ? "text-amber-600" : "text-red-600",
      bgColor: otd >= 90 ? "bg-green-50" : otd >= 70 ? "bg-amber-50" : "bg-red-50",
      url: createPageUrl("Expedicao"),
    },
    {
      icon: AlertCircle,
      label: "Inadimplência",
      value: `${taxaInadimplencia}%`,
      sub: fmt(valorVencido) + " vencido",
      color: taxaInadimplencia < 5 ? "text-green-600" : taxaInadimplencia < 10 ? "text-amber-600" : "text-red-600",
      bgColor: taxaInadimplencia < 5 ? "bg-green-50" : taxaInadimplencia < 10 ? "bg-amber-50" : "bg-red-50",
      url: createPageUrl("Financeiro"),
    },
    {
      icon: Package,
      label: "Estoque em Alerta",
      value: produtosBaixoEstoque,
      sub: "produtos abaixo do mínimo",
      color: produtosBaixoEstoque > 0 ? "text-red-600" : "text-green-600",
      bgColor: produtosBaixoEstoque > 0 ? "bg-red-50" : "bg-green-50",
      url: createPageUrl("Estoque"),
    },
    {
      icon: Truck,
      label: "Entregas Pendentes",
      value: entregasPendentes,
      sub: "aguardando envio",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      url: createPageUrl("Expedicao"),
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
      {kpis.map((k, i) => (
        <KPICard key={i} {...k} onClick={() => navigate(k.url)} />
      ))}
    </div>
  );
}