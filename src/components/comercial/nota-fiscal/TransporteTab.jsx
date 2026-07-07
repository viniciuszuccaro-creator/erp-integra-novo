import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useRLSQuery from "@/components/lib/useRLSQuery";

export default function TransporteTab({ formData, setFormData }) {
  const { data: tiposFrete = [], isLoading: loadingTipos } = useRLSQuery('TipoFrete', {}, 'nome', 50);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Modalidade de Frete</Label>
          <Select
            value={formData.transportadora?.modalidade_frete || "CIF"}
            onValueChange={(value) => setFormData({
              ...formData,
              transportadora: { ...formData.transportadora, modalidade_frete: value }
            })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {loadingTipos && <SelectItem value="_loading" disabled>Carregando...</SelectItem>}
              {!loadingTipos && tiposFrete.length === 0 && <SelectItem value="_empty" disabled>Nenhum tipo cadastrado</SelectItem>}
              {tiposFrete.map((t) => (
                <SelectItem key={t.id} value={t.nome || t.codigo || t.descricao}>{t.nome || t.codigo || t.descricao}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Transportadora</Label>
          <Input
            value={formData.transportadora?.nome || ""}
            onChange={(e) => setFormData({
              ...formData,
              transportadora: { ...formData.transportadora, nome: e.target.value }
            })}
            placeholder="Nome da transportadora"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label>Volumes</Label>
          <Input
            type="number"
            value={formData.transportadora?.volumes || 0}
            onChange={(e) => setFormData({
              ...formData,
              transportadora: { ...formData.transportadora, volumes: parseInt(e.target.value) || 0 }
            })}
          />
        </div>

        <div>
          <Label>Peso Bruto (kg)</Label>
          <Input
            type="number"
            step="0.001"
            value={formData.transportadora?.peso_bruto || 0}
            onChange={(e) => setFormData({
              ...formData,
              transportadora: { ...formData.transportadora, peso_bruto: parseFloat(e.target.value) || 0 }
            })}
          />
        </div>

        <div>
          <Label>Peso Líquido (kg)</Label>
          <Input
            type="number"
            step="0.001"
            value={formData.transportadora?.peso_liquido || 0}
            onChange={(e) => setFormData({
              ...formData,
              transportadora: { ...formData.transportadora, peso_liquido: parseFloat(e.target.value) || 0 }
            })}
          />
        </div>
      </div>
    </div>
  );
}