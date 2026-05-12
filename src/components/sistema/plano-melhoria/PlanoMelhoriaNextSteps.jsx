import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';

const steps = [
  // Ciclo 10 — Inovação Q3 2026 (próximas ações)
  { texto: 'IA Generativa contextual por módulo: LLM + RAG com contexto de empresa e histórico.', done: false },
  { texto: 'Business Intelligence preditivo com ML: forecast de vendas, margem e caixa 90 dias.', done: false },
  { texto: 'Integração nativa bidirecional: Mercado Livre, Amazon e Shopee (sync pedidos/estoque).', done: false },
  { texto: 'Bot WhatsApp com NLP: pedidos, consultas e suporte autônomo por empresa.', done: false },
  // Ciclo 11 — Mobile + Segurança (futuro)
  { texto: 'App iOS/Android nativo via Capacitor com todas as funcionalidades do ERP.', done: false },
  { texto: 'MFA por TOTP + biometria em ações críticas: pagamento, NF-e e aprovações.', done: false },
  { texto: 'Open Banking: extrato automático + conciliação bancária com IA.', done: false },
  { texto: 'BI Executivo com drill-down por empresa, grupo, produto e cenário.', done: false },
  // Ciclos 8 e 9 — Concluídos
  { texto: 'Ciclo 8: Timeline executiva, funções mapeadas (75+), score módulo × pilar. ✅', done: true },
  { texto: 'Ciclo 9: Hub Atendimento, RH, Financeiro, Produção e Contratos ≥97%.', done: true },
  { texto: 'Fluxo Pedido → NF-e → Cobrança → Liquidação → DRE 100% validado.', done: true },
  { texto: 'RBAC + SoD + piiEncryptor + auditoria completa em todos os módulos.', done: true },
  { texto: 'Multiempresa 99%: group_id/empresa_id em 18 módulos e 75+ funções backend.', done: true },
  { texto: 'IA operacional em 17 módulos: churn, anomalias, rotas, preço, diagnóstico.', done: true },
];

export default function PlanoMelhoriaNextSteps() {
  const pendentes = steps.filter(s => !s.done);
  const concluidos = steps.filter(s => s.done);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-xl text-slate-900">Próxima execução — ações imediatas</CardTitle>
          <div className="flex gap-2">
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">{pendentes.length} pendentes</span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full font-medium">{concluidos.length} concluídos</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Pendentes — próximo ciclo</p>
        {pendentes.map((step, i) => (
          <div key={step.texto} className="flex items-start gap-3 rounded-xl border border-amber-100 bg-amber-50/50 p-3">
            {i === 0 ? <ArrowRight className="mt-0.5 h-4 w-4 text-blue-600 shrink-0" /> : <Clock className="mt-0.5 h-4 w-4 text-amber-500 shrink-0" />}
            <span className="text-sm leading-5 text-slate-700">{step.texto}</span>
          </div>
        ))}
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mt-4 mb-3">Concluídos neste ciclo</p>
        {concluidos.map((step) => (
          <div key={step.texto} className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600 shrink-0" />
            <span className="text-sm leading-5 text-slate-600">{step.texto}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}