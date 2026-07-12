export function ensureEventType(event, expectedType) {
  return event?.type === expectedType;
}

export function resolveEntityIdFromPayload(payload, keys = []) {
  if (!payload || typeof payload !== 'object') return null;
  for (const k of keys) {
    const v = payload?.[k];
    if (typeof v === 'string' && v) return v;
  }
  const data = payload?.data;
  const event = payload?.event;
  return data?.id || event?.entity_id || null;
}

function isApprovedStatus(data, field = 'status', approved = 'Aprovado') {
  if (!data) return true;
  const s = data?.[field];
  return !s || s === approved;
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/validationUtils' });
});