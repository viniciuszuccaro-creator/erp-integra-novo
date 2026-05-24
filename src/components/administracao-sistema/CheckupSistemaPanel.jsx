/**
 * CheckupSistemaPanel v2.0
 * Diagnóstico completo: propagação, RBAC, toggles, performance, integrações
 * Regra-Mãe: melhorar, conectar, nunca apagar
 */

import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Shield, ArrowLeftRight, ToggleLeft, Zap, Database,
  Settings, Building2, Users, FileText, Package
} from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { toast } from 'sonner';

const CHECKS = [
  { id: 'context',     label: 'Contexto Multiempresa',    icon: Database,      desc: 'Grupo/empresa configurado' },
  { id: 'empresas',   label: 'Empresas do Grupo',         icon: Building2,     desc: 'Empresas vinculadas ao grupo' },
  { id: 'propagacao', label: 'Propagação Bidirecional',   icon: ArrowLeftRight,desc: 'Configs de propagação ativas' },
  { id: 'rbac',       label: 'Perfis RBAC',               icon: Shield,        desc: 'Perfis de acesso configurados' },
  { id: 'toggles',    label: 'Configurações Persistidas', icon: ToggleLeft,    desc: 'Configurações salvas no banco' },
  { id: 'clientes',   label: 'Clientes Cadastrados',      icon: Users,         desc: 'Base de clientes ativa' },
  { id: 'produtos',   label: 'Produtos Cadastrados',      icon: Package,       desc: 'Catálogo de produtos ativo' },
  { id: 'nfe',        label: 'Config. Fiscal (NF-e)',     icon: FileText,      desc: 'Configuração fiscal presente' },
];

function StatusIcon({ status }) {
  if (status === 'ok')   return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  if (status === 'warn') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  if (status === 'error')return <XCircle className="w-5 h-5 text-red-500" />;
  return <div className="w-5 h-5 rounded-full bg-slate-200 animate-pulse" />;
}

function StatusBadge({ status }) {
  if (status === 'ok')   return <Badge className="bg-green-100 text-green-700 border border-green-200 text-[10px]">OK</Badge>;
  if (status === 'warn') return <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px]">Atenção</Badge>;
  if (status === 'error')return <Badge className="bg-red-100 text-red-700 border border-red-200 text-[10px]">Erro</Badge>;
  return <Badge variant="secondary" className="text-[10px]">Verificando...</Badge>;
}

export default function CheckupSistemaPanel() {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState({});
  const [lastRun, setLastRun] = useState(null);

  const runCheck = async (id, fn) => {
    try {
      return await fn();
    } catch (e) {
      return { status: 'error', detail: e.message };
    }
  };

  const runCheckup = async () => {
    setRunning(true);
    setResults({});

    const groupId = grupoAtual?.id;
    const empresaId = empresaAtual?.id;

    const checks = {
      context: async () => ({
        status: (groupId || empresaId) ? 'ok' : 'error',
        detail: groupId
          ? `Grupo: ${grupoAtual.nome_do_grupo || groupId}`
          : empresaId
          ? `Empresa: ${empresaAtual.nome_fantasia || empresaAtual.razao_social}`
          : 'Nenhum contexto selecionado',
      }),

      empresas: async () => {
        const list = await base44.entities.Empresa.filter(
          groupId ? { group_id: groupId } : {}, null, 50
        ).catch(() => []);
        return {
          status: list.length > 0 ? 'ok' : 'warn',
          detail: list.length > 0 ? `${list.length} empresa(s) cadastrada(s)` : 'Nenhuma empresa encontrada',
        };
      },

      propagacao: async () => {
        const configs = await base44.entities.ConfiguracaoSistema.filter(
          { chave: 'propagacao_ativa' }, null, 5
        ).catch(() => []);
        // Também verifica sync_maps recentes
        const syncMaps = await base44.entities.SyncMap?.filter?.({}, '-updated_date', 5).catch(() => []);
        const found = configs.length > 0 || (syncMaps?.length ?? 0) > 0;
        return {
          status: found ? 'ok' : 'warn',
          detail: found
            ? `Propagação configurada — ${configs.length} config(s), ${syncMaps?.length ?? 0} mapa(s)`
            : 'Nenhuma configuração de propagação encontrada',
        };
      },

      rbac: async () => {
        const perfis = await base44.entities.PerfilAcesso.filter({}, null, 5).catch(() => []);
        return {
          status: perfis.length > 0 ? 'ok' : 'warn',
          detail: perfis.length > 0
            ? `${perfis.length} perfil(is) de acesso configurado(s)`
            : 'Nenhum perfil de acesso. Execute "Inicializar RBAC".',
        };
      },

      toggles: async () => {
        const cfgs = await base44.entities.ConfiguracaoSistema.filter({}, '-updated_date', 20).catch(() => []);
        return {
          status: cfgs.length > 0 ? 'ok' : 'warn',
          detail: cfgs.length > 0
            ? `${cfgs.length} configuração(ões) persistida(s) no banco`
            : 'Nenhuma configuração encontrada — toggles podem não persistir',
        };
      },

      clientes: async () => {
        const list = await base44.entities.Cliente.filter(
          groupId ? { group_id: groupId } : empresaId ? { empresa_id: empresaId } : {},
          null, 1
        ).catch(() => []);
        return {
          status: list.length > 0 ? 'ok' : 'warn',
          detail: list.length > 0 ? 'Base de clientes ativa' : 'Nenhum cliente cadastrado ainda',
        };
      },

      produtos: async () => {
        const list = await base44.entities.Produto.filter(
          groupId ? { group_id: groupId } : empresaId ? { empresa_id: empresaId } : {},
          null, 1
        ).catch(() => []);
        return {
          status: list.length > 0 ? 'ok' : 'warn',
          detail: list.length > 0 ? 'Catálogo de produtos ativo' : 'Nenhum produto cadastrado ainda',
        };
      },

      nfe: async () => {
        const cfgNfe = await base44.entities.ConfiguracaoNFe?.filter?.(
          empresaId ? { empresa_id: empresaId } : {}, null, 1
        ).catch(() => []);
        return {
          status: cfgNfe?.length > 0 ? 'ok' : 'warn',
          detail: cfgNfe?.length > 0
            ? 'Configuração fiscal presente'
            : 'Configuração NF-e não encontrada para esta empresa',
        };
      },
    };

    // Executa todos em paralelo
    const keys = Object.keys(checks);
    const values = await Promise.all(keys.map(k => runCheck(k, checks[k])));
    const newResults = Object.fromEntries(keys.map((k, i) => [k, values[i]]));

    setResults(newResults);
    setRunning(false);
    setLastRun(new Date());

    const errors = Object.values(newResults).filter(r => r.status === 'error').length;
    const warns  = Object.values(newResults).filter(r => r.status === 'warn').length;
    const oks    = Object.values(newResults).filter(r => r.status === 'ok').length;

    if (errors === 0 && warns === 0) {
      toast.success(`✅ Sistema 100% saudável! ${oks}/${keys.length} checks OK.`);
    } else if (errors > 0) {
      toast.error(`❌ ${errors} erro(s) crítico(s) + ${warns} aviso(s). Verificar detalhes.`);
    } else {
      toast.warning(`⚠️ ${warns} aviso(s) — ${oks} checks OK. Sistema funcional com ressalvas.`);
    }
  };

  const overallStatus = Object.values(results).length === 0
    ? 'idle'
    : Object.values(results).some(r => r.status === 'error') ? 'error'
    : Object.values(results).some(r => r.status === 'warn') ? 'warn'
    : 'ok';

  const okCount   = Object.values(results).filter(r => r.status === 'ok').length;
  const totalCount = CHECKS.length;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Checkup Geral do Sistema
            {lastRun && (
              <span className="text-xs font-normal text-slate-400 ml-2">
                Última verificação: {lastRun.toLocaleTimeString('pt-BR')}
              </span>
            )}
          </CardTitle>

          <div className="flex items-center gap-2">
            {overallStatus !== 'idle' && (
              <Badge className={
                overallStatus === 'ok'    ? 'bg-green-100 text-green-700 border border-green-200' :
                overallStatus === 'warn'  ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                                           'bg-red-100 text-red-700 border border-red-200'
              }>
                {overallStatus === 'ok'   ? `✅ Saudável (${okCount}/${totalCount})` :
                 overallStatus === 'warn' ? `⚠️ Atenção (${okCount}/${totalCount})` :
                                           `❌ Problemas (${okCount}/${totalCount})`}
              </Badge>
            )}
            <Button size="sm" onClick={runCheckup} disabled={running} className="gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
              {running ? 'Verificando...' : 'Executar Checkup'}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {CHECKS.map(check => {
            const result = results[check.id];
            const Icon = check.icon;
            return (
              <div
                key={check.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  result?.status === 'ok'    ? 'bg-green-50 border-green-200' :
                  result?.status === 'warn'  ? 'bg-amber-50 border-amber-200' :
                  result?.status === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{check.label}</p>
                    <p className="text-xs text-slate-500 truncate">{result?.detail || check.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                  <StatusBadge status={result?.status} />
                  <StatusIcon status={result?.status} />
                </div>
              </div>
            );
          })}
        </div>

        {overallStatus === 'idle' && (
          <p className="text-xs text-center text-slate-400 mt-4">
            Clique em "Executar Checkup" para verificar o status completo do sistema
          </p>
        )}
      </CardContent>
    </Card>
  );
}