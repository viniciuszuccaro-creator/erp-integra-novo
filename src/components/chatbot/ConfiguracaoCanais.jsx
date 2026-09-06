import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import * as TabsUI from "@/components/ui/tabs";
import { MessageCircle, Instagram, Send as Telegram, Mail, Globe, Settings, Smartphone, Phone, Workflow, Clock, Brain, Shield } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import RoteamentoInteligente from "./RoteamentoInteligente";
import NotificacoesCanal from "./NotificacoesCanal";
import AutomacaoFluxos from "./AutomacaoFluxos";
import WebhooksTester from "./WebhooksTester";
import CanalTabBasico from "./canal-config/CanalTabBasico";
import CanalTabHorarios from "./canal-config/CanalTabHorarios";
import CanalTabIA from "./canal-config/CanalTabIA";
import CanalTabSLA from "./canal-config/CanalTabSLA";

/**
 * REFACTORED (Regra-Mãe): 677 → ~90 linhas
 * Sub-componentes extraídos para /canal-config/
 */
export default function ConfiguracaoCanais() {
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, createInContext, updateInContext } = useContextoVisual();
  const { canCreate, canEdit } = usePermissions();
  const [canalSelecionado, setCanalSelecionado] = useState("WhatsApp");
  const [abaAtiva, setAbaAtiva] = useState("basico");

  const canais = [
    { nome: "WhatsApp", icon: MessageCircle, cor: "green" }, { nome: "Instagram", icon: Instagram, cor: "pink" },
    { nome: "Facebook", icon: MessageCircle, cor: "blue" }, { nome: "Telegram", icon: Telegram, cor: "sky" },
    { nome: "Email", icon: Mail, cor: "slate" }, { nome: "WebChat", icon: Globe, cor: "purple" },
    { nome: "Portal", icon: Smartphone, cor: "indigo" }, { nome: "SMS", icon: MessageCircle, cor: "orange" },
    { nome: "VoIP", icon: Phone, cor: "teal" }
  ];

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['config-canais', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      const filtro = empresaAtual?.id ? { empresa_id: empresaAtual.id } : grupoAtual?.id ? { group_id: grupoAtual.id } : {};
      return await base44.entities.ConfiguracaoCanal.filter(filtro);
    },
    enabled: !!empresaAtual?.id || !!grupoAtual?.id
  });

  const configAtual = configs.find(c => c.canal === canalSelecionado);

  const salvarConfigMutation = useMutation({
    mutationFn: async (dados) => {
      // Regra-Mãe 5: RBAC + contexto na persistência (fail-closed)
      if (configAtual ? !canEdit('HubAtendimento') : !canCreate('HubAtendimento')) throw new Error('Sem permissão para salvar configurações de canais.');
      if (configAtual) return await updateInContext('ConfiguracaoCanal', configAtual.id, dados);
      return await createInContext('ConfiguracaoCanal', { ...dados, empresa_id: empresaAtual?.id, group_id: empresaAtual?.group_id || grupoAtual?.id, canal: canalSelecionado });
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['config-canais'] }); toast.success("Configuração salva!"); },
    onError: (e) => toast.error(e?.message || 'Erro ao salvar configuração'),
  });

  const canaisAtivos = configs.filter(c => c.ativo).length;
  const totalConversasAtivas = configs.reduce((acc, c) => acc + (c.conversas_ativas || 0), 0);

  return (
    <div className="w-full h-full overflow-auto p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3"><Settings className="w-8 h-8 text-blue-600" />Configuração de Canais</h1>
            <p className="text-slate-600 mt-1">Gerencie todos os canais de atendimento</p>
          </div>
          <div className="flex gap-3">
            <Badge className="bg-green-100 text-green-800 px-3 py-1">{canaisAtivos} canais ativos</Badge>
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">{totalConversasAtivas} conversas</Badge>
          </div>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {canais.map((canal) => {
            const config = configs.find(c => c.canal === canal.nome);
            const Icon = canal.icon;
            const isSelected = canalSelecionado === canal.nome;
            return (
              <motion.div key={canal.nome} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Card className={`cursor-pointer transition-all h-full ${isSelected ? 'ring-2 ring-blue-600 bg-blue-50' : 'hover:shadow-md'}`} onClick={() => setCanalSelecionado(canal.nome)}>
                  <CardContent className="p-3 text-center">
                    <Icon className={`w-6 h-6 mx-auto mb-1 ${isSelected ? 'text-blue-600' : `text-${canal.cor}-600`}`} />
                    <p className="text-xs font-semibold mb-1 truncate">{canal.nome}</p>
                    {config?.ativo ? <Badge className="bg-green-600 text-xs px-1">Ativo</Badge> : <Badge variant="outline" className="text-xs px-1">Off</Badge>}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <TabsUI.Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="w-full">
          <TabsUI.TabsList className="grid grid-cols-5 w-full max-w-2xl">
            <TabsUI.TabsTrigger value="basico" className="text-xs"><Settings className="w-3 h-3 mr-1" />Básico</TabsUI.TabsTrigger>
            <TabsUI.TabsTrigger value="horarios" className="text-xs"><Clock className="w-3 h-3 mr-1" />Horários</TabsUI.TabsTrigger>
            <TabsUI.TabsTrigger value="ia" className="text-xs"><Brain className="w-3 h-3 mr-1" />IA</TabsUI.TabsTrigger>
            <TabsUI.TabsTrigger value="sla" className="text-xs"><Shield className="w-3 h-3 mr-1" />SLA</TabsUI.TabsTrigger>
            <TabsUI.TabsTrigger value="automacao" className="text-xs"><Workflow className="w-3 h-3 mr-1" />Automação</TabsUI.TabsTrigger>
          </TabsUI.TabsList>
          <TabsUI.TabsContent value="basico">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2"><CanalTabBasico canalSelecionado={canalSelecionado} configAtual={configAtual} onSave={(dados) => salvarConfigMutation.mutate(dados)} isSaving={salvarConfigMutation.isPending} /></div>
              <div className="space-y-4"><RoteamentoInteligente canalConfig={configAtual} /><NotificacoesCanal canalConfig={configAtual} /></div>
            </div>
          </TabsUI.TabsContent>
          <TabsUI.TabsContent value="horarios"><CanalTabHorarios config={configAtual} onSave={(dados) => salvarConfigMutation.mutate(dados)} isSaving={salvarConfigMutation.isPending} /></TabsUI.TabsContent>
          <TabsUI.TabsContent value="ia"><CanalTabIA config={configAtual} onSave={(dados) => salvarConfigMutation.mutate(dados)} isSaving={salvarConfigMutation.isPending} /></TabsUI.TabsContent>
          <TabsUI.TabsContent value="sla"><CanalTabSLA config={configAtual} onSave={(dados) => salvarConfigMutation.mutate(dados)} isSaving={salvarConfigMutation.isPending} /></TabsUI.TabsContent>
          <TabsUI.TabsContent value="automacao"><div className="grid md:grid-cols-2 gap-6"><AutomacaoFluxos canalConfig={configAtual} /><WebhooksTester canalConfig={configAtual} /></div></TabsUI.TabsContent>
        </TabsUI.Tabs>
      </div>
    </div>
  );
}