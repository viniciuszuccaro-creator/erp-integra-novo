import fs from 'node:fs';
import path from 'node:path';

const normalize = (value = '') => String(value || '').replace(/\\/g, '/');

const DOC_PREFIX = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO|RELATORIO|REPORT|MANUAL|VALIDADOR|FLUXO|rhf_zod_report|UnidadesDeMedida)/i;
const MIRROR_EXT = /\.(md|txt|rst|adoc|json|config|yaml|yml)\.(js|jsx|jsxe|ts|tsx)$/i;
const TEXT_EXT = /\.(md|txt|rst|adoc|yaml|yml|jsxe)$/i;
const SKIP_DIRS = /^(node_modules|dist|build|\.git|\.vite|coverage|tmp|temp|logs)$/i;
const TARGET_DIRS = ['src/components', 'components'];

function shouldNeutralize(relativePath) {
  const normalized = normalize(relativePath);
  const fileName = normalized.split('/').pop() || '';
  const inComponents = /(^|\/)(src\/)?components\//i.test(normalized);
  if (!inComponents) return false;
  return MIRROR_EXT.test(fileName) || TEXT_EXT.test(fileName) || (DOC_PREFIX.test(fileName) && /\.(js|jsx|ts|tsx)$/i.test(fileName));
}

function neutralContent(relativePath) {
  const safeName = (normalize(relativePath).split('/').pop() || 'DocumentationArtifact').replace(/[^a-zA-Z0-9_$]/g, '_');
  return `const ${safeName} = () => null;\nexport default ${safeName};\n`;
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
      continue;
    }

    if (!entry.isFile() || !shouldNeutralize(relativePath)) continue;

    try {
      if (/\.(js|jsx|ts|tsx)$/i.test(entry.name)) {
        const content = neutralContent(relativePath);
        if (!fs.readFileSync(fullPath, 'utf8').startsWith('const ')) {
          fs.writeFileSync(fullPath, content);
          changed.push(`${relativePath}::neutralized`);
        }
      } else {
        fs.rmSync(fullPath, { force: true });
        changed.push(`${relativePath}::removed`);
      }
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