export const DOCUMENTATION_FILE_NAME_PATTERN = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO|rhf_zod_report|UnidadesDeMedida)[^/]*(\.(md|txt|rst|adoc|json|config|js|jsx|ts|tsx))?$/i;
export const DOCUMENTATION_MIRROR_PATTERN = /\.(md|txt|rst|adoc|json|config)\.(js|jsx|ts|tsx)$/i;
export const DOCUMENTATION_TEXT_OR_DATA_PATTERN = /\.(md|txt|rst|adoc|json|config)$/i;
export const TEXT_DOCUMENTATION_PATTERN = /\.(md|txt|rst|adoc)$/i;
export const COMPONENTS_DIRECTORY_PATTERN = /(^|\/)src\/components\/|(^|\/)components\//i;
export const BUILD_CACHE_DIRS = ['node_modules/.vite', 'node_modules/.cache', 'dist/.vite', '.vite', '.eslintcache', 'build/.vite'];

export function isDocumentationArtifactPath(value = '') {
  const normalized = String(value || '').replace(/\\/g, '/');
  const fileName = normalized.split('/').pop() || '';
  return (
    TEXT_DOCUMENTATION_PATTERN.test(fileName) ||
    DOCUMENTATION_TEXT_OR_DATA_PATTERN.test(fileName) ||
    DOCUMENTATION_MIRROR_PATTERN.test(fileName) ||
    DOCUMENTATION_FILE_NAME_PATTERN.test(fileName)
  );
}

export function shouldBlockComponentDocumentationPath(value = '') {
  const normalized = String(value || '').replace(/\\/g, '/');
  return COMPONENTS_DIRECTORY_PATTERN.test(normalized) && isDocumentationArtifactPath(normalized);
}

export const DOCUMENTATION_BLOCK_POLICY = Object.freeze({
  strictMode: true,
  ignoredDuringImprovementPlan: true,
  autoRunCriticalTasksOnly: true,
  blockComponentDocumentationGeneration: true,
  blockDocumentationMirrors: true,
  purgeBuildCache: true,
  purgeTemporaryLogs: true,
  runStableEnvironmentCheck: true,
  protectedDirectories: ['src/components', 'components'],
  ignoredExtensions: ['.md', '.txt', '.rst', '.adoc', '.json', '.config', '.jsx', '.md.jsx', '.txt.jsx', '.rst.jsx', '.adoc.jsx', '.json.jsx', '.config.jsx', '.md.js', '.json.js', '.config.js'],
  buildCacheDirs: BUILD_CACHE_DIRS,
});