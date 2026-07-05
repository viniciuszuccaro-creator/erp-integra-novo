/**
 * PropagacaoStatusRealtime
 * Monitor de status de propagação com contadores em tempo real
 * Ideal para widget de admin
 */
import React, { useEffect, useState } from "react";
import { ArrowDownUp, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function PropagacaoStatusRealtime() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  useEffect(() => {
    checkPropagationStatus();
    const interval = setInterval(checkPropagationStatus, 30000); // a cada 30s
    return () => clearInterval(interval);
  }, [contextoKey]);

  const checkPropagationStatus = async () => {
    setLoading(true);
    try {
      const logs = await filterInContext('AuditLog',
        { entidade: 'PropagacaoGrupo' },
        '-data_hora',
        1
      );
      if (logs?.length) {
        const lastLog = logs[0];
        setStatus({
          ok: lastLog.dados_novos?.results?.every(r => r.created + r.updated > 0),
          timestamp: new Date(lastLog.data_hora).toLocaleTimeString('pt-BR'),
          resultados: lastLog.dados_novos?.results || []
        });
      }
    } catch (err) {
      console.error('Erro ao verificar propagação:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!status) return <div className="text-xs text-slate-500 text-center py-2">Aguardando dados...</div>;

  return (
    <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ArrowDownUp className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-slate-900">Propagação</span>
        </div>
        {status.ok ? (
          <CheckCircle2 className="w-4 h-4 text-green-600" />
        ) : (
          <AlertCircle className="w-4 h-4 text-yellow-600" />
        )}
      </div>
      <p className="text-slate-500 text-xs">{status.timestamp}</p>
      {loading && <Loader2 className="w-3 h-3 animate-spin text-blue-600 mt-2" />}
    </div>
  );
}