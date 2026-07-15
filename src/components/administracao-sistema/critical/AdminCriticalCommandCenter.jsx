import React, { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, AlertTriangle, Activity, PlayCircle, CheckCircle2, Lock } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useUser } from '@/components/lib/UserContext';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { getAdminCoverageSummary } from '@/components/administracao-sistema/fase1/adminControlRegistry';
import { criticalPriorityModules } from '@/components/sistema/plano-melhoria/criticalPriorityData';
import { adminCriticalActions, adminCriticalRings } from './adminCriticalPlanData';

export default function AdminCriticalCommandCenter() {
  const { user } = useUser();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const queryClient = useQueryClient();
  const [runningAction, setRunningAction] = useState(null);

  const groupId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;
  const empresaId = empresaAtual?.id || null;
  const coverage = getAdminCoverageSummary();
  const sistemaPlan = criticalPriorityModules.find((item) => item.module === 'Sistema');

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['admin-critical-audit', empresaId || 'sem-empresa', groupId || 'sem-grupo'],
    queryFn: () => base44.entities.AuditLog.filter(groupId ? { modulo: 'Sistema', group_id: groupId } : { modulo: 'Sistema' }, '-data_hora', 50),
    staleTime: 60000,
  });

  const riskSummary = useMemo(() => {
    const blocks = auditLogs.filter((log) => log.acao === 'Bloqueio').length;
    const security = auditLogs.filter((log) => log.tipo_auditoria === 'seguranca').length;
    const slow = auditLogs.filter((log) => log.entidade === 'FunctionLatency').length;
    return { blocks, security, slow };
  }, [auditLogs]);

  const maturity = Math.round(((sistemaPlan?.progress || 0) + (coverage.percentualMapeado || 0)) / 2);

  const runAction = async (action) => {
    setRunningAction(action.id);
    const payload = action.buildPayload({ empresaId, groupId });
    const response = await base44.functions.invoke(action.functionName, payload);

    await base44.entities.AuditLog.create({
      usuario: user?.full_name || user?.email || 'Administrador',
      usuario_id: user?.id || null,
      empresa_id: empresaId,
      group_id: groupId,
      acao: 'Execução',
      modulo: 'Sistema',
      tipo_auditoria: 'sistema',
      entidade: 'PlanoMelhoriaCritico',
      descricao: `Ação crítica executada: ${action.title}`,
      dados_novos: { action: action.id, response: response?.data || null },
      data_hora: new Date().toISOString(),
    });

    queryClient.invalidateQueries({ queryKey: ['admin-critical-audit'] });
    toast.success(`${action.title} concluída`);
    setRunningAction(null);
  };

  return (
    <Card className="w-full border-blue-200 bg-gradient-to-br from-white to-blue-50/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span className="flex items-center gap-2 text-slate-900">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            Command Center Crítico • Sistema/Administração
          </span>
          <Badge className="w-fit bg-blue-100 text-blue-700 border border-blue-200">
            Maturidade {maturity}%
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>{sistemaPlan?.objective}</span>
            <span>{coverage.percentualMapeado}% controles mapeados</span>
          </div>
          <Progress value={maturity} className="h-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <MetricCard label="Controles" value={coverage.total} detail={`${coverage.conectado} conectados`} icon={CheckCircle2} />
          <MetricCard label="Bloqueios" value={riskSummary.blocks} detail="últimos eventos" icon={Lock} />
          <MetricCard label="Segurança" value={riskSummary.security} detail="logs recentes" icon={AlertTriangle} />
          <MetricCard label="Performance" value={riskSummary.slow} detail="funções lentas" icon={Activity} />
        </div>

        <div className="flex flex-wrap gap-2">
          {adminCriticalRings.map((ring) => (
            <Badge key={ring.label} className={`border ${ring.tone}`} title={ring.description}>
              {ring.label}: {ring.status}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
          {adminCriticalActions.map((action) => (
            <div key={action.id} className="rounded-xl border bg-white p-3 space-y-3">
              <div>
                <p className="font-semibold text-sm text-slate-900">{action.title}</p>
                <p className="text-xs text-slate-500 mt-1">{action.description}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => runAction(action)}
                disabled={runningAction === action.id}
                data-action={`AdminCritical.${action.id}`}
                data-sensitive={action.sensitive ? 'true' : undefined}
                className="w-full"
              >
                <PlayCircle className="w-4 h-4" />
                {runningAction === action.id ? 'Executando…' : 'Executar'}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function MetricCard({ label, value, detail, icon: Icon }) {
  return (
    <div className="rounded-xl border bg-white p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
        <p className="text-[11px] text-slate-400">{detail}</p>
      </div>
    </div>
  );
}