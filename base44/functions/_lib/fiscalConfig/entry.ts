async function getFiscalConfig(base44, empresaId) {
  const cfgs = await base44.asServiceRole.entities.ConfigFiscalEmpresa.filter({ empresa_id: empresaId });
  const config = cfgs?.[0] || null;
  const integracao = config?.integracao_nfe || null;
  return { config, integracao };
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/fiscalConfig' });
});