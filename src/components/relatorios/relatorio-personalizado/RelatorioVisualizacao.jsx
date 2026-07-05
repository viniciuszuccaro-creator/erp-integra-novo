import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function RelatorioVisualizacao({ tipo, dados, dadosGrafico, camposExibir, isLoading }) {
  if (isLoading) return <div className="text-center py-12">Carregando dados...</div>;
  if (!dados.length) return <div className="text-center py-12 text-slate-500">Nenhum dado encontrado</div>;

  switch (tipo) {
    case 'tabela':
      return (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                {camposExibir.map(campo => <TableHead key={campo} className="capitalize">{campo.replace(/_/g, ' ')}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {dados.map((item, idx) => (
                <TableRow key={item.id || idx}>
                  {camposExibir.map(campo => (
                    <TableCell key={campo}>
                      {typeof item[campo] === 'number' && campo.includes('valor') ? `R$ ${item[campo].toFixed(2)}` : item[campo] || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      );

    case 'grafico_barras':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" /><YAxis /><Tooltip /><Legend />
            <Bar dataKey="quantidade" fill="#3b82f6" name="Quantidade" />
            {dadosGrafico[0]?.valor && <Bar dataKey="valor" fill="#10b981" name="Valor (R$)" />}
          </BarChart>
        </ResponsiveContainer>
      );

    case 'grafico_pizza':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie data={dadosGrafico} dataKey="quantidade" nameKey="nome" cx="50%" cy="50%" outerRadius={120} label>
              {dadosGrafico.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>
      );

    case 'grafico_linha':
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dadosGrafico}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" /><YAxis /><Tooltip /><Legend />
            <Line type="monotone" dataKey="quantidade" stroke="#3b82f6" name="Quantidade" />
            {dadosGrafico[0]?.valor && <Line type="monotone" dataKey="valor" stroke="#10b981" name="Valor (R$)" />}
          </LineChart>
        </ResponsiveContainer>
      );

    default:
      return null;
  }
}