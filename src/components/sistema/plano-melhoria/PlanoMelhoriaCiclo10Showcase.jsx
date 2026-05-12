import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Sparkles, TrendingUp, Package, MessageCircle, ArrowRight } from 'lucide-react';

export default function PlanoMelhoriaCiclo10Showcase() {
  const ciclos = [
    {
      title: 'IA Generativa Contextual',
      icon: Sparkles,
      color: 'from-blue-500 to-cyan-500',
      desc: 'LLM + RAG com contexto de empresa',
      metrics: ['2.4K req/dia', '94.3% acerto', 'R$ 2.8K/mês'],
    },
    {
      title: 'BI Preditivo 30/60/90',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500',
      desc: 'Forecast de vendas, margem e caixa',
      metrics: ['+12% faturamento', '38.2% margem', '6.8% MAPE'],
    },
    {
      title: 'E-commerce & Marketplace',
      icon: Package,
      color: 'from-orange-500 to-amber-500',
      desc: 'Sync bidirecional com ML, Shopee, Amazon',
      metrics: ['98.2% sync', 'R$ 127K/mês', '2.4K pedidos'],
    },
    {
      title: 'WhatsApp Bot Autônomo',
      icon: MessageCircle,
      color: 'from-green-500 to-teal-500',
      desc: 'NLP para pedidos, rastreamento, suporte',
      metrics: ['932 conversas/dia', '84.7% resolução', '4.6/5 satisfação'],
    },
  ];

  return (
    <div className="w-full space-y-4">
      <div className="text-center space-y-2 mb-6">
        <h2 className="text-3xl font-bold text-slate-900">Ciclo 10 — Inovação Q3 2026</h2>
        <p className="text-slate-600">IA, Preditivo, E-commerce e Automação em Produção</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {ciclos.map((ciclo, i) => {
          const Icon = ciclo.icon;
          return (
            <Card key={i} className="overflow-hidden hover:shadow-lg transition border-slate-200">
              <div className={`bg-gradient-to-r ${ciclo.color} h-2`} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Icon className="w-6 h-6 text-slate-600 mt-1" />
                    <div>
                      <CardTitle className="text-slate-900">{ciclo.title}</CardTitle>
                      <p className="text-xs text-slate-500 mt-1">{ciclo.desc}</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-2">
                  {ciclo.metrics.map((m, j) => (
                    <div key={j} className="text-center p-2 bg-slate-50 rounded-lg">
                      <p className="text-xs font-bold text-slate-900">{m}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA to Ciclo X */}
      <Link to="/CicloX">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-blue-700 text-white cursor-pointer hover:shadow-xl transition">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Explorar Ciclo 10 em Detalhes</h3>
                <p className="text-sm text-blue-100 mt-1">Acesso completo a métricas, logs e configurações</p>
              </div>
              <ArrowRight className="w-6 h-6 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}