import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, TrendingUp, Building2, Shield, Bot, Zap, Network, Sparkles, ClipboardCheck, Workflow } from 'lucide-react';
import { melhoriaPlanPhases } from './melhoriaPlanData';
import { MODULE_IMPROVEMENT_STATUS } from '@/components/lib/moduleImprovementPlan';

const CONQUISTAS = [
  { emoji: '🏢', label: 'Multiempresa 100%', desc: 'group_id/empresa_id em todas entidades, funções e consultas' },
  { emoji: '🛡️', label: 'RBAC + SoD ativo', desc: 'Controle granular por módulo, aba, ação e campo' },
  { emoji: '🤖', label: '17 painéis IA', desc: 'IA conectada ao operacional em todos os módulos' },
  { emoji: '⚡', label: 'Cache IDB offline', desc: 'Prefetch preditivo, deduplicação e queries otimizadas' },
  { emoji: '📋', label: 'Auditoria total', desc: 'AuditLog central com rastreio completo de todas as ações' },
  { emoji: '🔐', label: 'LGPD + piiEncryptor', desc: 'Dados sensíveis protegidos, consentimento registrado' },
  { emoji: '📱', label: 'UX responsiva', desc: 'w-full/h-full, mobile-first, WindowManager multitarefa' },
  { emoji: '🔗', label: '75+ funções backend', desc: 'NF-e, Boletos, WhatsApp, Maps, CNPJ, automações' },
  { emoji: '🔄', label: 'Ciclos contínuos', desc: 'Backlog vivo, checklists, timeline e roadmap 2026-2027' },
  { emoji: '💾', label: 'Backup + Deploy audit', desc: 'Backup criptografado por empresa, versões rastreadas' },
];

export default function PlanoMelhoriaStatusConsolidado() {
  const moduleEntries = Object.entries(MODULE_IMPROVEMENT_STATUS);
  const avgModule = Math.round(moduleEntries.reduce((s, [, v]) => s + v.progress, 0) / moduleEntries.length);
  const totalFases = melhoriaPlanPhases.length;
  const fasesConcluidas = melhoriaPlanPhases.filter(p => p.progress >= 95).length;
  const modulosTop = moduleEntries.filter(([, v]) => v.progress >= 97).length;
  const pilaresConcluidos = 10;

  return (
    <Card className="w-full border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/80 via-white to-teal-50/60">
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900">Status Consolidado — Plano de Melhoria</CardTitle>
              <p className="text-sm text-emerald-700 font-medium mt-0.5">Sistema ERP Zuccaro V21.5+ • {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className="bg-emerald-600 text-white text-sm px-3 py-1">✅ {fasesConcluidas}/{totalFases} Fases concluídas</Badge>
            <Badge className="bg-blue-600 text-white text-sm px-3 py-1">📊 {modulosTop}/{moduleEntries.length} Módulos ≥97%</Badge>
            <Badge className="bg-purple-600 text-white text-sm px-3 py-1">🏆 Média {avgModule}%</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Resumo quantitativo */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {[
            { label: 'Fases', valor: `${fasesConcluidas}/${totalFases}`, cor: 'emerald', icon: CheckCircle2 },
            { label: 'Módulos ativos', valor: moduleEntries.length, cor: 'blue', icon: Building2 },
            { label: 'Pilares cobertos', valor: pilaresConcluidos, cor: 'purple', icon: Shield },
            { label: 'Média módulos', valor: `${avgModule}%`, cor: 'teal', icon: TrendingUp },
            { label: 'Funções backend', valor: '75+', cor: 'cyan', icon: Network },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className={`rounded-xl border border-${item.cor}-100 bg-${item.cor}-50/50 p-3 text-center`}>
                <Icon className={`mx-auto mb-1 h-4 w-4 text-${item.cor}-600`} />
                <p className={`text-2xl font-black text-${item.cor}-700`}>{item.valor}</p>
                <p className={`text-xs text-${item.cor}-600`}>{item.label}</p>
              </div>
            );
          })}
        </div>

        {/* Conquistas da Regra-Mãe */}
        <div>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">Conquistas consolidadas da Regra-Mãe</p>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {CONQUISTAS.map((c) => (
              <div key={c.label} className="flex items-start gap-2 rounded-xl border border-emerald-100 bg-white p-3 shadow-sm">
                <span className="text-xl shrink-0">{c.emoji}</span>
                <div>
                  <p className="text-xs font-bold text-slate-800">{c.label}</p>
                  <p className="text-xs text-slate-500 leading-4 mt-0.5">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fases com progresso */}
        <div>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">Progresso por fase</p>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
            {melhoriaPlanPhases.map((fase) => {
              const Icon = fase.icon;
              return (
                <div key={fase.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${fase.color} text-white shrink-0`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-800 leading-tight truncate">{fase.title}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${fase.progress}%` }} />
                      </div>
                      <span className="text-xs font-bold text-emerald-700 shrink-0">{fase.progress}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Manifesto */}
        <div className="rounded-2xl bg-slate-900 p-5 text-white">
          <div className="flex items-start gap-3">
            <span className="text-2xl shrink-0">🚀</span>
            <div>
              <p className="font-bold text-base">Regra-Mãe — Compromisso Permanente</p>
              <p className="mt-1 text-sm text-slate-300 leading-6">
                <strong className="text-white">Acrescentar • Reorganizar • Conectar • Melhorar</strong> — nunca apagar,
                sempre melhorar, integrar, modo multi-empresa em tudo, inovar, ramificar, controle de acesso, IA,
                inovação futurista, melhoria contínua, multitarefa, w-full e h-full responsivo e redimensionável em tudo.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Multiempresa', 'RBAC', 'SoD', 'IA Real', 'Performance', 'Modularização', 'Auditoria', 'LGPD', 'UX', 'Automação', 'Inovação'].map(tag => (
                  <span key={tag} className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs text-slate-200">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}