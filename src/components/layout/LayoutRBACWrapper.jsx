/**
 * LayoutRBACWrapper — extrai a lógica de RBAC entity wrapping do layout principal.
 * Envolve as entidades do base44 com checkRBAC + stamping + sanitize.
 */
import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { sanitizeOnWrite } from "@/components/lib/sanitizeOnWrite";

export default function LayoutRBACWrapper({ user, empresaAtual, grupoAtual, contexto, contextRef }) {
  const wrappedRef = useRef(false);

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
        // fail-open em erros de rede
      }
    };

    const wrapEntity = (api, name) => {
      if (!api || name === "AuditLog") return;
      // Desempilha wrap anterior antes de re-aplicar (evita duplo wrap no HMR)
      if (api.__origMethods) {
        const o = api.__origMethods;
        if (o.create) api.create = o.create;
        if (o.bulkCreate) api.bulkCreate = o.bulkCreate;
        if (o.update) api.update = o.update;
        if (o.delete) api.delete = o.delete;
        if (o.filter) api.filter = o.filter;
        if (o.list) api.list = o.list;
        if (o.get && api.__origGet) { api.get = o.get; delete api.__origGet; }
        delete api.__origMethods;
        delete api.__wrappedContext;
      }
      if (api.__wrappedContext === true) return;
      const orig = {
        create: typeof api.create === "function" ? api.create.bind(api) : null,
        bulkCreate: typeof api.bulkCreate === "function" ? api.bulkCreate.bind(api) : null,
        update: typeof api.update === "function" ? api.update.bind(api) : null,
        delete: typeof api.delete === "function" ? api.delete.bind(api) : null,
        filter: typeof api.filter === "function" ? api.filter.bind(api) : null,
        list: typeof api.list === "function" ? api.list.bind(api) : null,
        get: typeof api.get === "function" ? api.get.bind(api) : null,
      };
      // Guarda originais para poder desfazer no próximo ciclo (HMR-safe)
      api.__origMethods = orig;

      const PII_ENTITIES = new Set(["Cliente", "Colaborador", "Fornecedor"]);

      if (orig.create) {
        api.create = async (data) => {
          await checkRBAC(name, "criar");
          const result = await orig.create(stamp(sanitizeOnWrite(data)));
          // Auto-encrypt PII após criação
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
          // Auto-encrypt PII após edição em entidades sensíveis
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
      // RLS em get() — valida escopo após busca para evitar acesso cruzado horizontal
      if (typeof api.get === 'function' && !api.__origGet) {
        const origGet = api.get.bind(api);
        api.__origGet = origGet;
        api.get = async (id) => {
          const rec = await origGet(id);
          if (!rec) return rec;
          const scope = getScope();
          if (scope.__blocked) return null;
          // Só valida quando o registro tem escopo explícito
          const recEmpresa = rec?.empresa_id || rec?.empresa_dona_id || null;
          const recGroup = rec?.group_id || null;
          const ctx = contextRef.current;
          if (recEmpresa && ctx.empresaAtual?.id && recEmpresa !== ctx.empresaAtual.id) {
            // Verifica se pertence ao mesmo grupo
            if (!recGroup || recGroup !== ctx.grupoAtual?.id) {
              // Acesso cruzado detectado — log silencioso + retorna null
              try {
                base44.entities.AuditLog.create({
                  usuario: ctx.user?.full_name || 'Usuário',
                  usuario_id: ctx.user?.id,
                  empresa_id: ctx.empresaAtual?.id,
                  acao: 'Bloqueio',
                  modulo: 'Sistema',
                  tipo_auditoria: 'seguranca',
                  entidade: name,
                  registro_id: id,
                  descricao: `RLS: tentativa de get() em registro de empresa ${recEmpresa} por empresa ${ctx.empresaAtual?.id}`,
                  data_hora: new Date().toISOString(),
                });
              } catch {}
              return null;
            }
          }
          return rec;
        };
      }
      api.__wrappedContext = true;
    };

    try { Object.keys(base44.entities).forEach((name) => wrapEntity(base44.entities[name], name)); } catch {}

  }, [user?.id, empresaAtual?.id, grupoAtual?.id, contexto]);

  return null;
}