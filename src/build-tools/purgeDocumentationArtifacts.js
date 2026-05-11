import fs from 'node:fs';
import path from 'node:path';

export const DOCUMENTATION_PREFIX_PATTERN = /^(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO|rhf_zod_report|UnidadesDeMedida)/i;
export const DOCUMENTATION_EXTENSION_PATTERN = /\.(md|txt|rst|adoc|json|config)(\.(js|jsx|ts|tsx))?$/i;
export const DOCUMENTATION_MIRROR_PATTERN = /\.(md|txt|rst|adoc|json|config)\.(js|jsx|ts|tsx)$/i;
export const BUILD_CACHE_DIRS = ['node_modules/.vite', 'node_modules/.cache', 'dist/.vite', '.vite', '.eslintcache', 'build/.vite'];
export const PROTECTED_DOC_DIR_PATTERN = /(^|\/)(src\/components|components)(\/|$)/i;

const normalize = (value = '') => String(value || '').replace(/\\/g, '/');

export function isBlockedDocumentationArtifact(filePath = '') {
  const normalized = normalize(filePath);
  const fileName = normalized.split('/').pop() || '';
  const inProtectedDir = PROTECTED_DOC_DIR_PATTERN.test(normalized);

  return inProtectedDir && (
    DOCUMENTATION_PREFIX_PATTERN.test(fileName) ||
    DOCUMENTATION_EXTENSION_PATTERN.test(fileName) ||
    DOCUMENTATION_MIRROR_PATTERN.test(fileName)
  );
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

  return { removed };
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
          removedFiles.push(relativePath);
        } catch {}
      }
    }
  };

  visit(root);
  const cache = purgeBuildCaches(root);

  return {
    removedCount: removedFiles.length,
    removedFiles,
    cacheRemovedCount: cache.removed,
  };
}