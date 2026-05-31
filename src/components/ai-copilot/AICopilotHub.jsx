import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Lightbulb, MessageCircle, DollarSign, Brain } from 'lucide-react';
import CopilotChat from './CopilotChat';
import CopilotInsightsFeed from './CopilotInsightsFeed';
import CopilotFinancialIntelligence from './CopilotFinancialIntelligence';
import CopilotLearningPanel from './CopilotLearningPanel';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function AICopilotHub() {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const [modulo, setModulo] = useState('geral');

  const modulos = [
    { id: 'geral', label: 'Geral', icon: '🏢' },
    { id: 'comercial', label: 'Comercial', icon: '📊' },
    { id: 'estoque', label: 'Estoque', icon: '📦' },
    { id: 'financeiro', label: 'Financeiro', icon: '💰' },
    { id: 'producao', label: 'Produção', icon: '🏭' },
    { id: 'crm', label: 'CRM', icon: '👥' },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-6 h-6 text-yellow-400" />
          <h1 className="text-2xl font-bold text-white">IA Copilot — Assistente Inteligente</h1>
        </div>
        <p className="text-sm text-slate-400">Seu assistente IA contextual, com insights em tempo real e recomendações inteligentes</p>
      </div>

      {/* Seletor de Módulo */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {modulos.map(m => (
          <button
            key={m.id}
            onClick={() => setModulo(m.id)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${modulo === m.id ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
          >
            {m.icon} {m.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="insights" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-700">
          <TabsTrigger value="insights" className="text-xs data-[state=active]:bg-blue-600">
            <Lightbulb className="w-4 h-4 mr-1" />
            Insights
          </TabsTrigger>
          <TabsTrigger value="chat" className="text-xs data-[state=active]:bg-blue-600">
            <MessageCircle className="w-4 h-4 mr-1" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="financeiro" className="text-xs data-[state=active]:bg-blue-600">
            <DollarSign className="w-4 h-4 mr-1" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="aprendizados" className="text-xs data-[state=active]:bg-blue-600">
            <Brain className="w-4 h-4 mr-1" />
            Aprendizados
          </TabsTrigger>
        </TabsList>

        {/* Insights */}
        <TabsContent value="insights" className="h-96">
          <CopilotInsightsFeed modulo={modulo} />
        </TabsContent>

        {/* Chat */}
        <TabsContent value="chat" className="h-96">
          <Card className="bg-slate-800 border-slate-700 h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-white">Chat com IA Copilot</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex items-center justify-center">
              <p className="text-sm text-slate-400">Use o botão de IA Copilot na corner inferior direita da tela para conversar.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Financeiro */}
        <TabsContent value="financeiro" className="h-96">
          <CopilotFinancialIntelligence />
        </TabsContent>

        {/* Aprendizados */}
        <TabsContent value="aprendizados" className="h-96">
          <CopilotLearningPanel />
        </TabsContent>
      </Tabs>

      {/* Status Contexto */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-3">
          <p className="text-xs text-slate-400">
            Contexto: {contexto === 'grupo' ? '📊 Grupo' : '🏢 Empresa'} {empresaAtual?.nome_fantasia || empresaAtual?.razao_social} | IA Confiança: 85% | Último Update: agora
          </p>
        </CardContent>
      </Card>

      {/* Copilot Chat Widget */}
      <CopilotChat />
    </div>
  );
}