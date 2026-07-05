import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Cloud, Shield, Mail, Play, Save, Settings } from "lucide-react";
import useConfigBackup from "./backup/useConfigBackup";
import BackupTabGeral from "./backup/BackupTabGeral";
import BackupTabArmazenamento from "./backup/BackupTabArmazenamento";
import BackupTabSeguranca from "./backup/BackupTabSeguranca";
import BackupTabNotificacoes from "./backup/BackupTabNotificacoes";

/**
 * V21.1.2 - REFACTORED (Regra-Mãe)
 * 835 linhas → ~95 linhas
 * Lógica em useConfigBackup, UI em 4 abas extraídas em /backup/
 */
export default function ConfiguracaoBackup({ empresaId, grupoId }) {
  const {
    config, isLoading, formData, setFormData, salvando,
    contextoValido, podeEditarBackup, podeExecutarBackup,
    executarBackupManualMutation, salvarMutation,
    handleSalvar, handleExecutarBackup, calcularProximoBackup
  } = useConfigBackup({ empresaId, grupoId });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner */}
      <Alert className={formData.ativo ? 'border-green-300 bg-green-50' : 'border-orange-300 bg-orange-50'}>
        <Database className={`w-5 h-5 ${formData.ativo ? 'text-green-600' : 'text-orange-600'}`} />
        <AlertDescription>
          <div className="flex items-center justify-between">
            <div>
              <p className={`font-semibold ${formData.ativo ? 'text-green-900' : 'text-orange-900'}`}>
                {formData.ativo ? '✅ Backup Automático Ativo' : '⚠️ Backup Automático Desativado'}
              </p>
              <p className="text-sm text-slate-700 mt-1">
                {formData.ativo ? `Próximo backup: ${calcularProximoBackup()}` : 'Ative o backup para proteger seus dados'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExecutarBackup}
                disabled={executarBackupManualMutation.isPending || !contextoValido || !podeExecutarBackup}
                variant="outline" className="bg-white"
                data-action="Backup.executarManual" data-permission="Sistema.Backup.executar" data-sensitive="true">
                {executarBackupManualMutation.isPending ? (
                  <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />Executando...</>
                ) : (
                  <><Play className="w-4 h-4 mr-2" />Backup Manual</>
                )}
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="geral" data-action="Backup.tab.geral"><Settings className="w-4 h-4 mr-2" />Geral</TabsTrigger>
          <TabsTrigger value="armazenamento" data-action="Backup.tab.armazenamento"><Cloud className="w-4 h-4 mr-2" />Armazenamento</TabsTrigger>
          <TabsTrigger value="seguranca" data-action="Backup.tab.seguranca"><Shield className="w-4 h-4 mr-2" />Segurança</TabsTrigger>
          <TabsTrigger value="notificacoes" data-action="Backup.tab.notificacoes"><Mail className="w-4 h-4 mr-2" />Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="space-y-6 mt-6">
          <BackupTabGeral formData={formData} setFormData={setFormData} />
        </TabsContent>
        <TabsContent value="armazenamento" className="space-y-6 mt-6">
          <BackupTabArmazenamento formData={formData} setFormData={setFormData} />
        </TabsContent>
        <TabsContent value="seguranca" className="space-y-6 mt-6">
          <BackupTabSeguranca formData={formData} setFormData={setFormData} />
        </TabsContent>
        <TabsContent value="notificacoes" className="space-y-6 mt-6">
          <BackupTabNotificacoes formData={formData} setFormData={setFormData} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button onClick={handleSalvar}
          disabled={salvando || salvarMutation.isPending || !contextoValido || !podeEditarBackup}
          className="bg-blue-600 hover:bg-blue-700"
          data-action="Backup.Configuracao.salvar" data-permission="Sistema.Backup.editar" data-sensitive="true">
          {salvando || salvarMutation.isPending ? (
            <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />Salvando...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" />Salvar Configuração</>
          )}
        </Button>
      </div>

      {config?.id && (
        <Card className="border-0 shadow-md bg-gradient-to-br from-slate-50 to-blue-50">
          <CardContent className="p-6">
            <div className="grid grid-cols-4 gap-4">
              <div><p className="text-xs text-slate-600 mb-1">Total Executados</p><p className="text-2xl font-bold text-blue-600">{config.total_backups_executados || 0}</p></div>
              <div><p className="text-xs text-slate-600 mb-1">Taxa de Sucesso</p><p className="text-2xl font-bold text-green-600">{config.taxa_sucesso_percentual || 100}%</p></div>
              <div><p className="text-xs text-slate-600 mb-1">Espaço Usado</p><p className="text-2xl font-bold text-purple-600">{(config.espaco_total_usado_gb || 0).toFixed(2)} GB</p></div>
              <div><p className="text-xs text-slate-600 mb-1">Último Sucesso</p><p className="text-sm font-semibold text-slate-900">{config.ultimo_backup_sucesso ? new Date(config.ultimo_backup_sucesso).toLocaleDateString('pt-BR') : 'Nunca'}</p></div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}