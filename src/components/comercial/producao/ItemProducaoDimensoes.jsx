import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ItemProducaoDimensoes({ formData, updateField }) {
  const isRetangular = ["Coluna", "Viga", "Bloco"].includes(formData.tipo_peca);
  const isCircular = ["Estaca", "Broca"].includes(formData.tipo_peca);

  return (
    <Card>
      <CardHeader className="bg-blue-50 pb-3">
        <CardTitle className="text-sm">Dimensões (cm)</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {isRetangular && (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Comprimento *</Label>
              <Input type="number" value={formData.comprimento}
                onChange={(e) => updateField('comprimento', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Largura *</Label>
              <Input type="number" value={formData.largura}
                onChange={(e) => updateField('largura', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Altura *</Label>
              <Input type="number" value={formData.altura}
                onChange={(e) => updateField('altura', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        )}
        {isCircular && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Comprimento *</Label>
              <Input type="number" value={formData.comprimento}
                onChange={(e) => updateField('comprimento', parseFloat(e.target.value) || 0)} />
            </div>
            <div>
              <Label>Diâmetro *</Label>
              <Input type="number" value={formData.diametro}
                onChange={(e) => updateField('diametro', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}