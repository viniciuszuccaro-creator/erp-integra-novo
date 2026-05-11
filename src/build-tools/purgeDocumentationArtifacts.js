import fs from 'node:fs';
import path from 'node:path';

export const DOCUMENTATION_PREFIX_PATTERN = /^(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPAS|ETAPA|FASES|FASE|SISTEMA|BOTOES|CORRECAO|RELATORIO|REPORT|MANUAL|VALIDADOR|FLUXO|ZINDEX|rhf_zod_report|UnidadesDeMedida)/i;
export const DOCUMENTATION_EXTENSION_PATTERN = /\.(md|txt|rst|adoc|json|config|yaml|yml)\.(js|jsx|jsxe|ts|tsx)$/i;
export const DOCUMENTATION_MIRROR_PATTERN = /\.(md|txt|rst|adoc|json|config|yaml|yml)\.(js|jsx|jsxe|ts|tsx)$/i;
export const VALID_COMPONENT_CODE_PATTERN = /\.(js|jsx|ts|tsx|css)$/i;
export const BUILD_CACHE_DIRS = ['node_modules/.vite', 'node_modules/.cache', 'dist/.vite', 'dist', '.vite', '.eslintcache', 'build/.vite', 'build'];
export const TEMP_LOG_DIRS = ['tmp', 'temp', '.tmp', 'logs', 'coverage', 'dist/.cache', 'build/.cache', '.turbo', '.parcel-cache'];
export const TEMP_LOG_FILE_PATTERN = /\.(log|tmp|temp|cache|bak|old|orig)$/i;
export const PROTECTED_DOC_DIR_PATTERN = /(^|\/)(src\/components|components)(\/|$)/i;
export const CHATBOT_DIR_PATTERN = /(^|\/)(src\/)?components\/chatbot\//i;
export const VALID_REACT_CODE_PATTERN = /\.(jsx|js|tsx|ts)$/i;

const normalize = (value = '') => String(value || '').replace(/\\/g, '/');

export function isBlockedDocumentationArtifact(filePath = '') {
  const normalized = normalize(filePath);
  const fileName = normalized.split('/').pop() || '';
  const inProtectedDir = PROTECTED_DOC_DIR_PATTERN.test(normalized);
  const inChatbotDir = CHATBOT_DIR_PATTERN.test(normalized);

  if (!inProtectedDir) return false;

  if (DOCUMENTATION_MIRROR_PATTERN.test(fileName)) return true;
  if (/\.jsxe$/i.test(fileName)) return true;
  if (!path.extname(fileName) && DOCUMENTATION_PREFIX_PATTERN.test(fileName)) return true;
  if (VALID_COMPONENT_CODE_PATTERN.test(fileName) && DOCUMENTATION_PREFIX_PATTERN.test(fileName)) return true;

  return DOCUMENTATION_EXTENSION_PATTERN.test(fileName);
}

const removePath = (targetPath) => {
  try {
    if (!fs.existsSync(targetPath)) return false;
    fs.rmSync(targetPath, { recursive: true, force: true });
    return true;
  } catch {
    return false;
  }
};

export function purgeBuildCaches(rootDir = '.') {
  const root = path.resolve(rootDir);
  let removed = 0;

  for (const cacheDir of BUILD_CACHE_DIRS) {
    if (removePath(path.resolve(root, cacheDir))) removed += 1;
  }

  for (const tempDir of TEMP_LOG_DIRS) {
    if (removePath(path.resolve(root, tempDir))) removed += 1;
  }

  return { removed };
}

export function purgeTemporaryLogs(rootDir = '.') {
  const root = path.resolve(rootDir);
  const removedFiles = [];

  const visit = (dir) => {
    if (!fs.existsSync(dir)) return;
    let entries = [];

    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = normalize(path.relative(root, fullPath));

      if (entry.isDirectory()) {
        if (/^(node_modules|dist|build|\.git|\.vite)$/.test(entry.name)) continue;
        visit(fullPath);
        continue;
      }

      if (entry.isFile() && TEMP_LOG_FILE_PATTERN.test(entry.name)) {
        try {
          fs.unlinkSync(fullPath);
          removedFiles.push(`${relativePath}::removed-temporary-file`);
        } catch {}
      }
    }
  };

  visit(root);
  return { removedCount: removedFiles.length, removedFiles };
}

export function purgeDocumentationArtifacts(rootDir = '.') {
  const root = path.resolve(rootDir);
  const removedFiles = [];

  const visit = (dir) => {
    if (!fs.existsSync(dir)) return;
    let entries = [];

    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = normalize(path.relative(root, fullPath));

      if (entry.isDirectory()) {
        if (/^(node_modules|dist|build|\.git|\.vite)$/.test(entry.name)) continue;
        visit(fullPath);
        try {
          if (fs.existsSync(fullPath) && fs.readdirSync(fullPath).length === 0) fs.rmdirSync(fullPath);
        } catch {}
        continue;
      }

      if (entry.isFile() && isBlockedDocumentationArtifact(relativePath)) {
        try {
          fs.unlinkSync(fullPath);
          removedFiles.push(`${relativePath}::removed-invalid-documentation-artifact`);
        } catch {}
      }
    }
  };

  visit(root);
  const cache = purgeBuildCaches(root);
  const temp = purgeTemporaryLogs(root);

  return {
    removedCount: removedFiles.length,
    removedFiles,
    cacheRemovedCount: cache.removed,
    tempLogRemovedCount: temp.removedCount,
    tempLogRemovedFiles: temp.removedFiles,
  };
}