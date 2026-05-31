import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import usePermissions from '@/components/lib/usePermissions';
import { AlertTriangle, TrendingUp, CheckCircle2, Zap } from 'lucide-react';
import RiskAssessmentPanel from './RiskAssessmentPanel';
import ComplianceMonitoringPanel from './ComplianceMonitoringPanel';
import RiskMitigationMatrix from './RiskMitigationMatrix';

export default function RiskManagementHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('avaliacao');

  const canAccess = hasPermission('Sistema', null, 'ver') || hasPermission('Administrativo', null, 'ver');

  if (!canAccess) {
    return (
      <Card className="bg-red-900/20 border-red-600 w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-semibold">Acesso Negado</p>
          <p className="text-red-200 text-sm mt-2">Você não tem permissão para acessar o Risk Management Hub.</p>
        </CardContent>
      </Card>
    );
  }

  const kpis = [
    { label: 'Risco Geral', valor: '6.2/10', cor: 'text-amber-400' },
    { label: 'Conformidade', valor: '94%', cor: 'text-emerald-400' },
    { label: 'Riscos Ativos', valor: '12', cor: 'text-red-400' },
    { label: 'Mitigações em Progresso', valor: '8', cor: 'text-blue-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900/40 to-slate-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <AlertTriangle className="w-7 h-7 text-amber-400" />
              Advanced Risk Management Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">Avaliação • Conformidade • Mitigação</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-amber-900 text-amber-200">Risk Active</Badge>
            <Badge className="bg-emerald-900 text-emerald-200">Compliant</Badge>
            <Badge className="bg-blue-900 text-blue-200">IA Enabled</Badge>
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
            <TabsTrigger value="avaliacao" className="data-[state=active]:bg-amber-600">
              <TrendingUp className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Avaliação</span>
            </TabsTrigger>
            <TabsTrigger value="conformidade" className="data-[state=active]:bg-emerald-600">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Conformidade</span>
            </TabsTrigger>
            <TabsTrigger value="mitigacao" className="data-[state=active]:bg-blue-600">
              <Zap className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Mitigação</span>
            </TabsTrigger>
          </TabsList>

          <div className="h-full">
            <TabsContent value="avaliacao" className="h-full m-0">
              <RiskAssessmentPanel />
            </TabsContent>
            <TabsContent value="conformidade" className="h-full m-0">
              <ComplianceMonitoringPanel />
            </TabsContent>
            <TabsContent value="mitigacao" className="h-full m-0">
              <RiskMitigationMatrix />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}