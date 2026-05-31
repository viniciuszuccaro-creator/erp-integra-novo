import React, { useState, useEffect } from 'react';
import { Zap, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function RealTimeSyncMonitor() {
  const [syncStatus, setSyncStatus] = useState([]);

  useEffect(() => {
    // Simulated sync status
    const mockSync = [
      {
        id: '1',
        entidade: 'Pedidos',
        status: 'sincronizado',
        progresso: 100,
        ultimaSinc: '2026-05-31 15:30:45',
        registros: '1,234'
      },
      {
        id: '2',
        entidade: 'Clientes',
        status: 'sincronizando',
        progresso: 67,
        ultimaSinc: '2026-05-31 15:25:30',
        registros: '856'
      },
      {
        id: '3',
        entidade: 'Produtos',
        status: 'sincronizado',
        progresso: 100,
        ultimaSinc: '2026-05-31 15:20:15',
        registros: '2,103'
      },
      {
        id: '4',
        entidade: 'Estoque',
        status: 'alerta',
        progresso: 45,
        ultimaSinc: '2026-05-31 14:50:00',
        registros: '512'
      }
    ];
    setSyncStatus(mockSync);
  }, []);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'sincronizado':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'sincronizando':
        return <Zap className="w-5 h-5 text-blue-600 animate-pulse" />;
      case 'alerta':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {syncStatus.map((sync) => (
        <Card key={sync.id} className="bg-white border-emerald-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(sync.status)}
                <div>
                  <CardTitle className="text-lg">{sync.entidade}</CardTitle>
                  <p className="text-xs text-slate-600">{sync.registros} registros</p>
                </div>
              </div>
              <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">
                {sync.ultimaSinc}
              </span>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-slate-600">Progresso da Sincronização</span>
                <span className="text-sm font-semibold text-slate-900">{sync.progresso}%</span>
              </div>
              <Progress value={sync.progresso} className="h-2" />
            </div>

            <div className={`p-2 rounded text-xs ${
              sync.status === 'sincronizado' ? 'bg-green-50 text-green-800' :
              sync.status === 'sincronizando' ? 'bg-blue-50 text-blue-800' :
              'bg-yellow-50 text-yellow-800'
            }`}>
              {sync.status === 'sincronizado' && '✓ Todos os registros estão sincronizados'}
              {sync.status === 'sincronizando' && '↻ Sincronização em progresso...'}
              {sync.status === 'alerta' && '⚠ Sincronização com atraso. Retentar em breve.'}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}