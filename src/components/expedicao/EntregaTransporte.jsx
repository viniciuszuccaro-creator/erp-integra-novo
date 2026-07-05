import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/**
 * Sub-componente extraído de FormularioEntrega.jsx
 * Seção: Transporte — frete, transportadora, motorista, volumes, peso.
 */
export default function EntregaTransporte({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-900 border-b pb-2">Transporte</h3>
      <div className="grid grid-cols-2 gap-4">
        <div><Label>Tipo de Frete</Label>
          <Select value={formData.tipo_frete} onValueChange={(v) => setFormData({ ...formData, tipo_frete: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="CIF">CIF (Pagamos)</SelectItem><SelectItem value="FOB">FOB (Cliente Paga)</SelectItem><SelectItem value="Retira">Cliente Retira</SelectItem><SelectItem value="Outro">Outro</SelectItem></SelectContent>
          </Select>
        </div>
        <div><Label>Transportadora</Label><Input value={formData.transportadora} onChange={(e) => setFormData({ ...formData, transportadora: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Motorista</Label><Input value={formData.motorista} onChange={(e) => setFormData({ ...formData, motorista: e.target.value })} /></div>
        <div><Label>Telefone Motorista</Label><Input value={formData.motorista_telefone} onChange={(e) => setFormData({ ...formData, motorista_telefone: e.target.value })} /></div>
        <div><Label>Placa</Label><Input value={formData.placa} onChange={(e) => setFormData({ ...formData, placa: e.target.value })} /></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><Label>Volumes</Label><Input type="number" min="1" value={formData.volumes} onChange={(e) => setFormData({ ...formData, volumes: parseInt(e.target.value) || 1 })} /></div>
        <div><Label>Peso (kg)</Label><Input type="number" step="0.01" value={formData.peso_total_kg} onChange={(e) => setFormData({ ...formData, peso_total_kg: parseFloat(e.target.value) || 0 })} /></div>
        <div><Label>Valor Frete</Label><Input type="number" step="0.01" value={formData.valor_frete} onChange={(e) => setFormData({ ...formData, valor_frete: parseFloat(e.target.value) || 0 })} /></div>
      </div>
      <div><Label>Código de Rastreamento</Label><Input value={formData.codigo_rastreamento} onChange={(e) => setFormData({ ...formData, codigo_rastreamento: e.target.value })} placeholder="Será preenchido pela integração com transportadora" /></div>
    </div>
  );
}