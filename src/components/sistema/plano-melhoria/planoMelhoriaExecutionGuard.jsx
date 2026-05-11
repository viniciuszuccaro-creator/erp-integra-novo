export const DOCUMENTATION_ARTIFACT_PATTERNS = [
  /(^|\/)(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA)[^/]*(\.(md|txt|rst|adoc|json|config|jsx|js|ts|tsx))?$/i,
  /\.(md|txt|rst|adoc|json|config)\.(js|jsx|ts|tsx)$/i,
  /\.(md|txt|rst|adoc)$/i,
  /(^|\/)components\/.*\.(md|txt|rst|adoc|json|config)\.jsx$/i,
  /rhf_zod_report/i,
  /UnidadesDeMedida/i,
];

export const DOCUMENTATION_BLOCK_POLICY = Object.freeze({
  autoRunCriticalTasks: true,
  ignoreDocumentationDuringExecution: true,
  blockDocumentationGenerationInComponents: true,
  purgeBuildCacheBeforeExecution: true,
  ignoredExtensions: ['.md', '.txt', '.rst', '.adoc', '.json', '.config', '.md.jsx', '.txt.jsx', '.rst.jsx', '.adoc.jsx', '.json.jsx', '.config.jsx'],
});

export const isDocumentationArtifact = (value = '') => {
  const normalized = String(value || '').replace(/\\/g, '/');
  return DOCUMENTATION_ARTIFACT_PATTERNS.some((pattern) => pattern.test(normalized));
};

export const isExecutableImprovementItem = (item = {}) => (
  ![item.titulo, item.descricao, item.modulo, item.file_path, item.path, item.functionName]
    .some((value) => isDocumentationArtifact(value))
);

export const filterOperationalPlanItems = (items = []) => items.filter(isExecutableImprovementItem);

export const buildImprovementExecutionPayload = (origem) => ({
  origem,
  modo_execucao: 'automatico_critico',
  ignorar_documentacao: true,
  bloqueio_artefatos_documentacao: true,
  bloquear_geracao_documentacao_componentes: true,
  limpar_cache_build: true,
  extensoes_ignoradas: DOCUMENTATION_BLOCK_POLICY.ignoredExtensions,
});