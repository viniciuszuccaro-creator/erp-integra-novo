import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import { Bot, Loader2, MessageCircle, TrendingUp, Users, Clock, Zap, AlertCircle } from 'lucide-react';

const INSIGHTS_INICIAIS = [
  { tipo: 'SLA', texto: 'Tempo médio de resposta: 4min 32s — abaixo da meta de 5min', cor: 'emerald' },
  { tipo: 'Volume', texto: '87% das conversas resolvidas no 1º atendimento esta semana', cor: 'blue' },
  { tipo: 'Pico', texto: 'Pico previsto entre 14h-16h — alocar atendentes adicionais', cor: 'amber' },
  { tipo: 'Satisfação', texto: 'NPS: 8.4/10 — crescimento de 0.6 ponto vs mês anterior', cor: 'violet' },
];

const corMap = {
  emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
  blue: 'bg-blue-50 border-blue-100 text-blue-700',
  amber: 'bg-amber-50 border-amber-100 text-amber-700',
  violet: 'bg-violet-50 border-violet-100 text-violet-700',
};

export default function HubAtendimentoIAPanel() {
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(INSIGHTS_INICIAIS);

  const analisarAtendimentos = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise o desempenho do hub de atendimento omnichannel com os seguintes dados:
          - Canal WhatsApp: 62% das conversas
          - Canal E-mail: 23% das conversas
          - Canal Chat: 15% das conversas
          - Tempo médio resolução: 4min 32s
          - Taxa de resolução 1º contato: 87%
          - Backlog atual: 12 conversas
          - NPS: 8.4/10
          Forneça 4 insights estratégicos de melhoria para o gestor.`,
        response_json_schema: {
          type: 'object',
          properties: {
            insights: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tipo: { type: 'string' },
                  texto: { type: 'string' },
                  cor: { type: 'string', enum: ['emerald', 'blue', 'amber', 'violet'] }
                }
              }
            }
          }
        }
      });
      if (res?.insights?.length) setInsights(res.insights);
    } catch (_) {}
    setLoading(false);
  };

  return (
    <Card className="w-full border-violet-100 bg-gradient-to-br from-violet-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">IA de Atendimento</CardTitle>
              <p className="text-xs text-slate-500">Análise de SLA, volume, NPS e otimização de canais</p>
            </div>
          </div>
          <Button size="sm" onClick={analisarAtendimentos} disabled={loading} className="bg-violet-600 hover:bg-violet-700 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            Analisar IA
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPIs rápidos */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Conversas Abertas', value: '12', IconComp: MessageCircle, color: 'text-blue-600' },
            { label: 'Resolvidas Hoje', value: '84', IconComp: TrendingUp, color: 'text-emerald-600' },
            { label: 'Tempo Médio', value: '4m32s', IconComp: Clock, color: 'text-amber-600' },
            { label: 'Atendentes Ativos', value: '5', IconComp: Users, color: 'text-violet-600' },
          ].map(({ label, value, IconComp: KpiIcon, color }) => (
            <div key={label} className="rounded-xl border border-white bg-white p-3 text-center shadow-sm">
              <KpiIcon className={`mx-auto mb-1 h-4 w-4 ${color}`} />
              <p className="text-xl font-bold text-slate-900">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Insights IA */}
        <div className="grid gap-2 md:grid-cols-2">
          {insights.map((insight, i) => (
            <div key={i} className={`rounded-xl border p-3 ${corMap[insight.cor] || corMap.blue}`}>
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <div>
                  <Badge className="mb-1 text-xs">{insight.tipo}</Badge>
                  <p className="text-sm">{insight.texto}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}