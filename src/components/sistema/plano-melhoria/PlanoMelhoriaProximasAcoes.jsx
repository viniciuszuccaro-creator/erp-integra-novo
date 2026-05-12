import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle, Clock, Zap } from 'lucide-react';

const ACOES_CICLO_10 = [
  {
    prioridade: 'Crítica',
    titulo: 'IA Generativa + RAG contextual',
    descricao: 'Implementar LLM generativa com Retrieval-Augmented Generation usando contexto da empresa/histórico',
    status: 'Em Planejamento',
    esforço: '21 dias',
    deps: ['Ciclo 9 completo'],
    cor: 'red'
  },
  {
    prioridade: 'Crítica',
    titulo: 'Business Intelligence Preditivo',
    descricao: 'ML forecast: vendas 90 dias, margem por produto, fluxo de caixa, risco inadimplência',
    status: 'Em Planejamento',
    esforço: '28 dias',
    deps: ['Data warehouse', 'Analytics'],
    cor: 'red'
  },
  {
    prioridade: 'Alta',
    titulo: 'E-commerce integrado bidirecional',
    descricao: 'Sincronização nativa: Mercado Livre, Amazon, Shopee (pedidos, estoque, faturamento)',
    status: 'Em Planejamento',
    esforço: '35 dias',
    deps: ['APIs de marketplaces', 'Fila de eventos'],
    cor: 'orange'
  },
  {
    prioridade: 'Alta',
    titulo: 'Bot WhatsApp com NLP',
    descricao: 'Chatbot autônomo: criação de pedidos, consulta estoque, suporte, rastreio, recebimento de voz',
    status: 'Em Planejamento',
    esforço: '21 dias',
    deps: ['WhatsApp Business API', 'NLP engine'],
    cor: 'orange'
  },
  {
    prioridade: 'Média',
    titulo: 'Dashboard BI executivo',
    descricao: 'Drill-down por empresa, grupo, produto com cenários de simulação (what-if)',
    status: 'Em Backlog',
    esforço: '14 dias',
    deps: ['BI Preditivo'],
    cor: 'yellow'
  },
  {
    prioridade: 'Média',
    titulo: 'App nativo iOS/Android',
    descricao: 'Todas as funcionalidades do ERP em app com Capacitor (login, pedidos, consultas, rastreio)',
    status: 'Em Backlog',
    esforço: '45 dias',
    deps: ['Ciclo 11'],
    cor: 'yellow'
  },
];

const ACOES_CONCLUIDAS = [
  { titulo: '✅ Ciclo 8: Timeline executiva + KPIs + status módulos' },
  { titulo: '✅ Ciclo 9: Hub Atendimento, RH, Produção, Contratos ≥97%' },
  { titulo: '✅ 8 pilares técnicos consolidados (RBAC, Multiempresa, IA, Performance, etc)' },
  { titulo: '✅ 75+ funções backend mapeadas e documentadas' },
  { titulo: '✅ AuditLog central com 10 tipos de eventos' },
  { titulo: '✅ piiEncryptor para PII sensível (LGPD)' },
  { titulo: '✅ WindowManager multitarefa com redimensionamento' },
];

export default function PlanoMelhoriaProximasAcoes() {
  const [expandidos, setExpandidos] = useState({});

  const corBg = { red: 'bg-red-600', orange: 'bg-orange-600', yellow: 'bg-amber-600' };
  const corBorder = { red: 'border-red-100 bg-red-50/40', orange: 'border-orange-100 bg-orange-50/40', yellow: 'border-yellow-100 bg-yellow-50/40' };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Zap className="h-5 w-5 text-yellow-600" />
          Próximas Ações — Ciclo 10 &amp; Roadmap
        </CardTitle>
        <p className="text-sm text-slate-500 mt-2">Ações imediatas para Q3 2026 (Ciclo 10) e roadmap futuro (Ciclo 11+)</p>
      </CardHeader>
      <CardContent className="space-y-5">
        
        {/* Ciclo 10 */}
        <div>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">Ciclo 10 — Q3 2026 (Ações Prioritárias)</p>
          <div className="grid gap-2 md:grid-cols-2">
            {ACOES_CICLO_10.map((acao) => {
              const aberto = !!expandidos[acao.titulo];
              return (
                <div key={acao.titulo} className={`rounded-xl border overflow-hidden ${corBorder[acao.cor]}`}>
                  <button
                    className="w-full flex items-center justify-between gap-2 p-3 hover:opacity-90 transition-opacity text-left"
                    onClick={() => setExpandidos(p => ({ ...p, [acao.titulo]: !aberto }))}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs text-white ${corBg[acao.cor]}`}>{acao.prioridade}</Badge>
                        <span className="font-semibold text-slate-900 text-sm">{acao.titulo}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                        <Clock className="h-3 w-3" />
                        <span>{acao.esforço}</span>
                        <span className="text-slate-400">•</span>
                        <span className={acao.status === 'Em Planejamento' ? 'text-orange-600' : 'text-blue-600'}>{acao.status}</span>
                      </div>
                    </div>
                    <span className="text-slate-500 text-sm shrink-0">{aberto ? '▼' : '▶'}</span>
                  </button>
                  {aberto && (
                    <div className="border-t border-slate-200 bg-white p-3 text-xs space-y-2">
                      <p className="text-slate-700"><strong>O quê:</strong> {acao.descricao}</p>
                      <p className="text-slate-600"><strong>Dependências:</strong> {acao.deps.join(', ')}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Ações concluídas */}
        <div>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wide mb-3">Ações Concluídas — Ciclos 8 &amp; 9</p>
          <div className="grid gap-1">
            {ACOES_CONCLUIDAS.map((acao) => (
              <div key={acao.titulo} className="flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50/40 px-3 py-2 text-xs text-slate-700">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                {acao.titulo}
              </div>
            ))}
          </div>
        </div>

        {/* Métricas */}
        <div className="grid gap-2 sm:grid-cols-3 rounded-xl bg-slate-50 p-4">
          {[
            { label: 'Ciclos completados', valor: '2/11', cor: 'emerald' },
            { label: 'Módulos operacionais', valor: '18/18', cor: 'blue' },
            { label: 'Taxa de conclusão', valor: '97-99%', cor: 'purple' },
          ].map((m) => (
            <div key={m.label} className="text-center">
              <p className={`text-2xl font-bold text-${m.cor}-700`}>{m.valor}</p>
              <p className="text-xs text-slate-600 mt-1">{m.label}</p>
            </div>
          ))}
        </div>

      </CardContent>
    </Card>
  );
}