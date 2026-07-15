import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, Save } from "lucide-react";

export default function ParametroCaixaDiarioForm({ parametro, onSubmit, windowMode = false }) {
  const [formData, setFormData] = useState(parametro || {
    exigir_abertura_caixa: true,
    exigir_fechamento_caixa: true,
    permitir_sangria: true,
    permitir_suprimento: true,
    valor_maximo_sangria: 1000,
    alertar_divergencia_fechamento: true,
    tolerancia_divergencia: 5,
    gerar_movimento_automatico: true,
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
              <Wallet className="w-5 h-5 text-emerald-600" />
              Parâmetros do Caixa Diário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Exigir Abertura Caixa</Label>
                <Switch
                  checked={formData.exigir_abertura_caixa}
                  onCheckedChange={(val) => setFormData({ ...formData, exigir_abertura_caixa: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Exigir Fechamento Caixa</Label>
                <Switch
                  checked={formData.exigir_fechamento_caixa}
                  onCheckedChange={(val) => setFormData({ ...formData, exigir_fechamento_caixa: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Permitir Sangria</Label>
                <Switch
                  checked={formData.permitir_sangria}
                  onCheckedChange={(val) => setFormData({ ...formData, permitir_sangria: val })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Permitir Suprimento</Label>
                <Switch
                  checked={formData.permitir_suprimento}
                  onCheckedChange={(val) => setFormData({ ...formData, permitir_suprimento: val })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Valor Máximo Sangria (R$)</Label>
                <Input
                  type="number"
                  value={formData.valor_maximo_sangria}
                  onChange={(e) => setFormData({ ...formData, valor_maximo_sangria: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label>Tolerância Divergência (R$)</Label>
                <Input
                  type="number"
                  value={formData.tolerancia_divergencia}
                  onChange={(e) => setFormData({ ...formData, tolerancia_divergencia: parseFloat(e.target.value) })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
            <Save className="w-4 h-4 mr-2" />
            Salvar Parâmetros
          </Button>
        </div>
      </form>
    </div>
  );
}