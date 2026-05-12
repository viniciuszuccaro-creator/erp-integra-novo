import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CicloXIAGenerativaPanel from '@/components/sistema/ciclo-10/CicloX_IAGenerativaPanel';
import CicloXBIForecastDashboard from '@/components/sistema/ciclo-10/CicloXBIForecastDashboard';
import CicloXMarketplacePanel from '@/components/sistema/ciclo-10/CicloXMarketplacePanel';
import CicloXWhatsAppBotPanel from '@/components/sistema/ciclo-10/CicloXWhatsAppBotPanel';
import { Sparkles, TrendingUp, Package, MessageCircle } from 'lucide-react';

export default function CicloX() {
  return (
    <div className="w-full h-full space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-slate-900">Ciclo 10 — Inovação Q3 2026</h1>
        <p className="text-lg text-slate-600">IA Generativa • BI Preditivo • E-commerce • Bot WhatsApp</p>
      </div>

      {/* Grid de painéis */}
      <div className="grid w-full gap-6 grid-cols-1 xl:grid-cols-2">
        {/* IA Generativa */}
        <div className="xl:col-span-1">
          <CicloXIAGenerativaPanel />
        </div>

        {/* BI Forecast */}
        <div className="xl:col-span-1">
          <CicloXBIForecastDashboard />
        </div>

        {/* Marketplace */}
        <div className="xl:col-span-1">
          <CicloXMarketplacePanel />
        </div>

        {/* WhatsApp Bot */}
        <div className="xl:col-span-1">
          <CicloXWhatsAppBotPanel />
        </div>
      </div>

      {/* Resumo de objetivos */}
      <Card className="w-full bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle>Objetivos do Ciclo 10</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <Sparkles className="w-5 h-5 text-blue-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">IA Generativa Contextual</h3>
                <p className="text-sm text-slate-600">LLM + RAG com contexto de empresa e histórico real</p>
              </div>
            </div>
            <div className="flex gap-3">
              <TrendingUp className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">BI Preditivo 30/60/90 dias</h3>
                <p className="text-sm text-slate-600">Forecast de vendas, margem e caixa com confiança</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Package className="w-5 h-5 text-orange-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">Integração Marketplace</h3>
                <p className="text-sm text-slate-600">Sincronização bidirecional com Mercado Livre, Amazon e Shopee</p>
              </div>
            </div>
            <div className="flex gap-3">
              <MessageCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-slate-900">WhatsApp Bot Autônomo</h3>
                <p className="text-sm text-slate-600">NLP para pedidos, rastreamento, boletos e suporte</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <Card className="w-full border-slate-200">
        <CardHeader>
          <CardTitle>Status da Implementação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>IA Generativa Contextual</span>
            <span className="font-semibold text-blue-600">✅ Backend Ready</span>
          </div>
          <div className="flex justify-between">
            <span>BI Forecast Preditivo</span>
            <span className="font-semibold text-green-600">✅ Backend Ready</span>
          </div>
          <div className="flex justify-between">
            <span>Marketplace Sync</span>
            <span className="font-semibold text-orange-600">🔄 API Integration Pending</span>
          </div>
          <div className="flex justify-between">
            <span>WhatsApp Bot</span>
            <span className="font-semibold text-green-600">✅ NLP Ready</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}