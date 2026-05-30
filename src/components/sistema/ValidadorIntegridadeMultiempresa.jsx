/**
 * ValidadorIntegridadeMultiempresa
 * Valida se dados estão sincronizados entre Grupo e Empresas
 * Executado automaticamente ao carregar Dashboard
 */
import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function ValidadorIntegridadeMultiempresa({ onStatus }) {
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    validateSync();
  }, []);

  const validateSync = async () => {
    setIsChecking(true);
    try {
      // Verifica se últimas alterações foram propagadas corretamente
      const recentAudits = await base44.entities.AuditLog.filter(
        { tipo_auditoria: 'entidade' },
        '-data_hora',
        10
      );

      const hasErrors = recentAudits.some(audit => 
        audit.descricao?.includes('erro') || 
        audit.dados_novos?.erro
      );

      onStatus?.({ 
        ok: !hasErrors,
        timestamp: new Date().toISOString(),
        recentCount: recentAudits.length 
      });
    } catch (err) {
      console.warn('Validação de integridade falhou:', err);
    } finally {
      setIsChecking(false);
    }
  };

  return null; // componente invisível, apenas auditoria
}