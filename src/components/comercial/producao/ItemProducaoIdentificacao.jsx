import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ItemProducaoIdentificacao({ formData, updateField, index }) {
  return (
    <Card>
      <CardHeader className="bg-slate-50 pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Badge className="bg-amber-600">Peça #{index + 1}</Badge>
          Identificação
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label>ID da Peça *</Label>
            <Input value={formData.identificador} onChange={(e) => updateField('identificador', e.target.value)}
              placeholder="P1, P2..." className="font-mono font-bold" />
          </div>
          <div>
            <Label>Tipo de Peça *</Label>
            <Select value={formData.tipo_peca} onValueChange={(value) => updateField('tipo_peca', value)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Coluna">Coluna</SelectItem>
                <SelectItem value="Viga">Viga</SelectItem>
                <SelectItem value="Estaca">Estaca</SelectItem>
                <SelectItem value="Broca">Broca</SelectItem>
                <SelectItem value="Bloco">Bloco</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Quantidade *</Label>
            <Input type="number" value={formData.quantidade}
              onChange={(e) => updateField('quantidade', parseInt(e.target.value) || 1)} min="1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}