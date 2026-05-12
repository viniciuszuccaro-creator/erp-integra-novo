import React from 'react';
import PlanoMelhoriaHeader from '@/components/sistema/plano-melhoria/PlanoMelhoriaHeader';
import PlanoMelhoriaKPIsGlobais from '@/components/sistema/plano-melhoria/PlanoMelhoriaKPIsGlobais';
import PlanoMelhoriaResumoFinal from '@/components/sistema/plano-melhoria/PlanoMelhoriaResumoFinal';
import PlanoMelhoriaModulosDashboard from '@/components/sistema/plano-melhoria/PlanoMelhoriaModulosDashboard';
import PlanoMelhoriaIAEngine from '@/components/sistema/plano-melhoria/PlanoMelhoriaIAEngine';
import PlanoMelhoriaAutomacoes from '@/components/sistema/plano-melhoria/PlanoMelhoriaAutomacoes';
import PlanoMelhoriaFullExecutionCenter from '@/components/sistema/plano-melhoria/PlanoMelhoriaFullExecutionCenter';
import PlanoMelhoriaGovernanca from '@/components/sistema/plano-melhoria/PlanoMelhoriaGovernanca';
import PlanoMelhoriaExecutionBoard from '@/components/sistema/plano-melhoria/PlanoMelhoriaExecutionBoard';
import PlanoMelhoriaSprintPanel from '@/components/sistema/plano-melhoria/PlanoMelhoriaSprintPanel';
import PlanoMelhoriaRiskPanel from '@/components/sistema/plano-melhoria/PlanoMelhoriaRiskPanel';
import PlanoMelhoriaModuleMatrix from '@/components/sistema/plano-melhoria/PlanoMelhoriaModuleMatrix';
import PlanoMelhoriaAutomationPanel from '@/components/sistema/plano-melhoria/PlanoMelhoriaAutomationPanel';
import PlanoMelhoriaLiveBacklog from '@/components/sistema/plano-melhoria/PlanoMelhoriaLiveBacklog';
import PlanoMelhoriaAcoesExecutadas from '@/components/sistema/plano-melhoria/PlanoMelhoriaAcoesExecutadas';
import PlanoMelhoriaRegisterAcoes from '@/components/sistema/plano-melhoria/PlanoMelhoriaRegisterAcoes';
import PlanoMelhoriaProximosPassos from '@/components/sistema/plano-melhoria/PlanoMelhoriaProximosPassos';
import PlanoMelhoriaCriticalCommandCenter from '@/components/sistema/plano-melhoria/PlanoMelhoriaCriticalCommandCenter';
import PlanoMelhoriaCriticalExecutor from '@/components/sistema/plano-melhoria/PlanoMelhoriaCriticalExecutor';
import PlanoMelhoriaCriticalCompletionSuite from '@/components/sistema/plano-melhoria/PlanoMelhoriaCriticalCompletionSuite';
import PlanoMelhoriaPhaseCard from '@/components/sistema/plano-melhoria/PlanoMelhoriaPhaseCard';
import { melhoriaPlanPhases } from '@/components/sistema/plano-melhoria/melhoriaPlanData';

export default function PlanoMelhoria() {
  const totalProgress = Math.round(
    melhoriaPlanPhases.reduce((sum, phase) => sum + phase.progress, 0) / melhoriaPlanPhases.length
  );

  return (
    <div className="flex h-full w-full flex-col gap-6 pb-10">

      {/* 1. Header executivo com KPIs reais */}
      <PlanoMelhoriaHeader totalProgress={totalProgress} />

      {/* 2. KPIs globais — 8 pilares em linha */}
      <PlanoMelhoriaKPIsGlobais />

      {/* 3. Execução completa automática (upsert no banco) */}
      <PlanoMelhoriaFullExecutionCenter />

      {/* 4. Motor de IA — execução modular */}
      <PlanoMelhoriaIAEngine />

      {/* 5. Automações e funções ativas */}
      <PlanoMelhoriaAutomacoes />

      {/* 6. Dashboard de módulos com drill-down por pilar */}
      <PlanoMelhoriaModulosDashboard />

      {/* 7. Resumo de fases + maturidade de módulos */}
      <PlanoMelhoriaResumoFinal />

      {/* 8. Centro de execução crítica (Comercial, Estoque, Financeiro, Sistema) */}
      <PlanoMelhoriaCriticalCommandCenter />

      {/* 9. Executor crítico detalhado */}
      <PlanoMelhoriaCriticalExecutor />

      {/* 10. Suite de conclusão crítica */}
      <PlanoMelhoriaCriticalCompletionSuite />

      {/* 11. Governança da Regra-Mãe — 14 regras */}
      <PlanoMelhoriaGovernanca />

      {/* 12. Board de execução real (pilares) */}
      <PlanoMelhoriaExecutionBoard />

      {/* 13. Sprints por módulo com prioridade e progresso */}
      <PlanoMelhoriaSprintPanel />

      {/* 14. Painel de automações conectadas (legado + novo) */}
      <PlanoMelhoriaAutomationPanel />

      {/* 15. Matriz módulo × pilar */}
      <PlanoMelhoriaModuleMatrix />

      {/* 16. Controle de riscos + trilhas de validação */}
      <PlanoMelhoriaRiskPanel />

      {/* 17. Backlog vivo do banco (PlanoMelhoriaItem) */}
      <PlanoMelhoriaLiveBacklog />

      {/* 18. Ações executadas principais (8 categorias) */}
      <PlanoMelhoriaAcoesExecutadas />

      {/* 19. Módulos complementares: Portal, Hub, SPED, PWA, Relatórios */}
      <PlanoMelhoriaRegisterAcoes />

      {/* 20. Cards de fases do plano */}
      <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
        {melhoriaPlanPhases.map((phase) => (
          <PlanoMelhoriaPhaseCard key={phase.id} phase={phase} />
        ))}
      </div>

      {/* 21. Próximos ciclos de inovação — Roadmap 2026 */}
      <PlanoMelhoriaProximosPassos />

    </div>
  );
}