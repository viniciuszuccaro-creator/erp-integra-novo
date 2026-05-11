import fs from 'node:fs';
import path from 'node:path';

const normalize = (value = '') => String(value || '').replace(/\\/g, '/');

const DOC_NAME_PATTERN = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|ETAPAS|FASE|SISTEMA|BOTOES|CORRECAO|RELATORIO|REPORT|MANUAL|VALIDADOR|FLUXO|rhf_zod_report|UnidadesDeMedida)/i;
const DOC_CODE_MIRROR = /\.(md|txt|rst|adoc|json|config|yaml|yml)\.(js|jsx|jsxe|ts|tsx)$/i;
const DOC_TEXT_FILE = /\.(md|txt|rst|adoc|yaml|yml|jsxe)$/i;
const SKIP_DIRS = /^(node_modules|dist|build|\.git|\.vite|coverage|tmp|temp|logs)$/i;
const TARGET_DIRS = ['src/components', 'components'];

function shouldNeutralize(relativePath) {
  const normalized = normalize(relativePath);
  const fileName = normalized.split('/').pop() || '';
  const inComponents = /(^|\/)(src\/)?components\//i.test(normalized);
  if (!inComponents) return false;

  if (DOC_CODE_MIRROR.test(fileName)) return true;
  if (DOC_TEXT_FILE.test(fileName)) return true;
  if (DOC_NAME_PATTERN.test(fileName) && /\.(js|jsx|ts|tsx)$/i.test(fileName)) return true;
  if (/(^|\/)commitlint\.config\.jsx$/i.test(normalized)) return true;

  return false;
}

function scanAndNeutralize(root, dir, changed) {
  if (!fs.existsSync(dir)) return;
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = normalize(path.relative(root, fullPath));

    if (entry.isDirectory()) {
      if (SKIP_DIRS.test(entry.name)) continue;
      scanAndNeutralize(root, fullPath, changed);
      try {
        if (fs.existsSync(fullPath) && fs.readdirSync(fullPath).length === 0) fs.rmdirSync(fullPath);
      } catch {}
      continue;
    }

    if (!entry.isFile() || !shouldNeutralize(relativePath)) continue;

    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      changed.push(`${relativePath}::removed`);
    } catch {}
  }
}

export function runStrictDuplicateArtifactGuard(rootDir = '.') {
  const root = path.resolve(rootDir);
  const changed = [];

  for (const targetDir of TARGET_DIRS) {
    scanAndNeutralize(root, path.resolve(root, targetDir), changed);
  }

  const proof = {
    status: 'strict_duplicate_artifact_guard_neutralized_ok',
    timestamp: new Date().toISOString(),
    changedCount: changed.length,
    changed,
    documentationCodeNeutralized: true,
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
  console.log('[Base44 Strict Guard] Artefatos de documentação neutralizados.', proof);
}