import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { MESES_ANO } from "./useDespesaRecorrenteForm";

export default function DespesaRecorrenteTabRecorrencia({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Periodicidade *</Label>
          <Select value={formData.periodicidade} onValueChange={(v) => setFormData({ ...formData, periodicidade: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Semanal","Quinzenal","Mensal","Bimestral","Trimestral","Semestral","Anual"].map(p => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Dia do Vencimento</Label>
          <Input type="number" min="1" max="31" value={formData.dia_vencimento} onChange={(e) => setFormData({ ...formData, dia_vencimento: parseInt(e.target.value) })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Data Início *</Label>
          <Input type="date" value={formData.data_inicio} onChange={(e) => setFormData({ ...formData, data_inicio: e.target.value })} required />
        </div>
        <div>
          <Label>Data Fim (Opcional)</Label>
          <Input type="date" value={formData.data_fim} onChange={(e) => setFormData({ ...formData, data_fim: e.target.value })} />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Meses de Aplicação</Label>
        <div className="grid grid-cols-4 gap-2">
          {MESES_ANO.map((mes) => (
            <div key={mes.value} className="flex items-center space-x-2">
              <Checkbox
                checked={formData.meses_aplicacao?.includes(mes.value)}
                onCheckedChange={(checked) => {
                  const novos = checked
                    ? [...(formData.meses_aplicacao || []), mes.value]
                    : (formData.meses_aplicacao || []).filter(m => m !== mes.value);
                  setFormData({ ...formData, meses_aplicacao: novos });
                }}
              />
              <label className="text-xs">{mes.label}</label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <Label>Ajustar por Inflação</Label>
          <p className="text-xs text-slate-500">Aplicar reajuste anual automático</p>
        </div>
        <Switch checked={formData.ajuste_inflacao} onCheckedChange={(checked) => setFormData({ ...formData, ajuste_inflacao: checked })} />
      </div>

      {formData.ajuste_inflacao && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Índice de Ajuste</Label>
            <Select value={formData.indice_ajuste} onValueChange={(v) => setFormData({ ...formData, indice_ajuste: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["IPCA","IGP-M","INPC","CDI"].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>% Ajuste Anual Previsto</Label>
            <Input type="number" step="0.01" value={formData.percentual_ajuste_anual} onChange={(e) => setFormData({ ...formData, percentual_ajuste_anual: parseFloat(e.target.value) })} />
          </div>
        </div>
      )}
    </div>
  );
}