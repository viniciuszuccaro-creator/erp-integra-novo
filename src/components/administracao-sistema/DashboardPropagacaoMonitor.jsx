/**
 * DashboardPropagacaoMonitor v1.0
 * Monitor em tempo real da propagação Grupo↔Empresas
 * Regra-Mãe: pequeno, focado, w-full h-full responsivo
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { TrendingUp, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

export default function DashboardPropagacaoMonitor() {
  const [forceRefresh, setForceRefresh] = useState(0);
  const [executando, setExecutando] = useState(false);

  // Fetch histórico de propagações
  const { data: propagacoes = [], refetch } = useQuery({
    queryKey: ['propagacoes', forceRefresh],
    queryFn: () => base44.entities.AuditLog.filter(
      { 
        entidade: 'PropagacaoAutomatica',
        tipo_auditoria: 'sincronizacao'
      },
      '-data_hora',
      20
    ),
    staleTime: 30000,
  });

  // Forçar sincronização imediata
  const handleForceSyncAll = async () => {
    setExecutando(true);
    try {
      const result = await base44.functions.invoke('propagateGroupConfigs', {
        forceAll: true,
        timestamp: new Date().toISOString()
      });
      
      // Registrar na auditoria
      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me()).full_name,
        acao: 'Execução Manual',
        modulo: 'Propagação',
        tipo_auditoria: 'sincronizacao',
        entidade: 'PropagacaoAutomatica',
        descricao: 'Sincronização forçada de todas entidades',
        dados_novos: { resultado: result },
        data_hora: new Date().toISOString(),
      });
      
      setForceRefresh(prev => prev + 1);
      await refetch();
    } catch (err) {
      console.error('Erro ao forçar sincronização:', err);
    } finally {
      setExecutando(false);
    }
  };

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

      {/* Botão de Sincronização Manual */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Sincronização Manual</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleForceSyncAll}
            disabled={executando}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2"
          >
            {executando ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Forçar Sincronização de Todas Entidades
              </>
            )}
          </Button>
          <p className="text-xs text-slate-500 mt-3">
            Execute quando mudanças críticas forem feitas no Grupo e precisarem ser propagadas imediatamente para todas as empresas.
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