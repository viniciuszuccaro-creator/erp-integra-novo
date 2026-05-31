/**
 * QuantumSecurityHub v1.0
 * Hub central de segurança quântica
 * Passo 30: Proteção contra futuro quântico + Zero-Trust
 * Regra-Mãe: w-full, h-full, multi-empresa, RBAC, IA
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, CheckCircle2, AlertTriangle } from 'lucide-react';
import ZeroTrustArchitecture from './ZeroTrustArchitecture';
import QuantumKeyDistribution from './QuantumKeyDistribution';
import EncryptionAudit from './EncryptionAudit';

export default function QuantumSecurityHub() {
  const [activeTab, setActiveTab] = useState('zero-trust');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  const empresas = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-indigo-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Lock className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Quantum Security Hub</h1>
              <p className="text-sm text-slate-300">Zero-Trust + Quantum-Ready + Post-Quantum Crypto</p>
            </div>
          </div>

          {/* Seletor Empresa */}
          <div className="flex gap-2">
            {empresas.map((emp) => (
              <button
                key={emp}
                onClick={() => setEmpresa(emp)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  empresa === emp
                    ? 'bg-indigo-600 text-white'
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
              { value: 'zero-trust', label: 'Zero-Trust', icon: Shield },
              { value: 'quantum-kd', label: 'Quantum Keys', icon: Lock },
              { value: 'encryption', label: 'Criptografia', icon: CheckCircle2 },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="zero-trust" className="flex-1 m-0 overflow-auto">
            <ZeroTrustArchitecture empresa={empresa} />
          </TabsContent>
          <TabsContent value="quantum-kd" className="flex-1 m-0 overflow-auto">
            <QuantumKeyDistribution empresa={empresa} />
          </TabsContent>
          <TabsContent value="encryption" className="flex-1 m-0 overflow-auto">
            <EncryptionAudit empresa={empresa} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}