/**
 * LayoutEffects — extrai todos os useEffect pesados do layout principal.
 * Responsabilidades: auditoria, PWA, offline, RBAC entity wrapping, performance.
 */
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { sanitizeOnWrite } from "@/components/lib/sanitizeOnWrite";
import { idbClearExpired } from "@/components/lib/useIndexedDBCache";
import usePermissions from "@/components/lib/usePermissions";

export default function LayoutEffects({
  user,
  empresaAtual,
  grupoAtual,
  contexto,
  moduleName,
  currentPageName,
  isOffline,
  setIsOffline,
  setIntegracoesOk,
  contextRef,
}) {
  const queryClient = useQueryClient();
  const location = useLocation();
  const { hasPermission } = usePermissions();
  const auditThrottleRef = useRef({ click: 0, change: 0 });
  const AUDIT_BUSINESS_ONLY = true;

  // 1. Online/Offline detection
  useEffect(() => {
    const goOnline = () => setIsOffline(false);
    const goOffline = () => setIsOffline(true);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  // 2. Dark mode + keyboard shortcuts (delegado ao LayoutContent — apenas offline aqui)

  // 3. Integrações fiscais check
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!empresaAtual?.id) { if (!cancelled) setIntegracoesOk(true); return; }
        const allowed = hasPermission("Sistema", null, "ver");
        if (!allowed) { if (!cancelled) setIntegracoesOk(true); return; }
        const isAuth = await base44.auth.isAuthenticated();
        if (!isAuth) { if (!cancelled) setIntegracoesOk(true); return; }
        const res = await base44.functions.invoke("getEntityRecord", {
          entityName: "ConfiguracaoSistema",
          filter: { chave: `integracoes_${empresaAtual.id}` },
          limit: 1,
        });
        const cfg = Array.isArray(res?.data) ? res.data[0] || null : null;
        if (!cancelled) setIntegracoesOk(!!(cfg?.integracao_nfe?.api_key && cfg?.integracao_boletos?.api_key));
      } catch { if (!cancelled) setIntegracoesOk(true); }
    })();
    return () => { cancelled = true; };
  }, [empresaAtual?.id]);

  // 4. React Query default options com auditoria de erros
  useEffect(() => {
    try {
      queryClient.setDefaultOptions({
        queries: {
          staleTime: 120000, gcTime: 300000,
          refetchOnWindowFocus: false, refetchOnReconnect: false, retry: 0,
          onError: (error) => {
            const m = String(error?.message || "");
            if (/aborted|abort|canceled|cancelled/i.test(m)) return;
            if (error?.response?.status === 429 || /rate limit/i.test(m)) return;
            (async () => { try {
              if (await base44.auth.isAuthenticated()) {
                await base44.functions.invoke("auditError", {
                  module: moduleName || "Sistema", message: `Query error: ${m}`,
                  stack: error?.stack || null, page: currentPageName,
                  empresa_id: empresaAtual?.id || null, group_id: grupoAtual?.id || user?.data?.group_id || user?.group_id || null,
                });
              }
            } catch (e) { console.error('[layout] catch:', e); } })();
          },
        },
        mutations: { retry: 0 },
      });
    } catch (e) { console.error('[layout] catch:', e); }
  }, [user?.id, empresaAtual?.id, grupoAtual?.id, moduleName, currentPageName]);

  // 5. Auditoria de navegação (throttle: 1 log por rota por sessão)
  const navAuditedRef = useRef(new Set());
  useEffect(() => {
    if (!user) return;
    const key = `${location.pathname}|${user?.id}`;
    if (navAuditedRef.current.has(key)) return;
    navAuditedRef.current.add(key);
    (async () => { try {
      if (await base44.auth.isAuthenticated()) {
        await base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || "Usuário",
          usuario_id: user?.id,
          empresa_id: empresaAtual?.id || null,
          group_id: grupoAtual?.id || user?.data?.group_id || user?.group_id || null,
          acao: "Visualização", modulo: moduleName || "Sistema",
          tipo_auditoria: "ui", entidade: "Navegação",
          descricao: `Rota: ${location.pathname}`,
          data_hora: new Date().toISOString(),
        });
      }
    } catch (e) { console.error('[layout] catch:', e); } })();
  }, [location.pathname, user?.id, empresaAtual?.id, moduleName]);

  // 6. Auditoria de bloqueio de módulo — limpa cache de sessão ao trocar empresa/grupo
  useEffect(() => {
    // P5: reseta auditorias de bloqueio ao mudar contexto multiempresa
    try {
      Object.keys(sessionStorage).filter(k => k.startsWith('audit_block_')).forEach(k => sessionStorage.removeItem(k));
    } catch (e) { console.error('[layout] catch:', e); }
  }, [empresaAtual?.id, grupoAtual?.id]);

  useEffect(() => {
    if (!moduleName) return;
    const key = `audit_block_${moduleName}_${empresaAtual?.id || 'none'}`;
    try {
      const allowed = hasPermission(moduleName, null, "ver");
      if (!allowed && !sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || "Usuário",
          usuario_id: user?.id,
          empresa_id: empresaAtual?.id || null,
          group_id: grupoAtual?.id || user?.data?.group_id || user?.group_id || null,
          acao: "Bloqueio", modulo: moduleName, tipo_auditoria: "seguranca",
          entidade: "Página",
          descricao: `Acesso negado ao módulo ${moduleName} (${currentPageName})`,
          data_hora: new Date().toISOString(),
        });
      }
    } catch (e) { console.error('[layout] catch:', e); }
  }, [moduleName, currentPageName, user?.id, empresaAtual?.id, grupoAtual?.id]);

  // 7. Entity subscriptions para auditoria + stamping
  useEffect(() => {
    if (!user) return;
    const entityToModule = {
      Cliente: "CRM", Oportunidade: "CRM", Interacao: "CRM",
      Pedido: "Comercial", NotaFiscal: "Fiscal", Entrega: "Expedição",
      Romaneio: "Expedição", Fornecedor: "Compras", SolicitacaoCompra: "Compras",
      OrdemCompra: "Compras", Produto: "Estoque", MovimentacaoEstoque: "Estoque",
      ContaPagar: "Financeiro", ContaReceber: "Financeiro", Evento: "Agenda", Comissao: "Comercial",
    };
    const stampConfig = {
      Cliente: { nameField: "vendedor_responsavel", idField: "vendedor_responsavel_id" },
      Oportunidade: { nameField: "responsavel", idField: "responsavel_id" },
      Interacao: { nameField: "responsavel", idField: "responsavel_id" },
      Entrega: { nameField: "usuario_responsavel", idField: "usuario_responsavel_id" },
      MovimentacaoEstoque: { nameField: "responsavel", idField: "responsavel_id" },
      Pedido: { nameField: "vendedor", idField: "vendedor_id" },
    };
    const queryMap = {
      Pedido: [["pedidos"]], ContaReceber: [["contasReceber"], ["cobrancas"]],
      ContaPagar: [["contasPagar"]], Entrega: [["entregas"]], Colaborador: [["colaboradores"]],
      Produto: [["produtos"], ["produtos-count-dash"]], Cliente: [["clientes"], ["clientes-count"]],
      OrdemProducao: [["ordensProducao"]], NotaFiscal: [["notasFiscais"]],
    };

    const unsubs = Object.keys(entityToModule).map((name) => {
      const api = base44.entities?.[name];
      if (!api?.subscribe) return null;
      return api.subscribe(async (evt) => {
        try {
          // P2: inclui group_id no AuditLog para rastreabilidade multiempresa
          await base44.entities.AuditLog.create({
            usuario: user?.full_name || user?.email || "Usuário",
            usuario_id: user?.id,
            empresa_id: empresaAtual?.id || evt?.data?.empresa_id || null,
            group_id: grupoAtual?.id || evt?.data?.group_id || user?.data?.group_id || user?.group_id || null,
            acao: evt.type === "create" ? "Criação" : evt.type === "update" ? "Edição" : "Exclusão",
            modulo: entityToModule[name], tipo_auditoria: "entidade",
            entidade: name, registro_id: evt.id,
            descricao: `${name} ${evt.type}`, dados_novos: evt?.data || null,
          });
          if (evt.type === "create") {
            const cfg = stampConfig[name];
            const data = evt?.data || {};
            const patch = {};
            if (cfg) {
              if (!data?.[cfg.nameField]) patch[cfg.nameField] = user?.full_name || user?.email;
              if (!data?.[cfg.idField]) patch[cfg.idField] = user?.id;
            }
            if ("empresa_id" in data && !data?.empresa_id && empresaAtual?.id) patch.empresa_id = empresaAtual.id;
            if (Object.keys(patch).length > 0) {
              try { await base44.entities?.[name]?.update?.(evt.id, patch); } catch (e) { console.error('[layout] catch:', e); }
            }
          }
          (queryMap[name] || []).forEach((qk) => {
            try { queryClient.invalidateQueries({ queryKey: qk }); } catch (e) { console.error('[layout] catch:', e); }
          });
        } catch (e) { console.error('[layout] catch:', e); }
      });
    }).filter(Boolean);

    return () => { unsubs.forEach((u) => { if (typeof u === "function") u(); }); };
  }, [user?.id, empresaAtual?.id, queryClient]);

  // 8. IDB cleanup on idle
  useEffect(() => {
    const cleanup = () => { try { idbClearExpired(); } catch (e) { console.error('[layout] catch:', e); } };
    if ("requestIdleCallback" in window) window.requestIdleCallback(cleanup, { timeout: 10000 });
    else setTimeout(cleanup, 8000);
  }, []);

  // 9. Deploy audit — apenas uma vez por sessão para evitar chamadas repetidas
  const deployAuditDoneRef = useRef(false);
  useEffect(() => {
    if (deployAuditDoneRef.current || !user?.id) return;
    deployAuditDoneRef.current = true;
    try {
      setTimeout(() => { (async () => { try {
        if (await base44.auth.isAuthenticated()) {
          await base44.functions.invoke("deployAudit", { event: "app_loaded", module: moduleName || "Sistema", page: currentPageName });
        }
      } catch (e) { console.error('[layout] catch:', e); } })(); }, 2000); // atraso para não bloquear carregamento inicial
    } catch (e) { console.error('[layout] catch:', e); }
  }, [user?.id]);

  // 10. Offline cache hydration
  useEffect(() => {
    if (!isOffline) return;
    try {
      const keys = JSON.parse(localStorage.getItem("rq_index_keys") || "[]");
      keys.forEach((k) => {
        try {
          const val = JSON.parse(localStorage.getItem(k) || "null");
          if (val != null) {
            const match = k.match(/^rq_(.*)_/);
            if (match) { try { queryClient.setQueryData(JSON.parse(match[1]), val); } catch (e) { console.error('[layout] catch:', e); } }
          }
        } catch (e) { console.error('[layout] catch:', e); }
      });
    } catch (e) { console.error('[layout] catch:', e); }
  }, [isOffline]);

  // 11. PWA manifest injection + service worker registration
  useEffect(() => {
    try {
      const manifest = {
        name: "ERP Zuccaro", short_name: "ERP", start_url: "/", scope: "/",
        display: "standalone", background_color: "#0f172a", theme_color: "#0f172a",
        icons: [
          { src: "https://base44.com/logo_v2.svg", sizes: "192x192", type: "image/svg+xml", purpose: "any maskable" },
          { src: "https://base44.com/logo_v2.svg", sizes: "512x512", type: "image/svg+xml", purpose: "any maskable" },
        ],
      };
      const blob = new Blob([JSON.stringify(manifest)], { type: "application/manifest+json" });
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = URL.createObjectURL(blob);
      if (!document.head.querySelector('link[rel="manifest"]')) document.head.appendChild(link);

      const themeMeta = document.querySelector('meta[name="theme-color"]') || document.createElement("meta");
      themeMeta.setAttribute("name", "theme-color");
      themeMeta.setAttribute("content", "#0f172a");
      if (!themeMeta.parentElement) document.head.appendChild(themeMeta);

      const appleMeta = document.querySelector('meta[name="apple-mobile-web-app-capable"]') || document.createElement("meta");
      appleMeta.setAttribute("name", "apple-mobile-web-app-capable");
      appleMeta.setAttribute("content", "yes");
      if (!appleMeta.parentElement) document.head.appendChild(appleMeta);

      const appleIcon = document.querySelector('link[rel="apple-touch-icon"]') || document.createElement("link");
      appleIcon.setAttribute("rel", "apple-touch-icon");
      appleIcon.setAttribute("href", "https://base44.com/logo_v2.svg");
      if (!appleIcon.parentElement) document.head.appendChild(appleIcon);

      try {
        const csp = document.querySelector('meta[http-equiv="Content-Security-Policy"]') || document.createElement("meta");
        csp.setAttribute("http-equiv", "Content-Security-Policy");
        csp.setAttribute("content", "upgrade-insecure-requests; default-src 'self' https: data: blob:; connect-src 'self' https: wss:; img-src 'self' https: data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https:; frame-ancestors 'self'; object-src 'none'");
        if (!csp.parentElement) document.head.appendChild(csp);
      } catch (e) { console.error('[layout] catch:', e); }

      try {
        if (window.location.protocol === "http:" && window.location.hostname !== "localhost") {
          window.location.replace("https://" + window.location.host + window.location.pathname + window.location.search + window.location.hash);
        }
      } catch (e) { console.error('[layout] catch:', e); }
    } catch (e) { console.error('[layout] catch:', e); }

    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        fetch("/functions/pwaSw", { method: "HEAD" }).then((res) => {
          if (!res.ok) return;
          navigator.serviceWorker.register("/functions/pwaSw").then((reg) => {
            if (reg && reg.waiting) { try { reg.waiting.postMessage({ type: "SKIP_WAITING" }); } catch (e) { console.error('[layout] catch:', e); } }
            reg.onupdatefound = () => {
              const nw = reg.installing;
              if (!nw) return;
              nw.onstatechange = () => {
                if (nw.state === "installed" && navigator.serviceWorker.controller) {
                  (async () => { try {
                    if (await base44.auth.isAuthenticated()) {
                      await base44.entities.AuditLog.create({
                        acao: "Visualização", modulo: moduleName || "Sistema", tipo_auditoria: "sistema", entidade: "PWA",
                        descricao: "Nova versão PWA disponível", data_hora: new Date().toISOString(),
                        usuario: user?.full_name || "Usuário", usuario_id: user?.id || null,
                        empresa_id: empresaAtual?.id || null, group_id: grupoAtual?.id || user?.data?.group_id || user?.group_id || null,
                      });
                    }
                  } catch (e) { console.error('[layout] catch:', e); } })();
                }
              };
            };
            try { setInterval(() => { try { reg.update(); } catch (e) { console.error('[layout] catch:', e); } }, 60 * 60 * 1000); } catch (e) { console.error('[layout] catch:', e); }
            try {
              navigator.serviceWorker.addEventListener("controllerchange", () => {
                (async () => { try {
                  if (await base44.auth.isAuthenticated()) {
                    await base44.entities.AuditLog.create({
                      acao: "Visualização", modulo: moduleName || "Sistema", tipo_auditoria: "sistema", entidade: "PWA",
                      descricao: "Service Worker atualizado e ativo", data_hora: new Date().toISOString(),
                      usuario: user?.full_name || "Usuário", usuario_id: user?.id || null,
                      empresa_id: empresaAtual?.id || null, group_id: grupoAtual?.id || user?.data?.group_id || user?.group_id || null,
                    });
                  }
                } catch (e) { console.error('[layout] catch:', e); } })();
              });
            } catch (e) { console.error('[layout] catch:', e); }
          }).catch(() => {});
        }).catch(() => {});
      });
    }
  }, [user?.id, empresaAtual?.id, grupoAtual?.id, moduleName]);

  // 12. React Query cache persistence (offline snapshot)
  useEffect(() => {
    const cache = queryClient.getQueryCache();
    const indexKey = "rq_index_keys";
    const addToIndex = (k) => {
      try {
        const curr = JSON.parse(localStorage.getItem(indexKey) || "[]");
        if (!curr.includes(k)) { curr.push(k); localStorage.setItem(indexKey, JSON.stringify(curr)); }
      } catch (e) { console.error('[layout] catch:', e); }
    };
    const sub = cache.subscribe((event) => {
      try {
        if (event?.type !== "updated") return;
        const q = event.query; const state = q.getState?.();
        if (state?.data === undefined) return;
        const sk = `rq_${JSON.stringify(q.queryKey)}_${empresaAtual?.id || ""}_${grupoAtual?.id || ""}`;
        localStorage.setItem(sk, JSON.stringify(state.data)); addToIndex(sk);
      } catch (e) { console.error('[layout] catch:', e); }
    });
    return () => { if (typeof sub === "function") sub(); };
  }, [queryClient, empresaAtual?.id, grupoAtual?.id]);

  return null; // Renderiza apenas efeitos, sem UI
}