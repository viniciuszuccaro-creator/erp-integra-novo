import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Landmark, Save } from "lucide-react";

export default function ParametroConciliacaoBancariaForm({ parametro, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(parametro || {
    tipo_lancamento: "Ambos",
    usar_nsu: true,
    usar_historico: true,
    usar_convenio: true,
    tolerancia_diferenca_valor: 0.01,
    tolerancia_diferenca_dias: 2,
    usar_ia_aprendizado: true,
    conciliacao_automatica_ativa: false,
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
              <Landmark className="w-5 h-5 text-cyan-600" />
              Parâmetros de Conciliação Bancária
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo de Lançamento</Label>
              <Select value={formData.tipo_lancamento} onValueChange={(val) => setFormData({ ...formData, tipo_lancamento: val })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Crédito">Crédito</SelectItem>
                  <SelectItem value="Débito">Débito</SelectItem>
                  <SelectItem value="Ambos">Ambos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Usar NSU</Label>
                <Switch
                  checked={formData.usar_nsu}
                  onCheckedChange={(val) => setFormData({ ...formData, usar_nsu: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Usar Histórico</Label>
                <Switch
                  checked={formData.usar_historico}
                  onCheckedChange={(val) => setFormData({ ...formData, usar_historico: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Usar IA Aprendizado</Label>
                <Switch
                  checked={formData.usar_ia_aprendizado}
                  onCheckedChange={(val) => setFormData({ ...formData, usar_ia_aprendizado: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Conciliação Automática</Label>
                <Switch
                  checked={formData.conciliacao_automatica_ativa}
                  onCheckedChange={(val) => setFormData({ ...formData, conciliacao_automatica_ativa: val })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tolerância Valor (R$)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.tolerancia_diferenca_valor}
                  onChange={(e) => setFormData({ ...formData, tolerancia_diferenca_valor: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Tolerância Dias</Label>
                <Input
                  type="number"
                  value={formData.tolerancia_diferenca_dias}
                  onChange={(e) => setFormData({ ...formData, tolerancia_diferenca_dias: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" className="bg-cyan-600 hover:bg-cyan-700">
            <Save className="w-4 h-4 mr-2" />
            Salvar Parâmetros
          </Button>
        </div>
      </form>
    </div>
  );
}