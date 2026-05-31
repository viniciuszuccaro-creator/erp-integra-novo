import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import usePermissions from '@/components/lib/usePermissions';
import { Mic, MessageSquare, Brain, BarChart3 } from 'lucide-react';
import VoiceCommandCenter from './VoiceCommandCenter';
import ConversationAnalyzer from './ConversationAnalyzer';
import OmnichannelRouter from './OmnichannelRouter';

export default function VoiceAIHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('voz');

  const canAccess = hasPermission('HubAtendimento', null, 'ver') || hasPermission('CRM', null, 'ver');

  if (!canAccess) {
    return (
      <Card className="bg-red-900/20 border-red-600 w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-semibold">Acesso Negado</p>
          <p className="text-red-200 text-sm mt-2">Você não tem permissão para acessar o Voice AI Hub.</p>
        </CardContent>
      </Card>
    );
  }

  const kpis = [
    { label: 'Conversas Processadas', valor: '847', cor: 'text-blue-400' },
    { label: 'Taxa de Resolução IA', valor: '76%', cor: 'text-emerald-400' },
    { label: 'Sentimento Médio', valor: '8.2/10', cor: 'text-purple-400' },
    { label: 'Tempo Resposta', valor: '2.1s', cor: 'text-cyan-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900/40 to-slate-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Mic className="w-7 h-7 text-purple-400" />
              Voice AI & Conversational Intelligence
            </h1>
            <p className="text-slate-400 text-sm mt-1">IA Conversacional • Análise Sentimento • Omnichannel</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-purple-900 text-purple-200">Voice AI</Badge>
            <Badge className="bg-blue-900 text-blue-200">NLU</Badge>
            <Badge className="bg-emerald-900 text-emerald-200">Real-Time</Badge>
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
            <TabsTrigger value="voz" className="data-[state=active]:bg-purple-600">
              <Mic className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Voz</span>
            </TabsTrigger>
            <TabsTrigger value="analise" className="data-[state=active]:bg-brain-600">
              <Brain className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Análise</span>
            </TabsTrigger>
            <TabsTrigger value="omnichannel" className="data-[state=active]:bg-blue-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Canais</span>
            </TabsTrigger>
          </TabsList>

          <div className="h-full">
            <TabsContent value="voz" className="h-full m-0">
              <VoiceCommandCenter />
            </TabsContent>
            <TabsContent value="analise" className="h-full m-0">
              <ConversationAnalyzer />
            </TabsContent>
            <TabsContent value="omnichannel" className="h-full m-0">
              <OmnichannelRouter />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}