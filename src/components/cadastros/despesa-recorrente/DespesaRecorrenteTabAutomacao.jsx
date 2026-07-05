import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function DespesaRecorrenteTabAutomacao({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Gerar Automaticamente</Label>
          <p className="text-xs text-slate-500">Criar títulos automaticamente</p>
        </div>
        <Switch checked={formData.gerar_automaticamente} onCheckedChange={(checked) => setFormData({ ...formData, gerar_automaticamente: checked })} />
      </div>

      {formData.gerar_automaticamente && (
        <>
          <div>
            <Label>Antecedência (Dias)</Label>
            <Input type="number" value={formData.antecedencia_dias} onChange={(e) => setFormData({ ...formData, antecedencia_dias: parseInt(e.target.value) })} />
            <p className="text-xs text-slate-500 mt-1">Quantos dias antes do vencimento gerar o título</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label>Notificar na Criação</Label>
              <p className="text-xs text-slate-500">Enviar notificação ao criar título</p>
            </div>
            <Switch checked={formData.notificar_criacao} onCheckedChange={(checked) => setFormData({ ...formData, notificar_criacao: checked })} />
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <div>
          <Label>Configuração Ativa</Label>
          <p className="text-xs text-slate-500">Ativar/desativar esta despesa recorrente</p>
        </div>
        <Switch checked={formData.ativa} onCheckedChange={(checked) => setFormData({ ...formData, ativa: checked })} />
      </div>
    </div>
  );
}