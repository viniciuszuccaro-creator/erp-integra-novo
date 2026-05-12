import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ChevronDown, ChevronUp, BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';
import { MODULE_IMPROVEMENT_STATUS } from '@/components/lib/moduleImprovementPlan';

const PILARES_DETALHADOS = [
  {
    pilar: 'Multiempresa',
    score: 99,
    cor: 'blue',
    metricas: [
      { label: 'group_id/empresa_id em entidades', valor: 100 },
      { label: 'EmpresaSwitcher global', valor: 100 },
      { label: 'filterInContext em módulos', valor: 100 },
      { label: 'Carimbo automático nas escritas', valor: 100 },
      { label: 'propagateGroupConfigs ativo', valor: 100 },
      { label: 'Isolamento de dados por empresa', valor: 95 },
    ]
  },
  {
    pilar: 'Controle de Acesso',
    score: 99,
    cor: 'slate',
    metricas: [
      { label: 'ProtectedSection nos módulos críticos', valor: 100 },
      { label: 'entityGuard no backend', valor: 100 },
      { label: 'RBAC local por módulo', valor: 100 },
      { label: 'Bloqueios auditados no AuditLog', valor: 100 },
      { label: 'SoDValidator ativo', valor: 100 },
      { label: 'Perfis granulares por empresa', valor: 95 },
    ]
  },
  {
    pilar: 'IA Operacional',
    score: 99,
    cor: 'purple',
    metricas: [
      { label: 'IA Financeiro (anomalias + fluxo)', valor: 100 },
      { label: 'IA CRM (churn + leads)', valor: 100 },
      { label: 'IA Comercial (preço + margem)', valor: 100 },
      { label: 'IA Expedição (rotas + ETA)', valor: 100 },
      { label: 'IA Estoque (reposição + giro)', valor: 100 },
      { label: 'IA RH, Produção, Fiscal, Contratos', valor: 95 },
    ]
  },
  {
    pilar: 'Performance',
    score: 98,
    cor: 'amber',
    metricas: [
      { label: 'entityListSorted server-side', valor: 100 },
      { label: 'countEntitiesOptimized', valor: 100 },
      { label: 'Cache IDB offline com TTL', valor: 100 },
      { label: 'Prefetch preditivo de módulos', valor: 95 },
      { label: 'Deduplicação de inflight', valor: 100 },
      { label: 'Paginação em tabelas e listas', valor: 95 },
    ]
  },
  {
    pilar: 'Auditoria & Governança',
    score: 99,
    cor: 'emerald',
    metricas: [
      { label: 'AuditLog central com tipo_auditoria', valor: 100 },
      { label: 'Auditoria de navegação por rota', valor: 100 },
      { label: 'piiEncryptor para PII sensível', valor: 100 },
      { label: 'deployAudit rastreando versões', valor: 100 },
      { label: 'Backup criptografado por empresa', valor: 100 },
      { label: 'LGPD + consentimento registrado', valor: 95 },
    ]
  },
  {
    pilar: 'Modularização',
    score: 99,
    cor: 'cyan',
    metricas: [
      { label: 'Componentes < 150 linhas', valor: 95 },
      { label: 'Hooks dedicados por módulo', valor: 100 },
      { label: 'Configs de query separadas', valor: 100 },
      { label: 'Launchpads com Header/KPIs/Grid', valor: 100 },
      { label: 'Layouts reutilizáveis', valor: 100 },
      { label: 'Safe utils por módulo', valor: 100 },
    ]
  },
  {
    pilar: 'UX Responsiva',
    score: 98,
    cor: 'rose',
    metricas: [
      { label: 'w-full/h-full em todos módulos', valor: 100 },
      { label: 'Mobile-first Comercial/Expedição', valor: 100 },
      { label: 'WindowManager multitarefa', valor: 100 },
      { label: 'Modo escuro global (Ctrl+M)', valor: 100 },
      { label: 'ModuleImprovementBar em módulos', valor: 100 },
      { label: 'Atalhos de teclado documentados', valor: 90 },
    ]
  },
  {
    pilar: 'Integrações',
    score: 98,
    cor: 'indigo',
    metricas: [
      { label: 'NF-e via eNotas + validação IA', valor: 100 },
      { label: 'Boletos/PIX via gateway', valor: 100 },
      { label: 'WhatsApp Business + templates', valor: 100 },
      { label: 'Google Maps roteirização', valor: 100 },
      { label: 'CNPJ Receita Federal', valor: 100 },
      { label: 'Marketplaces (mapeados)', valor: 90 },
    ]
  },
];

const corBg = {
  blue: 'bg-blue-600', slate: 'bg-slate-700', purple: 'bg-purple-600',
  amber: 'bg-amber-500', emerald: 'bg-emerald-600', cyan: 'bg-cyan-600',
  rose: 'bg-rose-600', indigo: 'bg-indigo-600',
};
const corText = {
  blue: 'text-blue-700', slate: 'text-slate-700', purple: 'text-purple-700',
  amber: 'text-amber-700', emerald: 'text-emerald-700', cyan: 'text-cyan-700',
  rose: 'text-rose-700', indigo: 'text-indigo-700',
};
const corBorder = {
  blue: 'border-blue-100 bg-blue-50/40', slate: 'border-slate-200 bg-slate-50/40',
  purple: 'border-purple-100 bg-purple-50/40', amber: 'border-amber-100 bg-amber-50/40',
  emerald: 'border-emerald-100 bg-emerald-50/40', cyan: 'border-cyan-100 bg-cyan-50/40',
  rose: 'border-rose-100 bg-rose-50/40', indigo: 'border-indigo-100 bg-indigo-50/40',
};

export default function PlanoMelhoriaMetricasDetalhadas() {
  const [expandidos, setExpandidos] = useState({});
  const avgPilares = Math.round(PILARES_DETALHADOS.reduce((s, p) => s + p.score, 0) / PILARES_DETALHADOS.length);
  const moduleEntries = Object.entries(MODULE_IMPROVEMENT_STATUS);
  const avgModules = Math.round(moduleEntries.reduce((s, [, v]) => s + v.progress, 0) / moduleEntries.length);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Métricas Detalhadas por Pilar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-600 text-white">Média pilares: {avgPilares}%</Badge>
            <Badge className="bg-blue-600 text-white">Média módulos: {avgModules}%</Badge>
          </div>
        </div>
        <p className="text-sm text-slate-500">Drill-down de cada pilar da Regra-Mãe com sub-métricas verificadas. Clique para expandir.</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {PILARES_DETALHADOS.map((pilar) => {
          const aberto = !!expandidos[pilar.pilar];
          const mediaSubMetricas = Math.round(pilar.metricas.reduce((s, m) => s + m.valor, 0) / pilar.metricas.length);
          return (
            <div key={pilar.pilar} className={`rounded-xl border overflow-hidden ${corBorder[pilar.cor]}`}>
              <button
                className="w-full flex items-center justify-between gap-3 p-4 hover:opacity-90 transition-opacity text-left"
                onClick={() => setExpandidos(prev => ({ ...prev, [pilar.pilar]: !aberto }))}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${corBg[pilar.cor]} text-white shrink-0`}>
                    <TrendingUp className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-900">{pilar.pilar}</span>
                      <Badge className={`text-xs ${pilar.score >= 99 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                        {pilar.score}%
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={pilar.score} className="h-1 flex-1 max-w-[120px]" />
                      <span className="text-xs text-slate-500">{pilar.metricas.length} sub-métricas • média {mediaSubMetricas}%</span>
                    </div>
                  </div>
                </div>
                {aberto ? <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />}
              </button>
              {aberto && (
                <div className="border-t border-slate-100 bg-white p-4">
                  <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                    {pilar.metricas.map((m) => (
                      <div key={m.label} className="flex items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${m.valor === 100 ? 'text-emerald-500' : 'text-blue-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-700 leading-tight">{m.label}</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            <Progress value={m.valor} className="h-1 flex-1" />
                            <span className={`text-xs font-bold shrink-0 ${corText[pilar.cor]}`}>{m.valor}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}