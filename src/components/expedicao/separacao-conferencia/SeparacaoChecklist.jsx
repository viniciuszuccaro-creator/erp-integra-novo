import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const CHECKLIST_ITEMS = [
  { key: "conferiu_quantidade", label: "Conferiu quantidade de todos os itens" },
  { key: "conferiu_qualidade", label: "Conferiu qualidade visual (sem avarias)" },
  { key: "conferiu_embalagem", label: "Conferiu embalagem adequada" },
  { key: "conferiu_etiquetas", label: "Conferiu etiquetas e identificação" },
  { key: "conferiu_documentos", label: "Conferiu documentos (NF, pedido, etc.)" },
];

/**
 * Checklist de conferência (extraído de SeparacaoConferencia)
 */
export default function SeparacaoChecklist({ checklist, setChecklist }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="text-base">Checklist de Conferência</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {CHECKLIST_ITEMS.map(({ key, label }) => (
          <div key={key} className="flex items-center gap-3">
            <Checkbox
              checked={checklist[key]}
              onCheckedChange={(v) => setChecklist({ ...checklist, [key]: v })}
              id={key}
            />
            <Label htmlFor={key} className="text-base">{label}</Label>
          </div>
        ))}
        <div className="mt-4">
          <Label htmlFor="observacoes_checklist">Observações do Checklist</Label>
          <Textarea
            id="observacoes_checklist"
            value={checklist.observacoes_checklist}
            onChange={(e) => setChecklist({ ...checklist, observacoes_checklist: e.target.value })}
            rows={3}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}