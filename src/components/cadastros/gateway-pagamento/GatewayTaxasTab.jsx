import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const TAXA_FIELDS = [
  { key: 'taxa_boleto_fixa', label: 'Taxa Boleto (Fixa em R$)' },
  { key: 'taxa_pix_percentual', label: 'Taxa PIX (%)' },
  { key: 'taxa_cartao_debito_percentual', label: 'Taxa Cartão Débito (%)' },
  { key: 'taxa_cartao_credito_percentual', label: 'Taxa Cartão Crédito (%)' },
];

export default function GatewayTaxasTab({ formData, setFormData }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {TAXA_FIELDS.map(({ key, label }) => (
        <div key={key}>
          <Label>{label}</Label>
          <Input
            type="number" step="0.01"
            value={formData.taxas_gateway?.[key] || 0}
            onChange={(e) => setFormData({
              ...formData,
              taxas_gateway: { ...formData.taxas_gateway, [key]: parseFloat(e.target.value) || 0 },
            })}
          />
        </div>
      ))}
    </div>
  );
}