/**
 * HerancaConfigNotice v3.0
 * - Tabela expandida com 12 entidades e status live
 * - Verificação real via backend (getEntityRecord)
 * - Indicador de override por empresa
 */
import React, { useState } from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { base44 } from "@/api/base44Client";
import { Layers, ChevronDown, ChevronRight, Info, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const POLITICAS = [
  // Configuração & Acesso
  { entidade: "ConfiguracaoSistema", heranca: "Grupo → Empresa", override: true,  tipo: "toggle",     desc: "Toggles globais propagados para todas as empresas" },
  { entidade: "PerfilAcesso",        heranca: "Grupo → Empresa", override: true,  tipo: "rbac",       desc: "Perfis RBAC com SoD — empresa pode criar perfis próprios" },
  // Financeiro
  { entidade: "PlanoDeContas",       heranca: "Grupo → Empresa", override: true,  tipo: "financeiro", desc: "Plano de contas padrão do grupo herdado por todas as empresas" },
  { entidade: "CentroCusto",         heranca: "Grupo → Empresa", override: true,  tipo: "financeiro", desc: "Centros de custo do grupo — empresa pode adicionar específicos" },
  { entidade: "CentroResultado",     heranca: "Grupo → Empresa", override: true,  tipo: "financeiro", desc: "Centros de resultado compartilhados" },
  { entidade: "FormaPagamento",      heranca: "Grupo → Empresa", override: true,  tipo: "financeiro", desc: "Formas de pagamento globais — empresa pode desativar" },
  { entidade: "TipoDespesa",         heranca: "Grupo → Empresa", override: true,  tipo: "financeiro", desc: "Tipos de despesa padronizados no grupo" },
  { entidade: "CondicaoComercial",   heranca: "Grupo → Empresa", override: true,  tipo: "financeiro", desc: "Condições comerciais herdadas — empresa pode customizar" },
  { entidade: "Banco",               heranca: "Grupo → Empresa", override: false, tipo: "financeiro", desc: "Bancos cadastrados no grupo — shared, sem override" },
  { entidade: "TabelaFiscal",        heranca: "Grupo → Empresa", override: false, tipo: "fiscal",     desc: "Tabelas fiscais (NCM/CEST/alíquotas) compartilhadas" },
  // RH
  { entidade: "Departamento",        heranca: "Grupo → Empresa", override: true,  tipo: "rh",         desc: "Estrutura organizacional herdada — empresa pode customizar" },
  { entidade: "Cargo",               heranca: "Grupo → Empresa", override: true,  tipo: "rh",         desc: "Cargos padrão do grupo" },
  { entidade: "Turno",               heranca: "Grupo → Empresa", override: true,  tipo: "rh",         desc: "Turnos de trabalho compartilhados" },
  // Catálogo
  { entidade: "GrupoProduto",        heranca: "Grupo → Empresa", override: false, tipo: "catalogo",   desc: "Grupos de produto definidos no grupo — sem override" },
  { entidade: "Marca",               heranca: "Grupo → Empresa", override: false, tipo: "catalogo",   desc: "Marcas centralizadas no grupo" },
  { entidade: "UnidadeMedida",       heranca: "Grupo → Empresa", override: false, tipo: "catalogo",   desc: "Unidades de medida padronizadas" },
  { entidade: "SetorAtividade",      heranca: "Grupo → Empresa", override: false, tipo: "catalogo",   desc: "Setores de atividade do grupo" },
  // Logística
  { entidade: "TipoFrete",           heranca: "Grupo → Empresa", override: true,  tipo: "logistica",  desc: "Tipos de frete compartilhados — empresa pode adicionar" },
  { entidade: "TabelaPreco",         heranca: "Grupo → Empresa", override: true,  tipo: "comercial",  desc: "Tabelas de preço do grupo propagadas para empresas" },
];

const TIPO_COLOR = {
  toggle:     "bg-amber-100 text-amber-800",
  rbac:       "bg-purple-100 text-purple-800",
  financeiro: "bg-blue-100 text-blue-800",
  fiscal:     "bg-orange-100 text-orange-800",
  rh:         "bg-teal-100 text-teal-800",
  catalogo:   "bg-slate-100 text-slate-700",
  logistica:  "bg-cyan-100 text-cyan-800",
  comercial:  "bg-green-100 text-green-800",
};

export default function HerancaConfigNotice({ entidade = null }) {
  const { grupoAtual, estaNoGrupo, empresaAtual } = useContextoVisual();
  const [expanded, setExpanded] = useState(false);
  const [verificando, setVerificando] = useState(false);
  const [liveStatus, setLiveStatus] = useState({}); // { entidade: { count, ok } }

  if (!grupoAtual) return null;

  const politicasFiltradas = entidade
    ? POLITICAS.filter(p => p.entidade.includes(entidade))
    : POLITICAS;

  // Verifica contagem via countEntities (não traz registros — mais rápido, evita 429)
  const handleVerificarLive = async () => {
    setVerificando(true);
    const novo = {};
    const lista = politicasFiltradas.slice(0, 8); // máx 8 para não sobrecarregar
    for (const p of lista) {
      try {
        const res = await base44.functions.invoke('countEntities', {
          entityName: p.entidade,
          filter: { group_id: grupoAtual.id },
        });
        const count = res?.data?.count ?? 0;
        novo[p.entidade] = { ok: count > 0, count };
      } catch (_) {
        novo[p.entidade] = { ok: null, count: 0 };
      }
      await new Promise(r => setTimeout(r, 150));
    }
    setLiveStatus(novo);
    setVerificando(false);
  };

  return (
    <div className="w-full rounded-lg border border-indigo-200 bg-indigo-50 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-indigo-100 transition-colors"
        onClick={() => setExpanded(o => !o)}
      >
        <div className="flex items-center gap-2 flex-wrap">
          <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-sm font-medium text-indigo-900">
            Políticas de Herança — {estaNoGrupo
              ? `Grupo: ${grupoAtual.nome_do_grupo}`
              : `Empresa: ${empresaAtual?.nome_fantasia || empresaAtual?.razao_social}`}
          </span>
          <Badge className="bg-indigo-100 text-indigo-700 text-[10px] border-indigo-200">
            {politicasFiltradas.length} entidade(s) · {estaNoGrupo ? 'Modo Grupo' : 'Override permitido'}
          </Badge>
        </div>
        {expanded
          ? <ChevronDown className="w-4 h-4 text-indigo-500 shrink-0" />
          : <ChevronRight className="w-4 h-4 text-indigo-500 shrink-0" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-indigo-200 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-xs text-indigo-700 flex items-center gap-1">
              <Info className="w-3 h-3 shrink-0" />
              Config criada no Grupo → propagada automaticamente para todas as Empresas via <strong>syncBidirectional</strong>. Override permitido quando indicado.
            </p>
            <Button
              size="sm" variant="outline"
              onClick={handleVerificarLive}
              disabled={verificando}
              className="gap-1.5 text-[10px] h-6 border-indigo-300 text-indigo-700 hover:bg-indigo-100"
            >
              {verificando ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Verificar Live (top 8)
            </Button>
          </div>

          {/* Tabela de políticas */}
          <div className="overflow-x-auto rounded border border-indigo-100 bg-white">
            <table className="w-full text-xs">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-indigo-800">Entidade</th>
                  <th className="text-left px-3 py-2 font-semibold text-indigo-800">Tipo</th>
                  <th className="text-left px-3 py-2 font-semibold text-indigo-800 hidden md:table-cell">Política</th>
                  <th className="text-left px-3 py-2 font-semibold text-indigo-800">Override</th>
                  <th className="text-left px-3 py-2 font-semibold text-indigo-800">Live</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {politicasFiltradas.map(p => {
                  const live = liveStatus[p.entidade];
                  return (
                    <tr key={p.entidade} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-1.5 font-mono font-medium text-slate-800 whitespace-nowrap">{p.entidade}</td>
                      <td className="px-3 py-1.5">
                        <Badge className={`text-[9px] px-1.5 py-0 ${TIPO_COLOR[p.tipo] || 'bg-slate-100 text-slate-700'}`}>
                          {p.tipo}
                        </Badge>
                      </td>
                      <td className="px-3 py-1.5 text-slate-500 hidden md:table-cell max-w-xs truncate" title={p.desc}>
                        {p.desc}
                      </td>
                      <td className="px-3 py-1.5">
                        {p.override
                          ? <span className="text-green-700 font-medium">✓ Sim</span>
                          : <span className="text-slate-400">— Não</span>
                        }
                      </td>
                      <td className="px-3 py-1.5">
                        {live === undefined ? (
                          <span className="text-slate-400 italic">—</span>
                        ) : live.ok === true ? (
                          <span className="flex items-center gap-1 text-green-700 font-medium">
                            <CheckCircle2 className="w-3 h-3" />
                            {live.count}
                          </span>
                        ) : live.ok === false ? (
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertCircle className="w-3 h-3" />
                            0
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Aviso de contexto */}
          <div className={`p-2 rounded border text-xs ${estaNoGrupo
            ? 'bg-blue-50 border-blue-200 text-blue-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}>
            {estaNoGrupo
              ? '🔵 Contexto Grupo — Alterações aqui propagam via syncBidirectional para TODAS as empresas filhas.'
              : '🟡 Contexto Empresa — Alterações aqui sobrescrevem apenas esta empresa. Grupo não é afetado.'
            }
          </div>
        </div>
      )}
    </div>
  );
}