/**
 * CollaborationHub v1.0
 * Hub de Colaboração em Tempo Real
 * Passo 32: Workspace colaborativo integrado ao ERP
 * Regra-Mãe: w-full, h-full, multi-empresa, real-time, IA
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, MessageSquare, FileText, Activity } from 'lucide-react';
import ActiveWorkspace from './ActiveWorkspace';
import TeamActivity from './TeamActivity';
import CollaborativeDocuments from './CollaborativeDocuments';

export default function CollaborationHub() {
  const [activeTab, setActiveTab] = useState('workspace');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  const empresas = ['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-blue-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Collaboration Hub</h1>
              <p className="text-sm text-slate-300">Real-Time Sync • Smart Workspace • AI-Powered</p>
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
                    ? 'bg-blue-600 text-white'
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
              { value: 'workspace', label: 'Workspace', icon: FileText },
              { value: 'activity', label: 'Activity', icon: Activity },
              { value: 'documents', label: 'Documents', icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value="workspace" className="flex-1 m-0 overflow-auto">
            <ActiveWorkspace empresa={empresa} />
          </TabsContent>
          <TabsContent value="activity" className="flex-1 m-0 overflow-auto">
            <TeamActivity empresa={empresa} />
          </TabsContent>
          <TabsContent value="documents" className="flex-1 m-0 overflow-auto">
            <CollaborativeDocuments empresa={empresa} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}