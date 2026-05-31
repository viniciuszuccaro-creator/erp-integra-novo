/**
 * SyncDashboard v1.0
 * Dashboard de sincronização de pedidos e produtos entre marketplaces
 * Regra-Mãe: sincronização automática, tempo real
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, TrendingUp, AlertTriangle } from 'lucide-react';

const SINCRONIZACOES = [
  {
    id: 1,
    tipo: 'Sincronizar Pedidos',
    origem: 'Shopee',
    destino: 'ERP',
    status: 'sincronizado',
    quantidade: 147,
    tempo: '2.3s',
  },
  {
    id: 2,
    tipo: 'Sincronizar Estoque',
    origem: 'ERP',
    destino: 'Mercado Livre',
    status: 'sincronizado',
    quantidade: 1203,
    tempo: '5.1s',
  },
  {
    id: 3,
    tipo: 'Sincronizar Produtos',
    origem: 'ERP',
    destino: 'Alibaba',
    status: 'erro',
    quantidade: 0,
    tempo: '0s',
  },
  {
    id: 4,
    tipo: 'Sincronizar Preços',
    origem: 'ERP',
    destino: 'Amazon',
    status: 'processando',
    quantidade: 89,
    tempo: '-',
  },
];

export default function SyncDashboard() {
  const [sincronizacoes] = useState(SINCRONIZACOES);

  const getStatusColor = (status) => {
    const colors = {
      sincronizado: 'bg-green-100 text-green-800',
      processando: 'bg-blue-100 text-blue-800',
      erro: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  const getStatusIcon = (status) => {
    const icons = {
      sincronizado: '✅',
      processando: '⏳',
      erro: '❌',
    };
    return icons[status];
  };

  const totalItems = sincronizacoes.reduce((sum, s) => sum + s.quantidade, 0);
  const sucesso = sincronizacoes.filter((s) => s.status === 'sincronizado').length;

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-green-50 overflow-auto">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <RefreshCw className="w-8 h-8 text-green-600" />
        Dashboard de Sincronização
      </h2>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Sincronizações', value: sincronizacoes.length, icon: '🔄' },
          { label: 'Taxa Sucesso', value: `${Math.round((sucesso / sincronizacoes.length) * 100)}%`, icon: '✅' },
          { label: 'Items Sincronizados', value: totalItems, icon: '📦' },
        ].map((kpi, idx) => (
          <Card key={idx} className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-xs text-slate-600 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-slate-900 flex items-center gap-1">
              <span>{kpi.icon}</span>
              {kpi.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Sincronizações */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">Status de Sincronizações</h3>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {sincronizacoes.map((sync) => (
            <div key={sync.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{sync.tipo}</p>
                  <p className="text-xs text-slate-600 mt-1">
                    {sync.origem} → {sync.destino}
                  </p>
                </div>

                <Badge className={getStatusColor(sync.status)}>
                  {getStatusIcon(sync.status)} {sync.status === 'sincronizado' ? 'OK' : sync.status === 'processando' ? 'Processando' : 'Erro'}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex gap-4">
                  <span className="text-slate-600">
                    {sync.quantidade > 0 && `${sync.quantidade} items`}
                  </span>
                  <span className="text-slate-500">{sync.tempo}</span>
                </div>

                {sync.status === 'erro' && (
                  <button className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200">
                    Tentar Novamente
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}