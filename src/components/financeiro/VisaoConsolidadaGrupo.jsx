import React from 'react';
import { useRLSQuery } from '@/components/lib/useRLSQuery';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, TrendingUp, TrendingDown, DollarSign, AlertTriangle } from 'lucide-react';

export default function VisaoConsolidadaGrupo({ groupId, windowMode = false }) {
  const { data: empresas = [] } = useRLSQuery(
    'Empresa', {}, '-created_date', 50,
    { enabled: !!groupId }
  );

  const { data: contasPagar = [] } = useRLSQuery(
    'ContaPagar', {}, '-data_vencimento', 200,
    { enabled: !!groupId }
  );

  const { data: contasReceber = [] } = useRLSQuery(
    'ContaReceber', {}, '-data_vencimento', 200,
    { enabled: !!groupId }
  );

  const totalPagar = contasPagar.filter(c => c.status === 'Pendente').reduce((acc, c) => acc + (c.valor || 0), 0);
  const totalReceber = contasReceber.filter(c => c.status === 'Pendente').reduce((acc, c) => acc + (c.valor || 0), 0);
  const saldoConsolidado = totalReceber - totalPagar;

  const pagarAtrasado = contasPagar.filter(c => c.status === 'Atrasado').reduce((acc, c) => acc + (c.valor || 0), 0);
  const receberAtrasado = contasReceber.filter(c => c.status === 'Atrasado').reduce((acc, c) => acc + (c.valor || 0), 0);

  const dadosPorEmpresa = empresas.map(emp => {
    const pagarEmpresa = contasPagar.filter(c => c.empresa_id === emp.id && c.status === 'Pendente').reduce((acc, c) => acc + (c.valor || 0), 0);
    const receberEmpresa = contasReceber.filter(c => c.empresa_id === emp.id && c.status === 'Pendente').reduce((acc, c) => acc + (c.valor || 0), 0);
    const saldoEmpresa = receberEmpresa - pagarEmpresa;

    return {
      empresa: emp.nome_fantasia || emp.razao_social,
      pagar: pagarEmpresa,
      receber: receberEmpresa,
      saldo: saldoEmpresa
    };
  });

  return (
    <div className={windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-4"}>
      <div className={windowMode ? "p-6 space-y-4 flex-1" : "space-y-4 p-6"}>
      <div className="flex items-center gap-3 mb-4">
        <Building2 className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-slate-900">Visão Consolidada do Grupo</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total a Receber</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-600">
                R$ {totalReceber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {receberAtrasado > 0 && (
              <p className="text-xs text-red-600 mt-1">
                R$ {receberAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} atrasado
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Total a Pagar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span className="text-2xl font-bold text-red-600">
                R$ {totalPagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            {pagarAtrasado > 0 && (
              <p className="text-xs text-orange-600 mt-1">
                R$ {pagarAtrasado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} atrasado
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Saldo Consolidado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className={`w-5 h-5 ${saldoConsolidado >= 0 ? 'text-blue-600' : 'text-red-600'}`} />
              <span className={`text-2xl font-bold ${saldoConsolidado >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                R$ {saldoConsolidado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-slate-600">Empresas no Grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-slate-600" />
              <span className="text-2xl font-bold text-slate-900">{empresas.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Saldos por Empresa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dadosPorEmpresa.map((dado, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{dado.empresa}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div className="text-right">
                    <p className="text-xs text-slate-500">A Receber</p>
                    <p className="font-semibold text-green-600">R$ {dado.receber.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">A Pagar</p>
                    <p className="font-semibold text-red-600">R$ {dado.pagar.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Saldo</p>
                    <p className={`font-bold ${dado.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      R$ {dado.saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div></div>
  );
}