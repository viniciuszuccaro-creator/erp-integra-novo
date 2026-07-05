import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegiaoTabComercial({ formData, setFormData }) {
  const update = (field, value) => setFormData({ ...formData, comercial: { ...formData.comercial, [field]: value } });
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Meta de Vendas Mensal (R$)</Label><Input type="number" step="0.01" value={formData.comercial.meta_vendas_mensal} onChange={(e) => update("meta_vendas_mensal", parseFloat(e.target.value) || 0)} /></div>
        <div><Label>Comissão Extra (%)</Label><Input type="number" step="0.01" value={formData.comercial.comissao_extra_percentual} onChange={(e) => update("comissao_extra_percentual", parseFloat(e.target.value) || 0)} /></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Desconto Máximo (%)</Label><Input type="number" step="0.01" value={formData.comercial.desconto_maximo_permitido_percentual} onChange={(e) => update("desconto_maximo_permitido_percentual", parseFloat(e.target.value) || 0)} /></div>
        <div><Label>Exige Aprovação Acima de (R$)</Label><Input type="number" step="0.01" value={formData.comercial.exige_aprovacao_acima_valor} onChange={(e) => update("exige_aprovacao_acima_valor", parseFloat(e.target.value) || 0)} /></div>
      </div>
      <div>
        <Label>Prioridade de Atendimento</Label>
        <Select value={formData.comercial.prioridade_atendimento} onValueChange={(value) => update("prioridade_atendimento", value)}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="z-[99999]"><SelectItem value="Baixa">Baixa</SelectItem><SelectItem value="Normal">Normal</SelectItem><SelectItem value="Alta">Alta</SelectItem><SelectItem value="Urgente">Urgente</SelectItem></SelectContent>
        </Select>
      </div>
    </div>
  );
}