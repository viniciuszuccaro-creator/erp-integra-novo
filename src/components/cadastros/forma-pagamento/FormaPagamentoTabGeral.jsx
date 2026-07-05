import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIPOS_PAGAMENTO, ICONES } from "./useFormaPagamentoForm";

/**
 * Sub-componente: Aba Geral da Forma de Pagamento
 * Código, descrição, tipo, ícone, cor, status.
 */
export default function FormaPagamentoTabGeral({ formData, setFormData, podeSalvar }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div><Label>Código *</Label><Input value={formData.codigo} onChange={(e) => setFormData({ ...formData, codigo: e.target.value })} placeholder="Ex: FP001" required /></div>
      <div><Label>Descrição *</Label><Input value={formData.descricao} onChange={(e) => setFormData({ ...formData, descricao: e.target.value })} placeholder="Ex: PIX" required /></div>
      <div><Label>Tipo Base *</Label><Select value={formData.tipo} onValueChange={(v) => setFormData({ ...formData, tipo: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIPOS_PAGAMENTO.map(tipo => <SelectItem key={tipo} value={tipo}>{tipo}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Ícone</Label><Select value={formData.icone} onValueChange={(v) => setFormData({ ...formData, icone: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ICONES.map(({ icon, label }) => <SelectItem key={icon} value={icon}>{icon} {label}</SelectItem>)}</SelectContent></Select></div>
      <div><Label>Cor (Hex)</Label><Input value={formData.cor} onChange={(e) => setFormData({ ...formData, cor: e.target.value })} placeholder="#10b981" /></div>
      <div><Label>Ordem Exibição</Label><Input type="number" value={formData.ordem_exibicao} onChange={(e) => setFormData({ ...formData, ordem_exibicao: parseInt(e.target.value) || 0 })} /></div>
      <div className="flex items-center gap-2 pt-6"><Switch checked={formData.ativa} onCheckedChange={(v) => setFormData({ ...formData, ativa: v })} disabled={!podeSalvar} data-permission="Cadastros.FormaPagamento.alterarStatus" data-sensitive="true" /><Label>Ativa</Label></div>
    </div>
  );
}