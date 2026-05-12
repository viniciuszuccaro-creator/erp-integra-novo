import React from 'react';
import PlanoMelhoriaHeader from '@/components/sistema/plano-melhoria/PlanoMelhoriaHeader';
import PlanoMelhoriaKPIsBig from '@/components/sistema/plano-melhoria/PlanoMelhoriaKPIsBig';
import PlanoMelhoriaIACockpit from '@/components/sistema/plano-melhoria/PlanoMelhoriaIACockpit';
import PlanoMelhoriaExecucaoFinal from '@/components/sistema/plano-melhoria/PlanoMelhoriaExecucaoFinal';
import PlanoMelhoriaChecklistFinal from '@/components/sistema/plano-melhoria/PlanoMelhoriaChecklistFinal';
import PlanoMelhoriaConexoesAvancadas from '@/components/sistema/plano-melhoria/PlanoMelhoriaConexoesAvancadas';
import PlanoMelhoriaConexoesModulos from '@/components/sistema/plano-melhoria/PlanoMelhoriaConexoesModulos';
import PlanoMelhoriaGovernanca from '@/components/sistema/plano-melhoria/PlanoMelhoriaGovernanca';
import PlanoMelhoriaExecutionBoard from '@/components/sistema/plano-melhoria/PlanoMelhoriaExecutionBoard';
import PlanoMelhoriaSprintPanel from '@/components/sistema/plano-melhoria/PlanoMelhoriaSprintPanel';
import PlanoMelhoriaAutomationPanel from '@/components/sistema/plano-melhoria/PlanoMelhoriaAutomationPanel';
import PlanoMelhoriaModuleMatrix from '@/components/sistema/plano-melhoria/PlanoMelhoriaModuleMatrix';
import PlanoMelhoriaRiskPanel from '@/components/sistema/plano-melhoria/PlanoMelhoriaRiskPanel';
import PlanoMelhoriaLiveBacklog from '@/components/sistema/plano-melhoria/PlanoMelhoriaLiveBacklog';
import PlanoMelhoriaAcoesExecutadas from '@/components/sistema/plano-melhoria/PlanoMelhoriaAcoesExecutadas';
import PlanoMelhoriaPhaseCard from '@/components/sistema/plano-melhoria/PlanoMelhoriaPhaseCard';
import PlanoMelhoriaProximosCiclos from '@/components/sistema/plano-melhoria/PlanoMelhoriaProximosCiclos';
import PlanoMelhoriaRoadmapFuturo from '@/components/sistema/plano-melhoria/PlanoMelhoriaRoadmapFuturo';
import PlanoMelhoriaNextSteps from '@/components/sistema/plano-melhoria/PlanoMelhoriaNextSteps';
import PlanoMelhoriaFullExecutionCenter from '@/components/sistema/plano-melhoria/PlanoMelhoriaFullExecutionCenter';
import PlanoMelhoriaCriticalCommandCenter from '@/components/sistema/plano-melhoria/PlanoMelhoriaCriticalCommandCenter';
import PlanoMelhoriaCriticalExecutor from '@/components/sistema/plano-melhoria/PlanoMelhoriaCriticalExecutor';
import PlanoMelhoriaCriticalCompletionSuite from '@/components/sistema/plano-melhoria/PlanoMelhoriaCriticalCompletionSuite';
import PlanoMelhoriaResumoFinal from '@/components/sistema/plano-melhoria/PlanoMelhoriaResumoFinal';
import PlanoMelhoriaStatusConsolidado from '@/components/sistema/plano-melhoria/PlanoMelhoriaStatusConsolidado';
import PlanoMelhoriaMetricasDetalhadas from '@/components/sistema/plano-melhoria/PlanoMelhoriaMetricasDetalhadas';
import PlanoMelhoriaDashboardFinal from '@/components/sistema/plano-melhoria/PlanoMelhoriaDashboardFinal';
import PlanoMelhoriaProximasAcoes from '@/components/sistema/plano-melhoria/PlanoMelhoriaProximasAcoes';
import PlanoMelhoriaFinalSummary from '@/components/sistema/plano-melhoria/PlanoMelhoriaFinalSummary';
import PlanoMelhoriaCiclo10Showcase from '@/components/sistema/plano-melhoria/PlanoMelhoriaCiclo10Showcase';
import PlanoMelhoriaRuleMaster from '@/components/sistema/plano-melhoria/PlanoMelhoriaRuleMaster';
import PlanoMelhoria100Execucao from '@/components/sistema/plano-melhoria/PlanoMelhoria100Execucao';
import PlanoMelhoriaAnalise100 from '@/components/sistema/plano-melhoria/PlanoMelhoriaAnalise100';
import { Link } from 'react-router-dom';
import { melhoriaPlanPhases } from '@/components/sistema/plano-melhoria/melhoriaPlanData';

export default function PlanoMelhoria() {
  const totalProgress = Math.round(
    melhoriaPlanPhases.reduce((sum, phase) => sum + phase.progress, 0) / melhoriaPlanPhases.length
  );

  return (
    <div className="flex h-full w-full flex-col gap-6">

      {/* 0. ANÁLISE PROFUNDA — O QUE FALTA PARA 100% */}
      <PlanoMelhoriaAnalise100 />

      {/* 1. Header com KPIs do plano */}
      <PlanoMelhoriaHeader totalProgress={totalProgress} />

      {/* 2. Dashboard Final — visão 360 completa do plano */}
      <PlanoMelhoriaDashboardFinal />

      {/* 3. Status Consolidado — conquistas e visão geral do plano */}
      <PlanoMelhoriaStatusConsolidado />

      {/* 4. KPIs Big + Pilares + Módulos completos */}
      <PlanoMelhoriaKPIsBig />

      {/* 3. Cockpit IA: diagnóstico executivo inteligente */}
      <PlanoMelhoriaIACockpit />

      {/* 4. Execução Final — todos os itens deste ciclo */}
      <PlanoMelhoriaExecucaoFinal />

      {/* 5. Checklist final expandível por categoria */}
      <PlanoMelhoriaChecklistFinal />

      {/* 6. Resumo visual de fases + módulos */}
      <PlanoMelhoriaResumoFinal />

      {/* 7. Centro de execução total (upsert automático no banco) */}
      <PlanoMelhoriaFullExecutionCenter />

      {/* 8. Centro de execução crítica */}
      <PlanoMelhoriaCriticalCommandCenter />

      {/* 9. Executor crítico detalhado */}
      <PlanoMelhoriaCriticalExecutor />

      {/* 10. Suite de conclusão crítica */}
      <PlanoMelhoriaCriticalCompletionSuite />

      {/* 11. Governança da Regra-Mãe */}
      <PlanoMelhoriaGovernanca />

      {/* 12. Fluxos ponta a ponta avançados */}
      <PlanoMelhoriaConexoesAvancadas />

      {/* 13. Conexões entre módulos (funções backend) */}
      <PlanoMelhoriaConexoesModulos />

      {/* 14. Board de execução por pilar */}
      <PlanoMelhoriaExecutionBoard />

      {/* 15. Sprints por módulo */}
      <PlanoMelhoriaSprintPanel />

      {/* 16. Painel de automações backend */}
      <PlanoMelhoriaAutomationPanel />

      {/* 17. Métricas detalhadas por pilar (drill-down) */}
      <PlanoMelhoriaMetricasDetalhadas />

      {/* 18. Matriz módulo × pilar */}
      <PlanoMelhoriaModuleMatrix />

      {/* 18. Controle de riscos */}
      <PlanoMelhoriaRiskPanel />

      {/* 19. Backlog vivo do banco */}
      <PlanoMelhoriaLiveBacklog />

      {/* 20. Ações executadas completas (checklist expandível) */}
      <PlanoMelhoriaAcoesExecutadas />

      {/* 21. Cards de fases do plano */}
      <div className="grid w-full gap-4 md:grid-cols-2 xl:grid-cols-3">
        {melhoriaPlanPhases.map((phase) => (
          <PlanoMelhoriaPhaseCard key={phase.id} phase={phase} />
        ))}
      </div>

      {/* 24. Roadmap de inovação futura 2026-2027 */}
      <PlanoMelhoriaRoadmapFuturo />

      {/* 25. Próximos ciclos de melhoria */}
      <PlanoMelhoriaProximosCiclos />

      {/* 26. Próximas ações — Ciclo 10 & Roadmap */}
      <PlanoMelhoriaProximasAcoes />

      {/* 27. Próxima execução — ações imediatas */}
      <PlanoMelhoriaNextSteps />

      {/* 28. Ciclo 10 Showcase */}
      <PlanoMelhoriaCiclo10Showcase />

      {/* 29. Regra-Mãe do Sistema */}
      <PlanoMelhoriaRuleMaster />

      {/* 30. Resumo Final Executivo */}
      <PlanoMelhoriaFinalSummary />

      {/* 31. EXECUÇÃO 100% COMPLETA — Registro permanente */}
      <PlanoMelhoria100Execucao />

    </div>
  );
}