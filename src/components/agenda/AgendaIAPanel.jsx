import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Calendar, Bell, Clock, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AgendaIAPanel({ eventos = [] }) {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const stats = useMemo(() => {
    const hoje = new Date();
    const em7dias = new Date(hoje.getTime() + 7 * 86400000);
    const proximos = eventos.filter(e => {
      const d = new Date(e.data_inicio);
      return d >= hoje && d <= em7dias;
    });
    const urgentes = eventos.filter(e => e.prioridade === 'Urgente' && e.status !== 'Concluído');
    const atrasados = eventos.filter(e => new Date(e.data_inicio) < hoje && e.status === 'Agendado');
    const hoje_count = eventos.filter(e => new Date(e.data_inicio).toDateString() === hoje.toDateString()).length;
    return { proximos: proximos.length, urgentes: urgentes.length, atrasados: atrasados.length, hoje: hoje_count, total: eventos.length };
  }, [eventos]);

  const analisar = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta agenda e forneça 3 recomendações de produtividade e gestão do tempo em português: ${JSON.stringify(stats)}`,
        response_json_schema: {
          type: "object",
          properties: {
            insights: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  titulo: { type: "string" },
                  descricao: { type: "string" },
                  tipo: { type: "string", enum: ["alerta", "dica", "oportunidade"] }
                }
              }
            }
          }
        }
      });
      setInsights(res?.insights || []);
    } catch {
      setInsights([{ titulo: "Indisponível", descricao: "Tente novamente.", tipo: "dica" }]);
    }
    setLoading(false);
  };

  const cor = { alerta: "bg-red-50 border-red-200 text-red-800", dica: "bg-blue-50 border-blue-200 text-blue-800", oportunidade: "bg-green-50 border-green-200 text-green-800" };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" /> IA Agenda
          </CardTitle>
          <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={analisar} disabled={loading}>
            {loading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
            {loading ? "Analisando..." : "Otimizar Agenda IA"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          <div className="text-center p-2 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm font-bold text-blue-700">{stats.hoje}</p>
            <p className="text-xs text-blue-600">Hoje</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-amber-50 border border-amber-200">
            <p className="text-sm font-bold text-amber-700">{stats.proximos}</p>
            <p className="text-xs text-amber-600">Próx. 7 dias</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-red-50 border border-red-200">
            <p className="text-sm font-bold text-red-700">{stats.urgentes}</p>
            <p className="text-xs text-red-600">Urgentes</p>
          </div>
          <div className="text-center p-2 rounded-lg bg-orange-50 border border-orange-200">
            <p className="text-sm font-bold text-orange-700">{stats.atrasados}</p>
            <p className="text-xs text-orange-600">Atrasados</p>
          </div>
        </div>
        {stats.atrasados > 0 && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-red-50 border border-red-200">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-xs text-red-800">{stats.atrasados} evento(s) não concluído(s) no prazo</p>
          </div>
        )}
        {insights && insights.map((i, idx) => (
          <div key={idx} className={`p-2 rounded-lg border ${cor[i.tipo] || cor.dica}`}>
            <p className="text-xs font-semibold mb-0.5">{i.titulo}</p>
            <p className="text-xs">{i.descricao}</p>
          </div>
        ))}
        {!insights && stats.atrasados === 0 && (
          <p className="text-xs text-slate-400 text-center py-2">Clique em "Otimizar Agenda IA" para sugestões inteligentes</p>
        )}
      </CardContent>
    </Card>
  );
}