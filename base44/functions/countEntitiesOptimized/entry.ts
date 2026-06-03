/**
 * countEntitiesOptimized — Função backend para contar entidades com multi-empresa
 * ✅ Batch counting rápido
 * ✅ Suporta grupo + empresa com $or automático
 * ✅ Cache de 30s no servidor
 */
import { createClientFromRequest } from "npm:@base44/sdk@0.8.25";

const FIELD_MAP = {
  Cliente: "empresa_id",
  Fornecedor: "empresa_dona_id",
  Transportadora: "empresa_dona_id",
  Colaborador: "empresa_alocada_id",
  Produto: "empresa_id",
  CentroCusto: "empresa_id",
};

const SHARED_ENTITIES = new Set(["Cliente", "Fornecedor", "Transportadora"]);

const serverCache = globalThis.__countEntitiesOptimizedCache || (globalThis.__countEntitiesOptimizedCache = new Map());
const CACHE_TTL = 300_000;
let backendPausedUntil = globalThis.__countEntitiesOptimizedPausedUntil || 0;
let lastBackendCallAt = globalThis.__countEntitiesOptimizedLastCallAt || 0;
const MIN_CALL_GAP_MS = 2500;
const BACKEND_PAUSE_MS = 120_000;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { batch = [], filter = {} } = body;

    if (!Array.isArray(batch) || !batch.length) {
      return Response.json({}, { status: 200 });
    }

    const result = {};
    const now = Date.now();

    for (const item of batch) {
      const { entity, groupId, empresaId } = item;

      if (!entity) continue;

      // Verificar cache
      const cacheKey = `${entity}|${groupId}|${empresaId}`;
      const cached = serverCache.get(cacheKey);
      if (cached && now - cached.ts < CACHE_TTL) {
        result[entity] = cached.count;
        continue;
      }

      // Construir filtro com suporte multi-empresa
      const countFilter = { ...filter };
      const campo = FIELD_MAP[entity] || "empresa_id";
      const orConditions = [];

      if (empresaId) {
        orConditions.push({ [campo]: empresaId });
        if (SHARED_ENTITIES.has(entity)) {
          orConditions.push({ empresas_compartilhadas_ids: { $in: [empresaId] } });
        }
      }
      if (groupId) {
        orConditions.push({ group_id: groupId });
      }

      if (orConditions.length > 0) {
        countFilter.$or = orConditions;
      }

      // Contar em modo protegido: evita rajadas e mantém cache em falhas 429/502
      try {
        if (Date.now() < backendPausedUntil) {
          result[entity] = cached?.count || 0;
          continue;
        }

        const waitMs = Math.max(0, MIN_CALL_GAP_MS - (Date.now() - lastBackendCallAt));
        if (waitMs > 0 && cached) {
          result[entity] = cached.count;
          continue;
        }
        if (waitMs > 0) await new Promise((resolve) => setTimeout(resolve, waitMs));

        lastBackendCallAt = Date.now();
        globalThis.__countEntitiesOptimizedLastCallAt = lastBackendCallAt;

        const api = base44.asServiceRole.entities[entity];
        // Limite 2000 para capturar entidades com muitos registros (ex: Produto com 2000+ duplicados)
        const rows = await api.filter(countFilter, "-id", 2000, 0);
        const count = Array.isArray(rows) ? rows.length : 0;

        result[entity] = count;
        serverCache.set(cacheKey, { count, ts: Date.now() });
      } catch (e) {
        const status = e?.status || e?.response?.status;
        if (status === 429 || status === 502 || (typeof status === "number" && status >= 500)) {
          backendPausedUntil = Date.now() + BACKEND_PAUSE_MS;
          globalThis.__countEntitiesOptimizedPausedUntil = backendPausedUntil;
        }
        result[entity] = cached?.count || 0;
      }
    }

    return Response.json(result, { status: 200 });
  } catch (error) {
    return Response.json(
      { error: error.message || "Server error" },
      { status: 500 }
    );
  }
});