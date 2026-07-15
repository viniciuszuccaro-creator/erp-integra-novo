import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Simple in-memory cache per instance
const CACHE = globalThis.__gcCache || (globalThis.__gcCache = new Map());
const AUDIT_CACHE = globalThis.__gcAuditCache || (globalThis.__gcAuditCache = new Map());
const CACHE_TTL_MS = 300_000; // 5 minutes
const AUDIT_TTL_MS = 15 * 60 * 1000;
let BACKEND_PAUSED_UNTIL = globalThis.__groupConsolidationPausedUntil || 0;
const BACKEND_PAUSE_MS = 120_000;

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    let filtros = {};
    try {
      const body = await req.json();
      if (body && body.filtros && (body.filtros.group_id || body.filtros.empresa_id)) {
        filtros = body.filtros;
      }
    } catch (_) { console.error('[groupConsolidation] catch:', _); }

    if (user.role !== 'admin' && !filtros.group_id && !filtros.empresa_id) {
      return Response.json({ error: 'empresa_id ou group_id obrigatório' }, { status: 403 });
    }

    const key = JSON.stringify(filtros || {});
    const entry = CACHE.get(key);
    if (entry && (Date.now() - entry.t) < CACHE_TTL_MS) {
      return Response.json(entry.resp);
    }

    if (Date.now() < BACKEND_PAUSED_UNTIL) {
      return Response.json(entry?.resp || { ok: true, groups: 0, summary: [], cached: true, paused: true });
    }

    let pedidos = [];
    let receber = [];
    let pagar = [];
    try {
      pedidos = await base44.asServiceRole.entities.Pedido.filter(filtros, '-updated_date', 300);
      receber = await base44.asServiceRole.entities.ContaReceber.filter(filtros, '-updated_date', 300);
      pagar = await base44.asServiceRole.entities.ContaPagar.filter(filtros, '-updated_date', 300);
    } catch (e) {
      const status = e?.status || e?.response?.status;
      if (status === 429 || status === 502 || (typeof status === 'number' && status >= 500)) {
        BACKEND_PAUSED_UNTIL = Date.now() + BACKEND_PAUSE_MS;
        globalThis.__groupConsolidationPausedUntil = BACKEND_PAUSED_UNTIL;
        return Response.json(entry?.resp || { ok: true, groups: 0, summary: [], cached: true, paused: true });
      }
      throw e;
    }

    const gaps = {
      pedido_sem_empresa: pedidos.filter(p => !p?.empresa_id).length,
      pedido_sem_grupo: pedidos.filter(p => !p?.group_id).length,
      receber_sem_empresa: receber.filter(r => !r?.empresa_id).length,
      pagar_sem_empresa: pagar.filter(c => !c?.empresa_id).length,
    };

    const groups = new Map();
    const add = (gid) => {
      if (!groups.has(gid)) groups.set(gid || null, { group_id: gid || null, pedidos: 0, valor_pedidos: 0, receber: 0, valor_receber: 0, pagar: 0, valor_pagar: 0 });
    };

    for (const p of pedidos) {
      const gid = p?.group_id || p?.empresa_id || null;
      add(gid);
      const g = groups.get(gid);
      g.pedidos += 1;
      g.valor_pedidos += Number(p?.valor_total || 0);
    }
    for (const r of receber) {
      const gid = r?.group_id || r?.empresa_id || null;
      add(gid);
      const g = groups.get(gid);
      g.receber += 1;
      g.valor_receber += Number(r?.valor || 0) - Number(r?.valor_recebido || 0);
    }
    for (const c of pagar) {
      const gid = c?.group_id || c?.empresa_id || null;
      add(gid);
      const g = groups.get(gid);
      g.pagar += 1;
      g.valor_pagar += Number(c?.valor || 0) - Number(c?.valor_pago || 0);
    }

    const summary = Array.from(groups.values());

    // Audit snapshot + performance (throttled to avoid rate limits)
    const auditKey = `snapshot:${key}`;
    try {
      const lastAudit = AUDIT_CACHE.get(auditKey) || 0;
      if (Date.now() - lastAudit > AUDIT_TTL_MS) {
        AUDIT_CACHE.set(auditKey, Date.now());
        await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'Sistema',
        acao: 'Criação',
        modulo: 'Sistema',
        entidade: 'ConsolidaçãoGrupo',
        descricao: `Snapshot multiempresa (${summary.length} escopos) — gaps: ${JSON.stringify(gaps)}`,
        dados_novos: { gerado_em: new Date().toISOString(), summary, gaps },
        data_hora: new Date().toISOString(),
        });
      }
    } catch (_) { console.error('[groupConsolidation] catch:', _); }

    const durationMs = Date.now() - t0;
    if (durationMs > 1500) {
      const perfKey = `perf:${key}`;
      try {
        const lastPerfAudit = AUDIT_CACHE.get(perfKey) || 0;
        if (Date.now() - lastPerfAudit > AUDIT_TTL_MS) {
          AUDIT_CACHE.set(perfKey, Date.now());
          await base44.asServiceRole.entities.AuditLog.create({
          usuario: 'Sistema',
          acao: 'Visualização',
          modulo: 'Sistema',
          tipo_auditoria: 'sistema',
          entidade: 'Performance',
          descricao: `groupConsolidation ${durationMs}ms`,
          dados_novos: { durationMs, filtros },
          data_hora: new Date().toISOString(),
          });
        }
      } catch (_) { console.error('[groupConsolidation] catch:', _); }
    }

    const resp = { ok: true, groups: summary.length, summary };
    try { CACHE.set(key, { t: Date.now(), resp }); } catch (_) { console.error('[groupConsolidation] catch:', _); }
    return Response.json(resp);
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});