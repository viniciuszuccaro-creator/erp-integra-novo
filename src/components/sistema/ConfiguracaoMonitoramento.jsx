import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, Database, Bolt, Shield, Mail, Settings, Save } from "lucide-react";
import useConfigMonitoramento from "./monitoramento/useConfigMonitoramento";
import MonitoramentoTabGeral from "./monitoramento/MonitoramentoTabGeral";
import MonitoramentoTabThresholds from "./monitoramento/MonitoramentoTabThresholds";
import MonitoramentoTabAlertas from "./monitoramento/MonitoramentoTabAlertas";
import MonitoramentoTabAvancado from "./monitoramento/MonitoramentoTabAvancado";

export default function ConfiguracaoMonitoramento({ empresaId, grupoId }) {
  const { config, isLoading, formData, setFormData, salvando, salvarMutation, contextoValido, podeEditar, handleSalvar } = useConfigMonitoramento({ empresaId, grupoId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto space-y-6 p-4">
      <Alert className={formData.ativo ? "border-green-300 bg-green-50" : "border-orange-300 bg-orange-50"}>
        <Activity className={`w-5 h-5 ${formData.ativo ? "text-green-600" : "text-orange-600"}`} />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold ${formData.ativo ? "text-green-900" : "text-orange-900"}`}>
                {formData.ativo ? "✅ Monitoramento de Performance Ativo" : "⚠️ Monitoramento Desativado"}
              </p>
              <p className="text-sm text-slate-700 mt-1">
                {formData.ativo ? `Nível: ${formData.nivel_monitoramento} • Coleta a cada ${formData.intervalo_coleta_segundos}s` : "Ative o monitoramento para rastrear performance"}
              </p>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral" data-action="Monitoramento.tab.geral"><Settings className="w-4 h-4 mr-2" />Geral</TabsTrigger>
          <TabsTrigger value="thresholds" data-action="Monitoramento.tab.thresholds"><Bolt className="w-4 h-4 mr-2" />Thresholds</TabsTrigger>
          <TabsTrigger value="alertas" data-action="Monitoramento.tab.alertas"><Mail className="w-4 h-4 mr-2" />Alertas</TabsTrigger>
          <TabsTrigger value="avancado" data-action="Monitoramento.tab.avancado"><Database className="w-4 h-4 mr-2" />Avançado</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6 mt-6"><MonitoramentoTabGeral formData={formData} setFormData={setFormData} /></TabsContent>
        <TabsContent value="thresholds" className="space-y-6 mt-6"><MonitoramentoTabThresholds formData={formData} setFormData={setFormData} /></TabsContent>
        <TabsContent value="alertas" className="space-y-6 mt-6"><MonitoramentoTabAlertas formData={formData} setFormData={setFormData} /></TabsContent>
        <TabsContent value="avancado" className="space-y-6 mt-6"><MonitoramentoTabAvancado formData={formData} setFormData={setFormData} /></TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button onClick={handleSalvar} disabled={salvando || salvarMutation.isPending || !contextoValido || !podeEditar}
          className="bg-blue-600 hover:bg-blue-700" data-action="Monitoramento.Configuracao.salvar" data-sensitive="true">
          {salvando || salvarMutation.isPending ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Salvando...</>) : (<><Save className="w-4 h-4 mr-2" />Salvar Configuração</>)}
        </Button>
      </div>

      {config?.id && (
        <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-purple-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4">
              <div><p className="text-xs text-slate-600 mb-1">Total Alertas</p><p className="text-2xl font-bold text-blue-600">{config.total_alertas_gerados || 0}</p></div>
              <div><p className="text-xs text-slate-600 mb-1">Resolvidos</p><p className="text-2xl font-bold text-green-600">{config.total_alertas_resolvidos || 0}</p></div>
              <div><p className="text-xs text-slate-600 mb-1">MTTR (horas)</p><p className="text-2xl font-bold text-purple-600">{(config.mttr_horas || 0).toFixed(1)}h</p></div>
              <div><p className="text-xs text-slate-600 mb-1">Último Alerta</p><p className="text-sm font-semibold text-slate-900">{config.ultimo_alerta_data ? new Date(config.ultimo_alerta_data).toLocaleString("pt-BR") : "Nunca"}</p></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}