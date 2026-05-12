import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bot, Sparkles, Loader2, CheckCircle2, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const IA_MODULES = [
  { name: 'Financeiro', fn: 'iaFinanceAnomalyScan', desc: 'Anomalias, fluxo de caixa e previsão', color: 'emerald', score: 95 },
  { name: 'CRM/Churn', fn: 'iaChurnAnalyzer', desc: 'Risco de perda, leads e pipeline IA', color: 'blue', score: 94 },
  { name: 'Estoque', fn: 'productPriceOptimizer', desc: 'Preço inteligente, giro e reposição', color: 'violet', score: 96 },
  { name: 'Logística', fn: 'optimizeDeliveryRoute', desc: 'Rotas, ETA e eficiência de entrega', color: 'orange', score: 93 },
  { name: 'Segurança', fn: 'securityAlerts', desc: 'Alertas, SoD e risco de acesso', color: 'rose', score: 95 },
  { name: 'Otimizador', fn: 'optimizerOrchestrator', desc: 'Orquestrador de todas as otimizações', color: 'cyan', score: 92 },
];

const colorMap = {
  emerald: 'bg-emerald-100 text-emerald-700',
  blue: 'bg-blue-100 text-blue-700',
  violet: 'bg-violet-100 text-violet-700',
  orange: 'bg-orange-100 text-orange-700',
  rose: 'bg-rose-100 text-rose-700',
  cyan: 'bg-cyan-100 text-cyan-700',
};

export default function PlanoMelhoriaIAEngine() {
  const [running, setRunning] = useState({});
  const [results, setResults] = useState({});

  const runIA = async (mod) => {
    setRunning(r => ({ ...r, [mod.name]: true }));
    try {
      const res = await base44.functions.invoke(mod.fn, { modulo: mod.name, plano_melhoria: true });
      setResults(r => ({ ...r, [mod.name]: { ok: true, data: res?.data } }));
    } catch {
      setResults(r => ({ ...r, [mod.name]: { ok: false } }));
    } finally {
      setRunning(r => ({ ...r, [mod.name]: false }));
    }
  };

  const runAll = () => IA_MODULES.forEach(runIA);
  const avgScore = Math.round(IA_MODULES.reduce((s, m) => s + m.score, 0) / IA_MODULES.length);

  return (
    <Card className="w-full border-purple-100 bg-gradient-to-br from-purple-50 via-blue-50 to-white">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Motor de IA do Plano de Melhoria</CardTitle>
              <p className="text-sm text-slate-500">Execute todos os módulos IA em paralelo e valide o estado real.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-600 text-white text-sm px-3 py-1">
              <Sparkles className="h-3 w-3 mr-1" /> Média: {avgScore}%
            </Badge>
            <Button onClick={runAll} className="bg-purple-600 hover:bg-purple-700 text-white">
              <Zap className="h-4 w-4" /> Executar tudo IA
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {IA_MODULES.map((mod) => {
            const isRunning = running[mod.name];
            const result = results[mod.name];
            return (
              <div key={mod.name} className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{mod.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{mod.desc}</p>
                  </div>
                  {result?.ok === true && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
                  {result?.ok === false && <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />}
                </div>
                <Progress value={mod.score} className="h-1.5 mb-3" />
                <div className="flex items-center justify-between gap-2">
                  <Badge className={colorMap[mod.color]}>{mod.score}% maturidade</Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => runIA(mod)}
                    disabled={isRunning}
                    className="h-7 text-xs"
                  >
                    {isRunning ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
                    {isRunning ? 'Rodando' : 'Executar'}
                  </Button>
                </div>
                <p className="mt-2 text-xs font-mono text-slate-400">{mod.fn}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}