/**
 * DashboardKPIStrip — Faixa horizontal de KPIs essenciais
 * Compacto, responsivo, clicável (drill-down)
 */
import React from "react";
import { DollarSign, TrendingUp, AlertCircle, Truck, Package, CheckCircle, ShoppingCart, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

function KPIChip({ label, value, icon: IconComp, color, bg, to, alert = false }) {
  const navigate = useNavigate();
  const Icon = IconComp;
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:shadow-md hover:scale-[1.02] cursor-pointer min-w-0 ${bg} ${alert ? "border-red-300 ring-1 ring-red-200" : "border-transparent"}`}
    >
      <div className={`p-1.5 rounded-md bg-white/70 flex-shrink-0`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="text-left min-w-0">
        <p className="text-[10px] text-slate-500 leading-none truncate">{label}</p>
        <p className={`text-sm font-bold leading-tight truncate ${color}`}>{value}</p>
      </div>
    </button>
  );
}

export default function DashboardKPIStrip({
  totalVendas = 0,
  fluxoCaixa = 0,
  entregasPendentes = 0,
  produtosBaixoEstoque = 0,
  otd = 0,
  taxaInadimplencia = 0,
  totalPedidos = 0,
  clientesAtivos = 0,
}) {
  const fmt = (v) => `R$\u00a0${v.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const chips = [
    {
      label: "Vendas",
      value: fmt(totalVendas),
      icon: DollarSign,
      color: "text-green-700",
      bg: "bg-green-50",
      to: createPageUrl("Comercial"),
    },
    {
      label: "Fluxo de Caixa",
      value: fmt(fluxoCaixa),
      icon: TrendingUp,
      color: fluxoCaixa >= 0 ? "text-emerald-700" : "text-orange-700",
      bg: fluxoCaixa >= 0 ? "bg-emerald-50" : "bg-orange-50",
      to: createPageUrl("Financeiro"),
    },
    {
      label: "Entregas Pend.",
      value: entregasPendentes,
      icon: Truck,
      color: "text-orange-700",
      bg: "bg-orange-50",
      to: createPageUrl("Expedicao"),
    },
    {
      label: "Estoque Baixo",
      value: produtosBaixoEstoque,
      icon: Package,
      color: produtosBaixoEstoque > 0 ? "text-red-700" : "text-green-700",
      bg: produtosBaixoEstoque > 0 ? "bg-red-50" : "bg-green-50",
      to: createPageUrl("Estoque"),
      alert: produtosBaixoEstoque > 0,
    },
    {
      label: "OTD",
      value: `${otd}%`,
      icon: CheckCircle,
      color: otd >= 90 ? "text-green-700" : otd >= 70 ? "text-orange-700" : "text-red-700",
      bg: otd >= 90 ? "bg-green-50" : otd >= 70 ? "bg-orange-50" : "bg-red-50",
      to: createPageUrl("Expedicao"),
    },
    {
      label: "Inadimplência",
      value: `${taxaInadimplencia}%`,
      icon: AlertCircle,
      color: taxaInadimplencia < 5 ? "text-green-700" : taxaInadimplencia < 10 ? "text-orange-700" : "text-red-700",
      bg: taxaInadimplencia < 5 ? "bg-green-50" : taxaInadimplencia < 10 ? "bg-orange-50" : "bg-red-50",
      to: createPageUrl("Financeiro"),
      alert: taxaInadimplencia >= 10,
    },
    {
      label: "Pedidos",
      value: totalPedidos,
      icon: ShoppingCart,
      color: "text-cyan-700",
      bg: "bg-cyan-50",
      to: createPageUrl("Comercial"),
    },
    {
      label: "Clientes Ativos",
      value: clientesAtivos,
      icon: Users,
      color: "text-violet-700",
      bg: "bg-violet-50",
      to: createPageUrl("Comercial"),
    },
  ];

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
      {chips.map((c) => (
        <KPIChip key={c.label} {...c} />
      ))}
    </div>
  );
}