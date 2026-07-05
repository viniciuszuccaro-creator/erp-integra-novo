import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CATEGORIAS = ['Aluguel', 'Contabilidade', 'Internet', 'Energia', 'Impostos', 'Água', 'Telefone', 'Outros'];

export default function RateioFormFields({ formRateio, setFormRateio }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Tipo de Documento *</Label>
          <Select value={formRateio.tipo_documento} onValueChange={(v) => setFormRateio({ ...formRateio, tipo_documento: v })}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="ContaPagar">Conta a Pagar (Despesa)</SelectItem>
              <SelectItem value="ContaReceber">Conta a Receber (Receita)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Categoria</Label>
          <Select value={formRateio.categoria} onValueChange={(v) => setFormRateio({ ...formRateio, categoria: v })}>
            <SelectTrigger className="mt-2"><SelectValue /></SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Descrição *</Label>
        <Input value={formRateio.descricao} onChange={(e) => setFormRateio({ ...formRateio, descricao: e.target.value })} placeholder="Ex: Aluguel Dezembro 2024" required className="mt-2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Valor Total *</Label>
          <Input
            type="number" step="0.01" value={formRateio.valor_total}
            onChange={(e) => {
              const valor = parseFloat(e.target.value) || 0;
              setFormRateio({
                ...formRateio, valor_total: valor,
                distribuicao: formRateio.distribuicao.map(d => ({ ...d, valor: ((d.percentual / 100) * valor).toFixed(2) })),
              });
            }}
            required className="mt-2"
          />
        </div>
        <div>
          <Label>Data Vencimento *</Label>
          <Input type="date" value={formRateio.data_vencimento} onChange={(e) => setFormRateio({ ...formRateio, data_vencimento: e.target.value })} required className="mt-2" />
        </div>
      </div>
    </>
  );
}