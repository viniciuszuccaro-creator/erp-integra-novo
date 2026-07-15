import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { z } from 'npm:zod@3.24.2';

// syncGroupCompany — sincronização bidirecional em tempo real via entity automation
// Disparada quando um registro é criado/atualizado/deletado em qualquer entidade rastreada.
// Anti-loop: janela de 2.5s por registro no SyncMap.

function pickAllowed(entityName, data) {
  const clone = { ...data };
  delete clone.id; delete clone.created_date; delete clone.updated_date; delete clone.created_by;
  // NF-e nunca é espelhada entre escopos (política separada em nfeActions)
  if (entityName === 'NotaFiscal') return null;
  return clone;
}

async function listEmpresasByGroup(base44, groupId) {
  try {
    const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: groupId }, undefined, 500);
    if (Array.isArray(empresas) && empresas.length) return empresas;
  } catch (_) { console.error('[syncGroupCompany] catch:', _); }
  return [];
}

function nowIso() { return new Date().toISOString(); }

async function doWithRetry(fn, tries = 3, delayMs = 300) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try { return await fn(); } catch (e) {
      lastErr = e;
      if (i < tries - 1) await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const raw = await req.json().catch(() => ({}));
    const EventSchema = z.object({
      event: z.object({
        entity_name: z.string(),
        type: z.enum(['create', 'update', 'delete']),
        entity_id: z.string()
      }),
      data: z.record(z.any()).optional(),
      old_data: z.record(z.any()).optional(),
      payload_too_large: z.boolean().optional()
    }).passthrough();

    const parsed = EventSchema.safeParse(raw);
    if (!parsed.success) {
      return Response.json({ error: 'Evento inválido', issues: parsed.error.issues }, { status: 400 });
    }
    const body = parsed.data;
    const event = body?.event || {};
    const entityName = event?.entity_name;
    const eventType = event?.type;
    const entityId = event?.entity_id;

    if (!entityName || !eventType || !entityId) {
      return Response.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // NF-e: nunca sincronizar automaticamente
    if (entityName === 'NotaFiscal') {
      return Response.json({ ok: true, skipped: 'NotaFiscal' });
    }

    // Entidades que NÃO devem ser espelhadas automaticamente (operacionais/transacionais que têm lógica própria)
    const SKIP_ENTITIES = new Set([
      'AuditLog', 'SyncMap', 'SessaoUsuario', 'TokenRefresh', 'Ponto', 'ApontamentoProducao',
      'BackupAutomatico', 'LogPerformance', 'AlertaPerformance', 'LogFiscal', 'LogCobranca',
      'ChatbotInteracao', 'MensagemOmnicanal', 'ConversaOmnicanal', 'ArquivoRemessaRetorno',
    ]);
    if (SKIP_ENTITIES.has(entityName)) {
      return Response.json({ ok: true, skipped: 'skip-list' });
    }

    let record = body?.data;
    if (!record && eventType !== 'delete') {
      try {
        record = await base44.asServiceRole.entities[entityName]?.get?.(entityId);
      } catch (_) { console.error('[syncGroupCompany] catch:', _); }
    }

    const groupId = record?.group_id || body?.data?.group_id || body?.old_data?.group_id || null;
    const empresaId = record?.empresa_id || body?.data?.empresa_id || null;

    // Anti-loop: verifica SyncMap para evitar propagação circular
    const existingMaps = await base44.asServiceRole.entities.SyncMap.filter({ entity_name: entityName }).catch(() => []);
    const mapsById = (existingMaps || []).filter(m => m.source_id === entityId || m.target_id === entityId);
    const recentSync = mapsById.find(m => {
      const t = new Date(m.last_sync_at || 0).getTime();
      return Date.now() - t < 2500; // 2.5s janela anti-loop
    });
    if (recentSync) {
      return Response.json({ ok: true, ignored: 'recent-sync' });
    }

    // DELETE: remover espelhos
    if (eventType === 'delete') {
      for (const m of mapsById) {
        const counterpartId = (m.source_id === entityId) ? m.target_id : m.source_id;
        try { await base44.asServiceRole.entities[entityName]?.delete?.(counterpartId); } catch (_) { console.error('[syncGroupCompany] catch:', _); }
        try { await base44.asServiceRole.entities.SyncMap.delete(m.id); } catch (_) { console.error('[syncGroupCompany] catch:', _); }
      }
      return Response.json({ ok: true, deleted: mapsById.length });
    }

    // CREATE/UPDATE: bidirecional
    if (empresaId) {
      // empresa → grupo (UP)
      const upMap = mapsById.find(m => m.direction === 'up');
      const payload = pickAllowed(entityName, record);
      if (!payload) return Response.json({ ok: true, skipped: 'not-allowed' });

      // IMPORTANT: preserve empresa_id in payload for entities that require it
      // Only strip empresa_id when creating a group-level mirror (where we explicitly set group scope)
      const groupFilter = groupId ? { group_id: groupId } : {};

      if (upMap?.target_id) {
        const current = await base44.asServiceRole.entities[entityName]?.get?.(upMap.target_id).catch(() => ({})) || {};
        const mergeRes = await base44.asServiceRole.functions.invoke('conflictPolicy', {
          entity_name: entityName, group_id: groupId || null, empresa_id: empresaId,
          source: 'up', current, incoming: payload
        }).catch(() => null);
        const merged = (mergeRes?.data && (mergeRes.data.merged || mergeRes.data)) || payload;
        await doWithRetry(() => base44.asServiceRole.entities[entityName].update(upMap.target_id, merged));
        await doWithRetry(() => base44.asServiceRole.entities.SyncMap.update(upMap.id, { last_sync_at: nowIso() }));
      } else {
        // For group-level record, keep empresa_id to satisfy required field constraints
        const groupPayload = { ...payload, ...groupFilter };
        const mergeRes = await base44.asServiceRole.functions.invoke('conflictPolicy', {
          entity_name: entityName, group_id: groupId || null, empresa_id: empresaId,
          source: 'up', current: {}, incoming: groupPayload
        }).catch(() => null);
        const merged = (mergeRes?.data && (mergeRes.data.merged || mergeRes.data)) || groupPayload;
        const created = await doWithRetry(() => base44.asServiceRole.entities[entityName].create(merged));
        await doWithRetry(() => base44.asServiceRole.entities.SyncMap.create({
          entity_name: entityName, group_id: groupId || null, empresa_id: empresaId,
          source_id: entityId, target_id: created.id, direction: 'up', last_sync_at: nowIso()
        }));
      }
      return Response.json({ ok: true, direction: 'up' });
    }

    // grupo → empresas (DOWN)
    if (groupId) {
      const empresas = await listEmpresasByGroup(base44, groupId);
      const payload = pickAllowed(entityName, record);
      if (!payload) return Response.json({ ok: true, skipped: 'not-allowed' });
      const results = [];
      for (const emp of empresas) {
        const empId = emp.id;
        const map = (existingMaps || []).find(m =>
          (m.source_id === entityId && m.empresa_id === empId && m.direction === 'down') ||
          (m.target_id === entityId && m.empresa_id === empId && m.direction === 'up')
        ) || mapsById.find(m => m.empresa_id === empId);
        const isMirror = map?.target_id && map.source_id === entityId && map.direction === 'down';
        const targetId = isMirror ? map.target_id : null;
        const dataDown = { ...payload, empresa_id: empId, group_id: groupId };

        if (targetId) {
          const current = await base44.asServiceRole.entities[entityName]?.get?.(targetId).catch(() => ({})) || {};
          const mergeRes = await base44.asServiceRole.functions.invoke('conflictPolicy', {
            entity_name: entityName, group_id: groupId, empresa_id: empId,
            source: 'down', current, incoming: dataDown
          }).catch(() => null);
          const merged = (mergeRes?.data && (mergeRes.data.merged || mergeRes.data)) || dataDown;
          await doWithRetry(() => base44.asServiceRole.entities[entityName].update(targetId, merged));
          await doWithRetry(() => base44.asServiceRole.entities.SyncMap.update(map.id, { last_sync_at: nowIso() }));
          results.push({ empresa_id: empId, action: 'updated' });
        } else {
          const mergeRes = await base44.asServiceRole.functions.invoke('conflictPolicy', {
            entity_name: entityName, group_id: groupId, empresa_id: empId,
            source: 'down', current: {}, incoming: dataDown
          }).catch(() => null);
          const merged = (mergeRes?.data && (mergeRes.data.merged || mergeRes.data)) || dataDown;
          const created = await doWithRetry(() => base44.asServiceRole.entities[entityName].create(merged));
          await doWithRetry(() => base44.asServiceRole.entities.SyncMap.create({
            entity_name: entityName, group_id: groupId, empresa_id: empId,
            source_id: entityId, target_id: created.id, direction: 'down', last_sync_at: nowIso()
          }));
          results.push({ empresa_id: empId, action: 'created' });
        }
      }
      return Response.json({ ok: true, direction: 'down', results });
    }

    return Response.json({ ok: true, note: 'no scope' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});