import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator } from "lucide-react";

export default function ItemProducaoMalha({ formData, updateField }) {
  if (formData.tipo_peca !== "Bloco") return null;

  return (
    <Card>
      <CardHeader className="bg-amber-50 pb-3">
        <CardTitle className="text-sm flex items-center justify-between">
          <span>Armadura da Malha (2 Lados)</span>
          <Badge className="bg-amber-600 text-white"><Calculator className="w-3 h-3 mr-1" />{formData.peso_unitario_kg} kg</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Bitola Malha *</Label>
            <Select value={formData.bitola_malha} onValueChange={(v) => updateField('bitola_malha', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="6.3mm">6.3mm</SelectItem>
                <SelectItem value="8.0mm">8.0mm</SelectItem>
                <SelectItem value="10.0mm">10.0mm</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Espaçamento (cm) *</Label>
            <Input type="number" value={formData.espacamento_malha}
              onChange={(e) => updateField('espacamento_malha', parseFloat(e.target.value) || 15)} />
          </div>
          <div>
            <Label>Qtd Ferro (Auto)</Label>
            <Input type="number" value={formData.quantidade_ferro_malha} disabled className="bg-slate-100 font-bold" />
            <p className="text-xs text-slate-500 mt-1">Calculado automaticamente</p>
          </div>
          <div>
            <Label>Qtd Costela (Reforço)</Label>
            <Input type="number" value={formData.quantidade_costela}
              onChange={(e) => updateField('quantidade_costela', parseInt(e.target.value) || 0)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}