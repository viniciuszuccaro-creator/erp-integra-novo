/**
 * useIntelligentAlerts v1.0
 * Sistema de alertas inteligentes baseado em limites multiempresa
 * Regra-Mãe: notificações contextualizadas + IA
 */
import { useEffect, useState, useCallback } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from './useContextoVisual';

const DEFAULT_THRESHOLDS = {
  Cliente: { warning: 100, critical: 500 },
  Pedido: { warning: 50, critical: 200 },
  ContaReceber: { warning: 30, critical: 100 },
  ContaPagar: { warning: 20, critical: 80 },
  Produto: { warning: 200, critical: 1000 },
};

export default function useIntelligentAlerts(counts = {}, enabled = true) {
  const { toast } = useToast();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [alertedEntities, setAlertedEntities] = useState(new Set());

  const checkAlerts = useCallback(async () => {
    if (!enabled) return;

    for (const [entity, count] of Object.entries(counts)) {
      const threshold = DEFAULT_THRESHOLDS[entity];
      if (!threshold) continue;

      const key = `${entity}_${empresaAtual?.id || grupoAtual?.id}`;
      const wasAlerted = alertedEntities.has(key);

      // Alerta crítico
      if (count >= threshold.critical && !wasAlerted) {
        toast({
          title: `⚠️ ${entity} — Limite Crítico`,
          description: `${count} registros. Considera implementar paginação ou filtros.`,
          variant: 'destructive',
        });
        setAlertedEntities(prev => new Set([...prev, key]));

        // Log de alerta crítico
        try {
          await base44.entities.AuditLog.create({
            usuario: (await base44.auth.me())?.full_name || 'Sistema',
            acao: 'Alerta',
            modulo: 'Sistema',
            tipo_auditoria: 'sistema',
            entidade: entity,
            descricao: `Limite crítico atingido: ${count} registros`,
            empresa_id: empresaAtual?.id,
            grupo_id: grupoAtual?.id,
            dados_novos: { count, threshold },
            data_hora: new Date().toISOString(),
          });
        } catch (_) {}
      }
      // Alerta de aviso
      else if (count >= threshold.warning && !wasAlerted && count < threshold.critical) {
        toast({
          title: `🔔 ${entity} — Aviso`,
          description: `${count} registros. Monitorar crescimento.`,
        });
        setAlertedEntities(prev => new Set([...prev, key]));
      }
      // Reset quando volta ao normal
      else if (count < threshold.warning && wasAlerted) {
        setAlertedEntities(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    }
  }, [counts, empresaAtual?.id, grupoAtual?.id, alertedEntities, enabled, toast]);

  useEffect(() => {
    const interval = setInterval(checkAlerts, 10000); // Check a cada 10s
    return () => clearInterval(interval);
  }, [checkAlerts]);

  return { alertedEntities };
}