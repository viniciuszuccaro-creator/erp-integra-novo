import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, Rocket, Sparkles } from 'lucide-react';

const TIMELINE = [
  {
    periodo: 'Fase 1 — Estabilização',
    data: 'Concluída',
    status: 'done',
    cor: 'emerald',
    itens: ['Lint e build limpos', 'Imports corrigidos', 'Base segura para evoluir', 'Erros auditados no AuditLog'],
  },
  {
    periodo: 'Fase 2 — Multiempresa + Acesso',
    data: 'Concluída',
    status: 'done',
    cor: 'emerald',
    itens: ['group_id + empresa_id em todas as entidades', 'Wrapping automático no Layout', 'RBAC + entityGuard', 'SoD Checker ativo'],
  },
  {
    periodo: 'Fase 3 — Modularização + Performance',
    data: 'Concluída',
    status: 'done',
    cor: 'emerald',
    itens: ['Launchpads por módulo', 'Hooks dedicados por módulo', 'Cache IDB offline', 'Prefetch preditivo'],
  },
  {
    periodo: 'Fase 4 — IA Operacional',
    data: 'Concluída',
    status: 'done',
    cor: 'emerald',
    itens: ['12 painéis IA em produção', 'iaFinanceAnomalyScan', 'productPriceOptimizer', 'iaChurnAnalyzer', 'Cockpit IA no Plano de Melhoria'],
  },
  {
    periodo: 'Fase 5 — Integrações + Automações',
    data: 'Concluída',
    status: 'done',
    cor: 'emerald',
    itens: ['NF-e multiempresa via eNotas', 'Boleto/PIX por gateway', 'WhatsApp com templates', 'onPedidoCreated/Approval/ReadyToInvoice'],
  },
  {
    periodo: 'Fase 6 — Governança + Auditoria',
    data: 'Concluída',
    status: 'done',
    cor: 'emerald',
    itens: ['AuditLog central universal', 'LGPD piiEncryptor', 'Backup automático criptografado', 'deployAudit + orderFlowAuditor'],
  },
  {
    periodo: 'Fase 7 — UX Responsiva + Multitarefa',
    data: 'Concluída',
    status: 'done',
    cor: 'emerald',
    itens: ['WindowManager multitarefa', 'Mobile-first em todos módulos', 'Sidebar adaptativa', 'Atalhos de teclado (Ctrl+K)'],
  },
  {
    periodo: 'Fase 8 — Cockpit + Conexões + Documentação',
    data: 'Em curso',
    status: 'active',
    cor: 'blue',
    itens: ['PlanoMelhoriaIACockpit', 'PlanoMelhoriaConexoesModulos', 'PlanoMelhoriaFuncoesBackend', 'PlanoMelhoriaEntidadesStatus'],
  },
  {
    periodo: 'Fase 9 — Inovação Q3/Q4 2026',
    data: 'Planejada',
    status: 'planned',
    cor: 'violet',
    itens: ['IA generativa contextual', 'BI preditivo com ML', 'Omnichannel total', 'Digital Twin 3D', 'RPA + Zero Trust'],
  },
];

const corMap = {
  emerald: { dot: 'bg-emerald-500', card: 'border-emerald-100 bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-700', line: 'bg-emerald-200' },
  blue: { dot: 'bg-blue-500 ring-4 ring-blue-100', card: 'border-blue-100 bg-blue-50/40', badge: 'bg-blue-100 text-blue-700', line: 'bg-blue-200' },
  violet: { dot: 'bg-violet-400', card: 'border-violet-100 bg-violet-50/40', badge: 'bg-violet-100 text-violet-700', line: 'bg-violet-200' },
};

export default function PlanoMelhoriaTimelineExecutiva() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
          <Rocket className="h-5 w-5 text-blue-600" />
          Timeline executiva do plano
        </CardTitle>
        <p className="text-sm text-slate-500">Histórico completo das fases executadas e próximos ciclos planejados.</p>
      </CardHeader>
      <CardContent>
        <div className="relative flex flex-col gap-0">
          {TIMELINE.map((fase, idx) => {
            const cores = corMap[fase.cor];
            const Icon = fase.status === 'done' ? CheckCircle2 : fase.status === 'active' ? Clock : Sparkles;
            return (
              <div key={fase.periodo} className="flex gap-4">
                {/* Linha vertical + dot */}
                <div className="flex flex-col items-center">
                  <div className={`mt-4 h-4 w-4 rounded-full shrink-0 ${cores.dot}`} />
                  {idx < TIMELINE.length - 1 && (
                    <div className={`w-0.5 flex-1 min-h-4 ${cores.line}`} />
                  )}
                </div>
                {/* Conteúdo */}
                <div className={`mb-3 flex-1 rounded-xl border p-4 ${cores.card}`}>
                  <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                    <div>
                      <p className="font-bold text-slate-900">{fase.periodo}</p>
                    </div>
                    <Badge className={cores.badge}>{fase.data}</Badge>
                  </div>
                  <div className="grid gap-1 sm:grid-cols-2">
                    {fase.itens.map((item) => (
                      <div key={item} className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Icon className={`h-3 w-3 shrink-0 ${fase.status === 'done' ? 'text-emerald-500' : fase.status === 'active' ? 'text-blue-500' : 'text-violet-400'}`} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}