/**
 * Dashboard Simplificado v2.0
 * Reduz de 40+ componentes para 6 seções principais
 * Cada seção em arquivo separado (lazy loaded)
 */

import React, { Suspense, lazy, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

// Lazy load seções
const KPIsSection = lazy(() => import('./sections/DashboardKPIs'));
const SalesSection = lazy(() => import('./sections/DashboardSales'));
const FinanceSection = lazy(() => import('./sections/DashboardFinance'));
const StockSection = lazy(() => import('./sections/DashboardStock'));
const OperationsSection = lazy(() => import('./sections/DashboardOperations'));
const InsightsSection = lazy(() => import('./sections/DashboardInsights'));

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
    </div>
  );
}

export default function DashboardSimplified() {
  const [activeTab, setActiveTab] = useState('kpis');

  // Cache data queries
  const { data: kpis } = useQuery({
    queryKey: ['dash', 'kpis'],
    queryFn: async () => {
      // Retorna apenas: vendas dia, faturamento, pedidos pendentes, estoque crítico
      return {
        sales_today: 0,
        invoiced_today: 0,
        pending_orders: 0,
        critical_stock: 0,
      };
    },
    enabled: activeTab === 'kpis',
  });

  return (
    <div className="w-full h-full min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Visão consolidada em tempo real</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="kpis">KPIs</TabsTrigger>
            <TabsTrigger value="sales">Vendas</TabsTrigger>
            <TabsTrigger value="finance">Financeiro</TabsTrigger>
            <TabsTrigger value="stock">Estoque</TabsTrigger>
            <TabsTrigger value="operations">Operações</TabsTrigger>
            <TabsTrigger value="insights">IA</TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="kpis">
              <Suspense fallback={<LoadingFallback />}>
                <KPIsSection />
              </Suspense>
            </TabsContent>

            <TabsContent value="sales">
              <Suspense fallback={<LoadingFallback />}>
                <SalesSection />
              </Suspense>
            </TabsContent>

            <TabsContent value="finance">
              <Suspense fallback={<LoadingFallback />}>
                <FinanceSection />
              </Suspense>
            </TabsContent>

            <TabsContent value="stock">
              <Suspense fallback={<LoadingFallback />}>
                <StockSection />
              </Suspense>
            </TabsContent>

            <TabsContent value="operations">
              <Suspense fallback={<LoadingFallback />}>
                <OperationsSection />
              </Suspense>
            </TabsContent>

            <TabsContent value="insights">
              <Suspense fallback={<LoadingFallback />}>
                <InsightsSection />
              </Suspense>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}