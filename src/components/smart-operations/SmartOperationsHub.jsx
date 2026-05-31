import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import usePermissions from '@/components/lib/usePermissions';
import { Factory, Wrench, ShieldCheck, BarChart3 } from 'lucide-react';
import ProductionRealtime from './ProductionRealtime';
import PredictiveMaintenancePanel from './PredictiveMaintenancePanel';
import QualityControlPanel from './QualityControlPanel';
import OperationsKPIPanel from './OperationsKPIPanel';

export default function SmartOperationsHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('producao');

  const canAccess = hasPermission('Producao', null, 'ver') || hasPermission('Estoque', null, 'ver');

  if (!canAccess) {
    return (
      <Card className="bg-red-900/20 border-red-600 w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-semibold">Acesso Negado</p>
          <p className="text-red-200 text-sm mt-2">Você não tem permissão para acessar o Smart Operations Hub.</p>
        </CardContent>
      </Card>
    );
  }

  const kpis = [
    { label: 'OEE Médio', valor: '83%', cor: 'text-blue-400' },
    { label: 'Linhas Ativas', valor: '3/5', cor: 'text-emerald-400' },
    { label: 'Ativos em Risco', valor: '2', cor: 'text-red-400' },
    { label: 'Taxa Aprovação', valor: '96.2%', cor: 'text-purple-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Factory className="w-7 h-7 text-blue-400" />
              Smart Operations Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">Produção em Tempo Real • Manutenção Preditiva • Qualidade SPC • KPIs</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-900 text-emerald-200">Multi-Empresa</Badge>
            <Badge className="bg-blue-900 text-blue-200">IA Ativa</Badge>
          </div>
        </div>

        {/* KPIs Header */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
              <p className="text-xs text-slate-400">{kpi.label}</p>
              <p className={`text-lg font-bold ${kpi.cor}`}>{kpi.valor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-b border-slate-700 mb-4">
            <TabsTrigger value="producao" className="data-[state=active]:bg-blue-600">
              <Factory className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Produção</span>
            </TabsTrigger>
            <TabsTrigger value="manutencao" className="data-[state=active]:bg-yellow-600">
              <Wrench className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Manutenção</span>
            </TabsTrigger>
            <TabsTrigger value="qualidade" className="data-[state=active]:bg-emerald-600">
              <ShieldCheck className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Qualidade</span>
            </TabsTrigger>
            <TabsTrigger value="kpis" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">KPIs</span>
            </TabsTrigger>
          </TabsList>

          <div className="h-full">
            <TabsContent value="producao" className="h-full m-0">
              <ProductionRealtime />
            </TabsContent>
            <TabsContent value="manutencao" className="h-full m-0">
              <PredictiveMaintenancePanel />
            </TabsContent>
            <TabsContent value="qualidade" className="h-full m-0">
              <QualityControlPanel />
            </TabsContent>
            <TabsContent value="kpis" className="h-full m-0">
              <OperationsKPIPanel />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}