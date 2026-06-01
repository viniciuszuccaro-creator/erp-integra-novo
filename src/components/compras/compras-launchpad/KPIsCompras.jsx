import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, DollarSign, Clock, AlertCircle, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, sub, icon: Icon, color, bgColor }) => (
  <Card className="border-0 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
      <CardTitle className="text-xs font-medium text-slate-600">{title}</CardTitle>
      <div className={`p-1.5 rounded-md ${bgColor}`}>
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
    </CardHeader>
    <CardContent className="px-3 pb-2">
      <div className={`text-xl font-bold ${color}`}>{value}</div>
      {sub && <p className="text-xs text-slate-500 mt-0.5">{sub}</p>}
    </CardContent>
  </Card>
);

export default function KPIsCompras({
  totalFornecedores = 0,
  fornecedoresAtivos = 0,
  totalOrdens = 0,
  totalCompras = 0,
  ocsPendentes = 0,
  valorEmAberto = 0,
  solicitacoesPendentes = 0,
}) {
  const fmtR = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
      <KPICard
        title="Fornecedores"
        value={totalFornecedores}
        sub={`${fornecedoresAtivos} ativos`}
        icon={Users}
        color="text-cyan-600"
        bgColor="bg-cyan-50"
      />
      <KPICard
        title="Ordens de Compra"
        value={totalOrdens}
        sub="no sistema"
        icon={ShoppingCart}
        color="text-blue-600"
        bgColor="bg-blue-50"
      />
      <KPICard
        title="OCs Pendentes"
        value={ocsPendentes}
        sub="aguardando"
        icon={Clock}
        color={ocsPendentes > 0 ? "text-amber-600" : "text-green-600"}
        bgColor={ocsPendentes > 0 ? "bg-amber-50" : "bg-green-50"}
      />
      <KPICard
        title="Valor em Aberto"
        value={fmtR(valorEmAberto)}
        sub="OCs aprovadas"
        icon={DollarSign}
        color="text-purple-600"
        bgColor="bg-purple-50"
      />
      <KPICard
        title="Total Comprado"
        value={fmtR(totalCompras)}
        sub="sem canceladas"
        icon={TrendingDown}
        color="text-indigo-600"
        bgColor="bg-indigo-50"
      />
      <KPICard
        title="Solicitações"
        value={solicitacoesPendentes}
        sub="pendentes"
        icon={AlertCircle}
        color={solicitacoesPendentes > 0 ? "text-orange-600" : "text-green-600"}
        bgColor={solicitacoesPendentes > 0 ? "bg-orange-50" : "bg-green-50"}
      />
    </div>
  );
}