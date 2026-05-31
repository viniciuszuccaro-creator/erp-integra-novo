/**
 * ExecutiveBriefing v1.0
 * Briefing executivo diário gerado por IA
 * Passo 33: Resumo inteligente do dia para cada papel executivo
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';

const BRIEFINGS = {
  CEO: {
    resumo: 'Dia positivo: Receita +8.3% vs ontem. 2 decisões críticas pendentes. ESG score melhorou +2pts.',
    kpis: [
      { label: 'Receita Hoje', valor: 'R$ 2.34M', trend: 'up', delta: '+8.3%' },
      { label: 'Margem Líquida', valor: '18.7%', trend: 'up', delta: '+1.2pp' },
      { label: 'Clientes Ativos', valor: '347', trend: 'up', delta: '+12' },
      { label: 'NPS', valor: '72', trend: 'down', delta: '-3' },
    ],
    acoes: [
      { prioridade: 'alta', descricao: 'Aprovar expansão Zuccaro MG — Payback 14 meses', prazo: 'Hoje' },
      { prioridade: 'media', descricao: 'Revisar proposta parceria distribuidora Nordeste', prazo: 'Amanhã' },
      { prioridade: 'baixa', descricao: 'Reunião board — preparar DRE Q2', prazo: 'Sexta' },
    ],
  },
  CFO: {
    resumo: 'Fluxo de caixa positivo. 3 contas a pagar vencendo amanhã. DRE Q2 2.1% acima da meta.',
    kpis: [
      { label: 'Caixa Disponível', valor: 'R$ 4.8M', trend: 'up', delta: '+340k' },
      { label: 'Inadimplência', valor: '2.1%', trend: 'down', delta: '-0.3pp' },
      { label: 'EBITDA', valor: '22.4%', trend: 'up', delta: '+0.9pp' },
      { label: 'Giro Estoque', valor: '18 dias', trend: 'up', delta: '-2d' },
    ],
    acoes: [
      { prioridade: 'alta', descricao: 'Pagar 3 fornecedores vencendo amanhã (R$ 234k)', prazo: 'Hoje' },
      { prioridade: 'alta', descricao: 'Liberar crédito cliente ABC (R$ 150k aprovado IA)', prazo: 'Hoje' },
      { prioridade: 'media', descricao: 'Fechar DRE Q2 para board', prazo: 'Sexta' },
    ],
  },
  COO: {
    resumo: 'OEE em 87.4%, 1 máquina parada para manutenção. Entregas no prazo 96.2%. Estoque crítico em 2 SKUs.',
    kpis: [
      { label: 'OEE Geral', valor: '87.4%', trend: 'down', delta: '-1.1pp' },
      { label: 'Entregas no Prazo', valor: '96.2%', trend: 'up', delta: '+2.1pp' },
      { label: 'Refugo', valor: '2.1%', trend: 'up', delta: '+0.3pp' },
      { label: 'SKUs Críticos', valor: '2', trend: 'down', delta: '+1' },
    ],
    acoes: [
      { prioridade: 'alta', descricao: 'CNC-B parada: autorizar manutenção corretiva (4h)', prazo: 'Agora' },
      { prioridade: 'alta', descricao: 'SKU-001 e SKU-045: gerar OC emergência', prazo: 'Hoje' },
      { prioridade: 'media', descricao: 'Revisar rota SP-Campinas: motorista atrasado 40min', prazo: 'Hoje' },
    ],
  },
  CSO: {
    resumo: 'Pipeline R$ 8.9M. 4 oportunidades quentes fechando esta semana. Churn previsto 2 clientes.',
    kpis: [
      { label: 'Pipeline', valor: 'R$ 8.9M', trend: 'up', delta: '+12%' },
      { label: 'Taxa Conversão', valor: '34%', trend: 'up', delta: '+4pp' },
      { label: 'Ticket Médio', valor: 'R$ 47k', trend: 'up', delta: '+8%' },
      { label: 'Churn Risk', valor: '2 clientes', trend: 'down', delta: 'Alerta' },
    ],
    acoes: [
      { prioridade: 'alta', descricao: 'Contatar cliente XPTO: risco churn alto (IA detectou)', prazo: 'Hoje' },
      { prioridade: 'alta', descricao: 'Proposta Construtora ABC: validade expira amanhã', prazo: 'Hoje' },
      { prioridade: 'media', descricao: 'Aprovar desconto 8% para fechar Metalúrgica XYZ', prazo: 'Amanhã' },
    ],
  },
};

const PRIORIDADE_CONFIG = {
  alta: { color: 'bg-red-500/20 text-red-300', border: 'border-red-500/30' },
  media: { color: 'bg-amber-500/20 text-amber-300', border: 'border-amber-500/30' },
  baixa: { color: 'bg-blue-500/20 text-blue-300', border: 'border-blue-500/30' },
};

export default function ExecutiveBriefing({ role, empresa }) {
  const briefing = BRIEFINGS[role] || BRIEFINGS.CEO;

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-violet-950 overflow-auto">
      {/* Resumo */}
      <Card className="p-5 bg-violet-500/10 border border-violet-400/40 rounded-xl">
        <div className="flex items-start gap-3">
          <Brain className="w-6 h-6 text-violet-400 flex-shrink-0 mt-0.5 animate-pulse" />
          <div>
            <p className="text-xs text-slate-400 mb-1">Briefing IA para {role} — {empresa}</p>
            <p className="text-white font-semibold">{briefing.resumo}</p>
          </div>
        </div>
      </Card>

      {/* KPIs Executivos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {briefing.kpis.map((kpi, idx) => (
          <Card key={idx} className="p-4 bg-white/5 border border-violet-500/20 rounded-lg">
            <p className="text-xs text-slate-400 mb-1">{kpi.label}</p>
            <p className="text-xl font-bold text-white">{kpi.valor}</p>
            <div className="flex items-center gap-1 mt-1">
              {kpi.trend === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-400" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-400" />
              )}
              <span className={`text-xs font-semibold ${kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                {kpi.delta}
              </span>
            </div>
          </Card>
        ))}
      </div>

      {/* Ações Prioritárias */}
      <div>
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          Ações Prioritárias
        </h3>
        <div className="space-y-2">
          {briefing.acoes.map((acao, idx) => {
            const cfg = PRIORIDADE_CONFIG[acao.prioridade];
            return (
              <Card key={idx} className={`p-4 bg-white/5 border rounded-lg ${cfg.border}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={cfg.color}>{acao.prioridade}</Badge>
                    </div>
                    <p className="text-sm text-white">{acao.descricao}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{acao.prazo}</span>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}