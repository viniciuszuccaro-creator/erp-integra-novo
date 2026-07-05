import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ClienteFormEndereco({ formData, setFormData }) {
  const campos = [
    { key: 'endereco', label: 'Endereço', colSpan: true },
    { key: 'numero', label: 'Número' },
    { key: 'complemento', label: 'Complemento' },
    { key: 'bairro', label: 'Bairro' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'estado', label: 'Estado', maxLength: 2 },
  ];

  return (
    <>
      {campos.map(c => (
        <div key={c.key} className={c.colSpan ? 'col-span-2' : ''}>
          <Label htmlFor={c.key}>{c.label}</Label>
          <Input
            id={c.key}
            value={formData[c.key]}
            onChange={(e) => setFormData({ ...formData, [c.key]: e.target.value })}
            maxLength={c.maxLength}
          />
        </div>
      ))}
    </>
  );
}