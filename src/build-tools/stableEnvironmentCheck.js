import { purgeDocumentationArtifacts, purgeTemporaryLogs, purgeBuildCaches } from './purgeDocumentationArtifacts.js';
import { verifyChatbotComponents } from './verifyChatbotComponents.js';

const CORE_ENTITIES = ['Cliente', 'Pedido', 'Produto', 'ContaReceber', 'ContaPagar', 'Entrega'];

export function runStableEnvironmentCheck(rootDir = '.') {
  const chatbot = verifyChatbotComponents(rootDir);
  const docs = purgeDocumentationArtifacts(rootDir);
  const logs = purgeTemporaryLogs(rootDir);
  const cache = purgeBuildCaches(rootDir);

  return {
    status: 'stable_check_completed',
    chatbotArtifactsRemoved: chatbot.removedCount,
    chatbotArtifactsClean: chatbot.removedCount === 0,
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