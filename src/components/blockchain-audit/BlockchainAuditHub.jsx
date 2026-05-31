import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import usePermissions from '@/components/lib/usePermissions';
import { Shield, Lock, FileCheck, Users } from 'lucide-react';
import AuditTrailBlockchain from './AuditTrailBlockchain';
import ComplianceDashboard from './ComplianceDashboard';
import SoDValidator from './SoDValidator';

export default function BlockchainAuditHub() {
  const { hasPermission } = usePermissions();

  if (!hasPermission('Sistema', null, 'ver')) {
    return (
      <Card className="bg-red-900/20 border-red-600 w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-semibold">Acesso Negado</p>
          <p className="text-red-200 text-sm mt-2">Apenas administradores podem acessar o Blockchain Audit Hub.</p>
        </CardContent>
      </Card>
    );
  }

  const kpis = [
    { label: 'Blocos Imutáveis', valor: '2.847', cor: 'text-blue-400' },
    { label: 'Conformidade Média', valor: '84%', cor: 'text-emerald-400' },
    { label: 'Conflitos SoD', valor: '3', cor: 'text-red-400' },
    { label: 'Frameworks Monitorados', valor: '3', cor: 'text-purple-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-7 h-7 text-emerald-400" />
              Blockchain Audit & Compliance Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">Trilha Imutável • LGPD/ISO/SOX • Segregação de Funções</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-900 text-emerald-200">Imutável</Badge>
            <Badge className="bg-blue-900 text-blue-200">Multi-Empresa</Badge>
            <Badge className="bg-purple-900 text-purple-200">IA Ativa</Badge>
          </div>
        </div>

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
        <Tabs defaultValue="trilha" className="w-full h-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700 mb-4">
            <TabsTrigger value="trilha" className="data-[state=active]:bg-blue-600">
              <Lock className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Trilha Imutável</span>
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-emerald-600">
              <FileCheck className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Compliance</span>
            </TabsTrigger>
            <TabsTrigger value="sod" className="data-[state=active]:bg-red-600">
              <Users className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">SoD Validator</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trilha" className="m-0">
            <AuditTrailBlockchain />
          </TabsContent>
          <TabsContent value="compliance" className="m-0">
            <ComplianceDashboard />
          </TabsContent>
          <TabsContent value="sod" className="m-0">
            <SoDValidator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}