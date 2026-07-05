import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ComposedChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RentabilidadeCharts({ top20, curvaABCData }) {
  const abcCounts = {
    A: curvaABCData.filter(c => c.classe === 'A').length,
    B: curvaABCData.filter(c => c.classe === 'B').length,
    C: curvaABCData.filter(c => c.classe === 'C').length,
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-md">
        <CardHeader><CardTitle>Receita x Custo x Margem (Top 20)</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={top20}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="descricao" angle={-45} textAnchor="end" height={120} fontSize={10} />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip formatter={(value, name) => name === 'Margem %' ? `${Number(value).toFixed(1)}%` : `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend />
              <Bar yAxisId="left" dataKey="receita_total" fill="#10b981" name="Receita" />
              <Bar yAxisId="left" dataKey="custo_total" fill="#ef4444" name="Custo" />
              <Line yAxisId="right" type="monotone" dataKey="margem_percentual" stroke="#8b5cf6" strokeWidth={2} name="Margem %" />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardHeader><CardTitle>Curva ABC - Participação na Receita</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={curvaABCData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="posicao" label={{ value: 'Produtos (ordenados)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: '% Acumulado', angle: -90, position: 'insideLeft' }} />
              <Tooltip formatter={(value, name) => name === '% Acumulado' ? `${Number(value).toFixed(1)}%` : `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              <Legend />
              <Line type="monotone" dataKey="percentualAcumulado" stroke="#3b82f6" strokeWidth={3} name="% Acumulado" />
              <Line dataKey={() => 80} stroke="#10b981" strokeDasharray="5 5" name="Classe A (80%)" strokeWidth={1} dot={false} />
              <Line dataKey={() => 95} stroke="#f59e0b" strokeDasharray="5 5" name="Classe B (95%)" strokeWidth={1} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[
              { cor: 'blue', classe: 'A', label: '0-80%', desc: '80% da receita' },
              { cor: 'green', classe: 'B', label: '80-95%', desc: '15% da receita' },
              { cor: 'yellow', classe: 'C', label: '95-100%', desc: '5% da receita' },
            ].map(c => (
              <div key={c.classe} className={`p-3 bg-${c.cor}-50 rounded-lg border border-${c.cor}-200`}>
                <p className={`text-xs text-${c.cor}-700`}>Classe {c.classe} ({c.label})</p>
                <p className={`font-bold text-${c.cor}-900`}>{abcCounts[c.classe]} produtos</p>
                <p className={`text-xs text-${c.cor}-600 mt-1`}>{c.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}