/**
 * DashboardPropagacaoMonitor v1.0
 * Monitor em tempo real da propagação Grupo↔Empresas
 * Regra-Mãe: pequeno, focado, w-full h-full responsivo
 */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function DashboardPropagacaoMonitor() {
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  // Fetch histórico de propagações com contexto multiempresa
  const { data: propagacoes = [] } = useQuery({
    queryKey: ['propagacoes', contextoKey],
    queryFn: () => filterInContext('AuditLog', 
      { 
        entidade: 'PropagacaoAutomatica',
        tipo_auditoria: 'sincronizacao'
      },
      '-data_hora',
      20
    ),
    staleTime: 30000,
  });

  // Contar sucesso vs erro
  const stats = {
    total: propagacoes.length,
    sucesso: propagacoes.filter(p => p.dados_novos?.sucesso !== false).length,
    erro: propagacoes.filter(p => p.dados_novos?.sucesso === false).length,
  };

  const percentualSucesso = stats.total > 0 ? (stats.sucesso / stats.total) * 100 : 0;

  return (
    <div className="w-full h-full space-y-4 overflow-auto p-4">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Sincronizações Totais</span>
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-slate-500 mt-1">Últimas 20</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-600">Bem-Sucedidas</span>
              <CheckCircle2 className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.sucesso}</p>
            <p className="text-xs text-green-500 mt-1">{percentualSucesso.toFixed(0)}% taxa</p>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-600">Com Erro</span>
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.erro}</p>
            <p className="text-xs text-red-500 mt-1">Investigação necessária</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-600">Taxa Sucesso</span>
              <Loader2 className="w-4 h-4 text-orange-600" />
            </div>
            <p className="text-2xl font-bold">{percentualSucesso.toFixed(0)}%</p>
            <Progress value={percentualSucesso} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Propagação automática por eventos */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-green-800">✅ Propagação Automática por Eventos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-green-700">
            Toda criação/edição de registro base dispara automaticamente a sincronização Grupo ↔ Empresas
            (automações de evento → <code>syncBidirectional</code>). Acionamento manual desnecessário —
            este painel é apenas de monitoramento.
          </p>
        </CardContent>
      </Card>

      {/* Histórico de Sincronizações */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Histórico de Sincronizações (Últimas 20)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-96 overflow-y-auto">
          {propagacoes.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Nenhuma sincronização registrada</p>
          ) : (
            propagacoes.map((p, i) => (
              <div key={i} className="p-3 bg-slate-50 rounded border border-slate-200 text-sm space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-900">{p.descricao}</span>
                  <Badge 
                    className={p.dados_novos?.sucesso !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                  >
                    {p.dados_novos?.sucesso !== false ? '✓ OK' : '✗ Erro'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {p.usuario} • {new Date(p.data_hora).toLocaleString('pt-BR')}
                </p>
                {p.dados_novos?.erro && (
                  <p className="text-xs text-red-600 bg-red-50 p-2 rounded">
                    {p.dados_novos.erro}
                  </p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}