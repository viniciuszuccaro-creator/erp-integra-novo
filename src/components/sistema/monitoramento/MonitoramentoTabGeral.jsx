import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings } from "lucide-react";

export default function MonitoramentoTabGeral({ formData, setFormData }) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">Configurações Gerais</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div><Label className="text-base">Monitoramento Ativo</Label><p className="text-sm text-slate-600">Ativar monitoramento de performance</p></div>
          <Switch data-action="Monitoramento.ativo" checked={formData.ativo} onCheckedChange={(checked) => setFormData({ ...formData, ativo: checked })} />
        </div>
        <div>
          <Label>Nível de Monitoramento</Label>
          <Select value={formData.nivel_monitoramento} onValueChange={(value) => setFormData({ ...formData, nivel_monitoramento: value })}>
            <SelectTrigger data-action="Monitoramento.nivel"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Básico">Básico (apenas erros)</SelectItem>
              <SelectItem value="Intermediário">Intermediário (erros + lentos)</SelectItem>
              <SelectItem value="Avançado">Avançado (tudo + métricas)</SelectItem>
              <SelectItem value="Completo">Completo (profiling detalhado)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-slate-500 mt-1">Níveis mais altos coletam mais dados mas podem impactar performance</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Intervalo de Coleta (segundos)</Label>
            <Input type="number" min="10" max="300" value={formData.intervalo_coleta_segundos} onChange={(e) => setFormData({ ...formData, intervalo_coleta_segundos: parseInt(e.target.value) })} />
          </div>
          <div>
            <Label>Retenção de Logs (dias)</Label>
            <Input type="number" min="7" max="365" value={formData.retencao_logs_dias} onChange={(e) => setFormData({ ...formData, retencao_logs_dias: parseInt(e.target.value) })} />
          </div>
        </div>
        <div className="border-t pt-4 space-y-3">
          {[
            { key: "monitorar_queries", label: "Monitorar Queries", desc: "Rastrear queries do banco", action: "Monitoramento.monitorarQueries" },
            { key: "monitorar_apis", label: "Monitorar APIs", desc: "Rastrear chamadas de API", action: "Monitoramento.monitorarApis" },
            { key: "monitorar_integracao", label: "Monitorar Integrações", desc: "Rastrear integrações externas", action: "Monitoramento.monitorarIntegracao" },
            { key: "monitorar_exports", label: "Monitorar Exportações", desc: "Rastrear PDF/Excel", action: "Monitoramento.monitorarExports" },
          ].map(({ key, label, desc, action }) => (
            <div key={key} className="flex items-center justify-between">
              <div><Label>{label}</Label><p className="text-xs text-slate-600">{desc}</p></div>
              <Switch data-action={action} checked={formData[key]} onCheckedChange={(checked) => setFormData({ ...formData, [key]: checked })} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}