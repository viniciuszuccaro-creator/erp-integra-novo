import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Controller } from 'react-hook-form';

export default function ClienteFormComercial({ control, formData, setFormData }) {
  return (
    <>
      <div>
        <Label htmlFor="limite_credito">Limite de Crédito</Label>
        <Controller
          control={control}
          name="limite_credito"
          render={({ field, fieldState }) => (
            <>
              <Input id="limite_credito" type="number" step="0.01" {...field} />
              {fieldState.error && <p className="text-xs text-red-600 mt-1">{fieldState.error.message}</p>}
            </>
          )}
        />
      </div>

      <div>
        <Label htmlFor="condicao_pagamento">Condição de Pagamento</Label>
        <Controller
          control={control}
          name="condicao_pagamento"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['À Vista', '7 dias', '15 dias', '30 dias', '45 dias', '60 dias', 'Parcelado'].map(v => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </div>

      <div>
        <Label htmlFor="vendedor_responsavel">Vendedor Responsável</Label>
        <Input
          id="vendedor_responsavel"
          value={formData.vendedor_responsavel}
          onChange={(e) => setFormData({ ...formData, vendedor_responsavel: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            {['Prospect', 'Ativo', 'Inativo', 'Bloqueado'].map(v => (
              <SelectItem key={v} value={v}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
}