import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Zap, TrendingUp, Link2, FileText } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import usePermissions from '@/components/lib/usePermissions';
import ResourceAllocationDashboard from './ResourceAllocationDashboard';
import RecruitmentForecastAI from './RecruitmentForecastAI';
import CostOptimizationEngine from './CostOptimizationEngine';
import OperationsRHLinker from './OperationsRHLinker';
import AllocationAuditLog from './AllocationAuditLog';

export default function WorkforceOrchestratorHub() {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('allocation');

  const isAuthorized = hasPermission('RH', 'Orquestração', 'gerenciar');
  if (!isAuthorized) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
        <Card className="bg-white/10 border-white/20 backdrop-blur-lg p-6 text-center max-w-md">
          <p className="text-white text-sm">Acesso negado. Apenas RH/Diretoria pode acessar Orquestração de Pessoal.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 bg-white/5 backdrop-blur-lg border-b border-white/10 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              Orquestrador de Pessoal Autônomo
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Alocação inteligente, previsão IA, otimização de custos
              {contexto === 'grupo' && grupoAtual && ` • Grupo: ${grupoAtual.nome_do_grupo}`}
              {contexto === 'empresa' && empresaAtual && ` • Empresa: ${empresaAtual.nome_fantasia || empresaAtual.razao_social}`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-emerald-400">87.3%</div>
            <p className="text-xs text-slate-400">Utilização Média</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-full rounded-none border-b border-white/10 bg-white/5 h-auto p-0 flex-shrink-0">
          <TabsTrigger
            value="allocation"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white/10 px-4 py-3 text-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            Alocação
          </TabsTrigger>
          <TabsTrigger
            value="recruitment"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white/10 px-4 py-3 text-sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Recrutamento IA
          </TabsTrigger>
          <TabsTrigger
            value="costs"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white/10 px-4 py-3 text-sm"
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Otimização Custos
          </TabsTrigger>
          <TabsTrigger
            value="integration"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white/10 px-4 py-3 text-sm"
          >
            <Link2 className="w-4 h-4 mr-2" />
            RH↔Operações
          </TabsTrigger>
          <TabsTrigger
            value="audit"
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white/10 px-4 py-3 text-sm"
          >
            <FileText className="w-4 h-4 mr-2" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <TabsContent value="allocation" className="w-full h-full p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <ResourceAllocationDashboard />
          </TabsContent>
          <TabsContent value="recruitment" className="w-full h-full p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <RecruitmentForecastAI />
          </TabsContent>
          <TabsContent value="costs" className="w-full h-full p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <CostOptimizationEngine />
          </TabsContent>
          <TabsContent value="integration" className="w-full h-full p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <OperationsRHLinker />
          </TabsContent>
          <TabsContent value="audit" className="w-full h-full p-0 m-0 data-[state=active]:flex data-[state=active]:flex-col">
            <AllocationAuditLog />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}