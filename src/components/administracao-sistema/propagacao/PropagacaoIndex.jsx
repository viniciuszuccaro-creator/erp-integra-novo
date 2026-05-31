import React, { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowDownUp, AlertCircle, Loader2,
  RefreshCw, Building2, ArrowDown, ArrowUp, Activity
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";
import PropagacaoStatusCard from "./PropagacaoStatusCard";
import PropagacaoEmpresaSelector from "./PropagacaoEmpresaSelector";

/**
 * PropagacaoIndex v5.0
 * - Usa PropagacaoStatusCard (componente separado, arquivo pequeno)
 * - Barra de progresso global
 * - Filtros por módulo
 * - Logs de execução completos
 */

const ENTITIES = [
  // Comercial
  { name: "Cliente",          label: "Clientes",           icon: "👥", grupo: "Comercial" },
  { name: "Pedido",           label: "Pedidos",            icon: "📋", grupo: "Comercial" },
  { name: "TabelaPreco",      label: "Tabelas de Preço",   icon: "🏷️", grupo: "Comercial" },
  { name: "Representante",    label: "Representantes",     icon: "🤝", grupo: "Comercial" },
  { name: "Oportunidade",     label: "Oportunidades",      icon: "🎯", grupo: "Comercial" },
  { name: "Comissao",         label: "Comissões",          icon: "💵", grupo: "Comercial" },
  { name: "CondicaoComercial",label: "Condições Comerciais",icon: "📑", grupo: "Comercial" },
  // Compras
  { name: "Fornecedor",       label: "Fornecedores",       icon: "🏭", grupo: "Compras" },
  { name: "OrdemCompra",      label: "Ordens de Compra",   icon: "🛒", grupo: "Compras" },
  // Estoque
  { name: "Produto",          label: "Produtos",           icon: "📦", grupo: "Estoque" },
  { name: "GrupoProduto",     label: "Grupos de Produto",  icon: "🗂️", grupo: "Estoque" },
  { name: "Marca",            label: "Marcas",             icon: "🎯", grupo: "Estoque" },
  { name: "SetorAtividade",   label: "Setores de Atividade",icon: "🏗️", grupo: "Estoque" },
  { name: "UnidadeMedida",    label: "Unidades de Medida", icon: "📐", grupo: "Estoque" },
  { name: "MovimentacaoEstoque",label: "Movimentações Est.",icon: "🔄", grupo: "Estoque" },
  // Financeiro
  { name: "ContaReceber",     label: "Contas a Receber",   icon: "💰", grupo: "Financeiro" },
  { name: "ContaPagar",       label: "Contas a Pagar",     icon: "💸", grupo: "Financeiro" },
  { name: "CentroCusto",      label: "Centro de Custo",    icon: "🏦", grupo: "Financeiro" },
  { name: "PlanoDeContas",    label: "Plano de Contas",    icon: "📊", grupo: "Financeiro" },
  { name: "FormaPagamento",   label: "Formas Pagamento",   icon: "💳", grupo: "Financeiro" },
  { name: "TipoDespesa",      label: "Tipos de Despesa",   icon: "📉", grupo: "Financeiro" },
  { name: "Banco",            label: "Bancos",             icon: "🏛️", grupo: "Financeiro" },
  // Fiscal
  { name: "NotaFiscal",       label: "Notas Fiscais",      icon: "📄", grupo: "Fiscal" },
  // Expedição & Logística
  { name: "Entrega",          label: "Entregas",           icon: "🚚", grupo: "Expedição" },
  { name: "Transportadora",   label: "Transportadoras",    icon: "🚛", grupo: "Expedição" },
  { name: "Veiculo",          label: "Veículos",           icon: "🚗", grupo: "Expedição" },
  // RH
  { name: "Colaborador",      label: "Colaboradores",      icon: "👤", grupo: "RH" },
  { name: "Departamento",     label: "Departamentos",      icon: "🏢", grupo: "RH" },
  { name: "Cargo",            label: "Cargos",             icon: "👔", grupo: "RH" },
  { name: "Turno",            label: "Turnos",             icon: "⏰", grupo: "RH" },
  // CRM
  { name: "SegmentoCliente",  label: "Segmentos de Cliente",icon: "🎨", grupo: "CRM" },
  { name: "RegiaoAtendimento",label: "Regiões de Atendimento",icon: "🗺️", grupo: "CRM" },
  // Sistema
  { name: "ConfiguracaoSistema", label: "Configurações",  icon: "⚙️", grupo: "Sistema" },
  { name: "PerfilAcesso",     label: "Perfis de Acesso",   icon: "🔐", grupo: "Sistema" },
];

const STATUS_INIT = () =>
  Object.fromEntries(ENTITIES.map(e => [e.name, { status: "idle", message: "Aguardando", lastSync: null, total: 0 }]));

const GRUPOS = ["Todos", ...new Set(ENTITIES.map(e => e.grupo))];

export default function PropagacaoIndex() {
  const { grupoAtual, empresasDoGrupo } = useContextoVisual();
  const [status, setStatus] = useState(STATUS_INIT);
  const [globalLoading, setGlobalLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [filtroGrupo, setFiltroGrupo] = useState("Todos");
  const [logs, setLogs] = useState([]);
  const [selectedForEmpresa, setSelectedForEmpresa] = useState(null);

  const addLog = (msg, type = "info") =>
    setLogs(prev => [{ msg, type, ts: new Date().toLocaleTimeString("pt-BR") }, ...prev].slice(0, 100));

  const runPropagation = useCallback(async (entityName, direction = "down") => {
    if (!grupoAtual?.id) { toast.error("Selecione um grupo antes de sincronizar."); return; }

    setStatus(prev => ({
      ...prev,
      [entityName]: { ...prev[entityName], status: "checking", message: "Sincronizando..." }
    }));

    try {
      const res = await base44.functions.invoke("syncBidirectional", {
        entityName,
        groupId: grupoAtual.id,
        direction,
      });

      const total = res?.data?.total_processados ?? res?.data?.synced ?? res?.data?.results?.length ?? 0;
      const msg = total > 0 ? `${total} registro(s) sincronizado(s)` : "Nenhum registro para sincronizar";

      setStatus(prev => ({
        ...prev,
        [entityName]: { status: "ok", message: msg, lastSync: new Date().toLocaleString("pt-BR"), total },
      }));
      addLog(`✅ ${entityName} [${direction}]: ${msg}`, "ok");
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
    addLog(`🚀 Iniciando sincronização completa [${direction}] — ${ENTITIES.length} entidades`, "info");
    for (const e of ENTITIES) {
      await runPropagation(e.name, direction);
    }
    setGlobalLoading(false);
    addLog("🏁 Sincronização completa finalizada", "info");
    toast.success("Sincronização completa concluída!");
  }, [grupoAtual?.id, runPropagation]);

  const resetAll = () => {
    setStatus(STATUS_INIT());
    setLogs([]);
    toast.info("Status resetado.");
  };

  const entidadesFiltradas = filtroGrupo === "Todos"
    ? ENTITIES
    : ENTITIES.filter(e => e.grupo === filtroGrupo);

  const okCount = Object.values(status).filter(s => s.status === "ok").length;
  const errCount = Object.values(status).filter(s => s.status === "error").length;
  const runningCount = Object.values(status).filter(s => s.status === "checking").length;
  const progressPct = ENTITIES.length > 0 ? Math.round((okCount / ENTITIES.length) * 100) : 0;

  if (!grupoAtual?.id) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 text-amber-500" />
          <p className="font-semibold text-amber-800">Selecione um Grupo Empresarial</p>
          <p className="text-sm mt-1 text-amber-700">Use o seletor de empresa/grupo no topo da tela para ativar a propagação.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full space-y-4 pb-8">

      {/* ── Header ── */}
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
            <span className="text-slate-400">{ENTITIES.length} entidades</span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => runAll("down")} disabled={globalLoading} size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700">
            {globalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowDown className="w-4 h-4" />}
            Grupo → Empresas
          </Button>
          <Button onClick={() => runAll("up")} disabled={globalLoading} variant="outline" size="sm" className="gap-2 border-blue-300 text-blue-700 hover:bg-blue-50">
            <ArrowUp className="w-4 h-4" /> Empresas → Grupo
          </Button>
          <Button onClick={() => runAll("both")} disabled={globalLoading} variant="outline" size="sm" className="gap-1">
            <RefreshCw className="w-4 h-4" /> Bidirecional
          </Button>
          <Button onClick={resetAll} disabled={globalLoading} variant="ghost" size="sm" className="text-slate-500">
            Resetar
          </Button>
        </div>
      </div>

      {/* ── KPI Bar ── */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "✅ Sincronizadas", value: okCount, bg: "bg-green-50 border-green-100", color: "text-green-600" },
          { label: "❌ Com Erro", value: errCount, bg: "bg-red-50 border-red-100", color: "text-red-600" },
          { label: "⏳ Pendentes", value: ENTITIES.length - okCount - errCount, bg: "bg-slate-50 border-slate-100", color: "text-slate-500" },
          { label: "📦 Total", value: ENTITIES.length, bg: "bg-blue-50 border-blue-100", color: "text-blue-600" },
        ].map(k => (
          <div key={k.label} className={`p-3 rounded-xl text-center border ${k.bg}`}>
            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs text-slate-600 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* ── Barra de progresso ── */}
      {(okCount + errCount) > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-slate-500">
            <span>Progresso da sincronização</span>
            <span>{progressPct}% concluído</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-700 bg-gradient-to-r from-blue-500 to-green-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-slate-200">
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
            {tab === "overview" ? "Entidades" : tab === "empresas" ? `Empresas (${empresasDoGrupo.length})` : `Logs (${logs.length})`}
          </button>
        ))}
      </div>

      {/* ── Filtros de módulo ── */}
      {activeTab === "overview" && (
        <div className="flex flex-wrap gap-1.5">
          {GRUPOS.map(g => (
            <button
              key={g}
              onClick={() => setFiltroGrupo(g)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                filtroGrupo === g
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      )}

      {/* ── Seletor de empresa específica ── */}
      {activeTab === "overview" && (
        <div className="bg-slate-50 rounded-lg border border-slate-200 px-4 py-3">
          <p className="text-xs font-medium text-slate-600 mb-1">Sincronização para empresa específica:</p>
          <PropagacaoEmpresaSelector
            entityName={selectedForEmpresa || "Produto"}
            onResult={(data) => addLog(`✅ Empresa específica: ${data?.total_processados ?? 0} reg. sincronizados`, "ok")}
          />
          <p className="text-[10px] text-slate-400 mt-1.5">
            Selecione uma entidade no grid e depois escolha a empresa de destino.
          </p>
        </div>
      )}

      {/* ── Grid de Entidades ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {entidadesFiltradas.map(entity => (
            <div
              key={entity.name}
              onClick={() => setSelectedForEmpresa(entity.name)}
              className="cursor-pointer"
            >
              <PropagacaoStatusCard
                entity={entity}
                st={status[entity.name]}
                globalLoading={globalLoading || runningCount > 0}
                onSync={runPropagation}
              />
            </div>
          ))}
        </div>
      )}

      {/* ── Empresas vinculadas ── */}
      {activeTab === "empresas" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-500" />
              Empresas do Grupo — {grupoAtual.nome_do_grupo}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {empresasDoGrupo.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Nenhuma empresa vinculada a este grupo.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {empresasDoGrupo.map(emp => (
                  <div key={emp.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 truncate">{emp.nome_fantasia || emp.razao_social}</p>
                      <p className="text-xs text-slate-400">{emp.cnpj || "Sem CNPJ"}</p>
                    </div>
                    <Badge variant="outline" className="ml-auto shrink-0 text-green-700 border-green-300 text-[10px]">
                      {emp.status || "Ativa"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Logs ── */}
      {activeTab === "logs" && (
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-500" />
                Log de Sincronização
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setLogs([])} className="text-xs">Limpar</Button>
            </div>
          </CardHeader>
          <CardContent>
            {logs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">Execute uma sincronização para ver os logs aqui.</p>
            ) : (
              <div className="space-y-1 max-h-96 overflow-auto font-mono text-xs">
                {logs.map((l, i) => (
                  <div
                    key={i}
                    className={`flex gap-2 p-2 rounded ${
                      l.type === "error" ? "bg-red-50 text-red-700"
                      : l.type === "ok" ? "bg-green-50 text-green-700"
                      : "bg-slate-50 text-slate-600"
                    }`}
                  >
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