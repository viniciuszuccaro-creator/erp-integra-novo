import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Shield } from "lucide-react";

export default function MonitoramentoTabAvancado({ formData, setFormData }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2"><Shield className="w-5 h-5 text-purple-600" />Configurações Avançadas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div><Label>Detectar Anomalias com IA</Label><p className="text-sm text-slate-600">Usar IA para detectar padrões anormais</p></div>
          <Switch data-action="Monitoramento.ia.detectarAnomalias" checked={formData.detectar_anomalias_ia} onCheckedChange={(checked) => setFormData({ ...formData, detectar_anomalias_ia: checked })} />
        </div>
        {formData.detectar_anomalias_ia && (
          <div>
            <Label>Confiança Mínima IA (%)</Label>
            <Input type="number" min="50" max="100" value={formData.ia_confianca_minima} onChange={(e) => setFormData({ ...formData, ia_confianca_minima: parseInt(e.target.value) })} />
          </div>
        )}
        <div className="flex items-center justify-between">
          <div><Label>Profiling Ativo</Label><p className="text-sm text-slate-600">Profiling detalhado de funções</p></div>
          <Switch data-action="Monitoramento.profilingAtivo" checked={formData.profiling_ativo} onCheckedChange={(checked) => setFormData({ ...formData, profiling_ativo: checked })} />
        </div>
        <div className="flex items-center justify-between">
          <div><Label>Samplear Requisições</Label><p className="text-sm text-slate-600">Monitorar apenas % das requisições (economia)</p></div>
          <Switch data-action="Monitoramento.samplearRequisicoes" checked={formData.samplear_requisicoes} onCheckedChange={(checked) => setFormData({ ...formData, samplear_requisicoes: checked })} />
        </div>
        {formData.samplear_requisicoes && (
          <div>
            <Label>Taxa de Amostragem (%)</Label>
            <Input type="number" min="1" max="100" value={formData.taxa_amostragem_percent || 100} onChange={(e) => setFormData({ ...formData, taxa_amostragem_percent: parseInt(e.target.value) })} />
            <p className="text-xs text-slate-500 mt-1">Recomendado: 10-20% para sistemas com alto volume</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}