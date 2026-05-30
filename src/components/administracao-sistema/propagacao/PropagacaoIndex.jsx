import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowDownUp, CheckCircle2, AlertCircle, Loader2, Play } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";

/**
 * PropagacaoIndex v2.0
 * Controle centralizado de propagação Grupo ↔ Empresas
 * Monitora e executa sincronização bidirecional
 */

const ENTITIES_TO_PROPAGATE = [
  { name: "Cliente", label: "Clientes", icon: "👥" },
  { name: "Fornecedor", label: "Fornecedores", icon: "🏭" },
  { name: "Produto", label: "Produtos", icon: "📦" },
  { name: "Pedido", label: "Pedidos", icon: "📋" },
  { name: "ContaReceber", label: "Contas a Receber", icon: "💰" },
  { name: "ContaPagar", label: "Contas a Pagar", icon: "💸" },
  { name: "NotaFiscal", label: "Notas Fiscais", icon: "📄" },
  { name: "Entrega", label: "Entregas", icon: "🚚" },
];

export default function PropagacaoIndex() {
  const { grupoAtual, empresasDoGrupo } = useContextoVisual();
  const [status, setStatus] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Carregar status inicial
    checkPropagationStatus();
  }, []);

  const checkPropagationStatus = async () => {
    try {
      const result = {};
      for (const entity of ENTITIES_TO_PROPAGATE) {
        result[entity.name] = {
          status: "checking",
          message: "Verificando...",
        };
      }
      setStatus(result);

      // Mock: em produção seria chamada backend function
      await new Promise((r) => setTimeout(r, 500));
      const newStatus = {};
      ENTITIES_TO_PROPAGATE.forEach((e) => {
        newStatus[e.name] = {
          status: "ok",
          message: "Sincronizado",
          lastSync: new Date().toLocaleString("pt-BR"),
        };
      });
      setStatus(newStatus);
    } catch (err) {
      toast.error("Erro ao verificar status: " + err.message);
    }
  };

  const runPropagation = async (entityName, direction = "down") => {
    try {
      setLoading(true);
      const result = await base44.functions.invoke("propagateGroupData", {
        action: "create",
        entityName,
        groupId: grupoAtual?.id,
        mode: direction,
      });

      setStatus((prev) => ({
        ...prev,
        [entityName]: {
          status: "ok",
          message: `${result.data?.total_processados || 0} registros sincronizados`,
          lastSync: new Date().toLocaleString("pt-BR"),
        },
      }));
      toast.success(`${entityName} sincronizado com sucesso!`);
    } catch (err) {
      setStatus((prev) => ({
        ...prev,
        [entityName]: {
          status: "error",
          message: err.message,
        },
      }));
      toast.error(`Erro ao sincronizar ${entityName}: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!grupoAtual?.id) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-6 text-center text-amber-800">
          <AlertCircle className="w-6 h-6 mx-auto mb-2" />
          <p className="font-semibold">Selecione um grupo para usar propagação</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full h-full space-y-6">
      {/* ─ Header ─ */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Propagação Grupo ↔ Empresas</h2>
        <p className="text-sm text-slate-600">
          Sincronize cadastros e transações entre {grupoAtual.nome_do_grupo} e suas empresas.
        </p>
      </div>

      {/* ─ Status Overview ─ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ArrowDownUp className="w-5 h-5 text-blue-600" />
            Status de Sincronização
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ENTITIES_TO_PROPAGATE.map((entity) => {
              const st = status[entity.name];
              const isError = st?.status === "error";
              const isOk = st?.status === "ok";
              const isChecking = st?.status === "checking";

              return (
                <button
                  key={entity.name}
                  onClick={() => runPropagation(entity.name, "down")}
                  disabled={loading}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    isError
                      ? "border-red-200 bg-red-50"
                      : isOk
                        ? "border-green-200 bg-green-50 hover:shadow-md"
                        : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {entity.icon} {entity.label}
                      </p>
                      <p className="text-xs text-slate-600 mt-1">
                        {st?.message || "Aguardando..."}
                      </p>
                    </div>
                    {isChecking && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                    {isError && <AlertCircle className="w-4 h-4 text-red-600" />}
                    {isOk && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* ─ Tabelas ─ */}
      <div className="flex gap-2 mb-4">
        <Button
          variant={activeTab === "overview" ? "default" : "outline"}
          onClick={() => setActiveTab("overview")}
          size="sm"
        >
          Visão Geral
        </Button>
        <Button
          variant={activeTab === "empresas" ? "default" : "outline"}
          onClick={() => setActiveTab("empresas")}
          size="sm"
        >
          Empresas Vinculadas ({empresasDoGrupo.length})
        </Button>
        <Button
          variant={activeTab === "logs" ? "default" : "outline"}
          onClick={() => setActiveTab("logs")}
          size="sm"
        >
          Logs de Sincronização
        </Button>
      </div>

      {activeTab === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Resumo Executivo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-slate-600">Total de Empresas</p>
                <p className="text-2xl font-bold text-blue-600">{empresasDoGrupo.length}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-slate-600">Sincronizadas</p>
                <p className="text-2xl font-bold text-green-600">
                  {Object.values(status).filter((s) => s?.status === "ok").length}
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-sm text-slate-600">Com Erro</p>
                <p className="text-2xl font-bold text-red-600">
                  {Object.values(status).filter((s) => s?.status === "error").length}
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t">
              <Button
                onClick={() => {
                  ENTITIES_TO_PROPAGATE.forEach((e) => runPropagation(e.name, "down"));
                }}
                disabled={loading}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                {loading ? "Sincronizando..." : "Sincronizar Tudo"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "empresas" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Empresas do Grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {empresasDoGrupo.length === 0 ? (
                <p className="text-sm text-slate-600 text-center py-4">
                  Nenhuma empresa vinculada a este grupo
                </p>
              ) : (
                empresasDoGrupo.map((emp) => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-900">{emp.nome_fantasia || emp.razao_social}</p>
                      <p className="text-xs text-slate-600">{emp.cnpj}</p>
                    </div>
                    <Badge variant="outline">Ativo</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === "logs" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Última Sincronização</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 text-center py-6">
              Nenhum log de sincronização ainda. Execute uma sincronização para começar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}