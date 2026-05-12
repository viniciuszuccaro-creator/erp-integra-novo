import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ShoppingCart, Zap } from 'lucide-react';

export default function CicloXMarketplacePanel() {
  const [selected, setSelected] = useState('all');

  const channels = [
    { name: 'Mercado Livre', status: '✅ Ativo', sync: '98.2%', orders: '1.2K' },
    { name: 'Shopee', status: '✅ Ativo', sync: '95.7%', orders: '847' },
    { name: 'Amazon', status: '🔄 Em testes', sync: '89.3%', orders: '423' },
  ];

  return (
    <Card className="w-full h-full bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-6 h-6 text-orange-600" />
            <CardTitle>E-commerce & Marketplace Sync</CardTitle>
          </div>
          <Badge className="bg-orange-600">2/3 Ativos</Badge>
        </div>
        <p className="text-sm text-slate-600 mt-2">Sincronização bidirecional com Mercado Livre, Shopee & Amazon</p>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-4">
        {/* Channel Status */}
        <div className="space-y-2">
          {channels.map((ch, i) => (
            <div key={i} className="bg-white p-3 rounded-lg border border-orange-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-slate-900">{ch.name}</h4>
                <Badge variant={ch.status.includes('✅') ? 'default' : 'outline'} className="text-xs">
                  {ch.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-slate-500">Taxa sync</p>
                  <p className="font-semibold text-slate-900">{ch.sync}</p>
                </div>
                <div>
                  <p className="text-slate-500">Pedidos/mês</p>
                  <p className="font-semibold text-slate-900">{ch.orders}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features */}
        <div className="bg-white p-3 rounded-lg border border-orange-100">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Sincronizações automáticas
          </h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>✓ Produtos: estoque, preço, descrição (a cada 2h)</li>
            <li>✓ Pedidos: baixa automática no ERP (real-time)</li>
            <li>✓ Devoluções: integração com logística reversa</li>
            <li>✓ Avaliações: capturadas para CRM & BI</li>
            <li>✓ Relatórios: faturamento consolidado diário</li>
          </ul>
        </div>

        {/* Impacto */}
        <div className="bg-white p-3 rounded-lg border border-orange-100">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-orange-600" />
            Impacto mensal
          </h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <p className="text-slate-500">Faturamento</p>
              <p className="font-bold text-orange-600">R$ 127K</p>
            </div>
            <div>
              <p className="text-slate-500">% do total</p>
              <p className="font-bold text-orange-600">28.4%</p>
            </div>
          </div>
        </div>

        {/* Endpoint */}
        <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono">
          <p className="text-slate-400">POST /functions/marketplaceSync</p>
          <p className="mt-1 text-yellow-400">⏳ Testes em andamento para Amazon</p>
        </div>
      </CardContent>
    </Card>
  );
}