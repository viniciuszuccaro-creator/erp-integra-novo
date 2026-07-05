import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bolt } from "lucide-react";

export default function MonitoramentoTabThresholds({ formData, setFormData }) {
  const thresholds = [
    { key: "query_lenta_ms", label: "Query Lenta (ms)", def: 1000 },
    { key: "api_lenta_ms", label: "API Lenta (ms)", def: 2000 },
    { key: "page_load_lenta_ms", label: "Page Load Lenta (ms)", def: 3000 },
    { key: "export_lento_ms", label: "Export Lento (ms)", def: 10000 },
    { key: "cpu_alta_percent", label: "CPU Alta (%)", def: 80, min: 50, max: 100 },
    { key: "memoria_alta_percent", label: "Memória Alta (%)", def: 85, min: 50, max: 100 },
    { key: "taxa_erro_percent", label: "Taxa de Erro Máxima (%)", def: 5, min: 0, max: 100 },
    { key: "disponibilidade_minima_percent", label: "Disponibilidade Mínima (%)", def: 99, min: 90, max: 100, step: "0.1", isFloat: true },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Bolt className="w-5 h-5 text-yellow-600" />Limites de Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-600 mb-4">Operações acima destes limites serão consideradas lentas e gerarão alertas</p>
        <div className="grid grid-cols-2 gap-4">
          {thresholds.map(({ key, label, def, min, max, step, isFloat }) => (
            <div key={key}>
              <Label className="text-xs">{label}</Label>
              <Input
                type="number"
                min={min} max={max} step={step}
                value={formData.thresholds?.[key] ?? def}
                onChange={(e) => setFormData({ ...formData, thresholds: { ...(formData.thresholds || {}), [key]: isFloat ? parseFloat(e.target.value) : parseInt(e.target.value) } })}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}