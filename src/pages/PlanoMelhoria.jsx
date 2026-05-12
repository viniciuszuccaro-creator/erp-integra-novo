import React from 'react';
import PlanoMelhoriaHeader from '@/components/sistema/plano-melhoria/PlanoMelhoriaHeader';
import PlanoMelhoriaPhaseCard from '@/components/sistema/plano-melhoria/PlanoMelhoriaPhaseCard';
import PlanoMelhoriaGovernanca from '@/components/sistema/plano-melhoria/PlanoMelhoriaGovernanca';
import PlanoMelhoriaNextSteps from '@/components/sistema/plano-melhoria/PlanoMelhoriaNextSteps';
import PlanoMelhoriaLiveBacklog from '@/components/sistema/plano-melhoria/PlanoMelhoriaLiveBacklog';
import PlanoMelhoriaModuleMatrix from '@/components/sistema/plano-melhoria/PlanoMelhoriaModuleMatrix';
import PlanoMelhoriaAutomationPanel from '@/components/sistema/plano-melhoria/PlanoMelhoriaAutomationPanel';
import PlanoMelhoriaExecutionBoard from '@/components/sistema/plano-melhoria/PlanoMelhoriaExecutionBoard';
import PlanoMelhoriaSprintPanel from '@/components/sistema/plano-melhoria/PlanoMelhoriaSprintPanel';
import PlanoMelhoriaRiskPanel from '@/components/sistema/plano-melhoria/PlanoMelhoriaRiskPanel';
import PlanoMelhoriaCriticalCommandCenter from '@/components/sistema/plano-melhoria/PlanoMelhoriaCriticalCommandCenter';
import PlanoMelhoriaCriticalExecutor from '@/components/sistema/plano-melhoria/PlanoMelhoriaCriticalExecutor';
import PlanoMelhoriaCriticalCompletionSuite from '@/components/sistema/plano-melhoria/PlanoMelhoriaCriticalCompletionSuite';
import PlanoMelhoriaFullExecutionCenter from '@/components/sistema/plano-melhoria/PlanoMelhoriaFullExecutionCenter';
import PlanoMelhoriaResumoFinal from '@/components/sistema/plano-melhoria/PlanoMelhoriaResumoFinal';
import PlanoMelhoriaAcoesExecutadas from '@/components/sistema/plano-melhoria/PlanoMelhoriaAcoesExecutadas';
import PlanoMelhoriaProximosCiclos from '@/components/sistema/plano-melhoria/PlanoMelhoriaProximosCiclos';
import { melhoriaPlanPhases } from '@/components/sistema/plano-melhoria/melhoriaPlanData';

export default function PlanoMelhoria() {
  const totalProgress = Math.round(
    melhoriaPlanPhases.reduce((sum, phase) => sum + phase.progress, 0) / melhoriaPlanPhases.length
  );

  return (
    <div className="flex h-full w-full flex-col gap-6">
      {/* 1. Header com KPIs do plano */}
      <PlanoMelhoriaHeader totalProgress={totalProgress} />

      {/* 2. Resumo final: fases + módulos com progresso visual */}
      <PlanoMelhoriaResumoFinal />

      {/* 3. Execução completa automática (upsert no banco) */}
      <PlanoMelhoriaFullExecutionCenter />

      {/* 4. Centro de execução crítica (Comercial, Estoque, Financeiro, Sistema) */}
      <PlanoMelhoriaCriticalCommandCenter />

      {/* 5. Executor crítico detalhado */}
      <PlanoMelhoriaCriticalExecutor />

      {/* 6. Suite de conclusão crítica */}
      <PlanoMelhoriaCriticalCompletionSuite />

      {/* 7. Governança da Regra-Mãe */}
      <PlanoMelhoriaGovernanca />

      {/* 8. Board de execução real (pilares) */}
      <PlanoMelhoriaExecutionBoard />

      {/* 9. Sprints por módulo */}
      <PlanoMelhoriaSprintPanel />

      {/* 10. Painel de automações */}
      <PlanoMelhoriaAutomationPanel />

      {/* 11. Matriz módulo × pilar */}
      <PlanoMelhoriaModuleMatrix />

      {/* 12. Controle de riscos */}
      <PlanoMelhoriaRiskPanel />

      {/* 13. Backlog vivo do banco */}
      <PlanoMelhoriaLiveBacklog />

      {/* 14. Ações executadas completas (checklist expandível) */}
      <PlanoMelhoriaAcoesExecutadas />

      {/* 15. Cards de fases do plano */}
      <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
        {melhoriaPlanPhases.map((phase) => (
          <PlanoMelhoriaPhaseCard key={phase.id} phase={phase} />
        ))}
      </div>

      {/* 16. Próximos ciclos de melhoria */}
      <PlanoMelhoriaProximosCiclos />

      {/* 17. Próximos passos e ciclos concluídos */}
      <PlanoMelhoriaNextSteps />
    </div>
  );
}