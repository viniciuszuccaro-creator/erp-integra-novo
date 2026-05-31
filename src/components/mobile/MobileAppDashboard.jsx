/**
 * MobileAppDashboard v1.0
 * Dashboard mobile otimizado para smartphones
 * Regra-Mãe: w-full, h-full, touch-friendly, offline-first
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Smartphone, TrendingUp, Bell, Menu, Settings } from 'lucide-react';

export default function MobileAppDashboard() {
  const [dados, setDados] = useState({
    vendas_hoje: 8450,
    pedidos_pendentes: 12,
    estoque_critico: 3,
    alertas: 5,
  });

  const [notificacoes, setNotificacoes] = useState([
    { id: 1, titulo: 'Novo Pedido', descricao: 'Pedido #5432 recebido', timestamp: '5m' },
    { id: 2, titulo: 'Estoque Baixo', descricao: 'SKU-001 estoque crítico', timestamp: '15m' },
    { id: 3, titulo: 'Pagamento', descricao: 'Pagamento recebido de Cliente A', timestamp: '1h' },
  ]);

  const handleNotificacaoPush = async () => {
    // Simular notificação push
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('ERP Zuccaro Mobile', {
        body: 'Novo pedido recebido!',
        icon: '📦',
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-blue-600" />
          <h1 className="font-bold text-lg text-slate-900">ERP Mobile</h1>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg hover:bg-slate-100 relative">
            <Bell className="w-5 h-5 text-slate-700" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-100">
            <Menu className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto px-4 py-4">
        {/* KPIs Quick View */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Vendas', value: `R$ ${dados.vendas_hoje.toLocaleString('pt-BR')}`, icon: '💰', cor: 'bg-green-50' },
            { label: 'Pedidos', value: dados.pedidos_pendentes, icon: '📦', cor: 'bg-blue-50' },
            { label: 'Crítico', value: dados.estoque_critico, icon: '⚠️', cor: 'bg-red-50' },
            { label: 'Alertas', value: dados.alertas, icon: '🔔', cor: 'bg-amber-50' },
          ].map((kpi, idx) => (
            <Card key={idx} className={`${kpi.cor} rounded-lg p-3 border-0`}>
              <p className="text-2xl mb-1">{kpi.icon}</p>
              <p className="text-xs text-slate-600">{kpi.label}</p>
              <p className="text-lg font-bold text-slate-900">{kpi.value}</p>
            </Card>
          ))}
        </div>

        {/* Ações Rápidas */}
        <Card className="mb-4 p-4 bg-white rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-3">Ações Rápidas</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Novo Pedido', icon: '➕' },
              { label: 'Ver Estoque', icon: '📦' },
              { label: 'Relatório', icon: '📊' },
            ].map((acao, idx) => (
              <button
                key={idx}
                className="p-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-center transition-all"
              >
                <p className="text-xl mb-1">{acao.icon}</p>
                <p className="text-xs text-slate-700 font-semibold">{acao.label}</p>
              </button>
            ))}
          </div>
        </Card>

        {/* Notificações */}
        <Card className="p-4 bg-white rounded-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-3">Notificações Recentes</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {notificacoes.map((notif) => (
              <div key={notif.id} className="p-3 bg-slate-50 rounded-lg border-l-4 border-blue-500">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{notif.titulo}</p>
                    <p className="text-xs text-slate-600 mt-1">{notif.descricao}</p>
                  </div>
                  <span className="text-xs text-slate-500">{notif.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="sticky bottom-0 bg-white border-t border-slate-200 px-4 py-3 flex justify-around">
        {[
          { icon: '📊', label: 'Dashboard' },
          { icon: '📦', label: 'Pedidos' },
          { icon: '💾', label: 'Estoque' },
          { icon: '⚙️', label: 'Config' },
        ].map((tab, idx) => (
          <button key={idx} className="flex flex-col items-center gap-1 py-2 px-3 rounded-lg hover:bg-slate-100">
            <span className="text-xl">{tab.icon}</span>
            <span className="text-xs text-slate-700 font-semibold">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}