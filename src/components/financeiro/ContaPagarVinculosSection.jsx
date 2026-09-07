import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ContaPagarVinculosSection({ formData, setFormData, ordensCompra = [], centrosCusto = [], planosContas = [] }) {
  return (
    <div className="space-y-4">
      <div>
        <Label>Ordem de Compra Vinculada</Label>
        <Select value={formData.ordem_compra_id} onValueChange={(v) => setFormData({ ...formData, ordem_compra_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Nenhuma OC vinculada..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Nenhuma</SelectItem>
            {ordensCompra.map((oc) => (
              <SelectItem key={oc.id} value={oc.id}>
                {oc.numero_oc} - {oc.fornecedor_nome} - R$ {oc.valor_total?.toFixed(2)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Centro de Custo *</Label>
        <Select
          value={formData.centro_custo_id}
          onValueChange={(v) => {
            const cc = centrosCusto.find((c) => c.id === v);
            setFormData({ ...formData, centro_custo_id: v, centro_custo: cc?.descricao || cc?.codigo || "" });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {centrosCusto.map((cc) => (
              <SelectItem key={cc.id} value={cc.id}>
                {cc.codigo} - {cc.descricao}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Plano de Contas *</Label>
        <Select value={formData.plano_contas_id} onValueChange={(v) => setFormData({ ...formData, plano_contas_id: v })}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione..." />
          </SelectTrigger>
          <SelectContent>
            {planosContas.map((pc) => (
              <SelectItem key={pc.id} value={pc.id}>
                {pc.codigo || pc.id} - {pc.nome_conta || pc.descricao || pc.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Projeto/Obra</Label>
        <Input
          value={formData.projeto_obra}
          onChange={(e) => setFormData({ ...formData, projeto_obra: e.target.value })}
          placeholder="Nome do projeto ou obra..."
        />
      </div>
    </div>
  );
}