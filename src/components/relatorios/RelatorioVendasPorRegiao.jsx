import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Award, FileDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import useRLSQuery from '@/components/lib/useRLSQuery';
import { useVendasPorRegiao } from './vendas-por-regiao/useVendasPorRegiao';
import RegiaoKPIs from './vendas-por-regiao/RegiaoKPIs';
import RegiaoDetalheCard from './vendas-por-regiao/RegiaoDetalheCard';

const CORES_GRAFICO = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4', '#EC4899', '#6366F1'];

export default function RelatorioVendasPorRegiao() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState('30');
  const [vendedorSelecionado, setVendedorSelecionado] = useState('todos');
  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: regioes = [] } = useRLSQuery('RegiaoAtendimento', {}, 'nome', 999, { enabled: !!contexto });
  const { data: pedidos = [] } = useRLSQuery('Pedido', {}, '-data_pedido', 999, { enabled: !!contexto });
  const { data: clientes = [] } = useRLSQuery('Cliente', {}, 'nome', 999, { enabled: !!contexto });
  const { data: colaboradores = [] } = useRLSQuery('Colaborador', { departamento: 'Comercial' }, 'nome', 999, { enabled: !!contexto });

  const { dadosPorRegiao, totaisGerais } = useVendasPorRegiao(regioes, pedidos, clientes, periodoSelecionado, vendedorSelecionado);

  const dadosGraficoBarras = dadosPorRegiao.map(r => ({ nome: r.nome, Vendas: r.valorTotal, Meta: r.metaMensal, Pedidos: r.quantidadePedidos }));
  const dadosGraficoPizza = dadosPorRegiao.map(r => ({ name: r.nome, value: r.valorTotal }));

  const exportarCSV = () => {
    const headers = ['Região', 'Tipo', 'Total Clientes', 'Qtd Pedidos', 'Valor Total', 'Ticket Médio', 'Meta Mensal', '% Meta'];
    const rows = dadosPorRegiao.map(r => [r.nome, r.tipo, r.totalClientes, r.quantidadePedidos, r.valorTotal.toFixed(2), r.ticketMedio.toFixed(2), r.metaMensal.toFixed(2), r.percentualMeta.toFixed(1)]);
    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `vendas_por_regiao_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6 w-full h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="w-7 h-7 text-blue-600" />Relatório de Vendas por Região
          </h2>
          <p className="text-sm text-slate-600 mt-1">Análise de desempenho comercial segmentado por região de atendimento</p>
        </div>
        <Button onClick={exportarCSV} variant="outline">
          <FileDown className="w-4 h-4 mr-2" />Exportar CSV
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Período</Label>
              <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[
                    { v: '7', l: 'Últimos 7 dias' }, { v: '30', l: 'Últimos 30 dias' },
                    { v: '60', l: 'Últimos 60 dias' }, { v: '90', l: 'Últimos 90 dias' },
                    { v: '180', l: 'Últimos 6 meses' }, { v: '365', l: 'Último ano' },
                  ].map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vendedor</Label>
              <Select value={vendedorSelecionado} onValueChange={setVendedorSelecionado}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os vendedores</SelectItem>
                  {colaboradores.map(c => <SelectItem key={c.id} value={c.id}>{c.nome_completo}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <RegiaoKPIs totais={totaisGerais} />

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Vendas por Região (R$)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosGraficoBarras}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="nome" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="Vendas" fill="#3B82F6" />
                <Bar dataKey="Meta" fill="#94A3B8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Distribuição de Vendas (%)</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={dadosGraficoPizza} cx="50%" cy="50%" labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                  outerRadius={80} fill="#8884d8" dataKey="value">
                  {dadosGraficoPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Detalhamento por Região</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dadosPorRegiao.map((regiao, index) => (
              <RegiaoDetalheCard key={regiao.id} regiao={regiao} corFallback={CORES_GRAFICO[index % CORES_GRAFICO.length]} />
            ))}
          </div>
          {dadosPorRegiao.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <MapPin className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma região cadastrada ou sem vendas no período</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-600" />Top 3 Regiões
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4">
            {dadosPorRegiao.slice(0, 3).map((regiao, index) => (
              <div key={regiao.id} className="text-center p-4 border rounded-lg bg-gradient-to-br from-white to-slate-50">
                <div className="text-4xl mb-2">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</div>
                <p className="font-bold text-lg mb-1">{regiao.nome}</p>
                <p className="text-2xl font-bold text-green-600">R$ {regiao.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-sm text-slate-500 mt-1">{regiao.quantidadePedidos} pedidos • {regiao.totalClientes} clientes</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}