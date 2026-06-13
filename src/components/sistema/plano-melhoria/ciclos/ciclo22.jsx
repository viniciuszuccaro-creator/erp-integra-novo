// Ciclo 22 — Junho 2026 — Qualidade técnica e padronização de entidades
export const ciclo22Items = [
  {
    id: 'c22-01', modulo: 'Cadastros', pilar: 'Governança', prioridade: 'CRÍTICO',
    titulo: 'Backfill `codigo` em 20 entidades — sequencial com delay anti-rate-limit',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Todos os 20 registros de entidades primárias receberam campo `codigo` único sequencial. Executado com updates sequenciais e delays para evitar 429.',
  },
  {
    id: 'c22-02', modulo: 'Cadastros', pilar: 'Modularização', prioridade: 'CRÍTICO',
    titulo: 'Refatoração VisualizadorUniversalEntidadeV24 — 1174 → ~250 linhas',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Extraídos: useVisualizadorState, useVisualizadorQuery, useVisualizadorCRUD, VisualizadorToolbar, VisualizadorTableBody, VisualizadorModal. Regra-Mãe respeitada.',
  },
  {
    id: 'c22-03', modulo: 'Sistema', pilar: 'Modularização', prioridade: 'ALTO',
    titulo: 'Refatoração melhoriaPlanData.js — ciclos movidos para ./ciclos/cicloXX.js',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Ciclos 11–22 extraídos para arquivos dedicados. melhoriaPlanData.js reduzido de 584 → ~170 linhas.',
  },
  {
    id: 'c22-04', modulo: 'Cadastros', pilar: 'Qualidade', prioridade: 'ALTO',
    titulo: 'Anti-duplicata centralizado no VisualizadorCRUD — código, CNPJ/CPF e nome',
    status: 'concluido', impacto: 'Alto',
    descricao: 'useVisualizadorCRUD.js verifica duplicidade de código, CNPJ/CPF e nome antes de qualquer create/update. Bloqueia UI com mensagem clara.',
  },
  {
    id: 'c22-05', modulo: 'Sistema', pilar: 'Governança', prioridade: 'MÉDIO',
    titulo: 'Atualização do Plano de Melhorias — Ciclo 22 registrado, roadmap Q1 2027 atualizado',
    status: 'concluido', impacto: 'Médio',
    descricao: 'ciclo22Items criado, PlanoMelhoria página atualizada para refletir Ciclo 22 como ciclo atual, roadmap sincronizado.',
  },
  {
    id: 'c22-06', modulo: 'Todos', pilar: 'Performance', prioridade: 'MÉDIO',
    titulo: 'Validação de integridade pós-backfill — zero duplicatas confirmado',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Verificação de integridade executada em todas as 20 entidades após backfill. Zero duplicatas encontradas.',
  },
];