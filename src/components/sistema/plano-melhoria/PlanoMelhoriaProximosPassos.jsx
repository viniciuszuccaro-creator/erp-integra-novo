import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Rocket, Sparkles, Zap, ShieldCheck, Bot, BarChart3, Smartphone, Globe } from 'lucide-react';

const PROXIMOS = [
  {
    titulo: 'Ciclo 4 — IA Preditiva Avançada',
    prazo: 'Q3 2026',
    icon: Bot,
    cor: 'purple',
    acoes: [
      'IA de previsão de demanda por SKU e região',
      'Score de saúde financeira preditivo (cliente)',
      'NLP para análise de sentimento no atendimento',
      'Recomendação de cross-sell baseada em histórico',
    ]
  },
  {
    titulo: 'Ciclo 5 — Integrações Externas',
    prazo: 'Q3 2026',
    icon: Globe,
    cor: 'cyan',
    acoes: [
      'Integração nativa Mercado Livre / Shopee / Amazon',
      'ERP integrado com ERP de clientes (EDI)',
      'Open Banking com extrato automático',
      'Integração com Sintegra e IBGE para impostos',
    ]
  },
  {
    titulo: 'Ciclo 6 — Mobile Nativo',
    prazo: 'Q4 2026',
    icon: Smartphone,
    cor: 'violet',
    acoes: [
      'App iOS/Android nativo via Capacitor',
      'Biometria para login e aprovações',
      'Câmera para leitura de NF-e e etiquetas',
      'Push notifications com ações rápidas',
    ]
  },
  {
    titulo: 'Ciclo 7 — Analytics Executivo',
    prazo: 'Q4 2026',
    icon: BarChart3,
    cor: 'blue',
    acoes: [
      'BI embarcado com drill-down por empresa/grupo',
      'Relatórios personalizados com IA gerativa',
      'Forecast de vendas e margem por período',
      'Dashboard de governança com score ESG',
    ]
  },
  {
    titulo: 'Regra-Mãe Permanente',
    prazo: 'Contínuo',
    icon: Rocket,
    cor: 'emerald',
    acoes: [
      'Ciclos mensais: medir → gap → executar → validar',
      'Backlog vivo atualizado por módulo',
      'Revisão de riscos a cada sprint',
      'Sem apagar — sempre melhorar, integrar e inovar',
    ]
  },
];

const corMap = {
  purple: { bg: 'bg-purple-50', border: 'border-purple-100', badge: 'bg-purple-100 text-purple-700', icon: 'bg-purple-600' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-100', badge: 'bg-cyan-100 text-cyan-700', icon: 'bg-cyan-600' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-100', badge: 'bg-violet-100 text-violet-700', icon: 'bg-violet-600' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-100', badge: 'bg-blue-100 text-blue-700', icon: 'bg-blue-600' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700', icon: 'bg-emerald-600' },
};

export default function PlanoMelhoriaProximosPassos() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Próximos ciclos de inovação</CardTitle>
              <p className="text-sm text-slate-500">Roadmap de evolução sem apagar funcionalidades existentes.</p>
            </div>
          </div>
          <Badge className="bg-blue-600 text-white">Roadmap 2026</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PROXIMOS.map((ciclo) => {
            const Icon = ciclo.icon;
            const c = corMap[ciclo.cor];
            return (
              <div key={ciclo.titulo} className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.icon} text-white`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-sm">{ciclo.titulo}</p>
                    <Badge className={`text-xs mt-0.5 ${c.badge}`}>{ciclo.prazo}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {ciclo.acoes.map((acao) => (
                    <div key={acao} className="flex items-start gap-2">
                      <ArrowRight className="h-3.5 w-3.5 text-slate-400 mt-0.5 shrink-0" />
                      <span className="text-xs text-slate-600 leading-4">{acao}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}