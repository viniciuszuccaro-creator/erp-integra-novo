import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

export default function DespesaRecorrenteTabRateio({ formData, setFormData, empresas }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label>Rateio Automático entre Empresas</Label>
          <p className="text-xs text-slate-500">Distribuir despesa entre filiais</p>
        </div>
        <Switch checked={formData.rateio_automatico} onCheckedChange={(checked) => setFormData({ ...formData, rateio_automatico: checked })} />
      </div>

      {formData.rateio_automatico && (
        <div className="space-y-2">
          <Label>Empresas para Rateio</Label>
          {empresas.map((empresa) => {
            const rateio = formData.empresas_rateio?.find(e => e.empresa_id === empresa.id);
            return (
              <div key={empresa.id} className="flex items-center gap-3 p-2 border rounded">
                <Checkbox
                  checked={!!rateio}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setFormData({
                        ...formData,
                        empresas_rateio: [
                          ...(formData.empresas_rateio || []),
                          { empresa_id: empresa.id, empresa_nome: empresa.nome_fantasia, percentual: 0 }
                        ]
                      });
                    } else {
                      setFormData({
                        ...formData,
                        empresas_rateio: (formData.empresas_rateio || []).filter(e => e.empresa_id !== empresa.id)
                      });
                    }
                  }}
                />
                <span className="flex-1 text-sm">{empresa.nome_fantasia}</span>
                {rateio && (
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="%"
                    className="w-20"
                    value={rateio.percentual}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        empresas_rateio: formData.empresas_rateio.map(er =>
                          er.empresa_id === empresa.id ? { ...er, percentual: parseFloat(e.target.value) } : er
                        )
                      });
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}