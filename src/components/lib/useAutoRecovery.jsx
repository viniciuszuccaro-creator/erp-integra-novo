/**
 * useAutoRecovery v1.0
 * Recuperação automática inteligente quando circuit abre
 * Regra-Mãe: resiliente, adaptável, IA-driven
 */
import { useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';

const RECOVERY_STRATEGIES = {
  LINEAR: (attempt) => 1000 * (attempt + 1), // 1s, 2s, 3s...
  EXPONENTIAL: (attempt) => 1000 * Math.pow(2, attempt), // 1s, 2s, 4s, 8s...
  FIBONACCI: (attempt) => 1000 * [1, 1, 2, 3, 5, 8, 13][Math.min(attempt, 6)],
};

export default function useAutoRecovery(
  isCircuitOpen = false,
  entityName = 'Unknown',
  options = {}
) {
  const { toast } = useToast();
  const attemptRef = useRef(0);
  const timeoutRef = useRef(null);
  const recoveryLogRef = useRef([]);

  const strategy = options.strategy || 'EXPONENTIAL';
  const maxAttempts = options.maxAttempts || 5;
  const onRecoverySuccess = options.onRecoverySuccess;

  const scheduleRecovery = useCallback(async () => {
    if (attemptRef.current >= maxAttempts) {
      toast({
        title: `⚠️ ${entityName}`,
        description: `Máximo de tentativas atingido. Entre em contato com suporte.`,
        variant: 'destructive',
      });
      return;
    }

    const delayMs = RECOVERY_STRATEGIES[strategy](attemptRef.current);
    const nextAttempt = attemptRef.current + 1;

    toast({
      title: `🔄 Recuperando ${entityName}`,
      description: `Tentativa ${nextAttempt}/${maxAttempts} em ${(delayMs / 1000).toFixed(0)}s...`,
    });

    // Log de recuperação
    recoveryLogRef.current.push({
      attempt: nextAttempt,
      delayMs,
      timestamp: new Date().toISOString(),
      status: 'scheduled',
    });

    timeoutRef.current = setTimeout(async () => {
      try {
        // Testar reconexão
        const testResult = await base44.entities.AuditLog.filter({}, '-data_hora', 1);
        if (testResult) {
          // Sucesso!
          attemptRef.current = 0;
          toast({
            title: `✅ ${entityName}`,
            description: `Sistema recuperado com sucesso.`,
          });

          // Log de sucesso
          recoveryLogRef.current[recoveryLogRef.current.length - 1].status = 'success';

          if (onRecoverySuccess) onRecoverySuccess();

          // Auditoria
          try {
            await base44.entities.AuditLog.create({
              usuario: 'Sistema',
              acao: 'Recuperação',
              modulo: 'Sistema',
              tipo_auditoria: 'sistema',
              entidade: entityName,
              descricao: `Auto-recovery bem-sucedido após ${nextAttempt} tentativa(s)`,
              dados_novos: { strategy, delayMs },
              data_hora: new Date().toISOString(),
            });
          } catch (_) {}
        }
      } catch (error) {
        // Falhou, agenda próxima tentativa
        recoveryLogRef.current[recoveryLogRef.current.length - 1].status = 'failed';
        attemptRef.current++;
        scheduleRecovery();
      }
    }, delayMs);
  }, [entityName, strategy, maxAttempts, toast, onRecoverySuccess]);

  // Iniciar recuperação quando circuit abrir
  useEffect(() => {
    if (isCircuitOpen) {
      attemptRef.current = 0;
      scheduleRecovery();
    } else {
      // Limpar timeout se circuit voltar ao normal
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      attemptRef.current = 0;
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [isCircuitOpen, scheduleRecovery]);

  return {
    recoveryLogs: recoveryLogRef.current,
    currentAttempt: attemptRef.current,
    maxAttempts,
  };
}