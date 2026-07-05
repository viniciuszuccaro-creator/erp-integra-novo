import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tag } from "lucide-react";

export default function ItemProducaoObservacoes({ formData, updateField, adicionarTag, removerTag }) {
  return (
    <Card>
      <CardHeader className="bg-slate-50 pb-3">
        <CardTitle className="text-sm flex items-center gap-2"><Tag className="w-4 h-4" />Observações Técnicas</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <Label>Tags Técnicas</Label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {['#ObraRapida', '#AltoRisco', '#Especial', '#ConcreteArmado', '#PreMoldado'].map(tag => (
                <Button key={tag} type="button" size="sm" variant="outline" onClick={() => adicionarTag(tag)} className="text-xs">{tag}</Button>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              {(formData.tags_tecnicas || []).map(tag => (
                <Badge key={tag} className="bg-blue-600">{tag}
                  <button type="button" onClick={() => removerTag(tag)} className="ml-2 hover:text-red-200">×</button>
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Observações Detalhadas</Label>
            <Textarea value={formData.observacoes_tecnicas} onChange={(e) => updateField('observacoes_tecnicas', e.target.value)}
              rows={3} placeholder="Especificações técnicas, requisitos especiais, detalhes de montagem..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Prazo Entrega (dias)</Label>
              <Input type="number" value={formData.prazo_entrega_dias}
                onChange={(e) => updateField('prazo_entrega_dias', parseInt(e.target.value) || 7)} min="1" />
            </div>
            <div className="flex items-center gap-2 mt-6">
              <Switch checked={formData.gerar_op_automaticamente} onCheckedChange={(c) => updateField('gerar_op_automaticamente', c)} />
              <Label>Gerar OP Automaticamente</Label>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}