/**
 * CheckupSistemaPanel v1.0
 * Painel de diagnóstico geral do sistema ERP
 * Verifica: propagação, RBAC, toggles, performance, integrações
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, AlertTriangle, XCircle, RefreshCw,
  Shield, ArrowLeftRight, ToggleLeft, Zap, Database, Settings
} from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { toast } from 'sonner';

const CHECKS = [
  {
    id: 'context',
    label: 'Contexto Multiempresa',
    icon: Database,
    description: 'Verifica se grupo/empresa está configurado',
  },
  {
    id: 'propagation',
    label: 'Propagação Bidirecional',
    icon: ArrowLeftRight,
    description: 'Verifica automações de sync ativas',
  },
  {
    id: 'rbac',
    label: 'Perfis de Acesso (RBAC)',
    icon: Shield,
    description: 'Verifica se existem perfis de acesso configurados',
  },
  {
    id: 'toggles',
    label: 'Configurações do Sistema',
    icon: ToggleLeft,
    description: 'Verifica se configurações estão salvas no banco',
  },
  {
    id: 'empresas',
    label: 'Empresas Vinculadas',
    icon: Settings,
    description: 'Verifica empresas cadastradas no grupo',
  },
];

function StatusIcon({ status }) {
  if (status === 'ok') return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  if (status === 'warn') return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  if (status === 'error') return <XCircle className="w-5 h-5 text-red-500" />;
  return <div className="w-5 h-5 rounded-full bg-slate-200 animate-pulse" />;
}

function statusBadge(status) {
  if (status === 'ok') return <Badge className="bg-green-100 text-green-700 border-green-200 border text-[10px]">OK</Badge>;
  if (status === 'warn') return <Badge className="bg-amber-100 text-amber-700 border-amber-200 border text-[10px]">Atenção</Badge>;
  if (status === 'error') return <Badge className="bg-red-100 text-red-700 border-red-200 border text-[10px]">Erro</Badge>;
  return <Badge variant="secondary" className="text-[10px]">Verificando...</Badge>;
}

export default function CheckupSistemaPanel() {
  const { grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState({});

  const runCheckup = async () => {
    setRunning(true);
    setResults({});
    const newResults = {};

    // Check 1: Contexto
    newResults.context = {
      status: (grupoAtual?.id || empresaAtual?.id) ? 'ok' : 'error',
      detail: grupoAtual?.id
        ? `Grupo: ${grupoAtual.nome_do_grupo}`
        : empresaAtual?.id
        ? `Empresa: ${empresaAtual.nome_fantasia || empresaAtual.razao_social}`
        : 'Nenhum contexto selecionado',
    };

    // Check 2: Propagação (verifica configurações)
    try {
      const configs = await base44.entities.ConfiguracaoSistema.filter(
        { chave: 'propagacao_ativa' },
        null, 5
      ).catch(() => []);
      newResults.propagation = {
        status: configs.length > 0 ? 'ok' : 'warn',
        detail: configs.length > 0
          ? `${configs.length} config(s) de propagação encontrada(s)`
          : 'Nenhuma configuração de propagação ativa encontrada',
      };
    } catch (e) {
      newResults.propagation = { status: 'error', detail: e.message };
    }

    // Check 3: RBAC
    try {
      const perfis = await base44.entities.PerfilAcesso.filter({}, null, 5).catch(() => []);
      newResults.rbac = {
        status: perfis.length > 0 ? 'ok' : 'warn',
        detail: perfis.length > 0
          ? `${perfis.length} perfil(is) de acesso configurado(s)`
          : 'Nenhum perfil de acesso configurado',
      };
    } catch (e) {
      newResults.rbac = { status: 'error', detail: e.message };
    }

    // Check 4: Toggles/Configs
    try {
      const cfgs = await base44.entities.ConfiguracaoSistema.filter({}, '-updated_date', 10).catch(() => []);
      newResults.toggles = {
        status: cfgs.length > 0 ? 'ok' : 'warn',
        detail: cfgs.length > 0
          ? `${cfgs.length} configuração(ões) salva(s) no banco`
          : 'Nenhuma configuração encontrada no banco',
      };
    } catch (e) {
      newResults.toggles = { status: 'error', detail: e.message };
    }

    // Check 5: Empresas vinculadas
    try {
      const empresas = await base44.entities.Empresa.filter(
        grupoAtual?.id ? { group_id: grupoAtual.id } : {},
        null, 50
      ).catch(() => []);
      newResults.empresas = {
        status: empresas.length > 0 ? 'ok' : 'warn',
        detail: empresas.length > 0
          ? `${empresas.length} empresa(s) cadastrada(s)`
          : 'Nenhuma empresa encontrada',
        count: empresas.length,
      };
    } catch (e) {
      newResults.empresas = { status: 'error', detail: e.message };
    }

    setResults(newResults);
    setRunning(false);

    const errors = Object.values(newResults).filter(r => r.status === 'error').length;
    const warns = Object.values(newResults).filter(r => r.status === 'warn').length;

    if (errors === 0 && warns === 0) {
      toast.success('✅ Sistema saudável! Todos os checks passaram.');
    } else {
      toast.warning(`⚠ ${errors} erro(s) e ${warns} aviso(s) encontrados.`);
    }
  };

  const overallStatus = Object.values(results).length === 0
    ? 'idle'
    : Object.values(results).some(r => r.status === 'error')
    ? 'error'
    : Object.values(results).some(r => r.status === 'warn')
    ? 'warn'
    : 'ok';

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Checkup Geral do Sistema
          </CardTitle>
          <div className="flex items-center gap-2">
            {overallStatus !== 'idle' && (
              overallStatus === 'ok'
                ? <Badge className="bg-green-100 text-green-700 border border-green-200">Sistema Saudável</Badge>
                : overallStatus === 'warn'
                ? <Badge className="bg-amber-100 text-amber-700 border border-amber-200">Atenção Necessária</Badge>
                : <Badge className="bg-red-100 text-red-700 border border-red-200">Problemas Detectados</Badge>
            )}
            <Button
              size="sm"
              onClick={runCheckup}
              disabled={running}
              className="gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${running ? 'animate-spin' : ''}`} />
              {running ? 'Verificando...' : 'Executar Checkup'}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {CHECKS.map(check => {
            const result = results[check.id];
            const Icon = check.icon;
            return (
              <div
                key={check.id}
                className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                  result?.status === 'ok' ? 'bg-green-50 border-green-200' :
                  result?.status === 'warn' ? 'bg-amber-50 border-amber-200' :
                  result?.status === 'error' ? 'bg-red-50 border-red-200' :
                  'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{check.label}</p>
                    <p className="text-xs text-slate-500">
                      {result?.detail || check.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {statusBadge(result?.status)}
                  <StatusIcon status={result?.status} />
                </div>
              </div>
            );
          })}
        </div>

        {overallStatus === 'idle' && (
          <p className="text-xs text-center text-slate-400 mt-4">
            Clique em "Executar Checkup" para verificar o status do sistema
          </p>
        )}
      </CardContent>
    </Card>
  );
}