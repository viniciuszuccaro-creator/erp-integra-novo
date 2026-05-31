/**
 * EquipmentMonitoring v1.0
 * Monitoramento em tempo real de equipamentos
 * Passo 27: Visão histórica + real-time + forecasting
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Gauge, TrendingUp, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EQUIPAMENTOS = [
  {
    id: 'CNC-A',
    nome: 'Máquina CNC-A',
    local: 'Produção SP',
    uptime: 99.2,
    temperatura: 67.8,
    vibracoes: 4.2,
    ultimaManutencao: '2026-05-15',
    proximaManutencao: '2026-06-05',
  },
  {
    id: 'CNC-B',
    nome: 'Máquina CNC-B',
    local: 'Produção SP',
    uptime: 97.8,
    temperatura: 72.1,
    vibracoes: 8.9,
    ultimaManutencao: '2026-04-10',
    proximaManutencao: '2026-06-02',
  },
];

export default function EquipmentMonitoring() {
  const [activeTab, setActiveTab] = useState('realtime');

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-800 p-6 overflow-auto">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Activity className="w-6 h-6 text-cyan-400" />
        Equipment Monitoring
      </h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-white/20 bg-transparent h-auto p-0 mb-4">
          {[
            { value: 'realtime', label: 'Real-time' },
            { value: 'historico', label: 'Histórico' },
            { value: 'forecast', label: 'Forecast 30d' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-cyan-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Real-time */}
        <TabsContent value="realtime" className="flex-1 space-y-3 overflow-y-auto">
          {EQUIPAMENTOS.map((eq) => (
            <Card key={eq.id} className="p-4 bg-white/5 border border-cyan-500/30 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-white">{eq.nome}</p>
                  <p className="text-xs text-slate-400">{eq.local}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Uptime</p>
                  <p className="text-lg font-bold text-green-400">{eq.uptime}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Temperatura</p>
                  <p className="text-xl font-bold text-orange-400">{eq.temperatura}°C</p>
                </div>
                <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Vibração</p>
                  <p className="text-xl font-bold text-amber-400">{eq.vibracoes} mm/s</p>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Histórico */}
        <TabsContent value="historico" className="flex-1 space-y-3 overflow-y-auto">
          {EQUIPAMENTOS.map((eq) => (
            <Card key={eq.id} className="p-4 bg-white/5 border border-purple-500/30 rounded-lg">
              <p className="font-bold text-white mb-3">{eq.nome}</p>
              <div className="space-y-2 text-sm text-slate-300">
                <p>
                  <span className="text-slate-400">Última Manutenção:</span> {eq.ultimaManutencao}
                </p>
                <p>
                  <span className="text-slate-400">Próxima Manutenção:</span> {eq.proximaManutencao}
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  {Math.floor((new Date(eq.proximaManutencao) - new Date()) / (1000 * 60 * 60 * 24))} dias até próxima manutenção programada
                </p>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Forecast */}
        <TabsContent value="forecast" className="flex-1 space-y-3 overflow-y-auto">
          <Card className="p-4 bg-white/5 border border-teal-500/30 rounded-lg">
            <p className="font-bold text-white mb-3">Previsões 30 Dias</p>
            <div className="space-y-2 text-sm text-slate-300">
              <p>📊 Degradação esperada: +8% em média</p>
              <p>⚠️ 2 máquinas podem precisar manutenção em 20 dias</p>
              <p>✓ Confiança das previsões: 94%</p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}