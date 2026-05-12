import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Sparkles, Calendar, AlertTriangle, TrendingUp, Loader2, Clock, Users } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AgendaIAPanel({ eventos = [] }) {
  const [analise, setAnalise] = useState(null);
  const [loading, setLoading] = useState(false);

  const hoje = new Date();
  const proximos7 = eventos.filter(e => {
    const d = new Date(e.data_inicio);
    const diff = (d - hoje) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  });
  const atrasados = eventos.filter(e => new Date(e.data_inicio) < hoje && e.status === 'Agendado');
  const urgentes = eventos.filter(e => e.prioridade === 'Urgente' && e.status !== 'Concluído');

  const handleAnalise = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise a agenda: ${proximos7.length} eventos nos próximos 7 dias, ${atrasados.length} eventos atrasados, ${urgentes.length} urgentes. Tipos: ${[...new Set(eventos.map(e => e.tipo).filter(Boolean))].join(', ')}. Dê 3 recomendações práticas em JSON com campos: recomendacoes (array de {titulo, descricao, prioridade}).`,
        response_json_schema: {
          type: "object",
          properties: {
            recomendacoes: { type: "array", items: { type: "object", properties: { titulo: { type: "string" }, descricao: { type: "string" }, prioridade: { type: "string" } } } }
          }
        }
      });
      setAnalise(res);
    } catch (e) {
      setAnalise({ recomendacoes: [{ titulo: "IA indisponível", descricao: "Tente novamente.", prioridade: "Baixa" }] });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Bot className="w-5 h-5 text-purple-600" />
          Agenda IA
          <Badge className="bg-purple-100 text-purple-700 text-xs ml-auto">
            {eventos.length} eventos
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-white/70 rounded-lg p-2">
            <Calendar className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{proximos7.length}</p>
            <p className="text-xs text-slate-500">7 dias</p>
          </div>
          <div className="bg-white/70 rounded-lg p-2">
            <AlertTriangle className="w-4 h-4 text-orange-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-orange-500">{atrasados.length}</p>
            <p className="text-xs text-slate-500">Atrasados</p>
          </div>
          <div className="bg-white/70 rounded-lg p-2">
            <Clock className="w-4 h-4 text-red-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-600">{urgentes.length}</p>
            <p className="text-xs text-slate-500">Urgentes</p>
          </div>
        </div>

        {analise?.recomendacoes?.length > 0 && (
          <div className="space-y-2">
            {analise.recomendacoes.map((r, i) => (
              <div key={i} className="bg-white/80 rounded-lg p-2 border border-purple-100">
                <p className="font-semibold text-xs text-purple-800">{r.titulo}</p>
                <p className="text-xs text-slate-600 mt-0.5">{r.descricao}</p>
              </div>
            ))}
          </div>
        )}

        <Button size="sm" variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50" onClick={handleAnalise} disabled={loading}>
          {loading ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Analisando...</> : <><Sparkles className="w-3 h-3 mr-1" />Análise IA</>}
        </Button>
      </CardContent>
    </Card>
  );
}