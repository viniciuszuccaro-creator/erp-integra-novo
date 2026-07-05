import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const LIMITE_FIELDS = [
  { key: 'valor_minimo', label: 'Valor Mínimo Transação (R$)' },
  { key: 'valor_maximo', label: 'Valor Máximo Transação (R$)' },
  { key: 'limite_diario', label: 'Limite Diário (R$)' },
  { key: 'limite_mensal', label: 'Limite Mensal (R$)' },
];

export default function GatewayConfigTab({ formData, setFormData }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {LIMITE_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <Label>{label}</Label>
            <Input
              type="number" step="0.01"
              value={formData.limites_transacao?.[key] || 0}
              onChange={(e) => setFormData({
                ...formData,
                limites_transacao: { ...formData.limites_transacao, [key]: parseFloat(e.target.value) || 0 },
              })}
            />
          </div>
        ))}
      </div>
      <div>
        <Label>Observações</Label>
        <Textarea
          value={formData.observacoes || ''}
          onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
          placeholder="Informações adicionais sobre este gateway..."
          rows={3}
        />
      </div>
    </div>
  );
}