import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Rocket, Target, Zap } from 'lucide-react';

const PROXIMOS_CICLOS = [
  {
    ciclo: 'Ciclo 8 — Cockpit + Documentação do Plano',
    prazo: 'Em curso (Mai 2026)',
    cor: 'blue',
    acoes: [
      { modulo: 'Sistema', acao: 'Timeline executiva com histórico completo de fases', prioridade: 'Alta', progresso: 95 },
      { modulo: 'Sistema', acao: 'Score módulo × pilar com drill-down expandível', prioridade: 'Alta', progresso: 95 },
      { modulo: 'Sistema', acao: 'Funções backend mapeadas e documentadas (25+)', prioridade: 'Alta', progresso: 95 },
      { modulo: 'Sistema', acao: 'Entidades com cobertura multiempresa mapeada', prioridade: 'Alta', progresso: 95 },
    ]
  },
  {
    ciclo: 'Ciclo 9 — Finalização 100% dos módulos',
    prazo: 'Jun 2026',
    cor: 'red',
    acoes: [
      { modulo: 'Hub Atendimento', acao: 'IAPanel + SLA + score de atendimento em tempo real', prioridade: 'Alta', progresso: 85 },
      { modulo: 'RH', acao: 'Ponto biométrico com integração folha de pagamento', prioridade: 'Média', progresso: 80 },
      { modulo: 'Financeiro', acao: 'Conciliação bancária 100% com IA + detecção de divergência', prioridade: 'Crítica', progresso: 90 },
      { modulo: 'Fiscal', acao: 'SPED Fiscal automatizado com validação pré-envio', prioridade: 'Alta', progresso: 85 },
    ]
  },
  {
    ciclo: 'Ciclo 10 — Inovação Q3 2026',
    prazo: 'Jul–Set 2026',
    cor: 'violet',
    acoes: [
      { modulo: 'IA', acao: 'IA Generativa contextual por módulo (LLM + RAG)', prioridade: 'Alta', progresso: 30 },
      { modulo: 'BI', acao: 'Business Intelligence preditivo com ML e forecast 90 dias', prioridade: 'Alta', progresso: 25 },
      { modulo: 'E-commerce', acao: 'Sync bidirecional Mercado Livre, Amazon, Shopee', prioridade: 'Alta', progresso: 20 },
      { modulo: 'Omnichannel', acao: 'Bot WhatsApp NLP com pedidos e suporte autônomo', prioridade: 'Crítica', progresso: 40 },
    ]
  }
];

const prioridadeCor = {
  Crítica: 'bg-red-100 text-red-700',
  Alta: 'bg-orange-100 text-orange-700',
  Média: 'bg-blue-100 text-blue-700',
};

const cicloCor = {
  red: 'border-red-100 bg-red-50/40',
  blue: 'border-blue-100 bg-blue-50/40',
  violet: 'border-violet-100 bg-violet-50/40',
};

const cicloHeaderCor = {
  red: 'bg-red-600',
  blue: 'bg-blue-600',
  violet: 'bg-violet-600',
};

export default function PlanoMelhoriaProximosCiclos() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
          <Target className="h-5 w-5 text-blue-600" />
          Próximos ciclos de melhoria
        </CardTitle>
        <p className="text-sm text-slate-500">
          Roadmap de evolução contínua — sem apagar, sempre acrescentar, conectar e inovar.
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {PROXIMOS_CICLOS.map((ciclo) => (
          <div key={ciclo.ciclo} className={`rounded-2xl border p-5 ${cicloCor[ciclo.cor]}`}>
            <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl text-white ${cicloHeaderCor[ciclo.cor]}`}>
                  <Rocket className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{ciclo.ciclo}</h3>
                  <p className="text-xs text-slate-500">{ciclo.prazo}</p>
                </div>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {ciclo.acoes.map((acao, i) => (
                <div key={i} className="rounded-xl border border-white bg-white p-3 shadow-sm">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{acao.modulo}</p>
                      <p className="text-sm font-medium text-slate-800 mt-0.5">{acao.acao}</p>
                    </div>
                    <Badge className={prioridadeCor[acao.prioridade] || prioridadeCor.Média}>
                      {acao.prioridade}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <Progress value={acao.progresso} className="h-1.5 flex-1" />
                    <span className="text-xs text-slate-500 w-8 text-right">{acao.progresso}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-slate-100 bg-slate-900 p-5 text-white">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500 text-slate-900">
              <Zap className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-lg">Regra-Mãe — Compromisso permanente</h3>
              <p className="mt-1 text-sm text-slate-300 leading-6">
                Acrescentar • Reorganizar • Conectar • Melhorar — nunca apagar, sempre melhorar, integrar, 
                modo multi-empresa em tudo, inovar, ramificar, controle de acesso, IA, inovação futurista, 
                melhoria contínua, multitarefa, w-full e h-full responsivo e redimensionável em tudo.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Multiempresa', 'Acesso RBAC', 'IA Real', 'Performance', 'Modularização', 'Auditoria', 'UX Responsiva', 'Automação'].map(tag => (
                  <span key={tag} className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-200">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}