import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import usePermissions from '@/components/lib/usePermissions';
import { Zap, AlertTriangle, Activity, Cpu } from 'lucide-react';
import MachineFloorMap from './MachineFloorMap';
import SensorDashboard from '../iot/SensorDashboard';
import AlertasIoT from '../iot/AlertasIoT';
import MachineMonitor from './MachineMonitor';

export default function DigitalTwinHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('mapa');
  const [selectedMachine, setSelectedMachine] = useState(null);

  const canAccess = hasPermission('Producao', null, 'ver') || hasPermission('Sistema', null, 'ver');

  if (!canAccess) {
    return (
      <Card className="bg-red-900/20 border-red-600 w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-semibold">Acesso Negado</p>
          <p className="text-red-200 text-sm mt-2">Você não tem permissão para acessar o Digital Twin Hub.</p>
        </CardContent>
      </Card>
    );
  }

  const kpis = [
    { label: 'Máquinas Online', valor: '18/20', cor: 'text-emerald-400' },
    { label: 'OEE Média', valor: '87.3%', cor: 'text-blue-400' },
    { label: 'Alertas Ativos', valor: '4', cor: 'text-red-400' },
    { label: 'Sensores', valor: '142', cor: 'text-purple-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-900/40 to-slate-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Cpu className="w-7 h-7 text-cyan-400" />
              Digital Twin & IoT Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">Gêmeos Digitais • Sensores Tempo Real • Previsão de Falhas</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-cyan-900 text-cyan-200">Real-Time</Badge>
            <Badge className="bg-emerald-900 text-emerald-200">IoT Ativo</Badge>
            <Badge className="bg-purple-900 text-purple-200">Preditivo</Badge>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {kpis.map((k, idx) => (
            <div key={idx} className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
              <p className="text-xs text-slate-400">{k.label}</p>
              <p className={`text-lg font-bold ${k.cor}`}>{k.valor}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-b border-slate-700 mb-4">
            <TabsTrigger value="mapa" className="data-[state=active]:bg-cyan-600">
              <Zap className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Mapa</span>
            </TabsTrigger>
            <TabsTrigger value="sensores" className="data-[state=active]:bg-blue-600">
              <Activity className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sensores</span>
            </TabsTrigger>
            <TabsTrigger value="maquina" className="data-[state=active]:bg-purple-600">
              <Cpu className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Máquina</span>
            </TabsTrigger>
            <TabsTrigger value="alertas" className="data-[state=active]:bg-red-600">
              <AlertTriangle className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
          </TabsList>

          <div className="h-full">
            <TabsContent value="mapa" className="h-full m-0">
              <MachineFloorMap onSelectMachine={setSelectedMachine} />
            </TabsContent>
            <TabsContent value="sensores" className="h-full m-0">
              <SensorDashboard />
            </TabsContent>
            <TabsContent value="maquina" className="h-full m-0">
              <MachineMonitor machineId={selectedMachine} />
            </TabsContent>
            <TabsContent value="alertas" className="h-full m-0">
              <AlertasIoT />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}