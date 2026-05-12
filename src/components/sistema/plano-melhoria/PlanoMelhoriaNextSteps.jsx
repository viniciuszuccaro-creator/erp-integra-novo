import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2, Clock } from 'lucide-react';

const steps = [
  { texto: 'Ativar IA de previsão de demanda por SKU com horizon 30/60/90 dias no módulo Compras.', done: false },
  { texto: 'Implementar score preditivo de saúde financeira do cliente (risco de inadimplência).', done: false },
  { texto: 'Integrar nativa com Mercado Livre / Shopee via API para sincronização de pedidos.', done: false },
  { texto: 'Adicionar biometria nativa para login e aprovações via app mobile (Capacitor).', done: false },
  { texto: 'Executar ciclo de performance: medir LCP/FID por módulo e otimizar gargalos.', done: false },
  { texto: 'Elevar Portal do cliente para 98%+ com BI embarcado e rastreamento avançado.', done: false },
  { texto: 'Implementar MFA por TOTP em ações críticas: pagamentos, NF-e e aprovações.', done: false },
  { texto: 'Criar agente autônomo para fechamento automático de pedidos via IA generativa.', done: false },
  { texto: 'Fluxo Pedido → NF-e → Cobrança → Liquidação → DRE validado 100%.', done: true },
  { texto: 'Todos os módulos com IA operacional conectada ao operacional real.', done: true },
  { texto: 'RBAC + SoD + auditoria completa em todos os módulos críticos.', done: true },
  { texto: 'Multiempresa group_id/empresa_id em todas as entidades e funções.', done: true },
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