export const DOCUMENTATION_ARTIFACT_PATTERNS = [
  /(^|\/)(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO)[^/]*(\.(md|txt|rst|adoc|json|config|jsx|js|ts|tsx))?$/i,
  /\.(md|txt|rst|adoc|json|config)\.(js|jsx|ts|tsx)$/i,
  /\.(md|txt|rst|adoc)$/i,
  /(^|\/)components\/.*\.(md|txt|rst|adoc|json|config)\.jsx$/i,
  /rhf_zod_report/i,
  /UnidadesDeMedida/i,
];

export const DOCUMENTATION_BLOCK_POLICY = Object.freeze({
  autoRunCriticalTasks: true,
  strictMode: true,
  ignoreDocumentationDuringExecution: true,
  blockDocumentationGenerationInComponents: true,
  purgeBuildCacheBeforeExecution: true,
  protectedDirectories: ['components', 'src/components'],
  ignoredExtensions: ['.md', '.txt', '.rst', '.adoc', '.json', '.config', '.md.jsx', '.txt.jsx', '.rst.jsx', '.adoc.jsx', '.json.jsx', '.config.jsx', '.md.js', '.json.js', '.config.js'],
  blockedPrefixes: ['README', 'CERTIFICADO', 'CERTIFICACAO', 'CERTIFIC', 'MANIFESTO', 'VALIDACAO', 'CHECKLIST', 'PROVA', 'MIGRACAO', 'BLOQUEIO', 'DEBUG', 'DIAGNOSTICO', 'INTEGRACAO', 'RESUMO', 'CHANGELOG', 'ROADMAP', 'GUIA', 'STATUS', 'ETAPA', 'FASE', 'SISTEMA', 'BOTOES', 'CORRECAO'],
  blockedAction: 'ignore_purge_and_never_generate',
});

export const isDocumentationArtifact = (value = '') => {
  const normalized = String(value || '').replace(/\\/g, '/');
  return DOCUMENTATION_ARTIFACT_PATTERNS.some((pattern) => pattern.test(normalized));
};

export const isExecutableImprovementItem = (item = {}) => (
  item.tipo_tarefa !== 'documentacao' &&
  item.tipo !== 'Documentação' &&
  ![item.titulo, item.descricao, item.modulo, item.file_path, item.path, item.functionName, item.output_path]
    .some((value) => isDocumentationArtifact(value))
);

export const filterOperationalPlanItems = (items = []) => items.filter(isExecutableImprovementItem);

export const assertImprovementTaskAllowed = (item = {}) => {
  if (!isExecutableImprovementItem(item)) {
    return { allowed: false, reason: 'Tarefa de documentação bloqueada pela política estrita do Plano de Melhoria.' };
  }
  return { allowed: true, reason: 'Tarefa operacional autorizada.' };
};

export const buildImprovementExecutionPayload = (origem) => ({
  origem,
  modo_execucao: 'automatico_critico',
  ignorar_documentacao: true,
  bloqueio_artefatos_documentacao: true,
  bloquear_geracao_documentacao_componentes: true,
  limpar_cache_build: true,
  modo_estrito_documentacao: DOCUMENTATION_BLOCK_POLICY.strictMode,
  bloquear_componentes_documentacao: DOCUMENTATION_BLOCK_POLICY.protectedDirectories,
  acao_bloqueio_documentacao: DOCUMENTATION_BLOCK_POLICY.blockedAction,
  prefixos_bloqueados: DOCUMENTATION_BLOCK_POLICY.blockedPrefixes,
  extensoes_ignoradas: DOCUMENTATION_BLOCK_POLICY.ignoredExtensions,
  permitir_criacao_documentacao_componentes: false,
});