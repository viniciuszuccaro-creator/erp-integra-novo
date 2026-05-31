import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import usePermissions from '@/components/lib/usePermissions';
import { Lock, Shield, Zap, AlertTriangle } from 'lucide-react';
import EncryptionAuditPanel from './EncryptionAuditPanel';
import ZeroTrustArchitecture from './ZeroTrustArchitecture';
import QuantumKeyDistribution from './QuantumKeyDistribution';

export default function QuantumSecurityHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('encriptacao');

  const canAccess = hasPermission('Sistema', null, 'ver') || hasPermission('Administrativo', null, 'ver');

  if (!canAccess) {
    return (
      <Card className="bg-red-900/20 border-red-600 w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-semibold">Acesso Negado</p>
          <p className="text-red-200 text-sm mt-2">Você não tem permissão para acessar o Quantum Security Hub.</p>
        </CardContent>
      </Card>
    );
  }

  const kpis = [
    { label: 'Certificados Ativos', valor: '24', cor: 'text-emerald-400' },
    { label: 'Zero Trust Score', valor: '94%', cor: 'text-blue-400' },
    { label: 'Conformidade PCI', valor: '100%', cor: 'text-purple-400' },
    { label: 'Ameaças Detectadas', valor: '3', cor: 'text-red-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900/40 to-slate-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Lock className="w-7 h-7 text-blue-400" />
              Quantum-Ready Security Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">Zero Trust • Criptografia Quântica • PCI/HIPAA</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-blue-900 text-blue-200">Quantum-Ready</Badge>
            <Badge className="bg-emerald-900 text-emerald-200">Zero Trust</Badge>
            <Badge className="bg-purple-900 text-purple-200">PCI Level 1</Badge>
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
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-b border-slate-700 mb-4">
            <TabsTrigger value="encriptacao" className="data-[state=active]:bg-blue-600">
              <Lock className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Criptografia</span>
            </TabsTrigger>
            <TabsTrigger value="zerotrust" className="data-[state=active]:bg-emerald-600">
              <Shield className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Zero Trust</span>
            </TabsTrigger>
            <TabsTrigger value="quantum" className="data-[state=active]:bg-purple-600">
              <Zap className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Quantum</span>
            </TabsTrigger>
          </TabsList>

          <div className="h-full">
            <TabsContent value="encriptacao" className="h-full m-0">
              <EncryptionAuditPanel />
            </TabsContent>
            <TabsContent value="zerotrust" className="h-full m-0">
              <ZeroTrustArchitecture />
            </TabsContent>
            <TabsContent value="quantum" className="h-full m-0">
              <QuantumKeyDistribution />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}