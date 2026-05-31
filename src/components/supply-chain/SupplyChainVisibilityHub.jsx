/**
 * SupplyChainVisibilityHub v1.0
 * Supply Chain Visibility 360° + Blockchain
 * Passo 34: Rastreamento total, previsões, otimizações autônomas
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Globe, Link2, Lock, Zap, TrendingUp } from 'lucide-react';
import SupplierNetworkMap from './SupplierNetworkMap';
import BlockchainAuditTrail from './BlockchainAuditTrail';
import SupplyChainAIOptimizer from './SupplyChainAIOptimizer';

export default function SupplyChainVisibilityHub() {
  const [activeTab, setActiveTab] = useState('network');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  const empresas = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-cyan-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Globe className="w-8 h-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Supply Chain Visibility Hub</h1>
              <p className="text-sm text-slate-300">360° • Blockchain Audit • Otimização IA</p>
            </div>
          </div>
          <div className="flex gap-2">
            {empresas.map((emp) => (
              <button
                key={emp}
                onClick={() => setEmpresa(emp)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  empresa === emp ? 'bg-cyan-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {emp.replace('Zuccaro ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/5 h-auto p-0 flex-shrink-0">
            {[
              { value: 'network', label: 'Rede Fornecedores', icon: Globe },
              { value: 'blockchain', label: 'Audit Trail', icon: Lock },
              { value: 'optimizer', label: 'IA Otimização', icon: TrendingUp },
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

          <TabsContent value="network" className="flex-1 m-0 overflow-auto">
            <SupplierNetworkMap empresa={empresa} />
          </TabsContent>
          <TabsContent value="blockchain" className="flex-1 m-0 overflow-auto">
            <BlockchainAuditTrail empresa={empresa} />
          </TabsContent>
          <TabsContent value="optimizer" className="flex-1 m-0 overflow-auto">
            <SupplyChainAIOptimizer empresa={empresa} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}