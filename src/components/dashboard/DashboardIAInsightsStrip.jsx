/**
 * DashboardIAInsightsStrip — Faixa compacta de insights gerados por IA
 * Exibe previsões de ruptura, anomalias e recomendações de forma elegante
 */
import React from "react";
import { Brain, TrendingDown, AlertCircle, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function InsightCard({ icon: Icon, title, value, severity = "info" }) {
  const colors = {
    critical: "border-red-200 bg-red-50 text-red-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    ok: "border-green-200 bg-green-50 text-green-700",
  };
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs ${colors[severity]}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="opacity-70 text-[10px] leading-none truncate">{title}</p>
        <p className="font-semibold leading-tight">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardIAInsightsStrip({ anomaliasIA = {}, previsoesIA = {}, loading = false }) {
  const anomList = anomaliasIA?.details || [];
  const altas = anomList.filter(a => a.severity === 'alto').length;
  const medias = anomList.filter(a => a.severity === 'medio').length;
  const preds = (previsoesIA?.previsoes || []).filter(p => p.risco_ruptura && p.risco_ruptura !== 'baixo').length;

  if (loading) {
    return (
      <div className="w-full flex items-center gap-2 p-3 rounded-xl border border-purple-100 bg-purple-50/50">
        <Brain className="w-4 h-4 text-purple-400 animate-pulse" />
        <span className="text-xs text-purple-400">IA analisando dados...</span>
      </div>
    );
  }

  return (
    <div className="w-full bg-gradient-to-r from-purple-50/60 to-blue-50/60 border border-purple-100 rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <Brain className="w-4 h-4 text-purple-600" />
        <span className="text-xs font-semibold text-purple-700">IA Insights</span>
        <Badge className="bg-purple-100 text-purple-700 text-[10px] px-1.5 py-0">
          <Sparkles className="w-2.5 h-2.5 mr-1 inline" />Tempo real
        </Badge>
        {loading && <span className="text-[10px] text-purple-400 animate-pulse ml-1">analisando...</span>}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {altas > 0 ? (
          <InsightCard icon={AlertCircle} title="Anomalias Críticas" value={`${altas} detectada${altas > 1 ? 's' : ''}`} severity="critical" />
        ) : (
          <InsightCard icon={Sparkles} title="Anomalias" value="Nenhuma crítica" severity="ok" />
        )}
        {medias > 0 && (
          <InsightCard icon={AlertCircle} title="Anomalias Médias" value={`${medias} detectada${medias > 1 ? 's' : ''}`} severity="warning" />
        )}
        {preds > 0 ? (
          <InsightCard icon={TrendingDown} title="Ruptura Estoque" value={`${preds} produto${preds > 1 ? 's' : ''} em risco`} severity="warning" />
        ) : (
          <InsightCard icon={Sparkles} title="Ruptura Estoque" value="Estoque estável" severity="ok" />
        )}
        <InsightCard icon={Sparkles} title="Status Geral IA" value={altas === 0 && preds === 0 ? "Operação normal" : "Requer atenção"} severity={altas === 0 && preds === 0 ? "ok" : "warning"} />
      </div>
    </div>
  );
}