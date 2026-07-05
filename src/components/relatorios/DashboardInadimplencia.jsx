import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, TrendingDown, Clock } from "lucide-react";
import ExportMenu from "@/components/ui/ExportMenu";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import useInadimplencia from "./inadimplencia/useInadimplencia";

const COLORS = {
  'Crítico': '#ef4444', 'Alto': '#f97316', 'Médio': '#f59e0b',
  'Baixo': '#3b82f6', 'OK': '#10b981'
};

export default function DashboardInadimplencia({ empresaId }) {
  const { filterInContext, grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: contasReceber = [] } = useQuery({
    queryKey: ['contasReceber', contextoKey],
    queryFn: () => filterInContext('ContaReceber', {}, '-data_vencimento', 999),
    enabled: !!contexto,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ['clientes', contextoKey],
    queryFn: () => filterInContext('Cliente', {}, 'nome', 999),
    enabled: !!contexto,
  });

  const { filtroRisco, setFiltroRisco, dadosFiltrados, totais, distribuicaoRisco } =
    useInadimplencia(contasReceber, clientes, empresaId);

  return (
    <div className="space-y-6 w-full h-full overflow-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Inadimplência</h2>
          <p className="text-sm text-slate-600">Score de risco e análise de inadimplência</p>
        </div>
        <div className="flex gap-3">
          <select value={filtroRisco} onChange={(e) => setFiltroRisco(e.target.value)} className="border rounded-lg px-3 py-2">
            <option value="todos">Todos</option>
            <option value="Crítico">Crítico</option>
            <option value="Alto">Alto</option>
            <option value="Médio">Médio</option>
            <option value="Baixo">Baixo</option>
            <option value="OK">OK</option>
          </select>
          <ExportMenu
            data={dadosFiltrados.map(c => ({
              Cliente: c.cliente_nome,
              'Total Devido': `R$ ${c.valor_vencido.toFixed(2)}`,
              'Dias Atraso Médio': c.dias_atraso_medio.toFixed(0),
              'Score de Risco': c.score_risco.toFixed(0),
              Classificação: c.nivel_risco
            }))}
            fileName="dashboard_inadimplencia"
            title="Dashboard de Inadimplência"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-md bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700">Valor Vencido</p>
                <p className="text-2xl font-bold text-red-900">R$ {totais.totalVencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-red-600 mt-1">{totais.totalTitulosVencidos} títulos</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">A Vencer</p>
            <p className="text-2xl font-bold text-blue-600">R$ {totais.totalAVencer.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p className="text-xs text-slate-500 mt-1">próximos vencimentos</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md bg-orange-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700">Dias Atraso Médio</p>
                <p className="text-2xl font-bold text-orange-900">{totais.diasAtrasoMedioGeral.toFixed(0)}</p>
                <p className="text-xs text-orange-600 mt-1">dias</p>
              </div>
              <Clock className="w-8 h-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-sm text-slate-600">Clientes com Atraso</p>
            <p className="text-2xl font-bold text-slate-900">{totais.clientesComAtraso}</p>
            <p className="text-xs text-slate-500 mt-1">{((totais.clientesComAtraso / Math.max(1, dadosFiltrados.length)) * 100).toFixed(1)}% do total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md">
          <CardHeader><CardTitle>Distribuição por Nível de Risco</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={distribuicaoRisco.filter(d => d.quantidade > 0)} cx="50%" cy="50%" labelLine={false}
                  label={(entry) => `${entry.nivel}: ${entry.quantidade}`} outerRadius={100} dataKey="quantidade">
                  {distribuicaoRisco.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[entry.nivel]} />))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-2 mt-4">
              {distribuicaoRisco.filter(d => d.quantidade > 0).map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-lg border" style={{ borderColor: COLORS[item.nivel] }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-600">{item.nivel}</p>
                      <p className="font-bold">{item.quantidade}</p>
                    </div>
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[item.nivel] }} />
                  </div>
                  <p className="text-xs text-slate-600 mt-1">R$ {item.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader><CardTitle>Top 10 Maiores Devedores</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dadosFiltrados.slice(0, 10)} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cliente_nome" angle={-45} textAnchor="end" height={100} fontSize={10} />
                <YAxis />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                <Legend />
                <Bar dataKey="valor_vencido" fill="#ef4444" name="Valor Vencido" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Análise Detalhada de Inadimplência
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Cliente</TableHead>
                  <TableHead>ABC</TableHead>
                  <TableHead className="text-right">Títulos Vencidos</TableHead>
                  <TableHead className="text-right">Valor Vencido</TableHead>
                  <TableHead className="text-right">Dias Atraso Médio</TableHead>
                  <TableHead className="text-right">Maior Atraso</TableHead>
                  <TableHead className="text-right">Score Risco</TableHead>
                  <TableHead>Nível Risco</TableHead>
                  <TableHead className="text-right">Previsão Recebimento</TableHead>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosFiltrados.map((cliente, idx) => (
                  <TableRow key={idx} className={`hover:bg-slate-50 ${
                    cliente.nivel_risco === 'Crítico' ? 'bg-red-50' :
                    cliente.nivel_risco === 'Alto' ? 'bg-orange-50' : ''
                  }`}>
                    <TableCell className="font-medium">{cliente.cliente_nome}</TableCell>
                    <TableCell>
                      <Badge className={
                        cliente.classificacao_abc === 'A' ? 'bg-blue-100 text-blue-700' :
                        cliente.classificacao_abc === 'B' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }>{cliente.classificacao_abc}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-red-600">{cliente.titulos_vencidos}</TableCell>
                    <TableCell className="text-right font-bold text-red-600">R$ {cliente.valor_vencido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell className="text-right">{cliente.dias_atraso_medio.toFixed(0)} dias</TableCell>
                    <TableCell className="text-right font-semibold">{cliente.maior_atraso} dias</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-slate-200 rounded-full h-2">
                          <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(100, cliente.score_risco)}%`, backgroundColor: COLORS[cliente.nivel_risco] }} />
                        </div>
                        <span className="font-bold text-sm">{cliente.score_risco.toFixed(0)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="text-white" style={{ backgroundColor: COLORS[cliente.nivel_risco] }}>{cliente.nivel_risco}</Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">~{cliente.previsao_recebimento_dias} dias</TableCell>
                    <TableCell>
                      {cliente.nivel_risco === 'Crítico' && <Badge className="bg-red-100 text-red-700">Bloquear</Badge>}
                      {cliente.nivel_risco === 'Alto' && <Badge className="bg-orange-100 text-orange-700">Cobrar</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {dadosFiltrados.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <TrendingDown className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Nenhum cliente com inadimplência no filtro selecionado</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}