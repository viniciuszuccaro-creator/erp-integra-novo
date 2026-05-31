/**
 * useSimulate429s v1.0
 * Simula erros 429 para testar circuit breaker
 * Regra-Mãe: testes determinísticos, auditáveis
 */
import { useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from './useContextoVisual';

export default function useSimulate429s() {
  const { toast } = useToast();
  const { empresaAtual } = useContextoVisual();
  const simulationLogRef = useRef([]);

  const simulate429 = useCallback(async (options = {}) => {
    const {
      entityName = 'TestEntity',
      errorCount = 1,
      delayBetweenErrors = 1000,
      shouldTriggerCircuitBreaker = false,
    } = options;

    toast({
      title: '🧪 Iniciando Simulação',
      description: `Simulando ${errorCount} erro(s) 429 em ${entityName}`,
    });

    const simulationId = `sim_${Date.now()}`;
    const logEntry = {
      id: simulationId,
      entityName,
      errorCount,
      startTime: new Date().toISOString(),
      events: [],
      status: 'running',
    };

    for (let i = 0; i < errorCount; i++) {
      try {
        // Simular chamada que retorna 429
        const mockError = {
          status: 429,
          message: 'Too Many Requests',
          timestamp: new Date().toISOString(),
          attempt: i + 1,
        };

        logEntry.events.push({
          attempt: i + 1,
          timestamp: mockError.timestamp,
          result: 'error_429',
          shouldTriggerCircuitBreaker: shouldTriggerCircuitBreaker && i === errorCount - 1,
        });

        // Log em AuditLog
        await base44.entities.AuditLog.create({
          usuario: 'Teste',
          acao: 'Simulação',
          modulo: 'Sistema',
          tipo_auditoria: 'teste',
          entidade: entityName,
          descricao: `Simulação 429 #${i + 1}/${errorCount} (${shouldTriggerCircuitBreaker ? 'com' : 'sem'} circuit breaker)`,
          empresa_id: empresaAtual?.id,
          dados_novos: mockError,
          data_hora: new Date().toISOString(),
        });

        toast({
          title: `⚠️ Erro 429 #${i + 1}`,
          description: `Entidade: ${entityName}`,
          variant: 'destructive',
        });

        // Delay entre erros
        if (i < errorCount - 1) {
          await new Promise(r => setTimeout(r, delayBetweenErrors));
        }
      } catch (error) {
        logEntry.events.push({
          attempt: i + 1,
          timestamp: new Date().toISOString(),
          result: 'unexpected_error',
          error: error.message,
        });
      }
    }

    logEntry.endTime = new Date().toISOString();
    logEntry.status = 'completed';
    simulationLogRef.current.push(logEntry);

    toast({
      title: '✅ Simulação Concluída',
      description: `${errorCount} erro(s) simulado(s)`,
    });

    return logEntry;
  }, [toast, empresaAtual?.id]);

  const getSimulationLog = useCallback(() => simulationLogRef.current, []);

  const clearSimulationLog = useCallback(() => {
    simulationLogRef.current = [];
  }, []);

  return {
    simulate429,
    getSimulationLog,
    clearSimulationLog,
    simulationCount: simulationLogRef.current.length,
  };
}