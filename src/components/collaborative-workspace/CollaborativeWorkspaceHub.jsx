import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import usePermissions from '@/components/lib/usePermissions';
import { Users, FileText, CheckSquare, MessageSquare, Video, Bell } from 'lucide-react';
import SharedDocuments from './SharedDocuments';
import TaskBoard from './TaskBoard';
import ActivityFeed from './ActivityFeed';
import MeetingsChannels from './MeetingsChannels';

export default function CollaborativeWorkspaceHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('documentos');

  const canAccess = hasPermission('Administrativo', null, 'ver') || hasPermission('Sistema', null, 'ver');

  if (!canAccess) {
    return (
      <Card className="bg-red-900/20 border-red-600 w-full">
        <CardContent className="p-6 text-center">
          <p className="text-red-400 font-semibold">Acesso Negado</p>
          <p className="text-red-200 text-sm mt-2">Você não tem permissão para acessar o Collaborative Workspace.</p>
        </CardContent>
      </Card>
    );
  }

  const notificacoes = {
    documentos: 0,
    tarefas: 2,
    atividades: 0,
    reunioes: 1,
  };

  const kpis = [
    { label: 'Documentos Compartilhados', valor: '8', cor: 'text-blue-400' },
    { label: 'Tarefas Ativas', valor: '4', cor: 'text-yellow-400' },
    { label: 'Canais Ativos', valor: '6', cor: 'text-purple-400' },
    { label: 'Reuniões Hoje', valor: '2', cor: 'text-cyan-400' },
  ];

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Users className="w-7 h-7 text-purple-400" />
              Collaborative Workspace Hub
            </h1>
            <p className="text-slate-400 text-sm mt-1">Documentos • Tarefas • Atividades • Reuniões & Canais</p>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-emerald-900 text-emerald-200">Tempo Real</Badge>
            <Badge className="bg-blue-900 text-blue-200">Multi-Empresa</Badge>
          </div>
        </div>

        {/* KPIs Header */}
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
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border-b border-slate-700 mb-4 relative">
            <TabsTrigger value="documentos" className="data-[state=active]:bg-blue-600 relative">
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Documentos</span>
              {notificacoes.documentos > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="tarefas" className="data-[state=active]:bg-yellow-600 relative">
              <CheckSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Tarefas</span>
              {notificacoes.tarefas > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-1">
                  {notificacoes.tarefas}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="atividade" className="data-[state=active]:bg-green-600">
              <Bell className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Atividade</span>
            </TabsTrigger>
            <TabsTrigger value="reunioes" className="data-[state=active]:bg-cyan-600">
              <Video className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Reuniões</span>
            </TabsTrigger>
          </TabsList>

          <div className="h-full">
            <TabsContent value="documentos" className="h-full m-0">
              <SharedDocuments />
            </TabsContent>
            <TabsContent value="tarefas" className="h-full m-0">
              <TaskBoard />
            </TabsContent>
            <TabsContent value="atividade" className="h-full m-0">
              <ActivityFeed />
            </TabsContent>
            <TabsContent value="reunioes" className="h-full m-0">
              <MeetingsChannels />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}