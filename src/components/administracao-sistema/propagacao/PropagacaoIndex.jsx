import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownUp, CheckCircle2, AlertCircle, Loader2,
  RefreshCw, Building2, Clock, ArrowDown, ArrowUp,
  Zap, Activity
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";

/**
 * PropagacaoIndex v4.0 — Propagação bidirecional real via backend
 * Grupo → Empresas (down), Empresas → Grupo (up), Delete (ambos sentidos)
 * Com logs de execução, filtros por módulo e feedback visual
 */

const ENTITIES = [
  { name: "Cliente",        label: "Clientes",          icon: "👥", grupo: "Comercial" },
  { name: "Fornecedor",     label: "Fornecedores",       icon: "🏭", grupo: "Compras" },
  { name: "Produto",        label: "Produtos",           icon: "📦", grupo: "Estoque" },
  { name: "Pedido",         label: "Pedidos",            icon: "📋", grupo: "Comercial" },
  { name: "ContaReceber",   label: "Contas a Receber",   icon: "💰", grupo: "Financeiro" },
  { name: "ContaPagar",     label: "Contas a Pagar",     icon: "💸", grupo: "Financeiro" },
  { name: "NotaFiscal",     label: "Notas Fiscais",      icon: "📄", grupo: "Fiscal" },
  { name: "Entrega",        label: "Entregas",           icon: "🚚", grupo: "Expedição" },
  { name: "Colaborador",    label: "Colaboradores",      icon: "👤", grupo: "RH" },
  { name: "CentroCusto",    label: "Centro de Custo",    icon: "🏦", grupo: "Financeiro" },
  { name: "TabelaPreco",    label: "Tabelas de Preço",   icon: "🏷️", grupo: "Comercial" },
  { name: "FormaPagamento", label: "Formas Pagamento",   icon: "💳", grupo: "Financeiro" },
  { name: "GrupoProduto",   label: "Grupos de Produto",  icon: "🗂️", grupo: "Estoque" },
  { name: "Marca",          label: "Marcas",             icon: "🎯", grupo: "Estoque" },
  { name: "OrdemCompra",    label: "Ordens de Compra",   icon: "🛒", grupo: "Compras" },
  { name: "Transportadora", label: "Transportadoras",    icon: "🚛", grupo: "Expedição" },
  { name: "Representante",  label: "Representantes",     icon: "🤝", grupo: "Comercial" },
  { name: "CentroCusto",    label: "Centro de Custo",    icon: "🏦", grupo: "Financeiro" },
  { name: "PlanoDeContas",  label: "Plano de Contas",    icon: "📊", grupo: "Financeiro" },
].filter((e, i, arr) => arr.findIndex(x => x.name === e.name) === i); // deduplicar

const STATUS_INIT = () =>
  Object.fromEntries(ENTITIES.map(e => [e.name, { status: "idle", message: "Aguardando", lastSync: null, total: 0 }]));

export default function PropagacaoIndex() {
  const { grupoAtual, empresasDoGrupo } = useContextoVisual();
  const [status, setStatus] = useState(STATUS_INIT);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [logs, setLogs] = useState([]);

  const addLog = (msg, type = "info") => {
    setLogs(prev => [{ msg, type, ts: new Date().toLocaleTimeString("pt-BR") }, ...prev].slice(0, 50));
  };

  const runPropagation = useCallback(async (entityName, direction = "down") => {
    if (!grupoAtual?.id) {
      toast.error("Selecione um grupo antes de sincronizar.");
      return;
    }

    setStatus(prev => ({
      ...prev,
      [entityName]: { ...prev[entityName], status: "checking", message: "Sincronizando..." }
    }));

    try {
      const res = await base44.functions.invoke("syncBidirectional", {
        entityName,
        groupId: grupoAtual.id,
        direction, // "down" = Grupo→Empresa | "up" = Empresa→Grupo | "both"
      });

      const total = res?.data?.total_processados ?? res?.data?.synced ?? 0;
      const msg = `${total} registro(s) sincronizado(s)`;

      setStatus(prev => ({
        ...prev,
        [entityName]: {
          status: "ok",
          message: msg,
          lastSync: new Date().toLocaleString("pt-BR"),
          total,
        }
      }));
      addLog(`✅ ${entityName} [${direction}]: ${msg}`, "ok");
      toast.success(`${entityName}: ${msg}`);
    } catch (err) {
      const errMsg = err?.message || String(err);
      setStatus(prev => ({
        ...prev,
        [entityName]: { status: "error", message: errMsg, lastSync: null, total: 0 }
      }));
      addLog(`❌ ${entityName} [${direction}]: ${errMsg}`, "error");
      toast.error(`Erro ao sincronizar ${entityName}`);
    }
  }, [grupoAtual?.id]);

  const runAll = useCallback(async (direction = "down") => {
    if (!grupoAtual?.id) { toast.error("Selecione um grupo."); return; }
    setGlobalLoading(true);
    addLog(`🚀 Iniciando sincronização completa [${direction}]`, "info");
    for (const e of ENTITIES) {
      await runPropagation(e.name, direction);
    }
    setGlobalLoading(false);
    addLog("🏁 Sincronização completa finalizada", "info");
    toast.success("Sincronização completa concluída!");
  }, [grupoAtual?.id, runPropagation]);

  const [filtroGrupo, setFiltroGrupo] = useState("Todos");
  const gruposDisponiveis = ["Todos", ...new Set(ENTITIES.map(e => e.grupo))];
  const entidadesFiltradas = filtroGrupo === "Todos" ? ENTITIES : ENTITIES.filter(e => e.grupo === filtroGrupo);

  const okCount = Object.values(status).filter(s => s.status === "ok").length;
  const errCount = Object.values(status).filter(s => s.status === "error").length;
  const idleCount = Object.values(status).filter(s => s.status === "idle").length;

  if (!grupoAtual?.id) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6 text-center text-amber-800">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          <p className="font-semibold">Selecione um Grupo Empresarial para usar a propagação</p>
          <p className="text-sm mt-1 text-amber-700">Use o seletor de empresa/grupo no topo da tela.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowDownUp className="w-5 h-5 text-blue-600" />
            Propagação Grupo ↔ Empresas
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            <span className="font-semibold text-blue-700">{grupoAtual.nome_do_grupo}</span>
            {" · "}
            <span className="text-indigo-600">{empresasDoGrupo.length} empresa(s)</span>
            {" · "}
            <span className="text-slate-500">{ENTITIES.length} entidades disponíveis</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => runAll("down")} disabled={globalLoading} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
            {globalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDown className="w-4 h-4" />}
            Grupo → Empresas
          </Button>
          <Button onClick={() => runAll("up")} disabled={globalLoading} variant="outline" size="sm" className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50">
            <ArrowUp className="w-4 h-4" />
            Empresas → Grupo
          </Button>
          <Button onClick={() => runAll("both")} disabled={globalLoading} variant="outline" size="sm" className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Bidirecional
          </Button>
        </div>
      </div>

      {/* KPI Bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-green-50 rounded-lg text-center border border-green-100">
          <p className="text-2xl font-bold text-green-600">{okCount}</p>
          <p className="text-xs text-slate-600">✅ Sincronizadas</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg text-center border border-red-100">
          <p className="text-2xl font-bold text-red-600">{errCount}</p>
          <p className="text-xs text-slate-600">❌ Com Erro</p>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg text-center border border-slate-100">
          <p className="text-2xl font-bold text-slate-500">{idleCount}</p>
          <p className="text-xs text-slate-600">⏳ Pendentes</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg text-center border border-blue-100">
          <p className="text-2xl font-bold text-blue-600">{ENTITIES.length}</p>
          <p className="text-xs text-slate-600">📦 Total Entidades</p>
        </div>
      </div>
      {/* Barra de progresso */}
      {(okCount + errCount) > 0 && (
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className="bg-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.round(((okCount) / ENTITIES.length) * 100)}%` }}
          />
        </div>
      )}

      {/* Tabs Nav */}
      <div className="flex gap-2 border-b border-slate-200 pb-0">
        {["overview", "empresas", "logs"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab === "overview" ? "Entidades" : tab === "empresas" ? `Empresas (${empresasDoGrupo.length})` : "Logs"}
          </button>
        ))}
      </div>

      {/* Filtro de módulo */}
      {activeTab === "overview" && (
        <div className="flex flex-wrap gap-1.5">
          {gruposDisponiveis.map(g => (
            <button
              key={g}
              onClick={() => setFiltroGrupo(g)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                filtroGrupo === g ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* Grid de Entidades */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {entidadesFiltradas.map(entity => {
            const st = status[entity.name];
            const isErr = st?.status === "error";
            const isOk = st?.status === "ok";
            const isRunning = st?.status === "checking";

            return (
              <Card key={entity.name} className={`transition-all ${isErr ? "border-red-200" : isOk ? "border-green-200" : "border-slate-200"}`}>
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-sm text-slate-900 truncate">
                      {entity.icon} {entity.label}
                    </span>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">{entity.grupo}</span>
                      {isRunning && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />}
                      {isErr && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                      {isOk && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 truncate">{st?.message}</p>
                  {st?.lastSync && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {st.lastSync}
                    </p>
                  )}
                  <div className="flex gap-1 pt-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={globalLoading || isRunning}
                      onClick={() => runPropagation(entity.name, "down")}
                      className="flex-1 text-xs h-7"
                    >
                      <ArrowDown className="w-3 h-3 mr-1" /> ↓
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={globalLoading || isRunning}
                      onClick={() => runPropagation(entity.name, "up")}
                      className="flex-1 text-xs h-7"
                    >
                      <ArrowUp className="w-3 h-3 mr-1" /> ↑
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={globalLoading || isRunning}
                      onClick={() => runPropagation(entity.name, "both")}
                      className="flex-1 text-xs h-7"
                    >
                      ⇅
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Empresas vinculadas */}
      {activeTab === "empresas" && (
        <Card>
          <CardContent className="p-4 space-y-2">
            {empresasDoGrupo.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">Nenhuma empresa vinculada a este grupo.</p>
            ) : (
              empresasDoGrupo.map(emp => (
                <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{emp.nome_fantasia || emp.razao_social}</p>
                      <p className="text-xs text-slate-500">{emp.cnpj}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-700 border-green-300">Ativa</Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* Logs de sincronização */}
      {activeTab === "logs" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Log de Sincronização</span>
              <Button variant="ghost" size="sm" onClick={() => setLogs([])}>Limpar</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-6">
                Execute uma sincronização para ver os logs aqui.
              </p>
            ) : (
              <div className="space-y-1 max-h-80 overflow-auto font-mono text-xs">
                {logs.map((l, i) => (
                  <div key={i} className={`flex gap-2 p-1.5 rounded ${l.type === "error" ? "bg-red-50 text-red-700" : l.type === "ok" ? "bg-green-50 text-green-700" : "bg-slate-50 text-slate-600"}`}>
                    <span className="text-slate-400 shrink-0">{l.ts}</span>
                    <span>{l.msg}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}