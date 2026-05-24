/**
 * PropagacaoHealthPanel v2.0
 * Painel de saúde da propagação Grupo↔Empresas
 * - Stats por entidade (DOWN + UP)
 * - Re-sync manual por entidade ou completo
 * - Indica entidades com propagação incompleta
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeftRight, CheckCircle2, AlertTriangle, XCircle,
  RefreshCw, Building2, TrendingUp, ArrowDown, ArrowUp
} from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { toast } from 'sonner';

// Entidades + direção suportada
const ENTITIES = [
  { name: 'ContaReceber', label: 'Contas a Receber', icon: '💰', down: true,  up: true  },
  { name: 'ContaPagar',   label: 'Contas a Pagar',   icon: '📤', down: true,  up: true  },
  { name: 'Pedido',       label: 'Pedidos',           icon: '🛒', down: true,  up: true  },
  { name: 'Produto',      label: 'Produtos',          icon: '📦', down: true,  up: false },
  { name: 'Cliente',      label: 'Clientes',          icon: '👤', down: true,  up: true  },
  { name: 'Fornecedor',   label: 'Fornecedores',      icon: '🏭', down: false, up: true  },
  { name: 'NotaFiscal',   label: 'Notas Fiscais',     icon: '🧾', down: false, up: true  },
  { name: 'Entrega',      label: 'Entregas',          icon: '🚚', down: false, up: true  },
];

export default function PropagacaoHealthPanel() {
  const { grupoAtual } = useContextoVisual();
  const [syncing, setSyncing] = useState({});

  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-grupo-health', grupoAtual?.id],
    queryFn: () => base44.entities.Empresa.filter({ group_id: grupoAtual?.id }, null, 50),
    enabled: !!grupoAtual?.id,
    staleTime: 60000,
  });

  const { data: syncStats, refetch, isLoading } = useQuery({
    queryKey: ['sync-stats-v2', grupoAtual?.id],
    queryFn: async () => {
      const stats = {};
      await Promise.all(ENTITIES.map(async (entity) => {
        try {
          const [groupRecords, replicas] = await Promise.all([
            base44.entities[entity.name].filter(
              { group_id: grupoAtual?.id, empresa_id: null }, null, 200
            ).catch(() => []),
            base44.entities[entity.name].filter(
              { e_replicado: true, group_id: grupoAtual?.id }, null, 200
            ).catch(() => []),
          ]);
          const groupCount = groupRecords.length;
          const replicaCount = replicas.length;
          const expectedReplicas = groupCount * Math.max(empresas.length, 1);
          stats[entity.name] = {
            groupCount,
            replicaCount,
            expectedReplicas,
            status: groupCount === 0 ? 'ok'
              : replicaCount >= expectedReplicas ? 'ok'
              : replicaCount > 0 ? 'partial'
              : 'missing',
          };
        } catch {
          stats[entity.name] = { groupCount: 0, replicaCount: 0, status: 'error' };
        }
      }));
      return stats;
    },
    enabled: !!grupoAtual?.id,
    staleTime: 30000,
  });

  const handleResync = async (entityName) => {
    setSyncing(s => ({ ...s, [entityName]: true }));
    try {
      await base44.functions.invoke('propagateGroupConfigs', {
        group_id: grupoAtual?.id,
        entity_name: entityName,
        force: true,
      });
      await refetch();
      toast.success(`✅ ${entityName} re-sincronizado`);
    } catch (e) {
      toast.error(`Erro ao sincronizar ${entityName}: ${e.message}`);
    } finally {
      setSyncing(s => ({ ...s, [entityName]: false }));
    }
  };

  const handleFullResync = async () => {
    setSyncing(s => ({ ...s, all: true }));
    try {
      for (const entity of ENTITIES) {
        await handleResync(entity.name).catch(() => {});
      }
      await refetch();
      toast.success('✅ Re-sync completo realizado!');
    } finally {
      setSyncing(s => ({ ...s, all: false }));
    }
  };

  const overallOk = syncStats
    ? Object.values(syncStats).every(s => s.status === 'ok' || s.status === 'error')
    : false;

  const pendentes = syncStats
    ? Object.values(syncStats).filter(s => s.status === 'partial' || s.status === 'missing').length
    : 0;

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <ArrowLeftRight className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Propagação Grupo↔Empresas</h2>
            <p className="text-xs text-slate-500">
              {empresas.length} empresa(s) vinculada(s) · {pendentes > 0 ? `${pendentes} entidade(s) pendente(s)` : 'Tudo sincronizado'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={
            overallOk && pendentes === 0
              ? 'text-green-700 border-green-300 bg-green-50'
              : 'text-amber-700 border-amber-300 bg-amber-50'
          }>
            {overallOk && pendentes === 0
              ? <><CheckCircle2 className="w-3 h-3 mr-1" />Sincronizado</>
              : <><AlertTriangle className="w-3 h-3 mr-1" />{pendentes} Pendente(s)</>
            }
          </Badge>
          <Button
            size="sm" variant="outline"
            onClick={handleFullResync}
            disabled={syncing.all || !grupoAtual?.id}
            className="gap-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncing.all ? 'animate-spin' : ''}`} />
            Re-Sync Completo
          </Button>
        </div>
      </div>

      {/* Empresas chips */}
      {empresas.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {empresas.map(emp => (
            <div key={emp.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-700">
              <Building2 className="w-3 h-3" />
              {emp.nome_fantasia || emp.razao_social}
            </div>
          ))}
        </div>
      )}

      {!grupoAtual?.id && (
        <div className="text-center py-6 text-sm text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
          Selecione um contexto de Grupo para visualizar o status da propagação
        </div>
      )}

      {/* Grid de entidades */}
      {grupoAtual?.id && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {ENTITIES.map(entity => {
            const stats = syncStats?.[entity.name];
            const isSyncing = syncing[entity.name];
            const statusColor =
              stats?.status === 'ok'      ? 'border-green-200 bg-green-50/40' :
              stats?.status === 'partial' ? 'border-amber-200 bg-amber-50/40' :
              stats?.status === 'missing' ? 'border-red-200 bg-red-50/40' :
              'border-slate-200 bg-slate-50';

            return (
              <Card key={entity.name} className={`border ${statusColor} transition-colors`}>
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xl flex-shrink-0">{entity.icon}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">{entity.label}</p>
                        <p className="text-[10px] text-slate-500">
                          {isLoading ? '...' : stats
                            ? `${stats.replicaCount} réplica(s) de ${stats.groupCount}`
                            : '—'}
                        </p>
                        {/* Direção suportada */}
                        <div className="flex gap-1 mt-1">
                          <Badge className={`text-[9px] px-1 py-0 ${entity.down ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-400'}`}>
                            <ArrowDown className="w-2 h-2 mr-0.5" />DOWN
                          </Badge>
                          <Badge className={`text-[9px] px-1 py-0 ${entity.up ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                            <ArrowUp className="w-2 h-2 mr-0.5" />UP
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {stats && (
                        stats.status === 'ok'      ? <CheckCircle2 className="w-4 h-4 text-green-500" /> :
                        stats.status === 'partial' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> :
                        stats.status === 'missing' ? <XCircle className="w-4 h-4 text-red-500" /> :
                        null
                      )}
                      <Button
                        size="sm" variant="ghost"
                        onClick={() => handleResync(entity.name)}
                        disabled={isSyncing}
                        className="h-6 w-6 p-0"
                        title="Re-sincronizar"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Direções */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
          <ArrowDown className="w-6 h-6 text-purple-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-purple-900">Grupo → Empresas (DOWN)</p>
            <p className="text-xs text-purple-600">Cadastros, configs, tabelas de preço, clientes, produtos</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <TrendingUp className="w-6 h-6 text-blue-500 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-blue-900">Empresas → Grupo (UP)</p>
            <p className="text-xs text-blue-600">Vendas, pedidos, NFs, movimentações, entregas</p>
          </div>
        </div>
      </div>
    </div>
  );
}