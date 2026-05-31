/**
 * DigitalTwinHub v1.0
 * Hub central do Gêmeo Digital 3D da empresa
 * Passo 29: Visualização 3D real-time de toda a operação
 * Regra-Mãe: w-full, h-full, multi-empresa, IA, real-time
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Box, Factory, BarChart3, Map } from 'lucide-react';
import DigitalTwinFloorMap from './DigitalTwinFloorMap';
import DigitalTwinKPIs from './DigitalTwinKPIs';
import DigitalTwinAlerts from './DigitalTwinAlerts';

export default function DigitalTwinHub() {
  const [activeTab, setActiveTab] = useState('floormap');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  const empresas = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-cyan-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Box className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Digital Twin Enterprise</h1>
              <p className="text-sm text-slate-300">Gêmeo Digital 3D • Dados em Tempo Real</p>
            </div>
          </div>

          {/* Seletor de Empresa */}
          <div className="flex gap-2">
            {empresas.map((emp) => (
              <button
                key={emp}
                onClick={() => setEmpresa(emp)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  empresa === emp
                    ? 'bg-cyan-600 text-white'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {emp.replace('Zuccaro ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/5 h-auto p-0 flex-shrink-0">
            {[
              { value: 'floormap', label: 'Planta 3D', icon: Map },
              { value: 'kpis', label: 'KPIs Live', icon: BarChart3 },
              { value: 'alerts', label: 'Alertas', icon: Factory },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="floormap" className="flex-1 m-0 overflow-hidden">
            <DigitalTwinFloorMap empresa={empresa} />
          </TabsContent>
          <TabsContent value="kpis" className="flex-1 m-0 overflow-auto">
            <DigitalTwinKPIs empresa={empresa} />
          </TabsContent>
          <TabsContent value="alerts" className="flex-1 m-0 overflow-auto">
            <DigitalTwinAlerts empresa={empresa} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}