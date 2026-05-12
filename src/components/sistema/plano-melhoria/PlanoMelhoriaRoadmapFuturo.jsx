import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Bot, Globe, Smartphone, BarChart3, Rocket, Cpu, ShieldCheck, Zap } from 'lucide-react';

const ROADMAP = [
  {
    titulo: 'Ciclo 4 — IA Preditiva Avançada',
    prazo: 'Q3 2026', icon: Bot, cor: 'purple',
    status: 'Planejado',
    acoes: [
      'IA de previsão de demanda por SKU e região com horizon 30/60/90d',
      'Score preditivo de saúde financeira do cliente (risco de inadimplência)',
      'NLP para análise de sentimento no atendimento e tickets',
      'Recomendação de cross-sell/upsell baseada em histórico de compras',
    ]
  },
  {
    titulo: 'Ciclo 5 — Integrações Externas Nativas',
    prazo: 'Q3 2026', icon: Globe, cor: 'cyan',
    status: 'Planejado',
    acoes: [
      'Integração nativa com Mercado Livre, Shopee e Amazon via API',
      'EDI para integração com ERPs de clientes e fornecedores',
      'Open Banking com extrato automático e conciliação IA',
      'Sintegra + IBGE + Receita Federal automático na abertura fiscal',
    ]
  },
  {
    titulo: 'Ciclo 6 — Mobile Nativo (iOS/Android)',
    prazo: 'Q4 2026', icon: Smartphone, cor: 'violet',
    status: 'Planejado',
    acoes: [
      'App iOS/Android nativo via Capacitor com todas as funcionalidades',
      'Biometria nativa para login, aprovações e assinatura digital',
      'Câmera para leitura de NF-e, QR codes e etiquetas de estoque',
      'Push notifications com ações rápidas (aprovar pedido, ver entrega)',
    ]
  },
  {
    titulo: 'Ciclo 7 — BI Executivo Embarcado',
    prazo: 'Q4 2026', icon: BarChart3, cor: 'blue',
    status: 'Planejado',
    acoes: [
      'BI com drill-down completo por empresa, grupo, período e produto',
      'Relatórios personalizados gerados por IA gerativa via prompt',
      'Forecast de vendas, margem e caixa por período e cenário',
      'Dashboard de governança ESG com score e relatório automático',
    ]
  },
  {
    titulo: 'Ciclo 8 — Segurança Avançada',
    prazo: 'Q1 2027', icon: ShieldCheck, cor: 'rose',
    status: 'Futuro',
    acoes: [
      'MFA por TOTP + biometria em ações críticas (pagamento, NF-e)',
      'Zero Trust: verificação contínua por sessão e IP',
      'SOC 2 / ISO 27001 roadmap com evidências automatizadas',
      'Pentest automatizado mensal com relatório de vulnerabilidades',
    ]
  },
  {
    titulo: 'Ciclo 9 — IA Autônoma e Agentes',
    prazo: 'Q2 2027', icon: Cpu, cor: 'indigo',
    status: 'Futuro',
    acoes: [
      'Agentes autônomos para fechamento automático de pedidos',
      'IA que cria OCs automaticamente ao atingir ponto de reposição',
      'Assistente executivo com memória de contexto por empresa',
      'Automação de onboarding de cliente via IA e workflows',
    ]
  },
  {
    titulo: 'Regra-Mãe — Permanente',
    prazo: 'Contínuo', icon: Rocket, cor: 'emerald',
    status: 'Ativo',
    acoes: [
      'Ciclos mensais: medir → identificar gap → executar → validar',
      'Backlog vivo atualizado por módulo com prioridade inteligente',
      'Revisão de riscos, SoD e RBAC a cada sprint',
      'Nunca apagar — sempre melhorar, integrar, inovar e ramificar',
    ]
  },
];

const corMap = {
  purple: { bg: 'bg-purple-50', border: 'border-purple-100', badge: 'bg-purple-100 text-purple-700', icon: 'bg-purple-600', text: 'text-purple-700' },
  cyan: { bg: 'bg-cyan-50', border: 'border-cyan-100', badge: 'bg-cyan-100 text-cyan-700', icon: 'bg-cyan-600', text: 'text-cyan-700' },
  violet: { bg: 'bg-violet-50', border: 'border-violet-100', badge: 'bg-violet-100 text-violet-700', icon: 'bg-violet-600', text: 'text-violet-700' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-100', badge: 'bg-blue-100 text-blue-700', icon: 'bg-blue-600', text: 'text-blue-700' },
  emerald: { bg: 'bg-emerald-50', border: 'border-emerald-100', badge: 'bg-emerald-100 text-emerald-700', icon: 'bg-emerald-600', text: 'text-emerald-700' },
  rose: { bg: 'bg-rose-50', border: 'border-rose-100', badge: 'bg-rose-100 text-rose-700', icon: 'bg-rose-600', text: 'text-rose-700' },
  indigo: { bg: 'bg-indigo-50', border: 'border-indigo-100', badge: 'bg-indigo-100 text-indigo-700', icon: 'bg-indigo-600', text: 'text-indigo-700' },
};

const statusBadge = {
  Ativo: 'bg-emerald-600 text-white',
  Planejado: 'bg-blue-100 text-blue-700',
  Futuro: 'bg-slate-100 text-slate-600',
};

export default function PlanoMelhoriaRoadmapFuturo() {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <Rocket className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-xl text-slate-900">Roadmap de inovação 2026–2027</CardTitle>
              <p className="text-sm text-slate-500">Próximos ciclos sem apagar funcionalidades existentes.</p>
            </div>
          </div>
          <Badge className="bg-blue-600 text-white">Roadmap {new Date().getFullYear()}-{new Date().getFullYear()+1}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {ROADMAP.map((ciclo) => {
            const Icon = ciclo.icon;
            const c = corMap[ciclo.cor];
            return (
              <div key={ciclo.titulo} className={`rounded-2xl border ${c.border} ${c.bg} p-5`}>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${c.icon} text-white shrink-0`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-900 text-sm leading-4">{ciclo.titulo}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge className={`text-xs ${c.badge}`}>{ciclo.prazo}</Badge>
                      <Badge className={`text-xs ${statusBadge[ciclo.status] || ''}`}>{ciclo.status}</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {ciclo.acoes.map((acao) => (
                    <div key={acao} className="flex items-start gap-2">
                      <ArrowRight className="h-3 w-3 text-slate-400 mt-0.5 shrink-0" />
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