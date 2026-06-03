/**
 * HerancaConfigNotice v2.0
 * Exibe banner de herança quando uma config vem do Grupo.
 * Documenta a política Grupo → Empresa com opção de override.
 */
import React, { useState } from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Layers, ChevronDown, ChevronRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const POLITICAS = [
  { entidade: "ConfiguracaoSistema", descricao: "Toggles do sistema herdados do grupo, override por empresa permitido" },
  { entidade: "PerfilAcesso", descricao: "Perfis criados no grupo disponíveis em todas as empresas" },
  { entidade: "PlanoDeContas", descricao: "Estrutura contábil propagada do grupo para empresas" },
  { entidade: "CentroCusto", descricao: "Centros de custo do grupo replicados nas empresas" },
  { entidade: "Departamento/Cargo", descricao: "Estrutura organizacional propagada do grupo" },
  { entidade: "Catálogos (Marca, Grupo, Unidade)", descricao: "Compartilhados automaticamente com todas empresas" },
];

export default function HerancaConfigNotice({ entidade = null }) {
  const { grupoAtual, estaNoGrupo, empresaAtual } = useContextoVisual();
  const [expanded, setExpanded] = useState(false);

  if (!grupoAtual) return null;

  const politicaFiltrada = entidade
    ? POLITICAS.filter(p => p.entidade.includes(entidade))
    : POLITICAS;

  return (
    <div className="w-full rounded-lg border border-indigo-200 bg-indigo-50 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-indigo-100 transition-colors"
        onClick={() => setExpanded(o => !o)}
      >
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600 shrink-0" />
          <span className="text-sm font-medium text-indigo-900">
            Políticas de Herança — {estaNoGrupo ? `Grupo: ${grupoAtual.nome_do_grupo}` : `Empresa: ${empresaAtual?.nome_fantasia || empresaAtual?.razao_social}`}
          </span>
          <Badge className="bg-indigo-100 text-indigo-700 text-[10px] border-indigo-200">
            {estaNoGrupo ? "Modo Grupo" : "Empresa pode sobrescrever"}
          </Badge>
        </div>
        {expanded
          ? <ChevronDown className="w-4 h-4 text-indigo-500" />
          : <ChevronRight className="w-4 h-4 text-indigo-500" />
        }
      </button>

      {expanded && (
        <div className="px-4 pb-4 pt-1 space-y-2 border-t border-indigo-200">
          <p className="text-xs text-indigo-700 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Regra: config criada no Grupo é propagada para todas as Empresas. Empresas podem sobrescrever.
          </p>
          <div className="space-y-1.5">
            {politicaFiltrada.map(p => (
              <div key={p.entidade} className="flex items-start gap-2 text-xs">
                <span className="font-mono font-semibold text-indigo-800 shrink-0">{p.entidade}</span>
                <span className="text-slate-600">— {p.descricao}</span>
              </div>
            ))}
          </div>
          {!estaNoGrupo && (
            <div className="mt-2 p-2 bg-white/60 rounded border border-indigo-200 text-xs text-indigo-800">
              ℹ️ Você está no contexto <strong>Empresa</strong>. Alterações aqui sobrescrevem apenas esta empresa, não afetam o grupo.
            </div>
          )}
          {estaNoGrupo && (
            <div className="mt-2 p-2 bg-white/60 rounded border border-indigo-200 text-xs text-indigo-800">
              ℹ️ Você está no contexto <strong>Grupo</strong>. Alterações aqui propagam para TODAS as empresas via syncBidirectional.
            </div>
          )}
        </div>
      )}
    </div>
  );
}