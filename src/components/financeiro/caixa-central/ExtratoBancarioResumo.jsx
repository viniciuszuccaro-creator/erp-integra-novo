import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import useContextoVisual from '@/components/lib/useContextoVisual';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';

export default function ExtratoBancarioResumo() {
  const { filterInContext, empresaAtual } = useContextoVisual();
  const [dataInicio, setDataInicio] = useState(new Date(new Date().setDate(1)).toISOString().split('T')[0]);
  const [dataFim, setDataFim] = useState(new Date().toISOString().split('T')[0]);

  const { data: extratos = [], isLoading } = useQuery({
    queryKey: ['extrato-bancario', dataInicio, dataFim, empresaAtual?.id],
    queryFn: () => filterInContext('ExtratoBancario', {
      data_lancamento: {
        $gte: new Date(dataInicio + 'T00:00:00').toISOString(),
        $lte: new Date(dataFim + 'T23:59:59').toISOString()
      }
    }, '-data_lancamento'),
    enabled: !!empresaAtual?.id
  });

  const totalEntradas = extratos.filter(e => e.tipo_lancamento === 'Crédito').reduce((sum, e) => sum + (e.valor || 0), 0);
  const totalSaidas = extratos.filter(e => e.tipo_lancamento === 'Débito').reduce((sum, e) => sum + (e.valor || 0), 0);
  const saldoPeriodo = totalEntradas - totalSaidas;

  // Agrupar por conta bancária
  const porConta = {};
  extratos.forEach(ext => {
    const conta = ext.conta_bancaria_nome || 'Não definido';
    if (!porConta[conta]) porConta[conta] = { creditos: 0, debitos: 0, saldo: 0 };
    if (ext.tipo_lancamento === 'Crédito') porConta[conta].creditos += (ext.valor || 0);
    else porConta[conta].debitos += (ext.valor || 0);
    porConta[conta].saldo = porConta[conta].creditos - porConta[conta].debitos;
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-slate-500">
          Carregando extrato bancário...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros de Período */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Extrato Bancário - Resumo
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={dataInicio}
                  onChange={(e) => setDataInicio(e.target.value)}
                  className="w-40 h-8"
                />
                <span className="text-slate-500">até</span>
                <Input
                  type="date"
                  value={dataFim}
                  onChange={(e) => setDataFim(e.target.value)}
                  className="w-40 h-8"
                />
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPIs do Período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="border-2 border-green-300 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-slate-700">Créditos</span>
            </div>
            <p className="text-xl font-bold text-green-600">
              R$ {totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {extratos.filter(e => e.tipo_lancamento === 'Crédito').length} lançamentos
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-red-300 bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <span className="text-xs font-semibold text-slate-700">Débitos</span>
            </div>
            <p className="text-xl font-bold text-red-600">
              R$ {totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              {extratos.filter(e => e.tipo_lancamento === 'Débito').length} lançamentos
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-700">Saldo Período</span>
            </div>
            <p className={`text-xl font-bold ${saldoPeriodo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              R$ {Math.abs(saldoPeriodo).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-600 mt-0.5">{saldoPeriodo >= 0 ? 'Positivo' : 'Negativo'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Resumo por Conta Bancária */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b py-2">
          <CardTitle className="text-base">Movimentação por Conta Bancária</CardTitle>
        </CardHeader>
        <CardContent className="py-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Object.entries(porConta).map(([conta, valores]) => (
              <div key={conta} className="p-3 border rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                <p className="font-semibold text-slate-900 mb-2 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-blue-600" />
                  {conta}
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-green-600">Créditos:</span>
                    <span className="font-semibold text-green-600">R$ {valores.creditos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Débitos:</span>
                    <span className="font-semibold text-red-600">R$ {valores.debitos.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t">
                    <span className="text-blue-600 font-semibold">Saldo:</span>
                    <span className={`font-bold ${valores.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      R$ {valores.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Lançamentos */}
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-slate-50 border-b py-2">
          <CardTitle className="text-base">Lançamentos Bancários</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-96 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Data</TableHead>
                  <TableHead>Conta</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Histórico</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Saldo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extratos.map((ext) => (
                  <TableRow key={ext.id} className="hover:bg-slate-50">
                    <TableCell className="text-sm">
                      {ext.data_lancamento ? new Date(ext.data_lancamento).toLocaleDateString('pt-BR') : '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      <Badge variant="outline" className="text-xs">
                        {ext.conta_bancaria_nome || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {ext.tipo_lancamento === 'Crédito' ? (
                        <Badge className="bg-green-100 text-green-700">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          Crédito
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700">
                          <TrendingDown className="w-3 h-3 mr-1" />
                          Débito
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm max-w-xs truncate">
                      {ext.historico || ext.descricao || '-'}
                    </TableCell>
                    <TableCell className={`font-semibold ${ext.tipo_lancamento === 'Crédito' ? 'text-green-600' : 'text-red-600'}`}>
                      {ext.tipo_lancamento === 'Crédito' ? '+' : '-'} R$ {(ext.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="font-semibold text-blue-600">
                      R$ {(ext.saldo_apos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {extratos.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Building2 className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum lançamento bancário encontrado no período</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}