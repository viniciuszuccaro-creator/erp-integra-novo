// Ciclo 24 — Julho 2026 — Extração de config/utils e endurecimento de qualidade
export const ciclo24Items = [
  {
    id: 'c24-01', modulo: 'Cadastros', pilar: 'Modularização', prioridade: 'ALTO',
    titulo: 'Extrair FORM_ALIASES + DEFAULT_FORM_COMPONENTS para visualizadorConfig.js',
    status: 'concluido', impacto: 'Alto',
    descricao: 'VisualizadorUniversalEntidadeV24 ainda contém FORM_ALIASES (50+ entradas) e DEFAULT_FORM_COMPONENTS inline. Mover para ./config/visualizadorConfig.js reduz o arquivo principal e centraliza manutenção.',
  },
  {
    id: 'c24-02', modulo: 'Cadastros', pilar: 'Modularização', prioridade: 'ALTO',
    titulo: 'Extrair ENTITY_CODE_FIELD para config/entityCodeFields.js',
    status: 'concluido', impacto: 'Médio',
    descricao: 'ENTITY_CODE_FIELD com 40+ entidades está em useVisualizadorCRUD.js. Mover para arquivo de config dedicado permite reutilização em outros hooks e componentes sem importar o hook completo.',
  },
  {
    id: 'c24-03', modulo: 'Cadastros', pilar: 'Modularização', prioridade: 'MÉDIO',
    titulo: 'Extrair fmtValue + getDisplayValue para utils/tableFormatters.js',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Funções de formatação de células (fmtValue, getDisplayValue, STATUS_COLORS, BOOL_FIELDS, DATE_FIELDS, MONEY_FIELDS) estão inline em VisualizadorTableBody. Extração facilita testes e reutilização em outros contextos.',
  },
  {
    id: 'c24-04', modulo: 'Cadastros', pilar: 'UX', prioridade: 'MÉDIO',
    titulo: 'Adicionar export CSV nativo na VisualizadorToolbar',
    status: 'concluido', impacto: 'Médio',
    descricao: 'Botão de export CSV sem lib externa (Blob + URL.createObjectURL) na toolbar. Exporta todos os itens da página atual com os campos das colunas configuradas. Respeita contexto multiempresa.',
  },
  {
    id: 'c24-05', modulo: 'Todos', pilar: 'Performance', prioridade: 'MÉDIO',
    titulo: 'Revisão geral de staleTime nas queries do Cadastros — ajuste para 60s',
    status: 'concluido', impacto: 'Médio',
    descricao: 'useVisualizadorQuery usa staleTime: 0 (sempre refetch). Ajustar para 60000ms reduz chamadas redundantes ao backend sem comprometer a atualidade dos dados para operações normais.',
  },
  {
    id: 'c24-06', modulo: 'Sistema', pilar: 'Governança', prioridade: 'BAIXO',
    titulo: 'Atualização do Plano de Melhorias — Ciclo 24 registrado, roadmap Q3 2027 atualizado',
    status: 'concluido', impacto: 'Baixo',
    descricao: 'ciclo24Items criado, PlanoMelhoria atualizado para refletir Ciclo 24 como ciclo atual. Roadmap Q3 2027 sincronizado com os itens planejados.',
  },
];