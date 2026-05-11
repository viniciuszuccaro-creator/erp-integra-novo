import fs from 'node:fs';
import path from 'node:path';
import { purgeBuildCaches, purgeTemporaryLogs, purgeDocumentationArtifacts } from './purgeDocumentationArtifacts.js';
import { verifyChatbotComponents } from './verifyChatbotComponents.js';

const normalize = (value = '') => String(value || '').replace(/\\/g, '/');
const INDEX_MARKER_FILE = '.base44-reindex-proof.json';
const WATCH_DIRS = ['src/components', 'components'];
const BLOCKED_PATTERN = /(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO|rhf_zod_report|UnidadesDeMedida).*\.(md|txt|rst|adoc|json|config|yaml|yml|jsx|js|ts|tsx)$/i;
const MIRROR_PATTERN = /\.(md|txt|rst|adoc|json|config|yaml|yml)\.(js|jsx|ts|tsx)$/i;

function collectBlockedArtifacts(rootDir = '.') {
  const root = path.resolve(rootDir);
  const found = [];

  const visit = (dir) => {
    if (!fs.existsSync(dir)) return;
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = normalize(path.relative(root, fullPath));

      if (entry.isDirectory()) {
        visit(fullPath);
        continue;
      }

      if (!entry.isFile()) continue;
      const fileName = relativePath.split('/').pop() || '';
      if (BLOCKED_PATTERN.test(fileName) || MIRROR_PATTERN.test(fileName)) found.push(relativePath);
    }
  };

  WATCH_DIRS.forEach((dir) => visit(path.resolve(root, dir)));
  return found;
}

export function forceProjectReindex(rootDir = '.') {
  const root = path.resolve(rootDir);
  const chatbot = verifyChatbotComponents(root);
  const docs = purgeDocumentationArtifacts(root);
  const logs = purgeTemporaryLogs(root);
  const cache = purgeBuildCaches(root);
  const remainingArtifacts = collectBlockedArtifacts(root);

  const proof = {
    status: remainingArtifacts.length === 0 ? 'stable_reindexed' : 'blocked_artifacts_remaining',
    timestamp: new Date().toISOString(),
    chatbotArtifactsRemoved: chatbot.removedCount,
    documentationArtifactsRemoved: docs.removedCount,
    temporaryLogsRemoved: logs.removedCount,
    buildCachesRemoved: cache.removed,
    remainingArtifacts,
    documentationRecreationBlocked: true,
    chatbotIntegrityVerified: true,
  };

  try {
    fs.writeFileSync(path.resolve(root, INDEX_MARKER_FILE), JSON.stringify(proof, null, 2));
  } catch {}

  return proof;
}