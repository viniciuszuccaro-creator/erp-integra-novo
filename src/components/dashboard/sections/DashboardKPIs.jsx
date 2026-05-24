/**
 * Seção KPIs Simplificada
 * 4 métricas principais apenas
 */

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, ShoppingCart, AlertTriangle } from 'lucide-react';

const KPI_CONFIG = [
  {
    id: 'sales_today',
    title: 'Vendas Hoje',
    icon: TrendingUp,
    query: ['dash', 'sales-today'],
    fn: () => ({ value: 0, currency: true }),
  },
  {
    id: 'invoiced',
    title: 'Faturado',
    icon: DollarSign,
    query: ['dash', 'invoiced-today'],
    fn: () => ({ value: 0, currency: true }),
  },
  {
    id: 'pending_orders',
    title: 'Pedidos Pendentes',
    icon: ShoppingCart,
    query: ['dash', 'pending-orders'],
    fn: () => ({ value: 0 }),
  },
  {
    id: 'critical_stock',
    title: 'Estoque Crítico',
    icon: AlertTriangle,
    query: ['dash', 'stock-critical'],
    fn: () => ({ value: 0, color: 'text-red-600' }),
  },
];

export default function DashboardKPIs() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {KPI_CONFIG.map((kpi) => {
        const Icon = kpi.icon;

        return (
          <Card key={kpi.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">
                  {kpi.title}
                </CardTitle>
                <Icon className="w-4 h-4 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">
                {/* Placeholder - integrar com dados reais */}
                —
              </div>
              <p className="text-xs text-slate-500 mt-1">Última atualização: agora</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}