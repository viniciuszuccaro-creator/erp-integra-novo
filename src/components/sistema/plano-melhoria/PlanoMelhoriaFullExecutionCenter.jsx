import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Loader2, PlayCircle, Rocket, ShieldCheck } from 'lucide-react';
import { fullPlanBacklogItems, fullPlanValidationStack } from './planoMelhoriaFullExecutionData';
import { buildImprovementExecutionPayload, filterOperationalPlanItems } from './planoMelhoriaExecutionGuard';

const stateClass = {
  idle: 'bg-slate-50 text-slate-600 border-slate-200',
  running: 'bg-blue-50 text-blue-700 border-blue-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  error: 'bg-red-50 text-red-700 border-red-200'
};

export default function PlanoMelhoriaFullExecutionCenter() {
  const queryClient = useQueryClient();
  const autoRunRef = useRef(false);
  const [executionState, setExecutionState] = useState('idle');
  const [validationState, setValidationState] = useState({});
  const operationalBacklogItems = useMemo(() => filterOperationalPlanItems(fullPlanBacklogItems), []);

  const progress = useMemo(() => Math.round(
    operationalBacklogItems.reduce((sum, item) => sum + (item.percentual || 0), 0) / operationalBacklogItems.length
  ), [operationalBacklogItems]);

  const executarPlanoCompleto = async () => {
    setExecutionState('running');
    await Promise.all(operationalBacklogItems.map(async (item) => {
      const existing = await base44.entities.PlanoMelhoriaItem.filter({ titulo: item.titulo }, '-updated_date', 1);
      if (existing?.[0]?.id) return base44.entities.PlanoMelhoriaItem.update(existing[0].id, item);
      return base44.entities.PlanoMelhoriaItem.create(item);
    }));
    await queryClient.invalidateQueries({ queryKey: ['plano-melhoria-items'] });
    setExecutionState('success');
  };

  const validarPlanoCompleto = async () => {
    setValidationState(Object.fromEntries(fullPlanValidationStack.map((item) => [item.id, 'running'])));
    const results = await Promise.allSettled(fullPlanValidationStack.map((item) => (
      base44.functions.invoke(item.functionName, buildImprovementExecutionPayload('plano_melhoria_completo'))
    )));
    setValidationState(Object.fromEntries(fullPlanValidationStack.map((item, index) => [
      item.id,
      results[index].status === 'fulfilled' ? 'success' : 'error'
    ])));
  };

  useEffect(() => {
    if (autoRunRef.current) return;
    autoRunRef.current = true;
    executarPlanoCompleto().then(() => validarPlanoCompleto());
  }, []);

  return (
    <Card className="w-full border-blue-100 bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 text-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Rocket className="h-6 w-6 text-cyan-300" /> Execução completa do Plano de Melhoria
            </CardTitle>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Converte todas as fases e sprints em backlog vivo, preservando módulos existentes e mantendo multiempresa, acesso, IA e auditoria como padrão.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={executarPlanoCompleto} disabled={executionState === 'running'}>
              {executionState === 'running' ? <Loader2 className="h-4 w-4 animate-spin" /> : <PlayCircle className="h-4 w-4" />}
              Executar tudo
            </Button>
            <Button className="bg-cyan-500 text-slate-950 hover:bg-cyan-400" onClick={validarPlanoCompleto}>
              <ShieldCheck className="h-4 w-4" /> Validar tudo
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-[280px_1fr]">
        <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-5xl font-black">{progress}%</p>
              <p className="mt-1 text-xs uppercase tracking-wide text-slate-300">plano mapeado</p>
            </div>
            <Badge variant="outline" className={stateClass[executionState]}>
              {executionState === 'success' ? 'Executado' : executionState === 'running' ? 'Executando' : 'Pronto'}
            </Badge>
          </div>
          <Progress value={progress} className="mt-5 h-2 bg-white/20" />
          <p className="mt-4 text-sm text-slate-300">{operationalBacklogItems.length} melhorias operacionais preparadas; documentação é ignorada automaticamente.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {fullPlanValidationStack.map((item) => {
            const status = validationState[item.id] || 'idle';
            return (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">{item.label}</p>
                    <p className="mt-1 text-xs text-slate-300">{item.area}</p>
                  </div>
                  <Badge variant="outline" className={stateClass[status]}>
                    {status === 'success' ? <CheckCircle2 className="h-3 w-3" /> : status === 'running' ? <Loader2 className="h-3 w-3 animate-spin" /> : null}
                    {status === 'success' ? 'OK' : status === 'running' ? 'Rodando' : status === 'error' ? 'Revisar' : 'Pendente'}
                  </Badge>
                </div>
                <p className="mt-3 rounded-lg bg-white/10 px-2 py-1 text-xs text-slate-200">{item.functionName}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}