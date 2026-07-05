import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function RegiaoTabLogistica({ formData, setFormData }) {
  const update = (field, value) => setFormData({ ...formData, logistica: { ...formData.logistica, [field]: value } });
  return (
    <div className="space-y-4 mt-4">
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Prazo Entrega Padrão (dias)</Label><Input type="number" value={formData.logistica.prazo_entrega_padrao_dias} onChange={(e) => update("prazo_entrega_padrao_dias", parseFloat(e.target.value) || 0)} /></div>
        <div><Label>Custo Frete Base (R$)</Label><Input type="number" step="0.01" value={formData.logistica.custo_frete_base} onChange={(e) => update("custo_frete_base", parseFloat(e.target.value) || 0)} /></div>
      </div>
      <div className="flex items-center justify-between p-3 border rounded-lg">
        <Label htmlFor="permite_entrega_expressa">Permite Entrega Expressa</Label>
        <Switch id="permite_entrega_expressa" checked={formData.logistica.permite_entrega_expressa} onCheckedChange={(checked) => update("permite_entrega_expressa", checked)} />
      </div>
      {formData.logistica.permite_entrega_expressa && (
        <div className="grid grid-cols-2 gap-4">
          <div><Label>Prazo Expressa (dias)</Label><Input type="number" value={formData.logistica.prazo_entrega_expressa_dias} onChange={(e) => update("prazo_entrega_expressa_dias", parseFloat(e.target.value) || 0)} /></div>
          <div><Label>Acréscimo Expresso (%)</Label><Input type="number" step="0.01" value={formData.logistica.acrescimo_frete_expresso_percentual} onChange={(e) => update("acrescimo_frete_expresso_percentual", parseFloat(e.target.value) || 0)} /></div>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Distância Centro Distribuição (km)</Label><Input type="number" value={formData.logistica.distancia_centro_distribuicao_km} onChange={(e) => update("distancia_centro_distribuicao_km", parseFloat(e.target.value) || 0)} /></div>
        <div>
          <Label>Dificuldade de Acesso</Label>
          <Select value={formData.logistica.dificuldade_acesso} onValueChange={(value) => update("dificuldade_acesso", value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent className="z-[99999]"><SelectItem value="Fácil">Fácil</SelectItem><SelectItem value="Moderado">Moderado</SelectItem><SelectItem value="Difícil">Difícil</SelectItem></SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}