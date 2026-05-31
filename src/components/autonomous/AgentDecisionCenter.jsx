/**
 * AgentDecisionCenter v1.0
 * Centro de decisões dos agentes autônomos
 * Passo 28: Onde agentes decidem e agem
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const DECISIONS_LOG = [
  {
    tempo: '11:50',
    agente: 'MaintenanceBot-A',
    input: 'Vibração CNC-B > 8mm/s por 3 minutos',
    decisao: 'Parar máquina e agendar manutenção',
    confianca: 96,
    resultado: '✓ Executado',
  },
  {
    tempo: '11:45',
    agente: 'InventoryBot-B',
    input: 'SKU-001 abaixo de mínimo, demanda crescente',
    decisao: 'Gerar OC automática para 500 un',
    confianca: 91,
    resultado: '✓ OC #5847 criada',
  },
  {
    tempo: '11:40',
    agente: 'QualityBot-C',
    input: '12 produtos fora de especificação',
    decisao: 'Rejeitar lote e notificar produção',
    confianca: 99,
    resultado: '✓ Lote rejeitado',
  },
];

const LEARNING_DATA = [
  { modelo: 'Vibração Preditiva', versao: 'v3.4', acuracia: '96.2%', treinos: 12400 },
  { modelo: 'Demand Forecast', versao: 'v2.1', acuracia: '91.7%', treinos: 8700 },
  { modelo: 'Quality Vision', versao: 'v5.0', acuracia: '99.1%', treinos: 34500 },
];

export default function AgentDecisionCenter() {
  const [activeTab, setActiveTab] = useState('decisions');

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-blue-900 p-6 overflow-auto">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        <Brain className="w-6 h-6 text-blue-400" />
        Agent Decision Center
      </h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full rounded-none border-b border-white/20 bg-transparent h-auto p-0 mb-4">
          {[
            { value: 'decisions', label: 'Decisões Recentes' },
            { value: 'learning', label: 'Machine Learning' },
          ].map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Decisões */}
        <TabsContent value="decisions" className="flex-1 space-y-3 overflow-y-auto">
          {DECISIONS_LOG.map((decision, idx) => (
            <Card key={idx} className="p-4 bg-white/5 border border-blue-500/30 rounded-lg">
              <div className="flex items-start gap-4">
                <Brain className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-white">{decision.agente}</p>
                      <p className="text-xs text-slate-400">{decision.tempo}</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300">{decision.confianca}% confiança</Badge>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-white/5 rounded border border-white/10">
                      <p className="text-xs text-slate-400 mb-1">Input do Sensor</p>
                      <p className="text-white">{decision.input}</p>
                    </div>

                    <div className="flex items-center justify-center py-1">
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                    </div>

                    <div className="p-2 bg-white/5 rounded border border-white/10">
                      <p className="text-xs text-slate-400 mb-1">Decisão Tomada</p>
                      <p className="text-white font-semibold">{decision.decisao}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <p className="text-green-400 font-semibold">{decision.resultado}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Machine Learning */}
        <TabsContent value="learning" className="flex-1 space-y-3 overflow-y-auto">
          <div className="p-4 bg-blue-500/10 border border-blue-400/30 rounded-lg mb-3">
            <p className="font-bold text-white mb-1">🧠 Modelos em Produção</p>
            <p className="text-sm text-slate-300">Os agentes aprendem continuamente com cada decisão tomada.</p>
          </div>
          {LEARNING_DATA.map((model, idx) => (
            <Card key={idx} className="p-4 bg-white/5 border border-blue-500/30 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-bold text-white">{model.modelo}</p>
                  <p className="text-xs text-slate-400">Versão {model.versao}</p>
                </div>
                <p className="text-2xl font-bold text-green-400">{model.acuracia}</p>
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <span>📊 {model.treinos.toLocaleString('pt-BR')} amostras treinadas</span>
              </div>
              <div className="mt-2 h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-green-500"
                  style={{ width: model.acuracia }}
                />
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}