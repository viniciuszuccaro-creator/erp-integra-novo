/**
 * EcosystemPlatformHub v1.0
 * Hub central do ecossistema multi-marketplace integrado
 * Regra-Mãe: w-full, h-full, integração total com 20 passos
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, RefreshCw, TrendingUp } from 'lucide-react';
import MarketplaceConnectors from './MarketplaceConnectors';
import SyncDashboard from './SyncDashboard';

export default function EcosystemPlatformHub() {
  const [activeTab, setActiveTab] = useState('conectores');

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-green-900">
      {/* Header Premium */}
      <div className="bg-white/10 backdrop-blur border-b border-white/20 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Globe className="w-8 h-8 text-green-300" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Ecosystem Platform</h1>
              <p className="text-sm text-slate-300">Multi-Marketplace · Sincronização · Inteligência</p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-slate-300">Marketplaces Ativos</p>
            <p className="text-2xl font-bold text-green-300">4/4</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/10 backdrop-blur h-auto p-0">
            {[
              { value: 'conectores', label: 'Conectores', icon: Globe },
              { value: 'sync', label: 'Sincronização', icon: RefreshCw },
              { value: 'insights', label: 'Insights', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-green-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Conectores */}
          <TabsContent value="conectores" className="flex-1 m-0">
            <MarketplaceConnectors />
          </TabsContent>

          {/* Sincronização */}
          <TabsContent value="sync" className="flex-1 m-0">
            <SyncDashboard />
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="flex-1 m-0 p-6 overflow-auto">
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Volume Vendas', value: 'R$ 487k', icon: '📊' },
                  { label: 'Ticket Médio', value: 'R$ 234', icon: '💰' },
                  { label: 'Taxa Conversão', value: '8.7%', icon: '📈' },
                  { label: 'Estoque Crítico', value: '12 SKUs', icon: '⚠️' },
                ].map((insight, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-white/10 border border-white/20">
                    <p className="text-2xl mb-1">{insight.icon}</p>
                    <p className="text-xs text-slate-300 mb-1">{insight.label}</p>
                    <p className="text-2xl font-bold text-green-300">{insight.value}</p>
                  </div>
                ))}
              </div>

              <div className="p-6 rounded-lg bg-white/10 border border-white/20">
                <h3 className="font-bold text-white mb-3">Recomendações do Ecosystem</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>✅ Sincronizar estoque de SKU-001 na Shopee (estoque baixo crítico)</li>
                  <li>✅ Aumentar estoque em Mercado Livre (demanda +40% este mês)</li>
                  <li>✅ Revisar preços no Alibaba (competidores 15% abaixo)</li>
                  <li>✅ Ativar promoção na Amazon (conversão abaixo da média)</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}