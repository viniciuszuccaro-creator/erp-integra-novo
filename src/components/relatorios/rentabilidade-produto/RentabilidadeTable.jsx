import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function RentabilidadeTable({ top20 }) {
  const headers = ['#', 'Código', 'Produto', 'ABC', 'Qtd Vendida', 'Receita', 'Custo', 'Margem R$', 'Margem %', 'Preço Médio', 'Giro'];

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle>Análise Detalhada - Top 20 Produtos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                {headers.map((h, i) => (
                  <TableHead key={i} className={i >= 4 ? 'text-right' : ''}>{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {top20.map((produto, idx) => (
                <TableRow key={idx} className={`hover:bg-slate-50 ${produto.margem_percentual < 0 ? 'bg-red-50' : ''}`}>
                  <TableCell>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${idx < 3 ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-slate-400'}`}>
                      {idx + 1}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">{produto.codigo || '-'}</TableCell>
                  <TableCell className="font-medium">{produto.descricao}</TableCell>
                  <TableCell>
                    <Badge className={
                      produto.classificacao_abc === 'A' ? 'bg-blue-100 text-blue-700' :
                      produto.classificacao_abc === 'B' ? 'bg-green-100 text-green-700' :
                      produto.classificacao_abc === 'C' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-slate-100 text-slate-700'
                    }>{produto.classificacao_abc}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{produto.quantidade_vendida.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} {produto.unidade}</TableCell>
                  <TableCell className="text-right font-semibold text-green-600">R$ {produto.receita_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right text-red-600">R$ {produto.custo_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className={`text-right font-bold ${produto.margem_valor >= 0 ? 'text-purple-600' : 'text-red-600'}`}>R$ {produto.margem_valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className={`text-right font-bold ${produto.margem_percentual >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{produto.margem_percentual.toFixed(1)}%</TableCell>
                  <TableCell className="text-right">R$ {produto.preco_medio_venda.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-right"><Badge variant="outline">{produto.giro_estoque.toFixed(1)}x</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}