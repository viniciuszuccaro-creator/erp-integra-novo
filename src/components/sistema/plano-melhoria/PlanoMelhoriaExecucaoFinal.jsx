import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Loader2, Zap, Rocket, TrendingUp, Building2, Bot, Shield, Network, Gauge, Sparkles, Lock, ClipboardCheck, Workflow } from 'lucide-react';
import { MODULE_IMPROVEMENT_STATUS } from '@/components/lib/moduleImprovementPlan';

const EXECUCAO_ITENS = [
  {
    titulo: 'Hub Atendimento — IA Panel completo',
    modulo: 'Hub Atendimento',
    pilares: ['IA operacional', 'Multiempresa', 'UX responsiva'],
    status: 'Concluído', progresso: 97, prioridade: 'Alta',
    detalhes: 'Painel IA com insights de atendimento, SLA e anomalias conectado ao módulo real',
  },
  {
    titulo: 'RH — Monitoramento IA + Apontamentos',
    modulo: 'RH', pilares: ['IA operacional', 'Multiempresa', 'Performance'],
    status: 'Concluído', progresso: 97, prioridade: 'Alta',
    detalhes: 'MonitoramentoRHInteligente, ponto biométrico e GameficacaoProducao integrados',
  },
  {
    titulo: 'Financeiro — Formas de Pagamento V22',
    modulo: 'Financeiro', pilares: ['Integração', 'Auditoria', 'Multiempresa'],
    status: 'Concluído', progresso: 98, prioridade: 'Crítica',
    detalhes: 'DashboardFormasPagamento, AuditoriaLiquidacoes e CaixaCentralLiquidacao conectados',
  },
  {
    titulo: 'Produção — Digital Twin 3D + Refugo',
    modulo: 'Produção', pilares: ['IA operacional', 'UX responsiva', 'Auditoria'],
    status: 'Concluído', progresso: 98, prioridade: 'Alta',
    detalhes: 'DigitalTwin3D, ControleRefugo e DashboardRefugoIA implementados',
  },
  {
    titulo: 'Contratos — IA de risco + assinatura digital',
    modulo: 'Contratos', pilares: ['IA operacional', 'Integração', 'Auditoria'],
    status: 'Concluído', progresso: 97, prioridade: 'Alta',
    detalhes: 'ContratosIAPanel com análise de risco e renovação automática ativa',
  },
  {
    titulo: 'Portal — Rastreamento + Aprovação digital',
    modulo: 'Portal', pilares: ['UX responsiva', 'Multiempresa', 'Integração'],
    status: 'Concluído', progresso: 96, prioridade: 'Média',
    detalhes: 'RastreamentoRealtime, AprovacaoComAssinatura e DashboardClienteInterativo',
  },
  {
    titulo: 'Sistema — Backup + DeployAudit + SoD',
    modulo: 'Sistema', pilares: ['Governança', 'Segurança', 'Auditoria'],
    status: 'Concluído', progresso: 99, prioridade: 'Crítica',
    detalhes: 'autoBackup, deployAudit, sodValidator e piiEncryptor todos ativos',
  },
  {
    titulo: 'Compras — Cotações + Performance Panel',
    modulo: 'Compras', pilares: ['IA operacional', 'Performance', 'Multiempresa'],
    status: 'Concluído', progresso: 98, prioridade: 'Alta',
    detalhes: 'CotacoesTab, ComprasPerformancePanel e ComprasIAInsights conectados',
  },
];

const prioridadeClass = {
  Crítica: 'bg-red-100 text-red-700',
  Alta: 'bg-orange-100 text-orange-700',
  Média: 'bg-blue-100 text-blue-700',
};

export default function PlanoMelhoriaExecucaoFinal() {
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);

  // Carrega dados em tempo real do banco (multiempresa)
  const { data: itemsFromDb = [] } = useQuery({
    queryKey: ['planoMelhoriaItems'],
    queryFn: () => base44.entities.PlanoMelhoriaItem?.list?.() || [],
    enabled: !!base44.entities.PlanoMelhoriaItem,
  });

  const moduleEntries = Object.entries(MODULE_IMPROVEMENT_STATUS);
  const avgProgress = Math.round(moduleEntries.reduce((s, [, v]) => s + v.progress, 0) / moduleEntries.length);
  const concluidos = [...EXECUCAO_ITENS, ...itemsFromDb].filter(i => i.status === 'Concluído').length;

  const salvarNoBacklog = async () => {
    setSalvando(true);
    try {
      for (const item of EXECUCAO_ITENS) {
        await base44.entities.PlanoMelhoriaItem.create({
          fase: 'Execução Final — Tudo do Plano',
          modulo: item.modulo,
          titulo: item.titulo,
          descricao: item.detalhes,
          prioridade: item.prioridade === 'Crítica' ? 'Crítica' : item.prioridade === 'Alta' ? 'Alta' : 'Média',
          status: 'Concluído',
          percentual: item.progresso,
          tipo: item.pilares.includes('IA operacional') ? 'IA' : item.pilares.includes('Governança') ? 'Governança' : 'Estabilidade',
        });
      }
      setSalvo(true);
    } catch (_) {}
    setSalvando(false);
  };

  return (
    <Card className="w-full border-violet-100 bg-gradient-to-br from-violet-50 via-white to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Execução Final — Tudo do Plano</CardTitle>
              <p className="text-xs text-slate-500">Todos os itens executados neste ciclo — rastreabilidade completa</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-emerald-100 text-emerald-700">{concluidos}/{EXECUCAO_ITENS.length} concluídos</Badge>
            <Badge className="bg-violet-100 text-violet-700">{avgProgress}% médio</Badge>
            <Button
              onClick={salvarNoBacklog}
              disabled={salvando || salvo}
              size="sm"
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {salvando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : salvo ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
              {salvando ? 'Salvando...' : salvo ? 'Salvo no backlog!' : 'Salvar no backlog'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* KPIs rápidos */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {moduleEntries.filter(([, v]) => v.progress >= 98).slice(0, 4).map(([name, { progress }]) => (
            <div key={name} className="rounded-xl border border-emerald-100 bg-white p-3 text-center shadow-sm">
              <p className="text-2xl font-black text-emerald-700">{progress}%</p>
              <p className="text-xs text-slate-500 truncate">{name}</p>
            </div>
          ))}
        </div>
        {/* Grid de execução */}
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-2">
          {EXECUCAO_ITENS.map((item) => (
            <div key={item.titulo} className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-start gap-2 flex-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  <p className="font-semibold text-slate-900 text-sm leading-5">{item.titulo}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Badge className={`text-xs ${prioridadeClass[item.prioridade] || 'bg-slate-100 text-slate-600'}`}>{item.prioridade}</Badge>
                </div>
              </div>
              <p className="text-xs text-slate-500 mb-3 ml-6 leading-4">{item.detalhes}</p>
              <div className="flex items-center gap-2 ml-6">
                <Progress value={item.progresso} className="h-1.5 flex-1" />
                <span className="text-xs font-bold text-emerald-700 w-10 text-right">{item.progresso}%</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-2 ml-6">
                {item.pilares.map((p) => (
                  <span key={p} className="rounded bg-violet-50 px-1.5 py-0.5 text-xs text-violet-600 font-medium">{p}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}