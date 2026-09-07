import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import usePermissions from "@/components/lib/usePermissions";

export default function ContaReceberFinanceiroSection({ formData, setFormData, formasPagamento = [] }) {
  // Regra-Mãe 5b: "Recebido" exige permissão de baixa/recebimento; "Cancelado" exige cancelar
  const { hasPermission } = usePermissions();
  const podeBaixar = ['baixar', 'liquidar', 'receber'].some(a => hasPermission('Financeiro', 'ContaReceber', a));
  const podeCancelar = hasPermission('Financeiro', 'ContaReceber', 'cancelar');
  const statusOptions = [
    { value: 'Pendente', allowed: true },
    { value: 'Recebido', allowed: podeBaixar },
    { value: 'Atrasado', allowed: true },
    { value: 'Cancelado', allowed: podeCancelar },
    { value: 'Parcial', allowed: true },
  ].filter(o => o.allowed);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Forma de Recebimento</Label>
          <Select
            value={formData.forma_recebimento_id || formData.forma_recebimento}
            onValueChange={(formaId) => {
              const forma = (formasPagamento || []).find((f) => f.id === formaId);
              setFormData({
                ...formData,
                forma_recebimento_id: formaId,
                forma_recebimento: forma?.descricao || formaId,
              });
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(formasPagamento || []).map((forma) => (
                <SelectItem key={forma.id} value={forma.id}>
                  {forma.icone && `${forma.icone} `}
                  {forma.descricao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.value}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Número do Documento</Label>
          <Input
            value={formData.numero_documento}
            onChange={(e) => setFormData({ ...formData, numero_documento: e.target.value })}
            placeholder="Ex: NF-123456"
          />
        </div>

        <div>
          <Label>Número Parcela</Label>
          <Input
            value={formData.numero_parcela}
            onChange={(e) => setFormData({ ...formData, numero_parcela: e.target.value })}
            placeholder="Ex: 1/3"
          />
        </div>
      </div>
    </div>
  );
}