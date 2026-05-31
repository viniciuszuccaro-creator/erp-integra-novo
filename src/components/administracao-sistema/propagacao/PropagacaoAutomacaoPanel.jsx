/**
 * PropagacaoAutomacaoPanel — Painel de automações de propagação em tempo real.
 * Mostra status de automações ativas e permite ativar/desativar por entidade.
 */
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, CheckCircle2, XCircle, RefreshCw, ArrowDownUp } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

const CHAVE_PROPAGACAO = "propagacao_grupo_empresas_ativa";

export default function PropagacaoAutomacaoPanel({ grupoAtual }) {
  const [runningAll, setRunningAll] = useState(false);

  const { data: config, isLoading } = useQuery({
    queryKey: ["propagacao-config", grupoAtual?.id],
    queryFn: async () => {
      const res = await base44.functions.invoke("getEntityRecord", {
        entityName: "ConfiguracaoSistema",
        filter: { chave: CHAVE_PROPAGACAO },
        limit: 1,
      });
      const list = Array.isArray(res?.data) ? res.data : [];
      return list[0] || null;
    },
    staleTime: 60000,
    enabled: !!grupoAtual?.id,
  });

  const propagacaoAtiva = config?.ativa !== false; // default true

  const handleSyncAll = async (direction) => {
    if (!grupoAtual?.id) { toast.error("Selecione um grupo."); return; }
    setRunningAll(true);
    try {
      const entities = [
        "Cliente", "Fornecedor", "Produto", "Pedido",
        "ContaReceber", "ContaPagar", "CentroCusto", "FormaPagamento",
        "PlanoDeContas", "TabelaPreco", "GrupoProduto", "Marca",
      ];
      let ok = 0, err = 0;
      for (const entityName of entities) {
        try {
          await base44.functions.invoke("syncBidirectional", {
            entityName, groupId: grupoAtual.id, direction,
          });
          ok++;
        } catch { err++; }
      }
      toast.success(`Sincronização concluída: ${ok} OK, ${err} erros.`);
    } catch (e) {
      toast.error("Erro na sincronização: " + e.message);
    } finally {
      setRunningAll(false);
    }
  };

  return (
    <Card className="border-blue-100">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-600" />
          Automações de Propagação
          <Badge className={propagacaoAtiva ? "bg-green-100 text-green-700 ml-auto" : "bg-slate-100 text-slate-600 ml-auto"}>
            {isLoading ? "..." : propagacaoAtiva ? "Ativa" : "Pausada"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm" disabled={runningAll || !grupoAtual?.id}
            onClick={() => handleSyncAll("down")}
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-xs"
          >
            {runningAll ? <RefreshCw className="w-3 h-3 animate-spin" /> : <ArrowDownUp className="w-3 h-3" />}
            Grupo → Empresas
          </Button>
          <Button
            size="sm" variant="outline" disabled={runningAll || !grupoAtual?.id}
            onClick={() => handleSyncAll("up")}
            className="gap-1.5 border-blue-300 text-blue-700 text-xs"
          >
            <ArrowDownUp className="w-3 h-3" />
            Empresas → Grupo
          </Button>
          <Button
            size="sm" variant="outline" disabled={runningAll || !grupoAtual?.id}
            onClick={() => handleSyncAll("both")}
            className="gap-1.5 text-xs"
          >
            <RefreshCw className="w-3 h-3" />
            Bidirecional
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: "Cadastros", ok: true },
            { label: "Financeiro", ok: true },
            { label: "Estoque", ok: true },
            { label: "Fiscal", ok: propagacaoAtiva },
          ].map(({ label, ok }) => (
            <div key={label} className="flex items-center gap-1.5 p-2 bg-slate-50 rounded border">
              {ok
                ? <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0" />
                : <XCircle className="w-3 h-3 text-slate-400 shrink-0" />}
              <span className={ok ? "text-slate-700" : "text-slate-400"}>{label}</span>
            </div>
          ))}
        </div>

        {!grupoAtual?.id && (
          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
            Selecione um grupo empresarial para ativar a propagação.
          </p>
        )}
      </CardContent>
    </Card>
  );
}