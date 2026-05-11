import fs from 'node:fs';
import path from 'node:path';

export const BUILD_CACHE_DIRS = ['node_modules/.vite', 'node_modules/.cache', 'dist/.vite', '.vite', '.eslintcache', 'build/.vite'];

const COMPONENT_DOC_PREFIX = /^(README|CERTIFIC|CERTIFICADO|CERTIFICACAO|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|BOTOES|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|CORRECAO|rhf_zod_report|UnidadesDeMedida)/i;
const DOC_TEXT_OR_DATA = /\.(md|txt|rst|adoc|json|config)$/i;
const DOC_MIRROR = /\.(md|txt|rst|adoc|json|config)\.(js|jsx|ts|tsx)$/i;
const COMPONENTS_DIR = /(^|\/)src\/components\/|(^|\/)components\//i;

export function isBlockedDocumentationArtifact(filePath = '') {
  const normalized = String(filePath || '').replace(/\\/g, '/');
  const fileName = normalized.split('/').pop() || '';
  return COMPONENTS_DIR.test(normalized) && (
    DOC_TEXT_OR_DATA.test(fileName) ||
    DOC_MIRROR.test(fileName) ||
    COMPONENT_DOC_PREFIX.test(fileName)
  );
}

export function purgeBuildCaches(rootDir = '.') {
  BUILD_CACHE_DIRS.forEach((dir) => {
    try { fs.rmSync(path.resolve(rootDir, dir), { recursive: true, force: true }); } catch {}
  });
}

export function purgeDocumentationArtifacts(rootDir = '.') {
  const targets = [path.resolve(rootDir, 'src/components'), path.resolve(rootDir, 'components')];

  const walk = (dir) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const filePath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(filePath);
        try {
          if (fs.existsSync(filePath) && fs.readdirSync(filePath).length === 0) fs.rmdirSync(filePath);
        } catch {}
        continue;
      }
      if (entry.isFile() && isBlockedDocumentationArtifact(filePath)) {
        try { fs.rmSync(filePath, { force: true }); } catch {}
      }
    }
  };

  targets.forEach(walk);
  purgeBuildCaches(rootDir);
}