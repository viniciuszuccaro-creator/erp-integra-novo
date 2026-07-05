import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function RomaneioChecklist({ checklist, setChecklist }) {
  const items = [
    { key: 'documentos_ok', label: 'Documentos conferidos (NF-e, romaneio, etc.)' },
    { key: 'veiculo_ok', label: 'Veículo em boas condições' },
    { key: 'carga_conferida', label: 'Carga conferida e amarrada' },
    { key: 'combustivel_ok', label: 'Combustível suficiente' },
  ];

  return (
    <Card>
      <CardHeader className="bg-orange-50 border-b">
        <CardTitle className="text-base">Checklist de Saída</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {items.map(item => (
          <div key={item.key} className="flex items-center gap-3">
            <Checkbox
              checked={checklist[item.key]}
              onCheckedChange={(v) => setChecklist({ ...checklist, [item.key]: v })}
            />
            <Label>{item.label}</Label>
          </div>
        ))}
        <div className="mt-3">
          <Label>Observações do Checklist</Label>
          <Textarea
            value={checklist.observacoes}
            onChange={(e) => setChecklist({ ...checklist, observacoes: e.target.value })}
            rows={2}
            className="mt-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}