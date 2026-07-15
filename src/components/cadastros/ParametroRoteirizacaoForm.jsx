import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Save } from "lucide-react";

export default function ParametroRoteirizacaoForm({ parametro, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(parametro || {
    usar_ia_otimizacao: true,
    considerar_janela_horario: true,
    priorizar_urgencia: true,
    agrupar_por_regiao: true,
    distancia_maxima_km: 100,
    tempo_medio_entrega_minutos: 30,
    ativo: true
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const containerClass = windowMode ? "w-full h-full overflow-auto p-6" : "space-y-6";

  return (
    <div className={containerClass}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-600" />
              Parâmetros de Roteirização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label>Usar IA para Otimização</Label>
                <Switch
                  checked={formData.usar_ia_otimizacao}
                  onCheckedChange={(val) => setFormData({ ...formData, usar_ia_otimizacao: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Considerar Janela Horário</Label>
                <Switch
                  checked={formData.considerar_janela_horario}
                  onCheckedChange={(val) => setFormData({ ...formData, considerar_janela_horario: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Priorizar Urgência</Label>
                <Switch
                  checked={formData.priorizar_urgencia}
                  onCheckedChange={(val) => setFormData({ ...formData, priorizar_urgencia: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Agrupar por Região</Label>
                <Switch
                  checked={formData.agrupar_por_regiao}
                  onCheckedChange={(val) => setFormData({ ...formData, agrupar_por_regiao: val })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Distância Máxima (km)</Label>
                <Input
                  type="number"
                  value={formData.distancia_maxima_km}
                  onChange={(e) => setFormData({ ...formData, distancia_maxima_km: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Tempo Médio Entrega (min)</Label>
                <Input
                  type="number"
                  value={formData.tempo_medio_entrega_minutos}
                  onChange={(e) => setFormData({ ...formData, tempo_medio_entrega_minutos: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
            <Save className="w-4 h-4 mr-2" />
            Salvar Parâmetros
          </Button>
        </div>
      </form>
    </div>
  );
}