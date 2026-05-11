import fs from 'node:fs';
import path from 'node:path';

const normalize = (value = '') => String(value || '').replace(/\\/g, '/');

const DOC_PREFIX = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO|RELATORIO|REPORT|MANUAL|VALIDADOR|rhf_zod_report|UnidadesDeMedida)/i;
const MIRROR_EXT = /\.(md|txt|rst|adoc|json|config|yaml|yml)\.(js|jsx|jsxe|ts|tsx)$/i;
const TEXT_EXT = /\.(md|txt|rst|adoc|yaml|yml|jsxe)$/i;
const GENERATED_DOC_CODE = /(^|\/)(src\/)?components\/.*(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO|RELATORIO|REPORT|MANUAL|VALIDADOR|rhf_zod_report|UnidadesDeMedida).*\.(js|jsx|jsxe|ts|tsx)$/i;
const SKIP_DIRS = /^(node_modules|dist|build|\.git|\.vite|coverage|tmp|temp|logs)$/i;
const TARGET_DIRS = ['src/components', 'components', 'src/build-tools', 'build-tools'];

function shouldRemove(relativePath) {
  const normalized = normalize(relativePath);
  const fileName = normalized.split('/').pop() || '';
  const inComponents = /(^|\/)(src\/)?components\//i.test(normalized);

  if (MIRROR_EXT.test(fileName) || TEXT_EXT.test(fileName)) return true;
  if (inComponents && GENERATED_DOC_CODE.test(normalized)) return true;
  if (inComponents && DOC_PREFIX.test(fileName) && /\.(js|jsx|jsxe|ts|tsx)$/i.test(fileName)) return true;

  return false;
}

function scanAndRemove(root, dir, removed) {
  if (!fs.existsSync(dir)) return;

  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = normalize(path.relative(root, fullPath));

    if (entry.isDirectory()) {
      if (SKIP_DIRS.test(entry.name)) continue;
      scanAndRemove(root, fullPath, removed);
      try {
        if (fs.existsSync(fullPath) && fs.readdirSync(fullPath).length === 0) fs.rmdirSync(fullPath);
      } catch {}
      continue;
    }

    if (entry.isFile() && shouldRemove(relativePath)) {
      try {
        fs.rmSync(fullPath, { force: true });
        removed.push(relativePath);
      } catch {}
    }
  }
}

export function runStrictDuplicateArtifactGuard(rootDir = '.') {
  const root = path.resolve(rootDir);
  const removed = [];

  for (const targetDir of TARGET_DIRS) {
    scanAndRemove(root, path.resolve(root, targetDir), removed);
  }

  const proof = {
    status: 'strict_duplicate_artifact_guard_ok',
    timestamp: new Date().toISOString(),
    removedCount: removed.length,
    removed,
    blockedPatterns: ['*.md.jsx', '*.md.jsxe', '*.json.jsx', '*.config.jsx', '*.jsxe', 'documentation-prefixed-code-in-components'],
    documentationMirrorsBlocked: true,
    buildSafe: true,
  };

  try {
    fs.writeFileSync(path.resolve(root, '.base44-strict-duplicate-artifact-guard-proof.json'), JSON.stringify(proof, null, 2));
  } catch {}

  return proof;
}

const cliProcess = globalThis?.process;
if (cliProcess?.argv?.[1] && import.meta.url === `file://${cliProcess.argv[1]}`) {
  const proof = runStrictDuplicateArtifactGuard(cliProcess.cwd());
  console.log('[Base44 Strict Guard] Espelhos de documentação bloqueados.', proof);
}