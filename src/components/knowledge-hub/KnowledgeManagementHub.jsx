import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import usePermissions from '@/components/lib/usePermissions';
import { BookOpen, Brain, Search, Users } from 'lucide-react';
import KnowledgeBaseSearch from './KnowledgeBaseSearch';
import AdaptiveLearningPanel from './AdaptiveLearningPanel';
import CollectiveInsightsPanel from './CollectiveInsightsPanel';

export default function KnowledgeManagementHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('base');

  const kpis = [
    { label: 'Artigos Ativos', valor: '1.247', cor: 'text-blue-400' },
    { label: 'Usuários Treinados', valor: '98', cor: 'text-emerald-400' },
    { label: 'Buscas/Dia', valor: '342', cor: 'text-purple-400' },
    { label: 'Precisão IA', valor: '94.7%', cor: 'text-amber-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
      <div className="bg-gradient-to-r from-indigo-900/40 to-slate-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-indigo-400" />
              Knowledge Management Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">Base de Conhecimento • IA Semântica • Aprendizado Adaptativo</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge className="bg-indigo-900 text-indigo-200">IA Semântica</Badge>
            <Badge className="bg-emerald-900 text-emerald-200">Multi-empresa</Badge>
            <Badge className="bg-purple-900 text-purple-200">Adaptive Learning</Badge>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {kpis.map((k, i) => (
            <div key={i} className="bg-slate-700/30 border border-slate-600 rounded-lg p-3">
              <p className="text-xs text-slate-400">{k.label}</p>
              <p className={`text-lg font-bold ${k.cor}`}>{k.valor}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-b border-slate-700 mb-4">
            <TabsTrigger value="base" className="data-[state=active]:bg-indigo-600">
              <Search className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Base & Busca</span>
            </TabsTrigger>
            <TabsTrigger value="aprendizado" className="data-[state=active]:bg-purple-600">
              <Brain className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Aprendizado</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="data-[state=active]:bg-emerald-600">
              <Users className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="base" className="h-full m-0"><KnowledgeBaseSearch /></TabsContent>
          <TabsContent value="aprendizado" className="h-full m-0"><AdaptiveLearningPanel /></TabsContent>
          <TabsContent value="insights" className="h-full m-0"><CollectiveInsightsPanel /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}