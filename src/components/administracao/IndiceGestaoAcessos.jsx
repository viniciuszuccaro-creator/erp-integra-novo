import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Lock, Shield, Activity } from 'lucide-react';

/**
 * ÍNDICE 2: GESTÃO DE ACESSOS
 * Consolida: Usuários, Perfis, Permissões, Auditoria
 * Refatorado de: GestaoUsuariosAvancada, RBACDashboard, PermissoesAccordion, AuditoriaLogsIndex
 * Regra-Mãe: Melhorar existente + consolidar duplicidades
 */
export default function IndiceGestaoAcessos() {
  const [activeTab, setActiveTab] = useState('usuarios');

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Lock className="w-6 h-6 text-red-600" />
        <h1 className="text-2xl font-bold">Gestão de Acessos & Permissões</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex-1">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="usuarios">
            <Users className="w-4 h-4 mr-2" />
            Usuários
          </TabsTrigger>
          <TabsTrigger value="perfis">
            <Shield className="w-4 h-4 mr-2" />
            Perfis
          </TabsTrigger>
          <TabsTrigger value="permissoes">
            <Lock className="w-4 h-4 mr-2" />
            Permissões
          </TabsTrigger>
          <TabsTrigger value="auditoria">
            <Activity className="w-4 h-4 mr-2" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Gestão de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Consolida: GestaoUsuariosAvancada + UsuariosTab + UsuarioForm</p>
              <p className="text-sm text-slate-500 mt-2">CRUD completo + histórico de login + status</p>
              {/* Renderizar UsuarioForm/Lista aqui */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perfis" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Perfis de Acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Consolida: RBACDashboard + PerfilCard + PerfilFormModal + CentralPerfisAcesso</p>
              <p className="text-sm text-slate-500 mt-2">5 perfis padrão + personalizado | Detecção de conflitos SoD</p>
              {/* Renderizar PerfilForm/Lista aqui */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="permissoes" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Matriz de Permissões (50+ Ações)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Consolida: PermissoesAccordion + RBACModuleMatrix</p>
              <p className="text-sm text-slate-500 mt-2">Modulo.Entidade.Acao | Visual + JSON | Validação SoD</p>
              {/* Renderizar PermissoesAccordion aqui */}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auditoria" className="flex-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Auditoria de Acessos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600">Consolida: AuditoriaLogsIndex + AuditTrailPanel + AccessAuditTimeline</p>
              <p className="text-sm text-slate-500 mt-2">Logs de acesso + relatórios + alertas de anomalias</p>
              {/* Renderizar AuditoriaLogs aqui */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}