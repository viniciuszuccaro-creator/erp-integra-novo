/**
 * BlockchainAuditHub v1.0
 * Hub de Auditoria Blockchain + Ledger Imutável
 * Passo 34: Conformidade total + Hash chain validation
 * Regra-Mãe: w-full, h-full, multi-empresa, IA, real-time
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, Lock, CheckCircle2 } from 'lucide-react';
import ImmutableLedger from './ImmutableLedger';
import AuditChainValidator from './AuditChainValidator';
import ComplianceReports from './ComplianceReports';

export default function BlockchainAuditHub() {
  const [activeTab, setActiveTab] = useState('ledger');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  const empresas = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-emerald-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Blockchain Audit Trail</h1>
              <p className="text-sm text-slate-300">Ledger Imutável • Hash Chain • Conformidade 100%</p>
            </div>
          </div>
          <div className="flex gap-2">
            {empresas.map((emp) => (
              <button
                key={emp}
                onClick={() => setEmpresa(emp)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  empresa === emp ? 'bg-emerald-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
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
              { value: 'ledger', label: 'Ledger Imutável', icon: Lock },
              { value: 'validation', label: 'Validação', icon: CheckCircle2 },
              { value: 'compliance', label: 'Conformidade', icon: Shield },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="ledger" className="flex-1 m-0 overflow-auto">
            <ImmutableLedger empresa={empresa} />
          </TabsContent>
          <TabsContent value="validation" className="flex-1 m-0 overflow-auto">
            <AuditChainValidator empresa={empresa} />
          </TabsContent>
          <TabsContent value="compliance" className="flex-1 m-0 overflow-auto">
            <ComplianceReports empresa={empresa} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}