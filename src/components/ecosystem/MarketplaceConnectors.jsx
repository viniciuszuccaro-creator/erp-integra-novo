/**
 * MarketplaceConnectors v1.0
 * Gerenciador de conexões com marketplaces (Shopee, ML, Alibaba, Amazon)
 * Regra-Mãe: multi-marketplace, sincronização em tempo real
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Globe, CheckCircle2, AlertCircle, Zap } from 'lucide-react';

const MARKETPLACES = [
  {
    id: 'shopee',
    nome: 'Shopee',
    icon: '🛍️',
    status: 'conectado',
    lojas: 3,
    pedidos_hoje: 45,
    cor: 'text-red-600',
  },
  {
    id: 'mercado_livre',
    nome: 'Mercado Livre',
    icon: '📦',
    status: 'conectado',
    lojas: 2,
    pedidos_hoje: 32,
    cor: 'text-yellow-600',
  },
  {
    id: 'alibaba',
    nome: 'Alibaba',
    icon: '🌐',
    status: 'desconectado',
    lojas: 0,
    pedidos_hoje: 0,
    cor: 'text-orange-600',
  },
  {
    id: 'amazon',
    nome: 'Amazon',
    icon: '📮',
    status: 'conectado',
    lojas: 1,
    pedidos_hoje: 18,
    cor: 'text-blue-600',
  },
];

export default function MarketplaceConnectors() {
  const [connectors, setConnectors] = useState(MARKETPLACES);
  const [conectando, setConectando] = useState(null);

  const handleConnectMarketplace = async (marketplaceId) => {
    setConectando(marketplaceId);
    // Simular conexão
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setConnectors(
      connectors.map((m) =>
        m.id === marketplaceId ? { ...m, status: 'conectado' } : m
      )
    );
    setConectando(null);
  };

  const conectados = connectors.filter((m) => m.status === 'conectado').length;
  const totalLojas = connectors.reduce((sum, m) => sum + m.lojas, 0);
  const totalPedidos = connectors.reduce((sum, m) => sum + m.pedidos_hoje, 0);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-orange-50 overflow-auto">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <Globe className="w-8 h-8 text-orange-600" />
        Conectores Marketplace
      </h2>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Conectados', value: conectados, total: connectors.length },
          { label: 'Total Lojas', value: totalLojas },
          { label: 'Pedidos Hoje', value: totalPedidos },
        ].map((kpi, idx) => (
          <Card key={idx} className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-xs text-slate-600 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-slate-900">
              {kpi.value}
              {kpi.total && <span className="text-xs text-slate-500"> / {kpi.total}</span>}
            </p>
          </Card>
        ))}
      </div>

      {/* Marketplaces */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">Plataformas Disponíveis</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {connectors.map((marketplace) => (
            <div
              key={marketplace.id}
              className="p-4 rounded-lg border-2 border-slate-200 hover:border-orange-300 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl">{marketplace.icon}</span>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900">{marketplace.nome}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    {marketplace.status === 'conectado' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                        <span className="text-xs text-green-600 font-semibold">Conectado</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-500">Desconectado</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {marketplace.status === 'conectado' && (
                <div className="space-y-1 text-sm mb-4">
                  <div className="flex justify-between text-slate-600">
                    <span>Lojas:</span>
                    <span className="font-semibold text-slate-900">{marketplace.lojas}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Pedidos hoje:</span>
                    <span className="font-semibold text-slate-900">{marketplace.pedidos_hoje}</span>
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleConnectMarketplace(marketplace.id)}
                disabled={conectando === marketplace.id || marketplace.status === 'conectado'}
                className={`w-full text-xs ${
                  marketplace.status === 'conectado'
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }`}
              >
                {conectando === marketplace.id
                  ? 'Conectando...'
                  : marketplace.status === 'conectado'
                  ? '✅ Conectado'
                  : 'Conectar Agora'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}