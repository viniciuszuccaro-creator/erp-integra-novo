/**
 * SystemHealthDashboard v1.0
 * Painel central de saúde do sistema em tempo real
 * Regra-Mãe: monitoramento multi-empresas + IA + w-full h-full responsivo
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import useCounterWithNotification from '@/components/lib/useCounterWithNotification';
import Monitor429RateLimit from '../Monitor429RateLimit';
import HealthMetricsCard from './HealthMetricsCard';
import IAHealthRecommendations from './IAHealthRecommendations';
import {
  Activity, Heart, Zap, TrendingUp, AlertTriangle, CheckCircle2,
  BarChart3, Settings
} from 'lucide-react';

export default function SystemHealthDashboard() {
  const { empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const { counts, circuitState, isProtected } = useCounterWithNotification([
    'Cliente', 'Pedido', 'Produto', 'Fornecedor', 'ContaReceber', 'ContaPagar'
  ], { autoLoad: true, pollInterval: 30000 });

  // Fetch métricas de performance
  const { data: metricas = {} } = useQuery({
    queryKey: ['systemHealth', empresaAtual?.id, grupoAtual?.id],
    queryFn: async () => {
      try {
        const result = await base44.functions.invoke('getEntityRecord', {
          entity_name: 'ConfiguracaoSistema',
          filters: {
            chave: 'health_metrics',
            empresa_id: empresaAtual?.id || grupoAtual?.id
          }
        });
        return result?.data?.[0] || {};
      } catch (_) {
        return {};
      }
    },
    staleTime: 15000,
  });

  // Logs de performance
  const { data: perfLogs = [] } = useQuery({
    queryKey: ['perfLogs', empresaAtual?.id],
    queryFn: () => base44.entities.AuditLog.filter(
      { 
        entidade: 'FunctionLatency',
        ...(grupoAtual?.id && { group_id: grupoAtual.id }),
        ...(empresaAtual?.id && { empresa_id: empresaAtual.id })
      },
      '-data_hora',
      30
    ),
    staleTime: 20000,
  });

  // Calcular saúde geral
  const healthScore = Math.max(0, Math.min(100, 
    100 - 
    (isProtected ? 30 : 0) -
    (perfLogs.filter(l => l.duracao_ms > 5000).length * 2)
  ));

  const getHealthStatus = (score) => {
    if (score >= 80) return { label: 'Excelente', color: 'text-green-600', bg: 'bg-green-50' };
    if (score >= 60) return { label: 'Bom', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    if (score >= 40) return { label: 'Alerta', color: 'text-orange-600', bg: 'bg-orange-50' };
    return { label: 'Crítico', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const status = getHealthStatus(healthScore);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Saúde do Sistema</h1>
          <p className="text-sm text-slate-500 mt-1">
            {contexto === 'grupo' ? `Grupo: ${grupoAtual?.nome_do_grupo}` : `Empresa: ${empresaAtual?.nome_fantasia}`}
          </p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${status.color}`}>{Math.round(healthScore)}%</div>
          <p className={`text-sm font-semibold ${status.color}`}>{status.label}</p>
        </div>
      </div>

      {/* Score bar */}
      <Progress value={healthScore} className="mb-6 h-3" />

      {/* Alert crítico */}
      {isProtected && (
        <Alert className="mb-4 border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 ml-2">
            ⚠️ Circuit Breaker ativo. Sistema em proteção.
          </AlertDescription>
        </Alert>
      )}

      {/* Tabs de conteúdo */}
      <Tabs defaultValue="overview" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Performance</span>
          </TabsTrigger>
          <TabsTrigger value="rateLimit" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span className="hidden sm:inline">Rate Limit</span>
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">IA</span>
          </TabsTrigger>
        </TabsList>

        {/* Overview */}
        <TabsContent value="overview" className="flex-1 overflow-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <HealthMetricsCard
              title="Clientes"
              value={counts.Cliente || 0}
              icon={<Heart className="w-5 h-5" />}
              trend="+12%"
              color="text-blue-600"
            />
            <HealthMetricsCard
              title="Pedidos"
              value={counts.Pedido || 0}
              icon={<BarChart3 className="w-5 h-5" />}
              trend="+8%"
              color="text-green-600"
            />
            <HealthMetricsCard
              title="Produtos"
              value={counts.Produto || 0}
              icon={<Zap className="w-5 h-5" />}
              trend="+3%"
              color="text-orange-600"
            />
            <HealthMetricsCard
              title="Fornecedores"
              value={counts.Fornecedor || 0}
              icon={<Activity className="w-5 h-5" />}
              trend="-2%"
              color="text-purple-600"
            />
            <HealthMetricsCard
              title="A Receber"
              value={counts.ContaReceber || 0}
              icon={<TrendingUp className="w-5 h-5" />}
              trend="+15%"
              color="text-red-600"
            />
            <HealthMetricsCard
              title="A Pagar"
              value={counts.ContaPagar || 0}
              icon={<AlertTriangle className="w-5 h-5" />}
              trend="+5%"
              color="text-yellow-600"
            />
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="flex-1 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle>Performance de Funções</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-96 overflow-y-auto">
              {perfLogs.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">Sem logs de performance</p>
              ) : (
                perfLogs.slice(0, 20).map((log, i) => (
                  <div key={i} className="p-3 bg-slate-50 rounded border-l-2 border-blue-400 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-slate-700">{log.descricao}</span>
                      <Badge className={
                        log.duracao_ms < 1000 ? 'bg-green-100 text-green-800' :
                        log.duracao_ms < 5000 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }>
                        {log.duracao_ms}ms
                      </Badge>
                    </div>
                    <p className="text-slate-500">
                      {new Date(log.data_hora).toLocaleTimeString('pt-BR')}
                    </p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rate Limit */}
        <TabsContent value="rateLimit" className="flex-1 overflow-auto">
          <Monitor429RateLimit />
        </TabsContent>

        {/* Recomendações IA */}
        <TabsContent value="recommendations" className="flex-1 overflow-auto">
          <IAHealthRecommendations 
            healthScore={healthScore}
            circuitState={circuitState}
            perfLogs={perfLogs}
            counts={counts}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}