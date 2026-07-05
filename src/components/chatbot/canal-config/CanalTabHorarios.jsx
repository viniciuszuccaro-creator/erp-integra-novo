import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Clock, Save, RefreshCw } from "lucide-react";

/** Sub-componente extraído: Configuração de Horários de Atendimento */
export default function CanalTabHorarios({ config, onSave, isSaving }) {
  const diasSemana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];
  const diasLabels = { segunda: 'Segunda', terca: 'Terça', quarta: 'Quarta', quinta: 'Quinta', sexta: 'Sexta', sabado: 'Sábado', domingo: 'Domingo' };
  const [horarios, setHorarios] = useState({
    segunda: { inicio: '08:00', fim: '18:00', ativo: true }, terca: { inicio: '08:00', fim: '18:00', ativo: true },
    quarta: { inicio: '08:00', fim: '18:00', ativo: true }, quinta: { inicio: '08:00', fim: '18:00', ativo: true },
    sexta: { inicio: '08:00', fim: '18:00', ativo: true }, sabado: { inicio: '08:00', fim: '12:00', ativo: false },
    domingo: { inicio: '', fim: '', ativo: false }
  });

  useEffect(() => { if (config?.horario_atendimento) setHorarios(config.horario_atendimento); }, [config]);
  const handleSave = () => onSave({ horario_atendimento: horarios });

  return (
    <Card>
      <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-green-600" />Horários de Atendimento</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {diasSemana.map(dia => (
          <div key={dia} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
            <div className="w-20"><span className="text-sm font-medium">{diasLabels[dia]}</span></div>
            <Switch checked={horarios[dia]?.ativo} onCheckedChange={(c) => setHorarios({ ...horarios, [dia]: { ...horarios[dia], ativo: c } })} />
            <Input type="time" value={horarios[dia]?.inicio || ''} onChange={(e) => setHorarios({ ...horarios, [dia]: { ...horarios[dia], inicio: e.target.value } })} disabled={!horarios[dia]?.ativo} className="w-28" />
            <span className="text-sm">até</span>
            <Input type="time" value={horarios[dia]?.fim || ''} onChange={(e) => setHorarios({ ...horarios, [dia]: { ...horarios[dia], fim: e.target.value } })} disabled={!horarios[dia]?.ativo} className="w-28" />
          </div>
        ))}
        <div className="flex justify-end pt-4">
          <Button data-permission="Chatbot.ConfiguracaoCanal.salvar" onClick={handleSave} disabled={isSaving} className="bg-blue-600">
            {isSaving ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Salvar Horários
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}