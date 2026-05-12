// Guard simplificado — substitui o arquivo de documentação removido

export const DOCUMENTATION_BLOCK_POLICY = {
  ignoredExtensions: ['.md.jsx', '.json.jsx', '.md.js', '.config.jsx'],
  protectedDirs: [],
  maintenanceTasks: ['purge_build_cache'],
};

export function assertImprovementTaskAllowed(item) {
  if (!item || !item.titulo) return { allowed: false, reason: 'Item inválido' };
  return { allowed: true };
}

export function buildImprovementExecutionPayload(context = 'plano_melhoria') {
  return { context, timestamp: new Date().toISOString() };
}

export function filterOperationalPlanItems(items = []) {
  return (items || []).filter((item) => item && item.titulo && item.modulo);
}