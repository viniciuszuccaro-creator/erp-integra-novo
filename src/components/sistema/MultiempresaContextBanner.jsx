/**
 * MultiempresaContextBanner v1.0
 * Banner inteligente que exibe o contexto atual (Grupo/Empresa)
 * com ações rápidas e indicador de propagação
 */

import React, { useState } from 'react';
import { Building2, Users, ChevronDown, ArrowLeftRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

export default function MultiempresaContextBanner({ compact = false }) {
  const { empresaAtual, grupoAtual, contexto, mudarContexto } = useContextoVisual();
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // Busca lista de empresas do grupo para troca rápida
  const { data: empresas = [] } = useQuery({
    queryKey: ['empresas-grupo', grupoAtual?.id],
    queryFn: () => base44.entities.Empresa.filter(
      grupoAtual?.id ? { group_id: grupoAtual.id } : {},
      '-razao_social',
      50
    ),
    enabled: !!grupoAtual?.id,
    staleTime: 300000,
  });

  // Trigger propagação manual
  const triggerSync = async () => {
    setSyncing(true);
    setSyncStatus(null);
    try {
      await base44.functions.invoke('propagateGroupConfigs', {
        group_id: grupoAtual?.id,
        empresa_id: empresaAtual?.id,
        direction: contexto === 'grupo' ? 'down' : 'up',
      });
      setSyncStatus('ok');
      setTimeout(() => setSyncStatus(null), 3000);
    } catch (e) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus(null), 3000);
    } finally {
      setSyncing(false);
    }
  };

  if (!grupoAtual && !empresaAtual) return null;

  const isGroup = contexto === 'grupo';

  if (compact) {
    return (
      <div className={`
        flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
        ${isGroup 
          ? 'bg-purple-100 text-purple-800 border border-purple-200' 
          : 'bg-blue-100 text-blue-800 border border-blue-200'
        }
      `}>
        {isGroup ? (
          <Users className="w-3.5 h-3.5" />
        ) : (
          <Building2 className="w-3.5 h-3.5" />
        )}
        <span className="truncate max-w-[120px]">
          {isGroup 
            ? (grupoAtual?.nome_do_grupo || 'Grupo') 
            : (empresaAtual?.nome_fantasia || empresaAtual?.razao_social || 'Empresa')
          }
        </span>
        {isGroup && (
          <Badge variant="secondary" className="text-[10px] px-1 py-0">
            GRUPO
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`
      flex items-center justify-between px-4 py-2.5 rounded-xl border mb-4
      ${isGroup 
        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200' 
        : 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200'
      }
    `}>
      <div className="flex items-center gap-3">
        <div className={`
          w-8 h-8 rounded-lg flex items-center justify-center
          ${isGroup ? 'bg-purple-100' : 'bg-blue-100'}
        `}>
          {isGroup ? (
            <Users className={`w-4 h-4 text-purple-700`} />
          ) : (
            <Building2 className={`w-4 h-4 text-blue-700`} />
          )}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              {isGroup 
                ? (grupoAtual?.nome_do_grupo || 'Grupo Empresarial')
                : (empresaAtual?.nome_fantasia || empresaAtual?.razao_social || 'Empresa')
              }
            </span>
            <Badge 
              variant="secondary" 
              className={`text-[10px] px-1.5 py-0 font-semibold ${isGroup ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}
            >
              {isGroup ? 'GRUPO' : 'EMPRESA'}
            </Badge>
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <ArrowLeftRight className="w-3 h-3" />
            <span>Propagação bidirecional {isGroup ? 'ativa (Grupo→Empresas)' : 'ativa (Empresa→Grupo)'}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Indicador de sync */}
        {syncing && (
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Sincronizando...
          </div>
        )}
        {syncStatus === 'ok' && (
          <div className="flex items-center gap-1 text-xs text-green-600">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sincronizado
          </div>
        )}
        {syncStatus === 'error' && (
          <div className="flex items-center gap-1 text-xs text-red-600">
            <AlertCircle className="w-3.5 h-3.5" />
            Erro na sync
          </div>
        )}

        {/* Troca de empresa */}
        {empresas.length > 1 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                Trocar <ChevronDown className="w-3 h-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Contexto</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {grupoAtual && (
                <DropdownMenuItem onClick={() => mudarContexto?.('grupo')}>
                  <Users className="w-4 h-4 mr-2 text-purple-600" />
                  {grupoAtual.nome_do_grupo} (Grupo)
                </DropdownMenuItem>
              )}
              {empresas.map(emp => (
                <DropdownMenuItem 
                  key={emp.id} 
                  onClick={() => mudarContexto?.('empresa', emp)}
                >
                  <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                  {emp.nome_fantasia || emp.razao_social}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Sync manual */}
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-7 px-2 text-xs"
          onClick={triggerSync}
          disabled={syncing}
          title="Forçar sincronização"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}