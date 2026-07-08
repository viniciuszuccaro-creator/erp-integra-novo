/**
 * PropagacaoQuickActions — Widget compacto para ações rápidas de propagação.
 * Exibido no topo de qualquer módulo com contexto de Grupo ativo.
 * Permite disparar sync DOWN/UP de uma entidade específica sem ir à aba Propagação.
 */
import React, { useState } from "react";
import { ArrowDown, ArrowUp, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function PropagacaoQuickActions({ entityName, entityLabel }) {
  const { grupoAtual, empresaAtual, estaNoGrupo } = useContextoVisual();
  const [loadingDown, setLoadingDown] = useState(false);
  const [loadingUp, setLoadingUp] = useState(false);
  const [lastOk, setLastOk] = useState(null);

  if (!grupoAtual?.id) return null;

  const mapDirection = (dir) => {
    if (dir === "down") return "grupo_to_empresas";
    if (dir === "up") return "empresa_to_grupo";
    return "ambos";
  };

  const run = async (direction) => {
    const setLoading = direction === "down" ? setLoadingDown : setLoadingUp;
    setLoading(true);
    try {
      const payload = {
        group_id: grupoAtual.id,
        direction: mapDirection(direction),
        entidades: [entityName],
        strategy: "merge",
      };
      if (direction === "up") {
        payload.empresas_ids = empresaAtual?.id ? [empresaAtual.id] : [];
      }
      const res = await base44.functions.invoke("propagateGroupConfigs", payload);
      const results = Array.isArray(res?.data?.results) ? res.data.results : [];
      const entityResult = results.find(r => r.entity === entityName) || {};
      const total = (entityResult.created || 0) + (entityResult.updated || 0) + (entityResult.skipped || 0);
      setLastOk(direction);
      toast.success(`${entityLabel}: ${total} registro(s) sincronizado(s) [${direction}]`);
    } catch (err) {
      toast.error(`Erro ao sincronizar ${entityLabel}: ${err?.message || String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-slate-400 mr-1">Sync:</span>
      <Button
        size="sm"
        variant="ghost"
        disabled={loadingDown || loadingUp}
        onClick={() => run("down")}
        className="h-6 px-2 text-xs text-blue-600 hover:bg-blue-50"
        title={`Propagar ${entityLabel} do Grupo para Empresas`}
      >
        {loadingDown ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowDown className="w-3 h-3" />}
      </Button>
      <Button
        size="sm"
        variant="ghost"
        disabled={loadingDown || loadingUp}
        onClick={() => run("up")}
        className="h-6 px-2 text-xs text-indigo-600 hover:bg-indigo-50"
        title={`Propagar ${entityLabel} da Empresa para o Grupo`}
      >
        {loadingUp ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUp className="w-3 h-3" />}
      </Button>
      {lastOk && <CheckCircle2 className="w-3 h-3 text-green-500" />}
    </div>
  );
}