/**
 * PropagacaoHealthPanel v1.0
 * Painel de saúde da propagação Grupo↔Empresas
 * Mostra stats de sync, falhas e permite re-sync manual
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeftRight, CheckCircle2, AlertTriangle, 
  RefreshCw, Building2, Users, TrendingUp
} from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

const PROPAGABLE_ENTITIES = [
  { name: 'ContaReceber', label: 'Contas a Receber', icon: '💰' },
  { name: 'ContaPagar', label: 'Contas a Pagar', icon: '📤' },
  { name: 'Pedido', label: 'Pedidos', icon: '🛒' },
  { name: 'Produto', label: 'Produtos', icon: '📦' },
  { name: 'Cliente', label: 'Clientes', icon: '👤' },
  { name: 'Fornecedor', label: 'Fornecedores', icon: '🏭' },
  { name: 'NotaFiscal', label: 'Notas Fiscais', icon: '🧾' },
];

export default function PropagacaoHealthPanel() {
  const { grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const [syncing, setSyncing] = useState({});

  // Busca empresas do grupo
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-grupo-health', grupoAtual?.id],
    queryFn: () => base44.entities.Empresa.filter(
      { group_id: grupoAtual?.id },
      '-razao_social',
      50
    ),
    enabled: !!grupoAtual?.id,
    staleTime: 60000,
  });

  // Busca contagem de réplicas por entidade
  const { data: syncStats, refetch } = useQuery({
    queryKey: ['sync-stats', grupoAtual?.id],
    queryFn: async () => {
      const stats = {};
      for (const entity of PROPAGABLE_ENTITIES) {
        try {
          const [groupRecords, replicas] = await Promise.all([
            base44.entities[entity.name].filter(
              { group_id: grupoAtual?.id, empresa_id: null },
              null, 1
            ).catch(() => []),
            base44.entities[entity.name].filter(
              { e_replicado: true, group_id: grupoAtual?.id },
              null, 1
            ).catch(() => []),
          ]);
          stats[entity.name] = {
            groupCount: groupRecords.length,
            replicaCount: replicas.length,
            status: replicas.length >= groupRecords.length ? 'ok' : 'partial',
          };
        } catch {
          stats[entity.name] = { groupCount: 0, replicaCount: 0, status: 'error' };
        }
      }
      return stats;
    },
    enabled: !!grupoAtual?.id,
    staleTime: 30000,
  });

  // Re-sync de entidade específica
  const handleResync = async (entityName) => {
    setSyncing(s => ({ ...s, [entityName]: true }));
    try {
      await base44.functions.invoke('propagateGroupConfigs', {
        group_id: grupoAtual?.id,
        entity_name: entityName,
        force: true,
      });
      await refetch();
    } catch (e) {
      console.error('Resync error:', e);
    } finally {
      setSyncing(s => ({ ...s, [entityName]: false }));
    }
  };

  // Re-sync completo
  const handleFullResync = async () => {
    setSyncing(s => ({ ...s, all: true }));
    try {
      for (const entity of PROPAGABLE_ENTITIES) {
        await handleResync(entity.name);
      }
      await refetch();
    } finally {
      setSyncing(s => ({ ...s, all: false }));
    }
  };

  const overallStatus = syncStats
    ? Object.values(syncStats).every(s => s.status === 'ok') ? 'ok' : 'partial'
    : 'loading';

  return (
    <div className="w-full h-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Propagação Grupo↔Empresas</h2>
            <p className="text-xs text-slate-500">
              {empresas.length} empresa(s) vinculada(s) ao grupo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline"
            className={overallStatus === 'ok' ? 'text-green-700 border-green-300 bg-green-50' : 'text-amber-700 border-amber-300 bg-amber-50'}
          >
            {overallStatus === 'ok' ? (
              <><CheckCircle2 className="w-3 h-3 mr-1" />Sincronizado</>
            ) : (
              <><AlertTriangle className="w-3 h-3 mr-1" />Parcial</>
            )}
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={handleFullResync}
            disabled={syncing.all}
            className="gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing.all ? 'animate-spin' : ''}`} />
            Re-Sync Completo
          </Button>
        </div>
      </div>

      {/* Empresas */}
      {empresas.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {empresas.map(emp => (
            <div key={emp.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              <Building2 className="w-3.5 h-3.5" />
              {emp.nome_fantasia || emp.razao_social}
            </div>
          ))}
        </div>
      )}

      {/* Status por entidade */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {PROPAGABLE_ENTITIES.map(entity => {
          const stats = syncStats?.[entity.name];
          const isEntitySyncing = syncing[entity.name];
          const statusOk = stats?.status === 'ok';

          return (
            <Card key={entity.name} className={`border ${statusOk ? 'border-green-200 bg-green-50/30' : 'border-amber-200 bg-amber-50/30'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{entity.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{entity.label}</p>
                      <p className="text-xs text-slate-500">
                        {stats ? `${stats.replicaCount} réplica(s)` : 'Verificando...'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {stats && (
                      statusOk ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleResync(entity.name)}
                      disabled={isEntitySyncing}
                      className="h-7 w-7 p-0"
                      title="Re-sincronizar"
                    >
                      <RefreshCw className={`w-3 h-3 ${isEntitySyncing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Direção */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <Users className="w-8 h-8 text-purple-500" />
          <div>
            <p className="text-sm font-semibold text-purple-900">Grupo → Empresas</p>
            <p className="text-xs text-purple-600">Cadastros, configs, tabelas de preço</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <TrendingUp className="w-8 h-8 text-blue-500" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Empresas → Grupo</p>
            <p className="text-xs text-blue-600">Vendas, pedidos, movimentações</p>
          </div>
        </div>
      </div>
    </div>
  );
}