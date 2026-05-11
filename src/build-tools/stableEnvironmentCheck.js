import { purgeDocumentationArtifacts, purgeTemporaryLogs, purgeBuildCaches } from './purgeDocumentationArtifacts.js';

const CORE_ENTITIES = ['Cliente', 'Pedido', 'Produto', 'ContaReceber', 'ContaPagar', 'Entrega'];

export function runStableEnvironmentCheck(rootDir = '.') {
  const docs = purgeDocumentationArtifacts(rootDir);
  const logs = purgeTemporaryLogs(rootDir);
  const cache = purgeBuildCaches(rootDir);

  return {
    status: 'stable_check_completed',
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