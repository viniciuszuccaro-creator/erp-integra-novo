import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Brain, Save, RefreshCw } from "lucide-react";

/** Sub-componente extraído: Configuração de IA do canal */
export default function CanalTabIA({ config, onSave, isSaving }) {
  const [iaConfig, setIaConfig] = useState({ modelo: 'gpt-4', temperatura: 0.7, max_tokens: 500, contexto_sistema: '', usar_historico_cliente: true, usar_base_conhecimento: true, detectar_idioma: true });
  useEffect(() => { if (config?.ia_config) setIaConfig(config.ia_config); }, [config]);
  const handleSave = () => onSave({ ia_config: iaConfig });

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Brain className="w-5 h-5 text-purple-600" />Configuração da IA</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-3 gap-4">
          <div><Label>Modelo</Label><select value={iaConfig.modelo} onChange={(e) => setIaConfig({ ...iaConfig, modelo: e.target.value })} className="w-full mt-1 px-3 py-2 border rounded-md"><option value="gpt-4">GPT-4</option><option value="gpt-3.5-turbo">GPT-3.5 Turbo</option><option value="claude-3">Claude 3</option></select></div>
          <div><Label>Temperatura ({iaConfig.temperatura})</Label><input type="range" min="0" max="1" step="0.1" value={iaConfig.temperatura} onChange={(e) => setIaConfig({ ...iaConfig, temperatura: parseFloat(e.target.value) })} className="w-full mt-3" /></div>
          <div><Label>Max Tokens</Label><Input type="number" value={iaConfig.max_tokens} onChange={(e) => setIaConfig({ ...iaConfig, max_tokens: parseInt(e.target.value) })} className="mt-1" /></div>
        </div>
        <div><Label>Contexto do Sistema</Label><Textarea value={iaConfig.contexto_sistema} onChange={(e) => setIaConfig({ ...iaConfig, contexto_sistema: e.target.value })} placeholder="Instruções de comportamento para a IA..." className="mt-1 h-24" /></div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm">Usar histórico</span><Switch checked={iaConfig.usar_historico_cliente} onCheckedChange={(c) => setIaConfig({ ...iaConfig, usar_historico_cliente: c })} /></div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm">Base conhecimento</span><Switch checked={iaConfig.usar_base_conhecimento} onCheckedChange={(c) => setIaConfig({ ...iaConfig, usar_base_conhecimento: c })} /></div>
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"><span className="text-sm">Detectar idioma</span><Switch checked={iaConfig.detectar_idioma} onCheckedChange={(c) => setIaConfig({ ...iaConfig, detectar_idioma: c })} /></div>
        </div>
        <div className="flex justify-end pt-4">
          <Button data-permission="Chatbot.ConfiguracaoCanal.salvar" onClick={handleSave} disabled={isSaving} className="bg-purple-600">
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Salvar IA
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}