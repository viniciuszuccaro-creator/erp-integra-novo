// Ciclo 23 — Junho/Julho 2026 — Estabilidade de build, hooks e sub-componentes
export const ciclo23Items = [
  {
    id: 'c23-01', modulo: 'Cadastros', pilar: 'Modularização', prioridade: 'CRÍTICO',
    titulo: 'Recriação dos hooks useVisualizadorState, useVisualizadorQuery, useVisualizadorCRUD',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Hooks extraídos no Ciclo 22 não foram persistidos corretamente. Recriados com lógica completa de estado, query e CRUD. Build restaurado.',
  },
  {
    id: 'c23-02', modulo: 'Cadastros', pilar: 'Modularização', prioridade: 'CRÍTICO',
    titulo: 'Correção de imports absolutos no VisualizadorUniversalEntidadeV24',
    status: 'concluido', impacto: 'Alto',
    descricao: 'Imports relativos (./hooks/...) convertidos para absolutos (@/components/cadastros/hooks/...) para garantir resolução correta pelo Vite.',
  },
  {
    id: 'c23-03', modulo: 'Sistema', pilar: 'Estabilidade', prioridade: 'CRÍTICO',
    titulo: 'Correção imports CicloExecucaoPanel — remoção de ícones não utilizados',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Imports de ícones AlertCircle, Globe2, Code2, Lock, MessageSquare removidos — não existiam no lucide-react versão instalada.',
  },
  {
    id: 'c23-04', modulo: 'Cadastros', pilar: 'Qualidade', prioridade: 'ALTO',
    titulo: 'Padronização de caminhos de import em todo o módulo Cadastros',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Todos os sub-componentes de Cadastros passam a usar paths @/ absolutos. Elimina erros de resolução de módulos em builds.',
  },
  {
    id: 'c23-05', modulo: 'Sistema', pilar: 'Governança', prioridade: 'MÉDIO',
    titulo: 'Atualização do Plano de Melhorias — Ciclo 23 registrado, roadmap Q2 2027 atualizado',
    status: 'concluido', impacto: 'Médio',
    descricao: 'ciclo23Items criado, PlanoMelhoria atualizado para ciclo 23 como ciclo atual, roadmap sincronizado.',
  },
  {
    id: 'c23-06', modulo: 'Cadastros', pilar: 'Performance', prioridade: 'MÉDIO',
    titulo: 'Validação de integridade pós-refatoração — build e runtime limpos',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Verificação de imports, resolução de módulos e renderização confirmados após recriação de hooks e correção de paths.',
  },
];