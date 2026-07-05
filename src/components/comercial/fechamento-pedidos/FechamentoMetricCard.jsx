import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const CORES = {
  blue: { card: 'bg-blue-100 text-blue-700 border-blue-300', icon: 'text-blue-600' },
  purple: { card: 'bg-purple-100 text-purple-700 border-purple-300', icon: 'text-purple-600' },
  green: { card: 'bg-green-100 text-green-700 border-green-300', icon: 'text-green-600' },
  orange: { card: 'bg-orange-100 text-orange-700 border-orange-300', icon: 'text-orange-600' },
  indigo: { card: 'bg-indigo-100 text-indigo-700 border-indigo-300', icon: 'text-indigo-600' },
};

export default function FechamentoMetricCard({ metrica }) {
  const Icon = metrica.icon;
  const cor = CORES[metrica.cor] || CORES.blue;
  return (
    <Card className={`border-2 ${cor.card}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className={`w-5 h-5 ${cor.icon}`} />
          {metrica.badge && <Badge className="text-xs bg-green-600 text-white">{metrica.badge}</Badge>}
        </div>
        <p className="text-2xl font-bold">{metrica.valor}</p>
        <p className="text-xs text-slate-600">{metrica.label}</p>
        {metrica.total !== undefined && (
          <div className="mt-2">
            <Progress value={metrica.percentual} className="h-1" />
            <p className="text-xs text-slate-500 mt-1">{metrica.percentual.toFixed(0)}% de {metrica.total}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}