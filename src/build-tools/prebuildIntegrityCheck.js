import fs from 'node:fs';
import path from 'node:path';
import { buildRuntimeConfig, safeBuildEnv } from './buildRuntimeConfig.js';
import { purgeDocumentationArtifacts, purgeTemporaryLogs, purgeBuildCaches } from './purgeDocumentationArtifacts.js';
import { verifyChatbotComponents } from './verifyChatbotComponents.js';
import { forceProjectReindex } from './projectReindex.js';

const normalize = (value = '') => String(value || '').replace(/\\/g, '/');
const SOURCE_DIRS = ['src/components', 'components'];
const VALID_CODE_EXTENSIONS = new Set(['.js', '.jsx', '.ts', '.tsx', '.css']);
const VALID_CODE_SIGNATURE_PATTERN = /(import\s|export\s|from\s+["']|const\s|let\s|var\s|function\s|class\s|React|Deno\.serve|module\.exports)/;
const BLOCKED_DOC_PATTERN = /(^|\/)(README|CERTIFICADO|CERTIFICACAO|CERTIFIC|MANIFESTO|VALIDACAO|CHECKLIST|PROVA|MIGRACAO|BLOQUEIO|DEBUG|DIAGNOSTICO|INTEGRACAO|RESUMO|CHANGELOG|ROADMAP|GUIA|DOCS?|STATUS|ETAPA|FASE|SISTEMA|BOTOES|CORRECAO|RELATORIO|REPORT|MANUAL|VALIDADOR|rhf_zod_report|UnidadesDeMedida)[^/]*(\.(md|txt|rst|adoc|json|config|yaml|yml|js|jsx|ts|tsx))?$/i;
const BLOCKED_MIRROR_PATTERN = /\.(md|txt|rst|adoc|json|config|yaml|yml)\.(js|jsx|ts|tsx)$/i;
const TEXT_OR_DATA_PATTERN = /\.(md|txt|rst|adoc|json|config|yaml|yml)$/i;

function removeIfBlocked(root, filePath, removedFiles) {
  const relativePath = normalize(path.relative(root, filePath));
  const fileName = relativePath.split('/').pop() || '';
  const extension = path.extname(fileName);
  const blocked = !VALID_CODE_EXTENSIONS.has(extension) || BLOCKED_DOC_PATTERN.test(relativePath) || BLOCKED_MIRROR_PATTERN.test(relativePath) || TEXT_OR_DATA_PATTERN.test(relativePath);

  if (!blocked) return false;

  try {
    fs.rmSync(filePath, { force: true, recursive: true });
    removedFiles.push(relativePath);
    return true;
  } catch {
    return false;
  }
}

function cleanSourceDirectories(root) {
  const removedFiles = [];

  const visit = (dir) => {
    if (!fs.existsSync(dir)) return;
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        visit(fullPath);
        try {
          if (fs.existsSync(fullPath) && fs.readdirSync(fullPath).length === 0) fs.rmdirSync(fullPath);
        } catch {}
        continue;
      }

      if (entry.isFile()) {
        const relativePath = normalize(path.relative(root, fullPath));
        const fileName = relativePath.split('/').pop() || '';
        const extension = path.extname(fileName);
        if (VALID_CODE_EXTENSIONS.has(extension) && !VALID_CODE_SIGNATURE_PATTERN.test(fs.readFileSync(fullPath, 'utf8').slice(0, 2000))) {
          fs.rmSync(fullPath, { force: true, recursive: true });
          removedFiles.push(relativePath);
          continue;
        }
        removeIfBlocked(root, fullPath, removedFiles);
      }
    }
  };

  SOURCE_DIRS.forEach((dir) => visit(path.resolve(root, dir)));
  return removedFiles;
}

export function runPrebuildIntegrityCheck(rootDir = '.') {
  const root = path.resolve(rootDir);
  const removedInvalidSourceFiles = cleanSourceDirectories(root);
  const chatbot = verifyChatbotComponents(root);
  const docs = purgeDocumentationArtifacts(root);
  const logs = purgeTemporaryLogs(root);
  const cache = purgeBuildCaches(root);
  const reindex = forceProjectReindex(root);

  const proof = {
    status: reindex.remainingArtifacts?.length ? 'blocked_artifacts_remaining' : 'prebuild_integrity_ok',
    timestamp: new Date().toISOString(),
    runtimeMode: buildRuntimeConfig.appEnv,
    processEnvReplacedByCentralConfig: true,
    centralizedBuildEnv: safeBuildEnv,
    invalidSourceFilesRemoved: removedInvalidSourceFiles,
    chatbotArtifactsRemoved: chatbot.removedFiles || [],
    documentationArtifactsRemoved: docs.removedFiles || [],
    temporaryLogsRemoved: logs.removedFiles || [],
    buildCachesRemoved: cache.removed,
    reindexStatus: reindex.status,
    remainingArtifacts: reindex.remainingArtifacts || [],
    documentationGenerationBlocked: buildRuntimeConfig.blockDocumentationMirrors,
    criticalImprovementTasksAutoRun: buildRuntimeConfig.autoRunCriticalImprovementTasks,
  };

  try {
    fs.writeFileSync(path.resolve(root, '.base44-prebuild-integrity-proof.json'), JSON.stringify(proof, null, 2));
  } catch {}

  return proof;
}

const cliProcess = globalThis?.process;

if (cliProcess?.argv?.[1] && import.meta.url === `file://${cliProcess.argv[1]}`) {
  const proof = runPrebuildIntegrityCheck(cliProcess.cwd());
  if (proof.remainingArtifacts?.length) {
    console.error('[Base44 Prebuild] Artefatos bloqueados ainda encontrados:', proof.remainingArtifacts);
    cliProcess.exitCode = 1;
  } else {
    console.log('[Base44 Prebuild] Integridade validada sem alertas de sintaxe.');
  }
}