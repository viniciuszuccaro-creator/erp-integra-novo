/**
 * PropagacaoEmpresaSelector — Seleciona empresa específica e faz sync direcionado
 * Pequeno componente focado, usado no PropagacaoIndex
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { ArrowDown, Loader2, Building2 } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function PropagacaoEmpresaSelector({ entityName, onResult }) {
  const { grupoAtual, empresasDoGrupo } = useContextoVisual();
  const [selectedEmpresa, setSelectedEmpresa] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSync = async () => {
    if (!selectedEmpresa || !grupoAtual?.id) {
      toast.error("Selecione uma empresa.");
      return;
    }
    setLoading(true);
    try {
      const res = await base44.functions.invoke("syncBidirectional", {
        entityName,
        groupId: grupoAtual.id,
        empresa_id: selectedEmpresa,
        direction: "down",
      });
      const total = res?.data?.total_processados ?? 0;
      toast.success(`${total} registro(s) sincronizados para a empresa selecionada.`);
      if (onResult) onResult(res?.data);
    } catch (e) {
      toast.error(e?.message || "Erro ao sincronizar.");
    } finally {
      setLoading(false);
    }
  };

  if (!empresasDoGrupo?.length) return null;

  return (
    <div className="flex items-center gap-2 flex-wrap mt-2">
      <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
      <select
        value={selectedEmpresa}
        onChange={e => setSelectedEmpresa(e.target.value)}
        className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        <option value="">Empresa específica…</option>
        {empresasDoGrupo.map(e => (
          <option key={e.id} value={e.id}>
            {e.nome_fantasia || e.razao_social}
          </option>
        ))}
      </select>
      <Button
        size="sm"
        variant="outline"
        disabled={!selectedEmpresa || loading}
        onClick={handleSync}
        className="text-xs gap-1 border-blue-300 text-blue-700 hover:bg-blue-50"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowDown className="w-3 h-3" />}
        Sync para esta empresa
      </Button>
    </div>
  );
}