import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { Bot, Loader2, Zap, CheckCircle2, TrendingUp, AlertTriangle } from 'lucide-react';
import { MODULE_IMPROVEMENT_STATUS } from '@/components/lib/moduleImprovementPlan';
import { melhoriaPlanPhases } from './melhoriaPlanData';

export default function PlanoMelhoriaIACockpit() {
  const [loading, setLoading] = useState(false);
  const [analise, setAnalise] = useState(null);

  const moduleEntries = Object.entries(MODULE_IMPROVEMENT_STATUS);
  const avgModule = Math.round(moduleEntries.reduce((s, [, v]) => s + v.progress, 0) / moduleEntries.length);
  const totalProgress = Math.round(melhoriaPlanPhases.reduce((s, p) => s + p.progress, 0) / melhoriaPlanPhases.length);
  const modulosBaixos = moduleEntries.filter(([, v]) => v.progress < 96);
  const modulosAltos = moduleEntries.filter(([, v]) => v.progress >= 97);

  const executarAnaliseIA = async () => {
    setLoading(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um consultor de TI especialista em sistemas ERP. Analise o estado atual do plano de melhoria:
          - Progresso geral: ${totalProgress}%
          - Média dos módulos: ${avgModule}%
          - Módulos com progresso < 96%: ${modulosBaixos.map(([n, v]) => `${n}(${v.progress}%)`).join(', ')}
          - Fases concluídas: ${melhoriaPlanPhases.filter(p => p.status === 'concluido').length}/${melhoriaPlanPhases.length}
          Forneça:
          1. Diagnóstico executivo em 1 parágrafo
          2. Top 3 pontos fortes do sistema
          3. Top 3 ações prioritárias para os próximos 30 dias
          4. Score geral de maturidade (0-100)`,
        response_json_schema: {
          type: 'object',
          properties: {
            diagnostico: { type: 'string' },
            pontos_fortes: { type: 'array', items: { type: 'string' } },
            acoes_prioritarias: { type: 'array', items: { type: 'string' } },
            score_maturidade: { type: 'number' }
          }
        }
      });
      setAnalise(res);
    } catch (_) {}
    setLoading(false);
  };

  return (
    <Card className="w-full border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-violet-50">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Cockpit IA do Plano de Melhoria</CardTitle>
              <p className="text-xs text-slate-500">Análise executiva inteligente do estado real do ERP</p>
            </div>
          </div>
          <Button onClick={executarAnaliseIA} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700 text-white">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
            {loading ? 'Analisando...' : 'Analisar com IA'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPIs resumo */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white bg-white p-3 text-center shadow-sm">
            <p className="text-3xl font-black text-indigo-700">{totalProgress}%</p>
            <p className="text-xs text-slate-500">Plano geral</p>
          </div>
          <div className="rounded-xl border border-white bg-white p-3 text-center shadow-sm">
            <p className="text-3xl font-black text-emerald-700">{modulosAltos.length}</p>
            <p className="text-xs text-slate-500">Módulos ≥97%</p>
          </div>
          <div className="rounded-xl border border-white bg-white p-3 text-center shadow-sm">
            <p className="text-3xl font-black text-amber-700">{modulosBaixos.length}</p>
            <p className="text-xs text-slate-500">Abaixo de 96%</p>
          </div>
          <div className="rounded-xl border border-white bg-white p-3 text-center shadow-sm">
            <p className="text-3xl font-black text-violet-700">{avgModule}%</p>
            <p className="text-xs text-slate-500">Média módulos</p>
          </div>
        </div>

        {/* Progresso por módulo — top 6 */}
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {moduleEntries.slice(0, 6).map(([name, { progress }]) => (
            <div key={name} className="rounded-lg border border-slate-100 bg-white p-3">
              <div className="mb-1 flex justify-between text-sm">
                <span className="font-medium text-slate-700">{name}</span>
                <Badge className={progress >= 97 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}>{progress}%</Badge>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          ))}
        </div>

        {/* Análise IA */}
        {analise && (
          <div className="rounded-2xl border border-indigo-100 bg-white p-5 space-y-4">
            {analise.score_maturidade && (
              <div className="flex items-center gap-3">
                <div className="text-4xl font-black text-indigo-700">{analise.score_maturidade}</div>
                <div>
                  <p className="font-semibold text-slate-900">Score de maturidade IA</p>
                  <Progress value={analise.score_maturidade} className="h-2 w-40 mt-1" />
                </div>
              </div>
            )}
            {analise.diagnostico && (
              <p className="text-sm text-slate-700 leading-relaxed border-l-2 border-indigo-300 pl-3">{analise.diagnostico}</p>
            )}
            <div className="grid gap-4 md:grid-cols-2">
              {analise.pontos_fortes?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase text-emerald-700 mb-2 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Pontos fortes
                  </p>
                  <ul className="space-y-1">
                    {analise.pontos_fortes.map((p, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <TrendingUp className="h-3 w-3 mt-1 shrink-0 text-emerald-500" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {analise.acoes_prioritarias?.length > 0 && (
                <div>
                  <p className="text-xs font-bold uppercase text-amber-700 mb-2 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Ações prioritárias
                  </p>
                  <ul className="space-y-1">
                    {analise.acoes_prioritarias.map((a, i) => (
                      <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                        <Zap className="h-3 w-3 mt-1 shrink-0 text-amber-500" />{a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {!analise && !loading && (
          <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/50 p-6 text-center">
            <Bot className="mx-auto mb-2 h-8 w-8 text-indigo-400" />
            <p className="text-sm text-slate-600">Clique em <strong>Analisar com IA</strong> para obter diagnóstico executivo personalizado do estado real do plano.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}