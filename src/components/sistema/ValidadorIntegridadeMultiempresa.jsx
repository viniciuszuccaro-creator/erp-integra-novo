/**
 * ValidadorIntegridadeMultiempresa v2
 * Verifica sincronização real Grupo↔Empresas com evidências do AuditLog.
 * Componente invisível — executa ao montar e repassa status via onStatus.
 */
import { useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutos

export default function ValidadorIntegridadeMultiempresa({ onStatus, groupId }) {
  const timerRef = useRef(null);

  const validateSync = async () => {
    try {
      const since = Date.now() - 24 * 60 * 60 * 1000;

      // Coleta em paralelo: logs de entidade + propagação
      const [auditLogs, propagLogs] = await Promise.allSettled([
        base44.entities.AuditLog.filter({ tipo_auditoria: 'entidade' }, '-data_hora', 50),
        base44.entities.AuditLog.filter({ tipo_auditoria: 'sistema'  }, '-data_hora', 50),
      ]);

      const audits = auditLogs.status  === 'fulfilled' ? (auditLogs.value  || []) : [];
      const propags = propagLogs.status === 'fulfilled' ? (propagLogs.value || []) : [];

      const recentAudits = audits.filter(l =>
        new Date(l?.data_hora || l?.created_date || 0).getTime() >= since
      );
      const recentPropags = propags.filter(l =>
        new Date(l?.data_hora || l?.created_date || 0).getTime() >= since &&
        /propag|sincroniz|syncBidirect|DOWN|UP/i.test(l?.descricao || '')
      );

      const errors = recentAudits.filter(l =>
        /erro|error|failed|falhou/i.test(l?.descricao || '') ||
        l?.dados_novos?.erro
      );

      const syncErrors = recentPropags.filter(l =>
        /error|erro|failed/i.test(l?.descricao || '')
      );

      onStatus?.({
        ok: errors.length === 0 && syncErrors.length === 0,
        timestamp: new Date().toISOString(),
        recentOps: recentAudits.length,
        recentPropagations: recentPropags.length,
        errors: errors.length,
        syncErrors: syncErrors.length,
      });
    } catch (err) {
      onStatus?.({ ok: false, timestamp: new Date().toISOString(), error: err.message });
    }
  };

  useEffect(() => {
    validateSync();
    timerRef.current = setInterval(validateSync, CHECK_INTERVAL_MS);
    return () => clearInterval(timerRef.current);
  }, [groupId]);

  return null;
}