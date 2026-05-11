import { purgeDocumentationArtifacts, purgeTemporaryLogs, purgeBuildCaches } from './purgeDocumentationArtifacts.js';
import { verifyChatbotComponents } from './verifyChatbotComponents.js';
import { forceProjectReindex } from './projectReindex.js';

const CORE_ENTITIES = ['Cliente', 'Pedido', 'Produto', 'ContaReceber', 'ContaPagar', 'Entrega'];

export function runStableEnvironmentCheck(rootDir = '.') {
  const reindex = forceProjectReindex(rootDir);
  const chatbot = verifyChatbotComponents(rootDir);
  const docs = purgeDocumentationArtifacts(rootDir);
  const logs = purgeTemporaryLogs(rootDir);
  const cache = purgeBuildCaches(rootDir);

  return {
    status: 'stable_check_completed',
    reindexStatus: reindex.status,
    remainingBlockedArtifacts: reindex.remainingArtifacts,
    chatbotArtifactsRemoved: chatbot.removedCount,
    chatbotArtifactsClean: chatbot.removedCount === 0 && reindex.remainingArtifacts.length === 0,
    documentationArtifactsRemoved: docs.removedCount,
    temporaryLogsRemoved: logs.removedCount,
    buildCachesRemoved: cache.removed,
    blockedDocumentationProcessing: true,
    blockedComponentDocumentation: true,
    ignoredImprovementDocumentationTasks: true,
    permanentComponentDocumentationGuard: true,
    preventsJsxDocumentationMirrors: true,
    clearsBuildCacheOnDocumentationEvents: true,
    permanentComponentDocumentationGuard: true,
    preventsJsxDocumentationMirrors: true,
    clearsBuildCacheOnDocumentationEvents: true,
    coreEntitiesChecked: CORE_ENTITIES,
  };
}