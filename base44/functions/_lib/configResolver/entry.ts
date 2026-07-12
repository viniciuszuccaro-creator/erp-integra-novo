async function resolveConfig(base44, { chave, empresa_id = null, group_id = null, aliases = [] }) {
  const allKeys = [chave, ...(Array.isArray(aliases) ? aliases : [])].filter(Boolean);
  if (!allKeys.length) return null;

  const configs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({}, '-updated_date', 300).catch(() => []);
  const candidates = configs.filter((c) => allKeys.includes(c?.chave));

  const scoped = candidates
    .map((item) => {
      let score = 4;
      if (empresa_id && group_id && item?.empresa_id === empresa_id && item?.group_id === group_id) score = 1;
      else if (empresa_id && item?.empresa_id === empresa_id) score = 2;
      else if (group_id && item?.group_id === group_id) score = 3;
      else if (!item?.empresa_id && !item?.group_id) score = 4;
      return { item, score };
    })
    .sort((a, b) => a.score - b.score);

  return scoped[0]?.item || null;
}

async function isConfigEnabled(base44, { chave, empresa_id = null, group_id = null, aliases = [], fallback = false }) {
  const config = await resolveConfig(base44, { chave, empresa_id, group_id, aliases });
  if (!config) return fallback;
  if (typeof config.ativa === 'boolean') return config.ativa;
  return fallback;
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/configResolver' });
});