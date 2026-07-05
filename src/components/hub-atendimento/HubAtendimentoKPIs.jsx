/**
 * HubAtendimentoKPIs — cartões de métricas + barra SLA 24h.
 */
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, MessageCircle, Clock, AlertCircle, CheckCircle, Bot } from "lucide-react";

export default function HubAtendimentoKPIs({ metricas, botSla }) {
  if (!metricas) return null;

  const kpis = [
    { label: "Total", value: metricas.total, icon: Activity, color: "text-slate-600" },
    { label: "Em Progresso", value: metricas.emProgresso, icon: MessageCircle, color: "text-blue-600" },
    { label: "Aguardando", value: metricas.aguardando, icon: Clock, color: "text-orange-600" },
    { label: "Não Atribuídas", value: metricas.naoAtribuidas, icon: AlertCircle, color: "text-red-600" },
    { label: "Resolvidas Hoje", value: metricas.resolvidasHoje, icon: CheckCircle, color: "text-green-600" },
    { label: "Resolução Bot", value: `${metricas.taxaResolucaoBot}%`, icon: Bot, color: "text-indigo-600" },
  ];

  const slaPct = botSla.sla_total ? Math.round(100 * (botSla.sla_ok / (botSla.sla_total || 1))) : 0;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <div className={`flex items-center gap-2 ${kpi.color} text-sm mb-1`}>
                <kpi.icon className="w-4 h-4" />
                {kpi.label}
              </div>
              <p className={`text-2xl font-bold ${kpi.color}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-4">
        <CardContent className="p-3 lg:p-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="text-sm text-slate-600">Conversas 24h:</div>
            <Badge variant="outline" className="text-xs">{botSla.chats}</Badge>
            <div className="text-sm text-slate-600 ml-4">SLA 1ª resp ≤ 60s:</div>
            <Badge className={slaPct >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
              {slaPct}%
            </Badge>
          </div>
        </CardContent>
      </Card>
    </>
  );
}