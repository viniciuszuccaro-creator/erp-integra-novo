/**
 * LayoutRBACWrapper — RBAC entity wrapping, HMR-safe.
 * Usa um único flag de versão para detectar re-execuções e sempre restaurar
 * os métodos originais antes de re-envolver. Nunca empilha wraps.
 */
import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { sanitizeOnWrite } from "@/components/lib/sanitizeOnWrite";

// Chave global para armazenar os originais fora do componente (sobrevive HMR)
const ORIG_KEY = "__rbac_orig_methods__";

function restoreEntity(api) {
  if (!api || !api[ORIG_KEY]) return;
  const o = api[ORIG_KEY];
  Object.keys(o).forEach((k) => { if (o[k]) api[k] = o[k]; });
  delete api[ORIG_KEY];
  delete api.__wrappedContext;
  delete api.__origGet;
}

export default function LayoutRBACWrapper({ user, empresaAtual, grupoAtual, contexto, contextRef }) {

  useEffect(() => {
    if (!base44?.entities) return;

    const stamp = (dados) => {
      const out = { ...(dados || {}) };
      try {
        const ctx = contextRef.current;
        if (ctx.grupoAtual?.id && !out.group_id) out.group_id = ctx.grupoAtual.id;
        if (ctx.contexto !== "grupo" && ctx.empresaAtual?.id && !out.empresa_id) out.empresa_id = ctx.empresaAtual.id;
      } catch {}
      return out;
    };

    const getScope = () => {
      const scope = {};
      try {
        const ctx = contextRef.current;
        if (ctx.grupoAtual?.id) scope.group_id = ctx.grupoAtual.id;
        if (ctx.contexto !== "grupo" && ctx.empresaAtual?.id) scope.empresa_id = ctx.empresaAtual.id;
        if (ctx.contexto !== "grupo" && !ctx.empresaAtual?.id) scope.__blocked = true;
      } catch {}
      return scope;
    };

    const __rbacCache = window.__layoutRbacCache || (window.__layoutRbacCache = new Map());
    const __RBAC_TTL = 5 * 60 * 1000;

    const checkRBAC = async (entityName, action) => {
      try {
        if (entityName === "AuditLog" && ["criar", "editar", "excluir"].includes(action)) throw new Error("RBAC: entidade protegida");
        if (contextRef.current.user?.role === "admin") return;

        const map = {
          Cliente: "CRM", Oportunidade: "CRM", Interacao: "CRM",
          Pedido: "Comercial", Comissao: "Comercial", NotaFiscal: "Fiscal",
          Entrega: "Expedição", Romaneio: "Expedição",
          Fornecedor: "Compras", SolicitacaoCompra: "Compras", OrdemCompra: "Compras",
          Produto: "Estoque", MovimentacaoEstoque: "Estoque",
          ContaPagar: "Financeiro", ContaReceber: "Financeiro", CentroCusto: "Financeiro",
          PerfilAcesso: "Administração", User: "Administração", Evento: "Agenda",
        };
        const modName = map[entityName] || "Sistema";
        const scope = getScope();
        const cacheKey = `${modName}|${entityName}|${action}|${scope.empresa_id || ""}|${scope.group_id || ""}`;
        const now = Date.now();
        const cached = __rbacCache.get(cacheKey);
        if (cached && now - cached.ts < __RBAC_TTL) {
          if (!cached.allowed) throw new Error("RBAC backend: ação negada");
          return;
        }
        const res = await base44.functions.invoke("entityGuard", {
          module: modName, section: entityName, action, entity_name: entityName,
          empresa_id: scope.empresa_id || null, group_id: scope.group_id || null,
        });
        const allowed = !(res?.data?.allowed === false);
        __rbacCache.set(cacheKey, { allowed, ts: now });
        if (!allowed) throw new Error("RBAC backend: ação negada");
      } catch (err) {
        if (err?.message === "RBAC backend: ação negada" || err?.response?.status === 403) throw err;
      }
    };

    const wrapEntity = (api, name) => {
      if (!api || name === "AuditLog") return;

      // Sempre restaura antes de re-envolver (HMR-safe, sem empilhamento)
      restoreEntity(api);

      // Salva os métodos originais ANTES de qualquer wrap
      const orig = {};
      ["create", "bulkCreate", "update", "delete", "filter", "list", "get"].forEach((k) => {
        if (typeof api[k] === "function") orig[k] = api[k].bind(api);
      });
      api[ORIG_KEY] = orig;

      const PII_ENTITIES = new Set(["Cliente", "Colaborador", "Fornecedor"]);

      if (orig.create) {
        api.create = async (data) => {
          await checkRBAC(name, "criar");
          const result = await orig.create(stamp(sanitizeOnWrite(data)));
          if (PII_ENTITIES.has(name) && result?.id) {
            try { base44.functions.invoke("piiEncryptor", { entity_name: name, id: result.id, action: "encrypt" }); } catch {}
          }
          return result;
        };
      }
      if (orig.bulkCreate) {
        api.bulkCreate = async (arr) => {
          const stamped = Array.isArray(arr) ? arr.map((x) => stamp(sanitizeOnWrite(x))) : arr;
          return await orig.bulkCreate(stamped);
        };
      }
      if (orig.update) {
        api.update = async (id, data) => {
          await checkRBAC(name, "editar");
          const result = await orig.update(id, stamp(sanitizeOnWrite(data)));
          if (PII_ENTITIES.has(name) && id) {
            try { base44.functions.invoke("piiEncryptor", { entity_name: name, id, action: "encrypt" }); } catch {}
          }
          return result;
        };
      }
      if (orig.delete) {
        api.delete = async (id) => {
          await checkRBAC(name, "excluir");
          return await orig.delete(id);
        };
      }
      if (orig.filter) {
        api.filter = async (criteria = {}, order, limit, skip) => {
          const scope = getScope();
          const hasScope = !!criteria?.empresa_id || !!criteria?.group_id || !!criteria?.$or || !!criteria?.$and;
          const merged = !hasScope ? { ...criteria, ...scope } : criteria;
          return await orig.filter(merged, order, limit, skip);
        };
      }
      if (orig.list) {
        api.list = async (order, limit, skip) => {
          if (orig.filter) return await orig.filter(getScope(), order, limit, skip);
          return await orig.list(order, limit, skip);
        };
      }
      if (orig.get) {
        api.get = async (id) => {
          const rec = await orig.get(id);
          if (!rec) return rec;
          const scope = getScope();
          if (scope.__blocked) return null;
          const recEmpresa = rec?.empresa_id || rec?.empresa_dona_id || null;
          const recGroup = rec?.group_id || null;
          const ctx = contextRef.current;
          if (recEmpresa && ctx.empresaAtual?.id && recEmpresa !== ctx.empresaAtual.id) {
            if (!recGroup || recGroup !== ctx.grupoAtual?.id) return null;
          }
          return rec;
        };
      }

      api.__wrappedContext = true;
    };

    try {
      Object.keys(base44.entities).forEach((name) => wrapEntity(base44.entities[name], name));
    } catch {}

    // Cleanup: restaura todos os métodos originais ao desmontar/re-executar
    return () => {
      try {
        Object.keys(base44.entities).forEach((name) => {
          const api = base44.entities[name];
          if (api) restoreEntity(api);
        });
      } catch {}
    };

  }, [user?.id, empresaAtual?.id, grupoAtual?.id, contexto]);

  return null;
}