import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const steps = [
  'Elevar módulos Financeiro e RH para 96%+ com painel de IA integrado.',
  'Completar validação ponta a ponta do fluxo Pedido → Estoque → NF-e → Entrega.',
  'Revisar perfis de acesso e revalidar SoD em todos os módulos críticos.',
  'Conectar IA de previsão de demanda ao módulo de Compras.',
  'Auditar cobertura de multiempresa nos relatórios e dashboards.',
  'Ativar notificações automáticas para eventos críticos por WhatsApp.',
  'Revisar e elevar score de UX responsiva em RH, Contratos e Hub de Atendimento.',
  'Executar ciclo de performance: medir latências, otimizar e republicar.'
];

export default function PlanoMelhoriaNextSteps() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl text-slate-900">Próxima execução</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {steps.map((step, index) => (
          <div key={step} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
            {index === 0 ? <ArrowRight className="mt-0.5 h-5 w-5 text-blue-600" /> : <CheckCircle2 className="mt-0.5 h-5 w-5 text-slate-400" />}
            <span className="text-sm leading-6 text-slate-700">{step}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}