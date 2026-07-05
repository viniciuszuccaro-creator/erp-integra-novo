import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function RentabilidadeKPIs({ dados, totalReceita, totalMargem, margemMediaPonderada, produtosMargemNegativa }) {
  const kpis = [
    { label: 'Total Produtos Vendidos', value: dados.length, cor: 'text-blue-600', sub: 'no período' },
    { label: 'Receita Total', value: `R$ ${totalReceita.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, cor: 'text-green-600' },
    { label: 'Margem Média', value: `${margemMediaPonderada.toFixed(1)}%`, cor: 'text-purple-600', sub: `R$ ${totalMargem.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <Card key={i} className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.cor}`}>{kpi.value}</p>
            {kpi.sub && <p className="text-xs text-slate-500 mt-1">{kpi.sub}</p>}
          </CardContent>
        </Card>
      ))}
      <Card className={`border-0 shadow-md ${produtosMargemNegativa.length > 0 ? 'bg-red-50 border-red-200' : ''}`}>
        <CardContent className="p-4">
          <p className="text-sm text-red-700">Produtos com Margem Negativa</p>
          <p className="text-2xl font-bold text-red-600">{produtosMargemNegativa.length}</p>
          {produtosMargemNegativa.length > 0 && (
            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Requer atenção
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}