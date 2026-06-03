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
  { entidade: "ConfiguracaoSistema", heranca: "Grupo → Empresa", override: true,  tipo: "toggle" },
  { entidade: "PerfilAcesso",        heranca: "Grupo → Empresa", override: true,  tipo: "rbac" },
  { entidade: "PlanoDeContas",       heranca: "Grupo → Empresa", override: true,  tipo: "financeiro" },
  { entidade: "CentroCusto",         heranca: "Grupo → Empresa", override: true,  tipo: "financeiro" },
  { entidade: "Departamento",        heranca: "Grupo → Empresa", override: true,  tipo: "rh" },
  { entidade: "Cargo",               heranca: "Grupo → Empresa", override: true,  tipo: "rh" },
  { entidade: "Turno",               heranca: "Grupo → Empresa", override: true,  tipo: "rh" },
  { entidade: "FormaPagamento",      heranca: "Grupo → Empresa", override: true,  tipo: "financeiro" },
  { entidade: "TipoDespesa",         heranca: "Grupo → Empresa", override: true,  tipo: "financeiro" },
  { entidade: "GrupoProduto",        heranca: "Grupo → Empresa", override: false, tipo: "catalogo" },
  { entidade: "Marca",               heranca: "Grupo → Empresa", override: false, tipo: "catalogo" },
  { entidade: "UnidadeMedida",       heranca: "Grupo → Empresa", override: false, tipo: "catalogo" },
  { entidade: "SetorAtividade",      heranca: "Grupo → Empresa", override: false, tipo: "catalogo" },
];

const TIPO_COLOR = {
  toggle:     "bg-amber-100 text-amber-800",
  rbac:       "bg-purple-100 text-purple-800",
  financeiro: "bg-blue-100 text-blue-800",
  rh:         "bg-teal-100 text-teal-800",
  catalogo:   "bg-slate-100 text-slate-700",
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

  // Verifica quantos registros cada entidade tem no grupo
  const handleVerificarLive = async () => {
    setVerificando(true);
    const novo = {};
    for (const p of politicasFiltradas.slice(0, 6)) { // limita a 6 para evitar 429
      try {
        const res = await base44.functions.invoke('getEntityRecord', {
          entityName: p.entidade,
          filter: { group_id: grupoAtual.id },
          limit: 1,
        });
        const items = Array.isArray(res?.data) ? res.data : [];
        novo[p.entidade] = { ok: items.length > 0, count: items.length };
      } catch (_) {
        novo[p.entidade] = { ok: null, count: 0 };
      }
      // pequena pausa entre chamadas para evitar 429
      await new Promise(r => setTimeout(r, 200));
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
              Config criada no Grupo → propagada automaticamente para todas as Empresas. Empresas podem sobrescrever (quando permitido).
            </p>
            <Button
              size="sm" variant="outline"
              onClick={handleVerificarLive}
              disabled={verificando}
              className="gap-1.5 text-[10px] h-6 border-indigo-300 text-indigo-700 hover:bg-indigo-100"
            >
              {verificando ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              Verificar Live (top 6)
            </Button>
          </div>

          {/* Tabela de políticas */}
          <div className="overflow-x-auto rounded border border-indigo-100 bg-white">
            <table className="w-full text-xs">
              <thead className="bg-indigo-50">
                <tr>
                  <th className="text-left px-3 py-2 font-semibold text-indigo-800">Entidade</th>
                  <th className="text-left px-3 py-2 font-semibold text-indigo-800">Tipo</th>
                  <th className="text-left px-3 py-2 font-semibold text-indigo-800">Herança</th>
                  <th className="text-left px-3 py-2 font-semibold text-indigo-800">Override</th>
                  <th className="text-left px-3 py-2 font-semibold text-indigo-800">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {politicasFiltradas.map(p => {
                  const live = liveStatus[p.entidade];
                  return (
                    <tr key={p.entidade} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-1.5 font-mono font-medium text-slate-800">{p.entidade}</td>
                      <td className="px-3 py-1.5">
                        <Badge className={`text-[9px] px-1.5 py-0 ${TIPO_COLOR[p.tipo] || 'bg-slate-100 text-slate-700'}`}>
                          {p.tipo}
                        </Badge>
                      </td>
                      <td className="px-3 py-1.5 text-blue-700">{p.heranca}</td>
                      <td className="px-3 py-1.5">
                        {p.override
                          ? <span className="text-green-700">✓ Sim</span>
                          : <span className="text-slate-500">— Não</span>
                        }
                      </td>
                      <td className="px-3 py-1.5">
                        {live === undefined ? (
                          <span className="text-slate-400 italic">—</span>
                        ) : live.ok === true ? (
                          <span className="flex items-center gap-1 text-green-700">
                            <CheckCircle2 className="w-3 h-3" />
                            {live.count > 0 ? `${live.count} reg.` : 'OK'}
                          </span>
                        ) : live.ok === false ? (
                          <span className="flex items-center gap-1 text-amber-600">
                            <AlertCircle className="w-3 h-3" />
                            Vazio
                          </span>
                        ) : (
                          <span className="text-slate-400">Erro</span>
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