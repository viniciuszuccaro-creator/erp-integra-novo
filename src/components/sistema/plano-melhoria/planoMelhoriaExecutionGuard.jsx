export const DOCUMENTATION_ARTIFACT_PATTERNS = [
  /(^|\/)(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?)[^/]*(\.(md|txt|rst|adoc|json|config|jsx|js|ts|tsx))?$/i,
  /\.(md|txt|rst|adoc|json|config)\.(js|jsx|ts|tsx)$/i,
  /\.(md|txt|rst|adoc)$/i,
  /rhf_zod_report/i,
  /UnidadesDeMedida/i,
];

export const isDocumentationArtifact = (value = '') => {
  const normalized = String(value || '').replace(/\\/g, '/');
  return DOCUMENTATION_ARTIFACT_PATTERNS.some((pattern) => pattern.test(normalized));
};

export const filterOperationalPlanItems = (items = []) => (
  items.filter((item) => !isDocumentationArtifact(item?.titulo) && !isDocumentationArtifact(item?.descricao))
);

export const buildImprovementExecutionPayload = (origem) => ({
  origem,
  modo_execucao: 'automatico_critico',
  ignorar_documentacao: true,
  bloqueio_artefatos_documentacao: true,
  extensoes_ignoradas: ['.md', '.txt', '.rst', '.adoc', '.json', '.config', '.md.jsx', '.json.jsx', '.config.jsx'],
});