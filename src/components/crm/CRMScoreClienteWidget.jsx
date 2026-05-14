import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Bot, RefreshCw, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

const SCORE_CONFIG = [
  { label: 'Excelente', min: 80, color: 'bg-emerald-600', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
  { label: 'Bom', min: 60, color: 'bg-blue-500', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
  { label: 'Regular', min: 40, color: 'bg-amber-500', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700' },
  { label: 'Crítico', min: 0, color: 'bg-red-500', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
];

function getScoreConfig(score) {
  return SCORE_CONFIG.find(c => score >= c.min) || SCORE_CONFIG[SCORE_CONFIG.length - 1];
}

export default function CRMScoreClienteWidget({ compact = false }) {
  const { filterInContext, empresaAtual, grupoAtual, estaNoGrupo } = useContextoVisual();
  const [refetchKey, setRefetchKey] = useState(0);

  const hasCtx = Boolean(empresaAtual?.id || estaNoGrupo || grupoAtual?.id);

  const { data = [], isLoading } = useQuery({
    queryKey: ['crm-score-clientes', empresaAtual?.id, grupoAtual?.id, estaNoGrupo, refetchKey],
    queryFn: async () => {
      const clientes = await filterInContext('Cliente', { status: 'Ativo' }, '-score_saude_cliente', compact ? 5 : 10);
      return (clientes || []).map(c => ({
        id: c.id,
        nome: c.nome || c.razao_social || 'Cliente',
        score: Number(c.score_saude_cliente ?? 50),
        risco_churn: c.risco_churn || 'Baixo',
        dias_sem_comprar: Number(c.dias_sem_comprar ?? 0),
        classificacao_abc: c.classificacao_abc || 'Novo',
        ticket_medio: Number(c.ticket_medio ?? 0),
      }));
    },
    staleTime: 300000,
    enabled: hasCtx,
  });

  const topRisco = (data || []).filter(c => c.risco_churn === 'Alto' || c.risco_churn === 'Crítico');
  const mediaScore = data.length ? Math.round(data.reduce((s, c) => s + c.score, 0) / data.length) : 0;

  const scoreConf = getScoreConfig(mediaScore);

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5 text-indigo-600" />
            Score de Saúde — Clientes
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-100 text-purple-700 text-xs flex items-center gap-1"><Bot className="w-3 h-3" /> IA</Badge>
            <button onClick={() => setRefetchKey(k => k + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo geral */}
        {!isLoading && data.length > 0 && (
          <div className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-slate-50">
            <div className="flex-1">
              <p className="text-xs text-slate-500 mb-1">Score Médio</p>
              <Progress value={mediaScore} className={`h-2 ${scoreConf.color}`} />
            </div>
            <div className="text-right">
              <p className={`text-2xl font-black ${scoreConf.text}`}>{mediaScore}</p>
              <Badge className={`text-xs ${scoreConf.badge}`}>{scoreConf.label}</Badge>
            </div>
          </div>
        )}

        {/* Lista de riscos */}
        {topRisco.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Em risco de churn
            </p>
            {topRisco.slice(0, compact ? 3 : 5).map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-red-100 bg-red-50 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-900 truncate max-w-[180px]">{c.nome}</p>
                  <p className="text-[10px] text-slate-500">{c.dias_sem_comprar}d sem comprar • ABC: {c.classificacao_abc}</p>
                </div>
                <Badge className="bg-red-100 text-red-700 text-[10px]">{c.risco_churn}</Badge>
              </div>
            ))}
          </div>
        )}

        {/* Lista saudáveis */}
        {!compact && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-slate-600 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Mais saudáveis
            </p>
            {(data || []).filter(c => c.risco_churn === 'Baixo').slice(0, 5).map(c => (
              <div key={c.id} className="flex items-center justify-between rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-2">
                <p className="text-xs font-semibold text-slate-900 truncate max-w-[180px]">{c.nome}</p>
                <Badge className="bg-emerald-100 text-emerald-700 text-[10px]">Score {c.score}</Badge>
              </div>
            ))}
          </div>
        )}

        {isLoading && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        )}
        {!isLoading && !hasCtx && (
          <p className="text-sm text-slate-500">Selecione uma empresa para carregar.</p>
        )}
      </CardContent>
    </Card>
  );
}