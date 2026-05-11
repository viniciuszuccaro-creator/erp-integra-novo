import fs from 'node:fs';
import path from 'node:path';
import { runPrebuildIntegrityCheck } from './prebuildIntegrityCheck.js';
import { runStableEnvironmentCheck } from './stableEnvironmentCheck.js';
import { verifyChatbotComponents } from './verifyChatbotComponents.js';
import { forceProjectReindex } from './projectReindex.js';
import { purgeBuildCaches, purgeDocumentationArtifacts, purgeTemporaryLogs } from './purgeDocumentationArtifacts.js';
import { runStrictDuplicateArtifactGuard } from './strictDuplicateArtifactGuard.js';

const root = globalThis?.process?.cwd?.() || '.';
const normalize = (value = '') => String(value || '').replace(/\\/g, '/');
const blockedArtifactPattern = /(^|\/)(src\/)?components\/.*(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO|rhf_zod_report|UnidadesDeMedida).*\.(md|txt|rst|adoc|json|config|yaml|yml)?\.(js|jsx|jsxe|ts|tsx)$/i;
const blockedTextPattern = /(^|\/)(src\/)?components\/.*\.(md|txt|rst|adoc|json|config|yaml|yml|jsxe)$/i;

function removeBlockedArtifacts(dir, removed = []) {
  if (!fs.existsSync(dir)) return removed;
  let entries = [];
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return removed; }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = normalize(path.relative(root, fullPath));

    if (entry.isDirectory()) {
      if (/^(node_modules|dist|build|\.git|\.vite)$/.test(entry.name)) continue;
      removeBlockedArtifacts(fullPath, removed);
      try { if (fs.existsSync(fullPath) && fs.readdirSync(fullPath).length === 0) fs.rmdirSync(fullPath); } catch {}
      continue;
    }

    if (entry.isFile() && (blockedArtifactPattern.test(relativePath) || blockedTextPattern.test(relativePath))) {
      try {
        fs.rmSync(fullPath, { force: true });
        removed.push(relativePath);
      } catch {}
    }
  }

  return removed;
}

const strictGuard = runStrictDuplicateArtifactGuard(root);
const removedArtifacts = removeBlockedArtifacts(path.resolve(root, 'src'))
  .concat(removeBlockedArtifacts(path.resolve(root, 'components')));
const prebuild = runPrebuildIntegrityCheck(root);
const chatbot = verifyChatbotComponents(root);
const docs = purgeDocumentationArtifacts(root);
const logs = purgeTemporaryLogs(root);
const cache = purgeBuildCaches(root);
const reindex = forceProjectReindex(root);
const stable = runStableEnvironmentCheck(root);

const proof = {
  status: 'full_build_sanitized',
  timestamp: new Date().toISOString(),
  strictGuardStatus: strictGuard.status,
  strictGuardRemovedCount: strictGuard.removedCount,
  removedArtifacts,
  prebuildStatus: prebuild.status,
  chatbotStatus: chatbot.status,
  documentationArtifactsRemoved: docs.removedCount,
  temporaryLogsRemoved: logs.removedCount,
  buildCachesRemoved: cache.removed,
  reindexStatus: reindex.status,
  stableStatus: stable.status,
  mdJsxeBlocked: true,
  processEnvCentralized: true,
  documentationRecreationBlocked: true,
};

fs.writeFileSync(path.resolve(root, '.base44-full-build-sanitizer-proof.json'), JSON.stringify(proof, null, 2));
console.log('[Base44 Sanitizer] Ambiente sanitizado para build/lint.', proof);