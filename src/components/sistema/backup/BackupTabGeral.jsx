import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function BackupTabGeral({ formData, setFormData }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Configurações Gerais</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div><Label className="text-base">Backup Automático</Label><p className="text-sm text-slate-600">Ativar backup automático agendado</p></div>
          <Switch data-action="Backup.automatico.ativo" checked={formData.ativo} onCheckedChange={(c) => setFormData({...formData, ativo: c})} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Frequência</Label>
            <Select value={formData.frequencia} onValueChange={(v) => setFormData({...formData, frequencia: v})}>
              <SelectTrigger data-action="Backup.frequencia"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Diário">Diário</SelectItem><SelectItem value="Semanal">Semanal</SelectItem>
                <SelectItem value="Quinzenal">Quinzenal</SelectItem><SelectItem value="Mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Horário de Execução</Label>
            <Input type="time" value={formData.horario_execucao} onChange={(e) => setFormData({...formData, horario_execucao: e.target.value})} />
          </div>
          {formData.frequencia === 'Semanal' && (
            <div>
              <Label>Dia da Semana</Label>
              <Select value={formData.dia_semana} onValueChange={(v) => setFormData({...formData, dia_semana: v})}>
                <SelectTrigger data-action="Backup.diaSemana"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["Domingo","Segunda","Terça","Quarta","Quinta","Sexta","Sábado"].map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          {formData.frequencia === 'Mensal' && (
            <div>
              <Label>Dia do Mês</Label>
              <Input type="number" min="1" max="31" value={formData.dia_mes || 1} onChange={(e) => setFormData({...formData, dia_mes: parseInt(e.target.value)})} />
            </div>
          )}
          <div>
            <Label>Tipo de Backup</Label>
            <Select value={formData.tipo_backup_padrao} onValueChange={(v) => setFormData({...formData, tipo_backup_padrao: v})}>
              <SelectTrigger data-action="Backup.tipoBackupPadrao"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Completo">Completo</SelectItem><SelectItem value="Incremental">Incremental</SelectItem><SelectItem value="Diferencial">Diferencial</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Retenção (dias)</Label>
            <Input type="number" min="7" max="365" value={formData.retencao_dias} onChange={(e) => setFormData({...formData, retencao_dias: parseInt(e.target.value)})} />
            <p className="text-xs text-slate-500 mt-1">Backups serão mantidos por {formData.retencao_dias} dias</p>
          </div>
        </div>
        <div className="border-t pt-4 space-y-3">
          {[{label:'Incluir Anexos', desc:'PDFs, imagens, arquivos de projetos', field:'incluir_anexos', action:'Backup.incluirAnexos'},
             {label:'Incluir Logs de Auditoria', desc:'Histórico de ações dos usuários', field:'incluir_logs', action:'Backup.incluirLogs'},
             {label:'Validar Integridade', desc:'Verificar integridade após backup', field:'validar_integridade', action:'Backup.validarIntegridade'}
          ].map(item => (
            <div key={item.field} className="flex items-center justify-between">
              <div><Label>{item.label}</Label><p className="text-xs text-slate-600">{item.desc}</p></div>
              <Switch data-action={item.action} checked={formData[item.field]} onCheckedChange={(c) => setFormData({...formData, [item.field]: c})} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}