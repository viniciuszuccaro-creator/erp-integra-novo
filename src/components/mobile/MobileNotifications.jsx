/**
 * MobileNotifications v1.0
 * Sistema de notificações push e in-app para mobile
 * Regra-Mãe: push notifications, real-time, multi-canal
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, Check, X } from 'lucide-react';

const TIPOS_NOTIF = {
  pedido: { icon: '📦', cor: 'bg-blue-50', titulo: 'Novo Pedido' },
  pagamento: { icon: '💰', cor: 'bg-green-50', titulo: 'Pagamento' },
  estoque: { icon: '⚠️', cor: 'bg-red-50', titulo: 'Estoque Crítico' },
  alerta: { icon: '🔔', cor: 'bg-amber-50', titulo: 'Alerta' },
};

export default function MobileNotifications() {
  const [notificacoes, setNotificacoes] = useState([
    {
      id: 1,
      tipo: 'pedido',
      titulo: 'Pedido #5432',
      descricao: 'Novo pedido de Cliente A - R$ 2.450',
      timestamp: new Date(Date.now() - 5 * 60000),
      lida: false,
    },
    {
      id: 2,
      tipo: 'estoque',
      titulo: 'SKU-001',
      descricao: 'Estoque crítico - 5 unidades restantes',
      timestamp: new Date(Date.now() - 15 * 60000),
      lida: false,
    },
    {
      id: 3,
      tipo: 'pagamento',
      titulo: 'Pagamento Recebido',
      descricao: 'Cliente B pagou boleto - R$ 1.200',
      timestamp: new Date(Date.now() - 1 * 3600000),
      lida: true,
    },
  ]);

  const handleEnablePushNotifications = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('ERP Zuccaro', {
          body: 'Push notifications ativadas! ✅',
          icon: '🔔',
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((permission) => {
          if (permission === 'granted') {
            new Notification('ERP Zuccaro', {
              body: 'Push notifications ativadas! ✅',
              icon: '🔔',
            });
          }
        });
      }
    }
  };

  const handleMarkAsRead = (id) => {
    setNotificacoes(notificacoes.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const handleDismiss = (id) => {
    setNotificacoes(notificacoes.filter((n) => n.id !== id));
  };

  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-indigo-50 overflow-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            Notificações
          </h2>
          <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">{naoLidas}</span>
        </div>

        <Button
          onClick={handleEnablePushNotifications}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
        >
          🔔 Ativar Push Notifications
        </Button>
      </div>

      {/* Notificações */}
      <div className="flex-1 overflow-auto px-4 py-4">
        <div className="space-y-3">
          {notificacoes.map((notif) => {
            const tipo = TIPOS_NOTIF[notif.tipo];
            return (
              <Card
                key={notif.id}
                className={`${tipo.cor} rounded-lg p-4 border-l-4 border-indigo-500 flex items-start gap-3 ${
                  notif.lida ? 'opacity-75' : ''
                }`}
              >
                <span className="text-2xl flex-shrink-0">{tipo.icon}</span>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900">{notif.titulo}</p>
                  <p className="text-sm text-slate-600 mt-1">{notif.descricao}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {notif.timestamp.toLocaleTimeString('pt-BR', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>

                <div className="flex gap-1 flex-shrink-0">
                  {!notif.lida && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="p-2 rounded-lg hover:bg-white/50 transition-all"
                    >
                      <Check className="w-4 h-4 text-slate-600" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDismiss(notif.id)}
                    className="p-2 rounded-lg hover:bg-white/50 transition-all"
                  >
                    <X className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        {notificacoes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-500 text-sm">Nenhuma notificação</p>
          </div>
        )}
      </div>
    </div>
  );
}