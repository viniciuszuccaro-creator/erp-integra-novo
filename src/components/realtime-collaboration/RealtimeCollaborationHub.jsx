import React, { useState } from 'react';
import { Users, Zap, FileText, MessageSquare } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import usePermissions from '@/components/lib/usePermissions';
import CollaborativeWorkspacePanel from './CollaborativeWorkspacePanel';
import RealTimeSyncMonitor from './RealTimeSyncMonitor';
import SharedDocumentsPanel from './SharedDocumentsPanel';
import CollaborativeNotesPanel from './CollaborativeNotesPanel';

export default function RealtimeCollaborationHub() {
  const { hasPermission } = usePermissions();
  const [activeTab, setActiveTab] = useState('workspace');

  if (!hasPermission('Administrativo', null, 'ver')) {
    return (
      <div className="p-8 text-center text-slate-600">
        Acesso negado. Real-Time Collaboration Hub requer permissões de acesso.
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-emerald-50 to-blue-50 p-6 gap-4 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 sticky top-6 z-10 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-emerald-200">
        <div className="p-3 bg-gradient-to-br from-emerald-600 to-blue-600 rounded-xl">
          <Users className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">Real-Time Collaboration</h1>
          <p className="text-slate-600 text-sm">Espaço Compartilhado • Sincronização • Documentação Colaborativa</p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 bg-white border border-emerald-200 sticky top-28 z-10">
          <TabsTrigger value="workspace" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Espaço</span>
          </TabsTrigger>
          <TabsTrigger value="sync" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Sync</span>
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Docs</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">Notas</span>
          </TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto mt-4">
          <TabsContent value="workspace" className="w-full h-full">
            <CollaborativeWorkspacePanel />
          </TabsContent>

          <TabsContent value="sync" className="w-full h-full">
            <RealTimeSyncMonitor />
          </TabsContent>

          <TabsContent value="documents" className="w-full h-full">
            <SharedDocumentsPanel />
          </TabsContent>

          <TabsContent value="notes" className="w-full h-full">
            <CollaborativeNotesPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}