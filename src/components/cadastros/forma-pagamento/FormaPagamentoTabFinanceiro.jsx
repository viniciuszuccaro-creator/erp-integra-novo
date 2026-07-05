import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Percent } from "lucide-react";

/**
 * Sub-componente: Aba Financeiro da Forma de Pagamento
 * Desconto, acréscimo, prazo de compensação.
 */
export default function FormaPagamentoTabFinanceiro({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="border-green-200 bg-green-50"><CardContent className="p-4">
          <div className="flex items-center justify-between mb-3"><Label className="font-semibold">Permite Desconto</Label><Switch checked={formData.aceita_desconto} onCheckedChange={(v) => setFormData({ ...formData, aceita_desconto: v })} /></div>
          {formData.aceita_desconto && (<div><Label className="text-xs">% Desconto Padrão</Label><div className="flex items-center gap-2 mt-1"><Input type="number" step="0.1" min="0" max="100" value={formData.percentual_desconto_padrao} onChange={(e) => setFormData({ ...formData, percentual_desconto_padrao: parseFloat(e.target.value) || 0 })} /><Percent className="w-4 h-4 text-green-600" /></div></div>)}
        </CardContent></Card>
        <Card className="border-orange-200 bg-orange-50"><CardContent className="p-4">
          <div className="flex items-center justify-between mb-3"><Label className="font-semibold">Aplicar Acréscimo</Label><Switch checked={formData.aplicar_acrescimo} onCheckedChange={(v) => setFormData({ ...formData, aplicar_acrescimo: v })} /></div>
          {formData.aplicar_acrescimo && (<div><Label className="text-xs">% Acréscimo Padrão (Taxa)</Label><div className="flex items-center gap-2 mt-1"><Input type="number" step="0.1" min="0" max="100" value={formData.percentual_acrescimo_padrao} onChange={(e) => setFormData({ ...formData, percentual_acrescimo_padrao: parseFloat(e.target.value) || 0 })} /><Percent className="w-4 h-4 text-orange-600" /></div></div>)}
        </CardContent></Card>
      </div>
      <div><Label>Prazo de Compensação (dias)</Label><Input type="number" min="0" value={formData.prazo_compensacao_dias} onChange={(e) => setFormData({ ...formData, prazo_compensacao_dias: parseInt(e.target.value) || 0 })} /><p className="text-xs text-slate-500 mt-1">Dias até o dinheiro entrar na conta</p></div>
    </div>
  );
}