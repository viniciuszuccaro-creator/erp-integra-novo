import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Mail } from "lucide-react";

export default function BackupTabNotificacoes({ formData, setFormData }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base flex items-center gap-2"><Mail className="w-5 h-5 text-green-600" />Notificações</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div><Label>Notificar por E-mail</Label><p className="text-sm text-slate-600">Enviar e-mail ao concluir backup</p></div>
          <Switch data-action="Backup.notificarEmail" checked={formData.notificar_email} onCheckedChange={(c) => setFormData({...formData, notificar_email: c})} />
        </div>
        {formData.notificar_email && (
          <div>
            <Label>E-mails para Notificação</Label>
            <Input placeholder="admin@empresa.com, ti@empresa.com"
              value={(formData.emails_notificacao || []).join(', ')}
              onChange={(e) => setFormData({...formData, emails_notificacao: e.target.value.split(',').map(email => email.trim()).filter(e => e)})} />
            <p className="text-xs text-slate-500 mt-1">Separe múltiplos e-mails com vírgula</p>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div><Label>Notificar Apenas Erros</Label><p className="text-sm text-slate-600">Enviar e-mail apenas se houver erro</p></div>
          <Switch data-action="Backup.notificarApenasErro" checked={formData.notificar_apenas_erro} onCheckedChange={(c) => setFormData({...formData, notificar_apenas_erro: c})} />
        </div>
      </CardContent>
    </Card>
  );
}