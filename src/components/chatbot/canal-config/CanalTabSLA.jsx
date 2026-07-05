import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Shield, Save, RefreshCw } from "lucide-react";

/** Sub-componente extraído: Configuração de SLA do canal */
export default function CanalTabSLA({ config, onSave, isSaving }) {
  const [slaConfig, setSlaConfig] = useState({ tempo_primeira_resposta_minutos: 5, tempo_resolucao_minutos: 60, tempo_espera_fila_maximo_minutos: 10, alertar_gestores: true, escalar_automaticamente: true });
  useEffect(() => { if (config?.sla_config) setSlaConfig(config.sla_config); }, [config]);
  const handleSave = () => onSave({ sla_config: slaConfig });

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5 text-red-600" />Configuração de SLA</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div><Label>Primeira Resposta (min)</Label><Input type="number" value={slaConfig.tempo_primeira_resposta_minutos} onChange={(e) => setSlaConfig({ ...slaConfig, tempo_primeira_resposta_minutos: parseInt(e.target.value) })} className="mt-1" /></div>
          <div><Label>Resolução (min)</Label><Input type="number" value={slaConfig.tempo_resolucao_minutos} onChange={(e) => setSlaConfig({ ...slaConfig, tempo_resolucao_minutos: parseInt(e.target.value) })} className="mt-1" /></div>
          <div><Label>Espera Fila (min)</Label><Input type="number" value={slaConfig.tempo_espera_fila_maximo_minutos} onChange={(e) => setSlaConfig({ ...slaConfig, tempo_espera_fila_maximo_minutos: parseInt(e.target.value) })} className="mt-1" /></div>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm">Alertar gestores ao exceder SLA</span><Switch checked={slaConfig.alertar_gestores} onCheckedChange={(c) => setSlaConfig({ ...slaConfig, alertar_gestores: c })} /></div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm">Escalar automaticamente</span><Switch checked={slaConfig.escalar_automaticamente} onCheckedChange={(c) => setSlaConfig({ ...slaConfig, escalar_automaticamente: c })} /></div>
        </div>
        <div className="flex justify-end pt-4">
          <Button data-permission="Chatbot.ConfiguracaoCanal.salvar" onClick={handleSave} disabled={isSaving} className="bg-red-600">
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Salvar SLA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}