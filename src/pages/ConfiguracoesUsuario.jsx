import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Save, CheckCircle, Palette, Lock } from "lucide-react";
import useConfiguracoesUsuario from "@/components/configuracoes-usuario/useConfiguracoesUsuario";
import ConfigTabNotificacoes from "@/components/configuracoes-usuario/ConfigTabNotificacoes";
import ConfigTabAparencia from "@/components/configuracoes-usuario/ConfigTabAparencia";
import ConfigTabSeguranca from "@/components/configuracoes-usuario/ConfigTabSeguranca";

/**
 * V21.1.2 - REFACTORED (Regra-Mãe)
 * 741 linhas → ~80 linhas
 * Lógica em useConfiguracoesUsuario, UI em 3 abas extraídas em /configuracoes-usuario/
 */
export default function ConfiguracoesUsuario() {
  const [activeTab, setActiveTab] = useState("notificacoes");
  const {
    user, preferencesForm, saveSuccess, pushHabilitado,
    updateUserMutation, handleSave, updateNotificationPref, updateSystemPref, handleSolicitarPush, testarPushNotification
  } = useConfiguracoesUsuario();

  return (
    <div className="w-full h-full overflow-auto p-6 lg:p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Configurações do Usuário</h1>
          <p className="text-slate-600">Personalize suas preferências e notificações</p>
        </div>
        <Button data-permission="Sistema.ConfiguracoesUsuario.salvar" onClick={handleSave} disabled={updateUserMutation.isPending}
          className={`${saveSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {saveSuccess ? <><CheckCircle className="w-4 h-4 mr-2" />Salvo!</> : <><Save className="w-4 h-4 mr-2" />{updateUserMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}</>}
        </Button>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{user?.full_name?.[0] || 'U'}</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{user?.full_name || 'Usuário'}</h3>
              <p className="text-slate-600">{user?.email}</p>
              <Badge className="mt-1">{user?.role === 'admin' ? 'Administrador' : 'Usuário'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="notificacoes" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"><Bell className="w-4 h-4 mr-2" />Notificações</TabsTrigger>
          <TabsTrigger value="aparencia" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"><Palette className="w-4 h-4 mr-2" />Aparência</TabsTrigger>
          <TabsTrigger value="seguranca" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"><Lock className="w-4 h-4 mr-2" />Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="notificacoes">
          <ConfigTabNotificacoes
            preferencesForm={preferencesForm}
            updateNotificationPref={updateNotificationPref}
            pushHabilitado={pushHabilitado}
            handleSolicitarPush={handleSolicitarPush}
            testarPushNotification={testarPushNotification}
          />
        </TabsContent>

        <TabsContent value="aparencia">
          <ConfigTabAparencia preferencesForm={preferencesForm} updateSystemPref={updateSystemPref} />
        </TabsContent>

        <TabsContent value="seguranca">
          <ConfigTabSeguranca user={user} />
        </TabsContent>
      </Tabs>

      <div className="fixed bottom-6 right-6 z-50">
        <Button data-permission="Sistema.ConfiguracoesUsuario.salvar" onClick={handleSave} disabled={updateUserMutation.isPending} size="lg"
          className={`shadow-lg ${saveSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>
          {saveSuccess ? <><CheckCircle className="w-5 h-5 mr-2" />Salvo!</> : <><Save className="w-5 h-5 mr-2" />{updateUserMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}</>}
        </Button>
      </div>
    </div>
  );
}