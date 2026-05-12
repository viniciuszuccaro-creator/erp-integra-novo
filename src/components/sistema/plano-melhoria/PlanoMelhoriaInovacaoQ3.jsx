import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Brain, Globe, Zap, Bot, BarChart3, MessageCircle, Smartphone, ShieldCheck, Cpu } from 'lucide-react';

const INOVACOES = [
  {
    icone: Brain,
    titulo: 'IA Generativa Contextual',
    descricao: 'Assistente IA por módulo com conhecimento do ERP — sugere ações, detecta anomalias e gera relatórios em linguagem natural.',
    modulos: ['Financeiro', 'CRM', 'Estoque'],
    prazo: 'Q3 2026',
    cor: 'from-purple-600 to-indigo-500',
    bg: 'from-purple-50 to-indigo-50',
    border: 'border-purple-100',
  },
  {
    icone: BarChart3,
    titulo: 'Business Intelligence Preditivo',
    descricao: 'Dashboards com ML real: previsão de vendas por sazonalidade, projeção de fluxo de caixa e forecast de estoque por 90 dias.',
    modulos: ['Dashboard', 'Financeiro', 'Estoque'],
    prazo: 'Q3 2026',
    cor: 'from-blue-600 to-cyan-500',
    bg: 'from-blue-50 to-cyan-50',
    border: 'border-blue-100',
  },
  {
    icone: Globe,
    titulo: 'E-commerce e Marketplace 360°',
    descricao: 'Sincronização bidirecional com Mercado Livre, Amazon, Shopee e site próprio. Gestão unificada de estoque e pedidos.',
    modulos: ['Estoque', 'Comercial', 'Fiscal'],
    prazo: 'Q3 2026',
    cor: 'from-emerald-600 to-teal-500',
    bg: 'from-emerald-50 to-teal-50',
    border: 'border-emerald-100',
  },
  {
    icone: MessageCircle,
    titulo: 'Omnichannel Total com WhatsApp IA',
    descricao: 'Bot conversacional com NLP avançado: pedidos, status de entrega, boletos e suporte — tudo por WhatsApp sem intervenção humana.',
    modulos: ['Hub Atendimento', 'Comercial', 'Expedição'],
    prazo: 'Q3 2026',
    cor: 'from-green-600 to-emerald-500',
    bg: 'from-green-50 to-emerald-50',
    border: 'border-green-100',
  },
  {
    icone: Smartphone,
    titulo: 'App Mobile Nativo (PWA+)',
    descricao: 'PWA avançado com offline-first, biometria, notificações push, câmera para QR/comprovantes e GPS para entregas.',
    modulos: ['Expedição', 'Produção', 'RH'],
    prazo: 'Q4 2026',
    cor: 'from-amber-500 to-orange-500',
    bg: 'from-amber-50 to-orange-50',
    border: 'border-amber-100',
  },
  {
    icone: ShieldCheck,
    titulo: 'Zero Trust + MFA Total',
    descricao: 'Autenticação multifator em todas as ações críticas, Zero Trust por módulo e sessões com timeout por inatividade.',
    modulos: ['Sistema', 'Financeiro', 'Fiscal'],
    prazo: 'Q4 2026',
    cor: 'from-rose-600 to-red-500',
    bg: 'from-rose-50 to-red-50',
    border: 'border-rose-100',
  },
  {
    icone: Cpu,
    titulo: 'Digital Twin e Simulação 3D',
    descricao: 'Gêmeo digital do processo produtivo com simulação de ordens, cortes e eficiência antes de executar na fábrica.',
    modulos: ['Produção', 'Estoque'],
    prazo: 'Q4 2026',
    cor: 'from-violet-600 to-fuchsia-500',
    bg: 'from-violet-50 to-fuchsia-50',
    border: 'border-violet-100',
  },
  {
    icone: Zap,
    titulo: 'Automação Total de Processos (RPA)',
    descricao: 'Robôs de software para conciliação bancária automática, emissão de NF-e em lote, folha de pagamento e reposição de estoque.',
    modulos: ['Financeiro', 'Fiscal', 'Estoque', 'RH'],
    prazo: 'Q4 2026',
    cor: 'from-cyan-600 to-sky-500',
    bg: 'from-cyan-50 to-sky-50',
    border: 'border-cyan-100',
  },
];

export default function PlanoMelhoriaInovacaoQ3() {
  return (
    <Card className="w-full border-violet-100 bg-gradient-to-br from-slate-50 to-violet-50/30">
      <CardHeader>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
            <Sparkles className="h-5 w-5 text-violet-600" />
            Inovações futuristas — Q3/Q4 2026
          </CardTitle>
          <div className="flex gap-2">
            <Badge className="bg-violet-100 text-violet-700">8 iniciativas</Badge>
            <Badge className="bg-blue-100 text-blue-700">Melhoria contínua</Badge>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          Próxima camada de evolução do ERP — IA generativa, automação total, omnichannel e expansão digital.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {INOVACOES.map((item) => {
            const Icon = item.icone;
            return (
              <div key={item.titulo} className={`rounded-2xl border ${item.border} bg-gradient-to-br ${item.bg} p-5 flex flex-col gap-3`}>
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${item.cor} text-white shadow-md`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 leading-5">{item.titulo}</p>
                  <p className="text-xs text-slate-500 mt-1.5 leading-5">{item.descricao}</p>
                </div>
                <div className="mt-auto pt-2 border-t border-white/60 flex items-center justify-between flex-wrap gap-1">
                  <Badge className="bg-white/80 text-slate-700 border border-white text-xs">{item.prazo}</Badge>
                  <div className="flex flex-wrap gap-1">
                    {item.modulos.slice(0, 2).map(m => (
                      <Badge key={m} className="bg-white/60 text-slate-600 text-xs border border-white/40">{m}</Badge>
                    ))}
                    {item.modulos.length > 2 && <Badge className="bg-white/60 text-slate-500 text-xs">+{item.modulos.length - 2}</Badge>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Compromisso */}
        <div className="mt-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-5 text-white">
          <div className="flex items-start gap-3">
            <Bot className="h-7 w-7 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Compromisso permanente da Regra-Mãe</p>
              <p className="text-sm text-slate-300 mt-1 leading-6">
                Cada inovação será implementada respeitando os pilares: nunca apagar funcionalidades existentes, 
                multiempresa em tudo, controle de acesso granular, auditoria completa e UX responsiva w-full/h-full. 
                Inovar sem destruir — expandir sem comprometer.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}