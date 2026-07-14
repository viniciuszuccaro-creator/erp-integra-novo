/**
 * moduleEventBus — Pub/Sub backend entre módulos do ERP Zuccaro
 * Suporta: publish, subscribe (poll), listEvents, clearProcessed
 * Multiempresa: todos os eventos têm group_id + empresa_id
 * Persistência: AuditLog (tipo_auditoria = 'evento_modulo')
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Buffer in-memory para eventos recentes (TTL 10min)
const EVENT_BUFFER = new Map();
const BUFFER_TTL_MS = 10 * 60 * 1000;

function pruneBuffer() {
  const now = Date.now();
  for (const [key, ev] of EVENT_BUFFER) {
    if (now - ev._ts > BUFFER_TTL_MS) EVENT_BUFFER.delete(key);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { action, event_type, payload, module_source, module_target,
            group_id, empresa_id, since_ts, limit = 50 } = body;

    pruneBuffer();

    // ── PUBLISH ──────────────────────────────────────────────────
    if (action === 'publish') {
      if (!event_type || !module_source) {
        return Response.json({ error: 'event_type e module_source são obrigatórios' }, { status: 400 });
      }
      const eventId = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const event = {
        id: eventId,
        event_type,
        module_source,
        module_target: module_target || null,
        payload: payload || {},
        group_id: group_id || null,
        empresa_id: empresa_id || null,
        published_by: user.id,
        published_at: new Date().toISOString(),
        processed: false,
        _ts: Date.now(),
      };

      EVENT_BUFFER.set(eventId, event);

      // Persistir no AuditLog para rastreabilidade
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email || 'Sistema',
          usuario_id: user.id,
          acao: 'Execução',
          modulo: module_source,
          tipo_auditoria: 'evento_modulo',
          entidade: 'ModuleEventBus',
          registro_id: eventId,
          descricao: `[BUS] ${module_source} → ${module_target || '*'} : ${event_type}`,
          dados_novos: { event_type, module_source, module_target, payload_keys: Object.keys(payload || {}) },
          empresa_id: empresa_id || null,
          group_id: group_id || null,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}

      return Response.json({ ok: true, event_id: eventId, event });
    }

    // ── SUBSCRIBE / POLL ─────────────────────────────────────────
    if (action === 'poll') {
      const sinceMs = since_ts ? new Date(since_ts).getTime() : (Date.now() - 60000);
      const events = [];
      for (const [, ev] of EVENT_BUFFER) {
        if (ev._ts < sinceMs) continue;
        if (module_target && ev.module_target && ev.module_target !== module_target) continue;
        if (group_id && ev.group_id && ev.group_id !== group_id) continue;
        if (empresa_id && ev.empresa_id && ev.empresa_id !== empresa_id) continue;
        events.push(ev);
      }
      events.sort((a, b) => a._ts - b._ts);
      return Response.json({ ok: true, events: events.slice(0, limit), count: events.length });
    }

    // ── LIST EVENTS (histórico AuditLog) ─────────────────────────
    if (action === 'list') {
      const filters = { tipo_auditoria: 'evento_modulo' };
      if (empresa_id) filters.empresa_id = empresa_id;
      if (group_id) filters.group_id = group_id;
      const logs = await base44.asServiceRole.entities.AuditLog.filter(filters, '-data_hora', limit);
      return Response.json({ ok: true, events: logs || [], count: (logs || []).length });
    }

    // ── MARK PROCESSED ───────────────────────────────────────────
    if (action === 'mark_processed') {
      const { event_id } = body;
      if (event_id && EVENT_BUFFER.has(event_id)) {
        const ev = EVENT_BUFFER.get(event_id);
        ev.processed = true;
        EVENT_BUFFER.set(event_id, ev);
      }
      return Response.json({ ok: true });
    }

    // ── HEALTH ───────────────────────────────────────────────────
    if (action === 'health' || !action) {
      return Response.json({
        ok: true,
        version: '1.0',
        buffer_size: EVENT_BUFFER.size,
        supported_actions: ['publish', 'poll', 'list', 'mark_processed', 'health'],
      });
    }

    return Response.json({ error: `Ação '${action}' desconhecida` }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});