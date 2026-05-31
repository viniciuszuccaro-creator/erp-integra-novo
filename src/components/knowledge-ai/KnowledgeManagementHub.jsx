/**
 * KnowledgeManagementHub v1.0
 * Hub de Gestão de Conhecimento + IA Self-Learning
 * Passo 35: Base de conhecimento corporativo que aprende automaticamente
 * Regra-Mãe: w-full, h-full, multi-empresa, IA, learning contínuo
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Brain, Zap, Share2 } from 'lucide-react';
import KnowledgeBase from './KnowledgeBase';
import AILearningEngine from './AILearningEngine';
import SharedInsights from './SharedInsights';

export default function KnowledgeManagementHub() {
  const [activeTab, setActiveTab] = useState('base');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  const empresas = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-indigo-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <BookOpen className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Knowledge Management Hub</h1>
              <p className="text-sm text-slate-300">IA Self-Learning • Conhecimento Corporativo • Inovação Contínua</p>
            </div>
          </div>
          <div className="flex gap-2">
            {empresas.map((emp) => (
              <button
                key={emp}
                onClick={() => setEmpresa(emp)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  empresa === emp ? 'bg-indigo-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
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
              { value: 'base', label: 'Base de Conhecimento', icon: BookOpen },
              { value: 'learning', label: 'IA Learning', icon: Brain },
              { value: 'insights', label: 'Insights Compartilhados', icon: Share2 },
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

          <TabsContent value="base" className="flex-1 m-0 overflow-auto">
            <KnowledgeBase empresa={empresa} />
          </TabsContent>
          <TabsContent value="learning" className="flex-1 m-0 overflow-auto">
            <AILearningEngine empresa={empresa} />
          </TabsContent>
          <TabsContent value="insights" className="flex-1 m-0 overflow-auto">
            <SharedInsights empresa={empresa} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}