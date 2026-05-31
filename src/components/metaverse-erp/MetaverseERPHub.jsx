import React, { useState } from 'react';
import { Monitor, Globe, Layers, Cpu, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import usePermissions from '@/components/lib/usePermissions';
import HolographicDashboardPanel from './panels/HolographicDashboardPanel';
import VirtualCollaborationRoomPanel from './panels/VirtualCollaborationRoomPanel';
import ARProductVisualizerPanel from './panels/ARProductVisualizerPanel';
import ImmersiveAnalyticsPanel from './panels/ImmersiveAnalyticsPanel';

export default function MetaverseERPHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('holographic');

  if (!hasPermission('Dashboard', null, 'ver')) {
    return (
      <Card className="border-red-300 bg-red-50 m-4">
        <CardContent className="pt-6 text-red-900">
          Acesso negado: módulo Metaverse ERP requer permissão de Dashboard.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-indigo-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-700 to-indigo-700 text-white p-6 border-b border-violet-600">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg">
              <Globe className="w-6 h-6" />
            </div>
            <h1 className="text-3xl font-bold">Metaverse & Immersive ERP</h1>
          </div>
          <p className="text-violet-200">Ambiente 3D imersivo, XR colaborativo e dashboards holográficos integrados</p>

          <div className="grid grid-cols-4 gap-4 mt-4">
            {[
              { label: 'Usuários Ativos XR', value: '48' },
              { label: 'Salas Virtuais', value: '12' },
              { label: 'Produtos em AR', value: '1.2k' },
              { label: 'Sessões Hoje', value: '234' },
            ].map((kpi) => (
              <div key={kpi.label} className="bg-white/10 rounded-lg p-3">
                <p className="text-xs text-violet-200">{kpi.label}</p>
                <p className="text-2xl font-bold">{kpi.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto bg-white">
        <div className="max-w-7xl mx-auto w-full h-full flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
            <TabsList className="bg-white border-b border-slate-200 rounded-none w-full justify-start px-6 py-0">
              <TabsTrigger value="holographic"><Monitor className="w-4 h-4 mr-2" />Holographic Dashboard</TabsTrigger>
              <TabsTrigger value="collaboration"><Users className="w-4 h-4 mr-2" />Virtual Collaboration</TabsTrigger>
              <TabsTrigger value="ar-products"><Layers className="w-4 h-4 mr-2" />AR Product Visualizer</TabsTrigger>
              <TabsTrigger value="immersive-analytics"><Cpu className="w-4 h-4 mr-2" />Immersive Analytics</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-auto p-6">
              <TabsContent value="holographic" className="w-full h-full"><HolographicDashboardPanel /></TabsContent>
              <TabsContent value="collaboration" className="w-full h-full"><VirtualCollaborationRoomPanel /></TabsContent>
              <TabsContent value="ar-products" className="w-full h-full"><ARProductVisualizerPanel /></TabsContent>
              <TabsContent value="immersive-analytics" className="w-full h-full"><ImmersiveAnalyticsPanel /></TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
}