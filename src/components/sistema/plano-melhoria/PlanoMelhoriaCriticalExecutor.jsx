import React, { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, PlayCircle, ShieldCheck } from 'lucide-react';
import { criticalBacklogItems, criticalValidationActions } from './criticalExecutionPlan';
import { DOCUMENTATION_BLOCK_POLICY, assertImprovementTaskAllowed, buildImprovementExecutionPayload, filterOperationalPlanItems } from './planoMelhoriaExecutionGuard';

const statusClass = {
  idle: 'bg-slate-50 text-slate-600 border-slate-200',
  running: 'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-red-50 text-red-700 border-red-200'
};

export default function PlanoMelhoriaCriticalExecutor() {
  const queryClient = useQueryClient();
  const autoRunRef = useRef(false);
  const [backlogStatus, setBacklogStatus] = useState('idle');
  const [validationStatus, setValidationStatus] = useState({});
  const operationalBacklogItems = filterOperationalPlanItems(criticalBacklogItems);
  const documentationPolicy = DOCUMENTATION_BLOCK_POLICY;

  const registrarBacklogCritico = async () => {
    setBacklogStatus('running');
    await Promise.all(operationalBacklogItems.map(async (item) => {
      if (!assertImprovementTaskAllowed(item).allowed) return null;
      const existing = await base44.entities.PlanoMelhoriaItem.filter({ titulo: item.titulo }, '-updated_date', 1);
      if (existing?.[0]?.id) {
        return base44.entities.PlanoMelhoriaItem.update(existing[0].id, item);
      }
      return base44.entities.PlanoMelhoriaItem.create(item);
    }));
    await queryClient.invalidateQueries({ queryKey: ['plano-melhoria-items'] });
    setBacklogStatus('success');
  };

  const executarValidacoes = async () => {
    setValidationStatus(Object.fromEntries(criticalValidationActions.map((action) => [action.id, 'running'])));
    const results = await Promise.allSettled(
      criticalValidationActions.map((action) => base44.functions.invoke(action.functionName, buildImprovementExecutionPayload('plano_melhoria_critico')))
    );
    setValidationStatus(Object.fromEntries(criticalValidationActions.map((action, index) => [
      action.id,
      results[index].status === 'fulfilled' ? 'success' : 'error'
    ])));
  };

  useEffect(() => {
    if (autoRunRef.current) return;
    autoRunRef.current = true;
    registrarBacklogCritico().then(() => executarValidacoes());
  }, []);

  return (
    <Card className="w-full border-red-100 bg-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl text-slate-900">
              <ShieldCheck className="h-5 w-5 text-red-600" /> Executor crítico do plano
            </CardTitle>
            <p className="mt-1 text-sm text-slate-500">Registra melhorias críticas automaticamente com documentação bloqueada no processo.</p>
            <p className="mt-1 text-xs text-emerald-700">Política ativa: {documentationPolicy.ignoredExtensions.length} extensões ignoradas e cache de build limpo.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={registrarBacklogCritico} disabled={backlogStatus === 'running'}>
              {backlogStatus === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Registrar backlog crítico
            </Button>
            <Button onClick={executarValidacoes}>
              <PlayCircle className="h-4 w-4" /> Rodar validações
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 lg:grid-cols-[1fr_1.3fr]">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-900">Backlog crítico</p>
            <Badge variant="outline" className={statusClass[backlogStatus]}>{backlogStatus === 'success' ? 'Registrado' : backlogStatus === 'running' ? 'Executando' : 'Pronto'}</Badge>
          </div>
          <div className="mt-3 grid gap-2">
            {operationalBacklogItems.map((item) => (
              <div key={item.titulo} className="rounded-xl bg-white px-3 py-2 text-sm text-slate-700">
                <span className="font-medium text-slate-900">{item.modulo}</span> • {item.titulo}
              </div>
            ))}
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {criticalValidationActions.map((action) => {
            const state = validationStatus[action.id] || 'idle';
            return (
              <div key={action.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900">{action.label}</p>
                  <Badge variant="outline" className={statusClass[state]}>{state === 'success' ? 'OK' : state === 'running' ? 'Rodando' : state === 'error' ? 'Revisar' : 'Pendente'}</Badge>
                </div>
                <p className="mt-2 text-xs leading-5 text-slate-500">{action.description}</p>
                <p className="mt-3 rounded-lg bg-white px-2 py-1 text-xs font-medium text-slate-600">{action.functionName}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}