import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, AlertCircle, Building2, Zap } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import PropagacaoStatusCard from "./PropagacaoStatusCard";

/**
 * PropagacaoIndex v6.0 — Monitoramento da propagação 100% automática por eventos.
 * Toda criação/edição de registro base dispara automaticamente a sincronização
 * Grupo ↔ Empresas via automações de evento (syncBidirectional) — Regra-Mãe 9.
 * Botões manuais de sincronização removidos: a via primária é o evento.
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
  { name: "Marca",            label: "Marcas",              icon: "🎯", grupo: "Estoque" },
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
  { name: "Cargo",            label: "Cargos",              icon: "👔", grupo: "RH" },
  { name: "Turno",            label: "Turnos",              icon: "⏰", grupo: "RH" },
  // CRM
  { name: "SegmentoCliente",  label: "Segmentos de Cliente",icon: "🎨", grupo: "CRM" },
  { name: "RegiaoAtendimento",label: "Regiões de Atendimento",icon: "🗺️", grupo: "CRM" },
  // Sistema
  { name: "ConfiguracaoSistema", label: "Configurações",  icon: "⚙️", grupo: "Sistema" },
  { name: "PerfilAcesso",     label: "Perfis de Acesso",   icon: "🔐", grupo: "Sistema" },
];

const GRUPOS = ["Todos", ...new Set(ENTITIES.map(e => e.grupo))];

export default function PropagacaoIndex() {
  const { grupoAtual, empresasDoGrupo } = useContextoVisual();
  const [activeTab, setActiveTab] = useState("overview");
  const [filtroGrupo, setFiltroGrupo] = useState("Todos");

  const entidadesFiltradas = useMemo(() =>
    filtroGrupo === "Todos" ? ENTITIES : ENTITIES.filter(e => e.grupo === filtroGrupo),
    [filtroGrupo]
  );

  if (!grupoAtual?.id) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-8 h-8 mx-auto mb-3 text-amber-500" />
          <p className="font-semibold text-amber-800">Selecione um Grupo Empresarial</p>
          <p className="text-sm mt-1 text-amber-700">Use o seletor de empresa/grupo no topo da tela para ver o status da propagação.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full space-y-4 pb-8">

      {/* ── Banner: automação por eventos ativa ── */}
      <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-500 mt-1.5 animate-pulse"></div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-green-800">✅ Propagação 100% automática por eventos</p>
          <p className="text-xs text-green-700 mt-0.5">
            Toda criação/edição de registro dispara <strong>automaticamente</strong> a sincronização Grupo ↔ Empresas via automações de evento (<code className="text-[10px]">syncBidirectional</code>).
            Não há mais necessidade de acionamento manual — esta tela é exclusivamente de monitoramento.
          </p>
        </div>
      </div>

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <ArrowDownUp className="w-5 h-5 text-blue-600" />
            Propagação Automática — Monitoramento
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            <span className="font-semibold text-blue-700">{grupoAtual.nome_do_grupo}</span>
            {" · "}
            <span className="text-indigo-600">{empresasDoGrupo.length} empresa(s)</span>
            {" · "}
            <span className="text-slate-400">{ENTITIES.length} entidades com ⚡ auto-sync</span>
          </p>
        </div>
        <Badge className="bg-green-100 text-green-800 border-green-300 gap-1 px-3 py-1.5">
          <Zap className="w-3.5 h-3.5" /> Eventos ativos: create / update
        </Badge>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b border-slate-200">
        {["overview", "empresas"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab === "overview" ? `Entidades (${ENTITIES.length})` : `Empresas (${empresasDoGrupo.length})`}
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

      {/* ── Grid de Entidades (monitoramento) ── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {entidadesFiltradas.map(entity => (
            <PropagacaoStatusCard key={entity.name} entity={entity} />
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
    </div>
  );
}