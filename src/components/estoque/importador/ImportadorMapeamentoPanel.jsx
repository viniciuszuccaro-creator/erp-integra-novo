import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FIELD_LABELS } from "./importadorHelpers";

export default function ImportadorMapeamentoPanel({ availableHeaders, columnMap, setColumnMap }) {
  if (!availableHeaders.length) return null;

  return (
    <Card className="border-slate-200 mt-4">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-sm">Mapeamento automático de colunas</CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        <p className="text-xs text-slate-600">Revise as correspondências sugeridas. Você pode ajustar manualmente.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.keys(FIELD_LABELS).map((field) => (
            <div key={field} className="flex items-center gap-2">
              <Label className="w-40 text-xs text-slate-700">{FIELD_LABELS[field]}</Label>
              <Select value={columnMap[field] || ''} onValueChange={(v) => setColumnMap((prev) => ({ ...prev, [field]: v }))}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Auto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>(Auto)</SelectItem>
                  {availableHeaders.map((h) => (
                    <SelectItem key={`${field}-${h}`} value={h}>{h}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}