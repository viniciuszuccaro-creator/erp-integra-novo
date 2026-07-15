/**
 * useAdvancedNotifications v1.0
 * Notificações multi-canal (toast, email, WhatsApp, webhook)
 * Regra-Mãe: escalação automática, inteligente
 */
import { useCallback, useRef } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from './useContextoVisual';

const ESCALATION_LEVELS = {
  INFO: { channels: ['toast'], delay: 0 },
  WARNING: { channels: ['toast', 'email'], delay: 300000 }, // 5min
  CRITICAL: { channels: ['toast', 'email', 'whatsapp'], delay: 60000 }, // 1min
  EMERGENCY: { channels: ['toast', 'email', 'whatsapp', 'webhook'], delay: 0 },
};

export default function useAdvancedNotifications() {
  const { toast } = useToast();
  const { empresaAtual } = useContextoVisual();
  const notificationHistoryRef = useRef(new Map());

  const sendNotification = useCallback(async (
    message = {},
    level = 'WARNING'
  ) => {
    const {
      title = 'Notificação',
      description = '',
      entityName = 'Sistema',
      severity = 'medium'
    } = message;

    const config = ESCALATION_LEVELS[level] || ESCALATION_LEVELS.WARNING;
    const notificationKey = `${entityName}_${level}`;
    const lastNotifTime = notificationHistoryRef.current.get(notificationKey);

    // Evitar spam: não enviar se a mesma notificação foi enviada há menos de 5min
    if (lastNotifTime && (Date.now() - lastNotifTime) < 300000) {
      return;
    }

    // 1. Toast (imediato)
    if (config.channels.includes('toast')) {
      toast({
        title,
        description,
        variant: severity === 'critical' ? 'destructive' : 'default',
      });
    }

    // 2. Email (com delay)
    if (config.channels.includes('email')) {
      setTimeout(async () => {
        try {
          await base44.functions.invoke('sendEmailProvider', {
            to: empresaAtual?.admin_email || 'admin@system.local',
            subject: `🚨 ${title} - ${entityName}`,
            body: `
              <h2>${title}</h2>
              <p>${description}</p>
              <p><strong>Nível:</strong> ${level}</p>
              <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
            `,
          });
        } catch (_) { console.error('[lib] catch:', _); }
      }, config.delay);
    }

    // 3. WhatsApp (com delay)
    if (config.channels.includes('whatsapp')) {
      setTimeout(async () => {
        try {
          await base44.functions.invoke('whatsappSend', {
            phone: empresaAtual?.admin_whatsapp,
            message: `🚨 *${title}*\n\n${description}\n\nNível: ${level}\nData: ${new Date().toLocaleString('pt-BR')}`,
          });
        } catch (_) { console.error('[lib] catch:', _); }
      }, config.delay);
    }

    // 4. Webhook customizado
    if (config.channels.includes('webhook')) {
      setTimeout(async () => {
        try {
          const webhookUrl = empresaAtual?.webhook_url;
          if (webhookUrl) {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'SYSTEM_ALERT',
                level,
                title,
                description,
                entityName,
                timestamp: new Date().toISOString(),
                empresa_id: empresaAtual?.id,
              }),
            });
          }
        } catch (_) { console.error('[lib] catch:', _); }
      }, config.delay);
    }

    // Log em AuditLog
    try {
      await base44.entities.AuditLog.create({
        usuario: 'Sistema',
        acao: 'Notificação',
        modulo: 'Sistema',
        tipo_auditoria: 'sistema',
        entidade: entityName,
        descricao: `${level}: ${title}`,
        dados_novos: { channels: config.channels, message },
        empresa_id: empresaAtual?.id,
        data_hora: new Date().toISOString(),
      });
    } catch (_) { console.error('[lib] catch:', _); }

    notificationHistoryRef.current.set(notificationKey, Date.now());
  }, [toast, empresaAtual?.id, empresaAtual?.admin_email, empresaAtual?.admin_whatsapp, empresaAtual?.webhook_url]);

  return { sendNotification };
}