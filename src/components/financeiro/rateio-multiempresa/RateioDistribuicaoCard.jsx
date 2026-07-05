import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Building2, DollarSign, Percent } from 'lucide-react';

export default function RateioDistribuicaoCard({ dist, onPercentualChange }) {
  return (
    <Card className="p-4 bg-slate-50">
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-2 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-purple-600" />
          <span className="font-semibold">{dist.empresa_nome}</span>
        </div>
        <div>
          <Label className="text-xs text-slate-600">Percentual %</Label>
          <div className="relative mt-1">
            <Input type="number" step="0.01" min="0" max="100" value={dist.percentual} onChange={(e) => onPercentualChange(dist.empresa_id, e.target.value)} className="pr-8" />
            <Percent className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
        <div>
          <Label className="text-xs text-slate-600">Valor R$</Label>
          <div className="relative mt-1">
            <Input type="number" step="0.01" value={dist.valor} readOnly className="bg-white font-semibold" />
            <DollarSign className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>
      </div>
    </Card>
  );
}