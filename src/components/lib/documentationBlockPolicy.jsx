export const DOCUMENTATION_FILE_NAME_PATTERN = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO|rhf_zod_report|UnidadesDeMedida)[^/]*(\.(md|txt|rst|adoc|json|config|js|jsx|ts|tsx))?$/i;
export const DOCUMENTATION_MIRROR_PATTERN = /\.(md|txt|rst|adoc|json|config)\.(js|jsx|ts|tsx)$/i;
export const TEXT_DOCUMENTATION_PATTERN = /\.(md|txt|rst|adoc)$/i;

export function isDocumentationArtifactPath(value = '') {
  const normalized = String(value || '').replace(/\\/g, '/');
  const fileName = normalized.split('/').pop() || '';
  return (
    TEXT_DOCUMENTATION_PATTERN.test(fileName) ||
    DOCUMENTATION_MIRROR_PATTERN.test(fileName) ||
    DOCUMENTATION_FILE_NAME_PATTERN.test(fileName)
  );
}

export const DOCUMENTATION_BLOCK_POLICY = Object.freeze({
  strictMode: true,
  ignoredDuringImprovementPlan: true,
  blockComponentDocumentationGeneration: true,
  purgeBuildCache: true,
  protectedDirectories: ['src/components', 'components'],
});