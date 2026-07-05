import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

/** Sub-componente: Aba Alíquotas, CFOP e Observações */
export default function FiscalTabImpostos({ formData, setFormData }) {
  const aliquotas = [
    { field: 'aliquota_padrao_icms', label: 'ICMS (%)' },
    { field: 'aliquota_padrao_pis', label: 'PIS (%)' },
    { field: 'aliquota_padrao_cofins', label: 'COFINS (%)' },
    { field: 'aliquota_padrao_ipi', label: 'IPI (%)' },
    { field: 'aliquota_padrao_iss', label: 'ISS (%)' },
  ];
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-orange-50"><CardTitle className="text-base">CFOP Padrão</CardTitle></CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div><Label>CFOP Dentro do Estado</Label><Input value={formData.cfop_padrao_dentro_estado} onChange={(e) => setFormData({ ...formData, cfop_padrao_dentro_estado: e.target.value })} placeholder="5102" className="mt-2" /><p className="text-xs text-slate-500 mt-1">Ex: 5102 - Venda de mercadoria</p></div>
            <div><Label>CFOP Fora do Estado</Label><Input value={formData.cfop_padrao_fora_estado} onChange={(e) => setFormData({ ...formData, cfop_padrao_fora_estado: e.target.value })} placeholder="6102" className="mt-2" /><p className="text-xs text-slate-500 mt-1">Ex: 6102 - Venda interestadual</p></div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="bg-blue-50"><CardTitle className="text-base">Alíquotas Padrão (%)</CardTitle></CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4">
            {aliquotas.map(({ field, label }) => (
              <div key={field}><Label>{label}</Label><Input type="number" step="0.01" value={formData[field]} onChange={(e) => setFormData({ ...formData, [field]: parseFloat(e.target.value) })} className="mt-2" /></div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="bg-slate-50"><CardTitle className="text-base">Observações Padrão</CardTitle></CardHeader>
        <CardContent className="p-6">
          <Label>Mensagem que aparece em todas as NF-e</Label>
          <Textarea value={formData.observacoes_padrao_nfe} onChange={(e) => setFormData({ ...formData, observacoes_padrao_nfe: e.target.value })} rows={3} placeholder="Ex: Mercadoria sob encomenda. Prazo de entrega: 7 dias úteis." className="mt-2" />
        </CardContent>
      </Card>
      <div className="flex items-center gap-3 p-4 bg-red-50 rounded border border-red-200">
        <input type="checkbox" id="permite-sem-estoque" checked={formData.permite_emissao_sem_estoque} onChange={(e) => setFormData({ ...formData, permite_emissao_sem_estoque: e.target.checked })} />
        <div><Label htmlFor="permite-sem-estoque" className="font-semibold text-red-900 cursor-pointer">Permitir emissão sem estoque disponível</Label><p className="text-sm text-red-700">⚠️ Não recomendado. Pode gerar divergências fiscais.</p></div>
      </div>
    </div>
  );
}