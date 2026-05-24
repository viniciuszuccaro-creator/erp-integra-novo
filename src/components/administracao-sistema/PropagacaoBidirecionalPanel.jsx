/**
 * PropagacaoBidirecionalPanel — Painel de controle da propagação Grupo ↔ Empresas
 * Permite disparar propagação manual com seleção de direção, entidades e estratégia.
 */
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, ArrowDown, ArrowUp, RefreshCw, CheckCircle, AlertCircle, Building2 } from "lucide-react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const ENTIDADES_GRUPOS = {
  "Financeiro": ["PlanoDeContas", "CentroCusto", "CentroResultado", "TipoDespesa", "MoedaIndice", "FormaPagamento", "Banco"],
  "Produtos": ["GrupoProduto", "Marca", "SetorAtividade", "UnidadeMedida", "Servico", "TabelaPreco"],
  "Logística": ["TipoFrete", "LocalEstoque", "RotaPadrao", "Transportadora"],
  "Organizacional": ["Cargo", "Departamento", "Turno", "PerfilAcesso"],
  "Comercial": ["SegmentoCliente", "RegiaoAtendimento", "CondicaoComercial"],
};

export default function PropagacaoBidirecionalPanel() {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const [direction, setDirection] = useState("grupo_to_empresas");
  const [strategy, setStrategy] = useState("merge");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState(null);

  const groupId = grupoAtual?.id;
  const empresaId = empresaAtual?.id;

  const canRun = !!(groupId || empresaId);

  const handlePropagar = async () => {
    if (!canRun) {
      toast.error("Selecione um grupo ou empresa para propagar.");
      return;
    }
    setLoading(true);
    setLastResult(null);
    try {
      const res = await base44.functions.invoke("propagateGroupConfigs", {
        group_id: groupId || null,
        empresa_id: empresaId || null,
        direction,
        strategy,
      });
      const data = res?.data;
      if (data?.ok) {
        const total = (data.results || []).reduce((s, r) => s + (r.created || 0) + (r.updated || 0), 0);
        toast.success(`✅ Propagação concluída! ${total} registros afetados.`);
        setLastResult(data);
      } else {
        toast.error("Erro na propagação: " + (data?.error || "resposta inválida"));
      }
    } catch (err) {
      toast.error("Erro: " + String(err?.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ArrowDownUp className="w-4 h-4 text-blue-600" />
          Propagação Bidirecional
          <Badge variant="outline" className="text-xs ml-1 border-blue-200 text-blue-700">
            {groupId ? `Grupo: ${grupoAtual?.nome_do_grupo || groupId}` : empresaAtual?.nome_fantasia || empresaId || "Sem escopo"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Direção */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: "grupo_to_empresas", label: "Grupo → Empresas", icon: ArrowDown, desc: "Replica dados do Grupo para todas as Empresas" },
            { value: "empresa_to_grupo", label: "Empresa → Grupo", icon: ArrowUp, desc: "Sobe dados da Empresa para o Grupo" },
            { value: "ambos", label: "Ambas direções", icon: ArrowDownUp, desc: "Sincronização completa bidirecional" },
          ].map(opt => {
            const Icon = opt.icon;
            const active = direction === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setDirection(opt.value)}
                className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-left transition-all ${
                  active ? "border-blue-500 bg-blue-50 text-blue-900" : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-4 h-4 ${active ? "text-blue-600" : "text-slate-400"}`} />
                  <span className="text-sm font-medium">{opt.label}</span>
                </div>
                <p className="text-xs text-slate-500 leading-tight">{opt.desc}</p>
              </button>
            );
          })}
        </div>

        {/* Estratégia */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-slate-700">Estratégia:</span>
          <Select value={strategy} onValueChange={setStrategy}>
            <SelectTrigger className="w-40 h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="merge">Merge (preencher vazios)</SelectItem>
              <SelectItem value="override">Sobrescrever tudo</SelectItem>
              <SelectItem value="skip">Pular existentes</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-slate-400">
            {strategy === "merge" && "Apenas preenche campos nulos — não sobrescreve."}
            {strategy === "override" && "Substitui todos os campos nos registros existentes."}
            {strategy === "skip" && "Ignora registros já existentes, cria apenas novos."}
          </span>
        </div>

        {/* Entidades cobertas */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-slate-600">Entidades cobertas:</p>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(ENTIDADES_GRUPOS).map(([grupo, lista]) => (
              <div key={grupo} className="flex items-center gap-1">
                <Badge variant="outline" className="text-[10px] text-slate-600 border-slate-200">
                  {grupo} ({lista.length})
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Botão */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePropagar}
            disabled={loading || !canRun}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            data-action="PropagacaoBidirecional.executar"
          >
            {loading ? (
              <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Propagando…</>
            ) : (
              <><ArrowDownUp className="w-4 h-4 mr-2" />Propagar Agora</>
            )}
          </Button>
          {!canRun && (
            <span className="text-xs text-amber-600">⚠ Selecione um grupo ou empresa</span>
          )}
        </div>

        {/* Resultado */}
        {lastResult && (
          <div className="mt-2 p-3 rounded-lg bg-green-50 border border-green-200 space-y-2">
            <div className="flex items-center gap-2 text-green-700 font-medium text-sm">
              <CheckCircle className="w-4 h-4" />
              Propagação concluída
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(lastResult.results || []).filter(r => r.created > 0 || r.updated > 0).slice(0, 12).map((r, i) => (
                <div key={i} className="text-xs text-green-700 bg-green-100 rounded px-2 py-1">
                  <span className="font-medium">{r.entity}</span>: +{r.created || 0} / ~{r.updated || 0}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}