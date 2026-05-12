import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, PlusCircle } from 'lucide-react';

// Novas ações para completar o plano
const NOVAS_ACOES = [
  {
    categoria: 'HubAtendimento',
    cor: 'cyan',
    itens: [
      { acao: 'Hub omnicanal com chat, WhatsApp e Chatbot integrado', feito: true },
      { acao: 'ChatbotWidget avançado com IA conversacional', feito: true },
      { acao: 'Fila de espera e roteamento inteligente', feito: true },
      { acao: 'SLA monitor com alertas automáticos', feito: true },
      { acao: 'Análise de sentimento por IA', feito: false },
    ]
  },
  {
    categoria: 'Portal do Cliente',
    cor: 'blue',
    itens: [
      { acao: 'Dashboard do cliente com KPIs personalizados', feito: true },
      { acao: 'Aprovação de orçamentos pelo portal', feito: true },
      { acao: 'Rastreamento de entregas em tempo real', feito: true },
      { acao: 'Gamificação com pontos e cashback', feito: true },
      { acao: 'Chat com vendedor integrado', feito: true },
    ]
  },
  {
    categoria: 'DRE e Relatórios Avançados',
    cor: 'emerald',
    itens: [
      { acao: 'DRE Comparativo multiempresa com períodos', feito: true },
      { acao: 'Fluxo de caixa projetado com IA', feito: true },
      { acao: 'Dashboard de inadimplência', feito: true },
      { acao: 'Rentabilidade por cliente e produto', feito: true },
      { acao: 'Relatório de representantes com comissão', feito: true },
    ]
  },
  {
    categoria: 'PWA e Mobile',
    cor: 'violet',
    itens: [
      { acao: 'Service Worker com cache offline completo', feito: true },
      { acao: 'Manifest com ícones e splash para iOS/Android', feito: true },
      { acao: 'Produção Mobile com apontamento touch', feito: true },
      { acao: 'Entregas Mobile para motoristas', feito: true },
      { acao: 'Push notifications via Service Worker', feito: false },
    ]
  },
  {
    categoria: 'Fiscal e SPED',
    cor: 'rose',
    itens: [
      { acao: 'Importação XML NF-e com classificação automática', feito: true },
      { acao: 'SPED Fiscal com geração automática', feito: true },
      { acao: 'Validação fiscal IA pré-emissão', feito: true },
      { acao: 'Motor fiscal inteligente com CFOP automático', feito: true },
      { acao: 'Tabela DIFAL multiestado integrada', feito: true },
    ]
  },
];

const corMap = {
  cyan: 'bg-cyan-100 text-cyan-700',
  blue: 'bg-blue-100 text-blue-700',
  emerald: 'bg-emerald-100 text-emerald-700',
  violet: 'bg-violet-100 text-violet-700',
  rose: 'bg-rose-100 text-rose-700',
};

export default function PlanoMelhoriaRegisterAcoes() {
  const [expandidos, setExpandidos] = useState({});
  const total = NOVAS_ACOES.reduce((s, c) => s + c.itens.length, 0);
  const feitos = NOVAS_ACOES.reduce((s, c) => s + c.itens.filter(i => i.feito).length, 0);
  const pct = Math.round((feitos / total) * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle className="text-xl text-slate-900 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-blue-600" />
            Módulos complementares do plano
          </CardTitle>
          <Badge className="bg-blue-600 text-white text-sm px-3 py-1">
            {feitos}/{total} — {pct}%
          </Badge>
        </div>
        <p className="text-sm text-slate-500">Portal do Cliente, Hub de Atendimento, SPED, PWA e relatórios avançados.</p>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {NOVAS_ACOES.map((cat) => {
            const aberto = expandidos[cat.categoria] !== false;
            const feitosNa = cat.itens.filter(i => i.feito).length;
            return (
              <div key={cat.categoria} className="rounded-xl border border-slate-100 overflow-hidden">
                <button
                  className="w-full flex items-center justify-between gap-3 p-4 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                  onClick={() => setExpandidos(prev => ({ ...prev, [cat.categoria]: !aberto }))}
                >
                  <div className="flex items-center gap-3">
                    <Badge className={corMap[cat.cor]}>{cat.categoria}</Badge>
                    <span className="text-sm font-medium text-slate-700">{feitosNa}/{cat.itens.length} itens</span>
                  </div>
                  {aberto ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                </button>
                {aberto && (
                  <div className="grid gap-1 p-3 bg-white md:grid-cols-2">
                    {cat.itens.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg p-2 hover:bg-slate-50">
                        {item.feito
                          ? <CheckCircle2 className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                          : <Circle className="h-4 w-4 mt-0.5 text-slate-300 shrink-0" />}
                        <span className={`text-sm ${item.feito ? 'text-slate-700' : 'text-slate-400'}`}>{item.acao}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}