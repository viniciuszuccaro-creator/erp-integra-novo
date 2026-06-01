import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Target, BarChart3, Users, Zap } from "lucide-react";

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

export default function KPIsCRM({
  oportunidadesAbertas = 0,
  totalOportunidades = 0,
  valorPipeline = 0,
  valorPonderado = 0,
  taxaConversao = 0,
  totalClientes = 0,
  campanhasAtivas = 0,
}) {
  const fmtK = (v) => v >= 1000000
    ? `R$ ${(v / 1000000).toFixed(1)}M`
    : v >= 1000
    ? `R$ ${(v / 1000).toFixed(0)}k`
    : `R$ ${Number(v).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
      <KPICard
        title="Em Aberto"
        value={oportunidadesAbertas}
        sub={`de ${totalOportunidades} total`}
        icon={TrendingUp}
        color="text-blue-600"
        bgColor="bg-blue-50"
      />
      <KPICard
        title="Pipeline"
        value={fmtK(valorPipeline)}
        sub="total estimado"
        icon={DollarSign}
        color="text-green-600"
        bgColor="bg-green-50"
      />
      <KPICard
        title="Ponderado"
        value={fmtK(valorPonderado)}
        sub="por probabilidade"
        icon={Target}
        color="text-purple-600"
        bgColor="bg-purple-50"
      />
      <KPICard
        title="Conversão"
        value={`${taxaConversao}%`}
        sub="oport. ganhas"
        icon={BarChart3}
        color={taxaConversao >= 30 ? "text-green-600" : taxaConversao >= 15 ? "text-amber-600" : "text-red-600"}
        bgColor={taxaConversao >= 30 ? "bg-green-50" : taxaConversao >= 15 ? "bg-amber-50" : "bg-red-50"}
      />
      <KPICard
        title="Clientes"
        value={totalClientes}
        sub="na base ativa"
        icon={Users}
        color="text-cyan-600"
        bgColor="bg-cyan-50"
      />
      <KPICard
        title="Campanhas"
        value={campanhasAtivas}
        sub="ativas"
        icon={Zap}
        color={campanhasAtivas > 0 ? "text-orange-600" : "text-slate-400"}
        bgColor={campanhasAtivas > 0 ? "bg-orange-50" : "bg-slate-50"}
      />
    </div>
  );
}