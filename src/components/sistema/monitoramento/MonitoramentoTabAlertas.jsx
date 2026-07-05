import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mail } from "lucide-react";

export default function MonitoramentoTabAlertas({ formData, setFormData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Mail className="w-5 h-5 text-blue-600" />Configuração de Alertas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div><Label>Gerar Alertas Automáticos</Label><p className="text-sm text-slate-600">Criar alertas quando thresholds forem excedidos</p></div>
          <Switch data-action="Monitoramento.alertasAutomaticos" checked={formData.gerar_alertas_automaticos} onCheckedChange={(checked) => setFormData({ ...formData, gerar_alertas_automaticos: checked })} />
        </div>
        <div className="flex items-center justify-between">
          <div><Label>Notificar por E-mail</Label><p className="text-sm text-slate-600">Enviar e-mail quando alertas forem gerados</p></div>
          <Switch data-action="Monitoramento.notificarEmail" checked={formData.notificar_email} onCheckedChange={(checked) => setFormData({ ...formData, notificar_email: checked })} />
        </div>
        {formData.notificar_email && (
          <div>
            <Label>E-mails para Notificação</Label>
            <Input placeholder="admin@empresa.com, ti@empresa.com" value={(formData.emails_notificacao || []).join(", ")}
              onChange={(e) => setFormData({ ...formData, emails_notificacao: e.target.value.split(",").map((email) => email.trim()).filter((e) => e) })} />
            <p className="text-xs text-slate-500 mt-1">Separe múltiplos e-mails com vírgula</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div><Label>Agrupar Alertas Similares</Label><p className="text-sm text-slate-600">Evitar spam de alertas duplicados</p></div>
          <Switch data-action="Monitoramento.agruparAlertas" checked={formData.agrupar_alertas_similares} onCheckedChange={(checked) => setFormData({ ...formData, agrupar_alertas_similares: checked })} />
        </div>
        {formData.agrupar_alertas_similares && (
          <div>
            <Label>Janela de Agrupamento (minutos)</Label>
            <Input type="number" min="5" max="60" value={formData.janela_agrupamento_minutos} onChange={(e) => setFormData({ ...formData, janela_agrupamento_minutos: parseInt(e.target.value) })} />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div><Label>Alertar Apenas Críticos</Label><p className="text-sm text-slate-600">Notificar apenas alertas de severidade Critical</p></div>
          <Switch data-action="Monitoramento.alertarApenasCriticos" checked={formData.alertar_apenas_criticos} onCheckedChange={(checked) => setFormData({ ...formData, alertar_apenas_criticos: checked })} />
        </div>
      </CardContent>
    </Card>
  );
}