import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calculator } from "lucide-react";
import { PESOS_FERRO, COBRIMENTO_PADRAO } from "./useItemProducaoCalculo";

export default function ItemProducaoEstribos({ formData, updateField }) {
  const isColunaViga = ["Coluna", "Viga"].includes(formData.tipo_peca);
  const isEstacaBroca = ["Estaca", "Broca"].includes(formData.tipo_peca);

  if (!isColunaViga && !isEstacaBroca) return null;

  return (
    <Card>
      <CardHeader className="bg-purple-50 pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>{isEstacaBroca ? "Estribo Espiral (Formato Redondo)" : "Estribos (Armadura Transversal)"}</span>
          <div className="flex gap-2">
            <Badge className="bg-purple-600 text-white">{formData.estribo_quantidade} {isEstacaBroca ? "voltas" : "unidades"}</Badge>
            <Badge className="bg-purple-600 text-white"><Calculator className="w-3 h-3 mr-1" />{formData.estribo_peso_kg} kg</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isColunaViga ? (
          <>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label>Bitola Estribo *</Label>
                <Select value={formData.estribo_bitola} onValueChange={(v) => updateField('estribo_bitola', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["4.2mm", "5.0mm", "6.3mm"].map(b => (
                      <SelectItem key={b} value={b}>{b} ({PESOS_FERRO[b]} kg/m)</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Largura (Auto)</Label>
                <Input type="number" value={formData.estribo_largura} disabled className="bg-slate-100" />
                <p className="text-xs text-slate-500 mt-1">Largura - 2×{COBRIMENTO_PADRAO}cm</p>
              </div>
              <div>
                <Label>Altura (Auto)</Label>
                <Input type="number" value={formData.estribo_altura} disabled className="bg-slate-100" />
                <p className="text-xs text-slate-500 mt-1">Altura - 2×{COBRIMENTO_PADRAO}cm</p>
              </div>
              <div>
                <Label>Espaçamento (cm) *</Label>
                <Input type="number" value={formData.estribo_distancia}
                  onChange={(e) => updateField('estribo_distancia', parseFloat(e.target.value) || 0)} />
              </div>
            </div>

            <div className="mt-4 p-3 bg-purple-50 rounded border border-purple-200">
              <Label className="mb-2 block">Lados sem Estribo (Opcional)</Label>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Switch checked={formData.lado_sem_estribo_le} onCheckedChange={(c) => updateField('lado_sem_estribo_le', c)} />
                  <Label>Lado Esquerdo</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={formData.lado_sem_estribo_ld} onCheckedChange={(c) => updateField('lado_sem_estribo_ld', c)} />
                  <Label>Lado Direito</Label>
                </div>
                {(formData.lado_sem_estribo_le || formData.lado_sem_estribo_ld) && (
                  <div>
                    <Label>Comprimento sem Estribo (cm)</Label>
                    <Input type="number" value={formData.comprimento_sem_estribo}
                      onChange={(e) => updateField('comprimento_sem_estribo', parseFloat(e.target.value) || 0)} />
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Bitola Estribo *</Label>
              <Select value={formData.estribo_bitola} onValueChange={(v) => updateField('estribo_bitola', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["4.2mm", "5.0mm", "6.3mm"].map(b => (
                    <SelectItem key={b} value={b}>{b} ({PESOS_FERRO[b]} kg/m)</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Diâmetro Estribo (Auto)</Label>
              <Input type="number" value={formData.estribo_diametro} disabled className="bg-slate-100" />
              <p className="text-xs text-slate-500 mt-1">Diâmetro - 2×{COBRIMENTO_PADRAO}cm</p>
            </div>
            <div>
              <Label>Espaçamento Espiral (cm) *</Label>
              <Input type="number" value={formData.estribo_distancia}
                onChange={(e) => updateField('estribo_distancia', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}