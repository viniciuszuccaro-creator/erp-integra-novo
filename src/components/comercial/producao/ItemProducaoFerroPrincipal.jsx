import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calculator } from "lucide-react";
import { PESOS_FERRO } from "./useItemProducaoCalculo";

export default function ItemProducaoFerroPrincipal({ formData, updateField }) {
  if (!["Coluna", "Viga", "Estaca", "Broca"].includes(formData.tipo_peca)) return null;
  const isColunaViga = ["Coluna", "Viga"].includes(formData.tipo_peca);

  return (
    <Card>
      <CardHeader className="bg-green-50 pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Ferro Principal (Armadura Longitudinal)</span>
          <Badge className="bg-green-600 text-white">
            <Calculator className="w-3 h-3 mr-1" />{formData.ferro_principal_peso_kg} kg
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Bitola *</Label>
            <Select value={formData.ferro_principal_bitola} onValueChange={(v) => updateField('ferro_principal_bitola', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["10.0mm", "12.5mm", "16.0mm", "20.0mm", "25.0mm"].map(b => (
                  <SelectItem key={b} value={b}>{b} ({PESOS_FERRO[b]} kg/m)</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantidade Barras *</Label>
            <Input type="number" value={formData.ferro_principal_quantidade}
              onChange={(e) => updateField('ferro_principal_quantidade', parseInt(e.target.value) || 0)} min="1" />
          </div>
          {isColunaViga && (
            <>
              <div className="flex items-center gap-2 mt-6">
                <Switch checked={formData.dobra_le} onCheckedChange={(c) => updateField('dobra_le', c)} />
                <Label>Dobra LE</Label>
              </div>
              <div className="flex items-center gap-2 mt-6">
                <Switch checked={formData.dobra_ld} onCheckedChange={(c) => updateField('dobra_ld', c)} />
                <Label>Dobra LD</Label>
              </div>
            </>
          )}
        </div>

        {isColunaViga && (formData.dobra_le || formData.dobra_ld) && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            {formData.dobra_le && (
              <div>
                <Label>Tamanho Dobra LE (cm)</Label>
                <Input type="number" value={formData.tamanho_dobra_le}
                  onChange={(e) => updateField('tamanho_dobra_le', parseFloat(e.target.value) || 0)} />
              </div>
            )}
            {formData.dobra_ld && (
              <div>
                <Label>Tamanho Dobra LD (cm)</Label>
                <Input type="number" value={formData.tamanho_dobra_ld}
                  onChange={(e) => updateField('tamanho_dobra_ld', parseFloat(e.target.value) || 0)} />
              </div>
            )}
          </div>
        )}

        {isColunaViga && (
          <>
            <div className="flex items-center gap-2 mt-4">
              <Switch checked={formData.tem_reforco} onCheckedChange={(c) => updateField('tem_reforco', c)} />
              <Label>Adicionar Reforço?</Label>
            </div>
            {formData.tem_reforco && (
              <div className="grid grid-cols-3 gap-4 mt-3 p-3 bg-green-50 rounded border border-green-200">
                <div>
                  <Label>Qtd Reforço</Label>
                  <Input type="number" value={formData.reforco_quantidade}
                    onChange={(e) => updateField('reforco_quantidade', parseInt(e.target.value) || 0)} />
                </div>
                <div>
                  <Label>Bitola Reforço</Label>
                  <Select value={formData.reforco_bitola} onValueChange={(v) => updateField('reforco_bitola', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10.0mm">10.0mm</SelectItem>
                      <SelectItem value="12.5mm">12.5mm</SelectItem>
                      <SelectItem value="16.0mm">16.0mm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Badge className="bg-green-600 text-white h-10 px-3 flex items-center">{formData.reforco_peso_kg} kg</Badge>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}