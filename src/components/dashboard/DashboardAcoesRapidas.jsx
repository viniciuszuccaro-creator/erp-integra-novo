/**
 * DashboardAcoesRapidas — Atalhos contextuais de ações rápidas no Dashboard.
 * Mostra as ações mais relevantes baseadas no contexto (alertas de estoque, pendências, etc.)
 */
import React from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingCart, Package, DollarSign, Truck, Users, AlertTriangle, CheckCircle, PlusCircle, FileText, TrendingUp, BarChart2, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

function AcaoCard({ icon: Icon, label, desc, badge, badgeColor = "bg-blue-100 text-blue-700", color = "text-blue-600", bg = "bg-blue-50", onClick, alert = false }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-xl border text-left w-full transition-all hover:shadow-md hover:scale-[1.01] group ${alert ? "border-red-200 bg-red-50/50" : "border-slate-100 bg-white"}`}
    >
      <div className={`p-2 rounded-lg ${bg} flex-shrink-0`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-slate-800 truncate">{label}</div>
        <div className="text-xs text-slate-500 truncate">{desc}</div>
      </div>
      {badge != null && (
        <Badge className={`text-xs shrink-0 ${badgeColor}`}>{badge}</Badge>
      )}
    </button>
  );
}

export default function DashboardAcoesRapidas({
  pedidosAguardandoAprovacao = [],
  produtosBaixoEstoque = 0,
  entregasPendentes = 0,
  receitasPendentes = 0,
  despesasPendentes = 0,
  canSeeComercial = true,
  canSeeEstoque = true,
  canSeeFinanceiro = true,
  canSeeExpedicao = true,
  canSeeCRM = true,
  onDrillDown,
}) {
  const navigate = useNavigate();
  const go = (path) => { if (onDrillDown) onDrillDown(path); else navigate(path); };
  const fmtR = (v) => `R$\u00a0${Number(v||0).toLocaleString('pt-BR',{minimumFractionDigits:0,maximumFractionDigits:0})}`;

  const acoes = [
    canSeeComercial && {
      icon: pedidosAguardandoAprovacao.length > 0 ? AlertTriangle : ShoppingCart,
      label: pedidosAguardandoAprovacao.length > 0 ? "Aprovações Pendentes" : "Pedidos",
      desc: pedidosAguardandoAprovacao.length > 0 ? "Pedidos aguardando aprovação" : "Ver todos os pedidos",
      badge: pedidosAguardandoAprovacao.length > 0 ? pedidosAguardandoAprovacao.length : null,
      badgeColor: "bg-amber-100 text-amber-700",
      color: pedidosAguardandoAprovacao.length > 0 ? "text-amber-600" : "text-purple-600",
      bg: pedidosAguardandoAprovacao.length > 0 ? "bg-amber-50" : "bg-purple-50",
      alert: pedidosAguardandoAprovacao.length > 0,
      onClick: () => go("/comercial"),
    },
    canSeeEstoque && produtosBaixoEstoque > 0 && {
      icon: Package,
      label: "Estoque Crítico",
      desc: "Produtos abaixo do estoque mínimo",
      badge: produtosBaixoEstoque,
      badgeColor: "bg-red-100 text-red-700",
      color: "text-red-600",
      bg: "bg-red-50",
      alert: true,
      onClick: () => go("/estoque"),
    },
    canSeeExpedicao && entregasPendentes > 0 && {
      icon: Truck,
      label: "Entregas Pendentes",
      desc: "Aguardando expedição ou entrega",
      badge: entregasPendentes,
      badgeColor: "bg-orange-100 text-orange-700",
      color: "text-orange-600",
      bg: "bg-orange-50",
      alert: entregasPendentes > 5,
      onClick: () => go("/expedicao"),
    },
    canSeeFinanceiro && receitasPendentes > 0 && {
      icon: TrendingUp,
      label: "A Receber",
      desc: `${fmtR(receitasPendentes)} em aberto`,
      color: "text-green-600",
      bg: "bg-green-50",
      onClick: () => go("/financeiro"),
    },
    canSeeFinanceiro && despesasPendentes > 0 && {
      icon: DollarSign,
      label: "A Pagar",
      desc: `${fmtR(despesasPendentes)} em aberto`,
      color: "text-blue-600",
      bg: "bg-blue-50",
      onClick: () => go("/financeiro"),
    },
    canSeeComercial && {
      icon: PlusCircle,
      label: "Novo Pedido",
      desc: "Criar pedido de venda",
      color: "text-violet-600",
      bg: "bg-violet-50",
      onClick: () => go("/comercial"),
    },
    canSeeEstoque && {
      icon: FileText,
      label: "Movimentar Estoque",
      desc: "Entrada ou saída de produtos",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      onClick: () => go("/estoque"),
    },
    canSeeCRM && {
      icon: UserPlus,
      label: "Novo Cliente",
      desc: "Cadastrar cliente no CRM",
      color: "text-cyan-600",
      bg: "bg-cyan-50",
      onClick: () => go("/crm"),
    },
    {
      icon: BarChart2,
      label: "Relatórios",
      desc: "Análises e indicadores",
      color: "text-slate-600",
      bg: "bg-slate-50",
      onClick: () => go("/relatorios"),
    },
  ].filter(Boolean);

  if (acoes.length === 0) return null;

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2 pt-4 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-slate-500" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
          {acoes.map((a, i) => <AcaoCard key={i} {...a} />)}
        </div>
      </CardContent>
    </Card>
  );
}