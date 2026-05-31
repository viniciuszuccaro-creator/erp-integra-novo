import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Package, Truck, Map, Zap } from 'lucide-react';
import SupplierNetworkAnalyzer from './SupplierNetworkAnalyzer';
import TransportationFleetOptimizer from './TransportationFleetOptimizer';
import RealTimeTrackingMap from './RealTimeTrackingMap';
import RoutingAIOptimizer from './RoutingAIOptimizer';
import ComplianceAndRiskPanel from './ComplianceAndRiskPanel';
import usePermissions from '@/components/lib/usePermissions';

export default function SupplyChainIntelligenceHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('suppliers');

  // Verificar permissões (apenas Compras/Logística)
  if (!hasPermission('Compras', null, 'ver') && !hasPermission('Expedição', null, 'ver')) {
    return (
      <div className="p-10 text-center text-slate-600">
        Acesso negado. Apenas Compras e Logística podem acessar este hub.
      </div>
    );
  }

  const tabs = [
    { id: 'suppliers', label: 'Rede de Fornecedores', icon: Package },
    { id: 'transportation', label: 'Frota e Transportadoras', icon: Truck },
    { id: 'tracking', label: 'Rastreamento Tempo Real', icon: Map },
    { id: 'routing', label: 'Otimização de Rotas (IA)', icon: Zap },
    { id: 'compliance', label: 'Conformidade & Riscos', icon: AlertCircle },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-cyan-400" />
              Supply Chain Intelligence
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Inteligência de cadeia de suprimentos em tempo real com IA autônoma
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-cyan-900 text-cyan-100 border border-cyan-600">
              Multi-Empresa
            </Badge>
            <Badge className="bg-green-900 text-green-100 border border-green-600">
              IA Ativa
            </Badge>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="px-6 py-3 bg-slate-800/30 border-b border-slate-700 grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Fornecedores Ativos</p>
            <p className="text-lg font-bold text-cyan-400">324</p>
            <p className="text-xs text-green-400">↑ 8 novos</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Frota Operacional</p>
            <p className="text-lg font-bold text-cyan-400">156</p>
            <p className="text-xs text-green-400">91% utilização</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Entregas em Trânsito</p>
            <p className="text-lg font-bold text-cyan-400">487</p>
            <p className="text-xs text-yellow-400">5 atrasadas</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Economia IA (Mês)</p>
            <p className="text-lg font-bold text-green-400">R$ 89k</p>
            <p className="text-xs text-green-400">12% otimização</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Score de Risco</p>
            <p className="text-lg font-bold text-cyan-400">7.2/10</p>
            <p className="text-xs text-orange-400">↓ Controlado</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-6 py-3 border-b border-slate-700 bg-slate-800/20">
            <TabsList className="bg-slate-800 border border-slate-700">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-cyan-900 data-[state=active]:text-cyan-100 text-slate-400 flex items-center gap-1"
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="suppliers" className="p-6 h-full">
              <SupplierNetworkAnalyzer />
            </TabsContent>

            <TabsContent value="transportation" className="p-6 h-full">
              <TransportationFleetOptimizer />
            </TabsContent>

            <TabsContent value="tracking" className="p-6 h-full">
              <RealTimeTrackingMap />
            </TabsContent>

            <TabsContent value="routing" className="p-6 h-full">
              <RoutingAIOptimizer />
            </TabsContent>

            <TabsContent value="compliance" className="p-6 h-full">
              <ComplianceAndRiskPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}