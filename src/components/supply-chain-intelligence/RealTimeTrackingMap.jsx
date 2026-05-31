import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Package, AlertCircle } from 'lucide-react';

export default function RealTimeTrackingMap() {
  const [selectedDelivery, setSelectedDelivery] = useState(null);

  const deliveries = [
    { id: 'ENTREGA-0847', cliente: 'Cliente A (São Paulo)', veiculo: 'CAM-001', motorista: 'João Silva', status: 'Em rota', progresso: 78, proximaSaida: '2026-05-31 14:30', localizacao: '-23.5505, -46.6333', proximoProximo: 'Zona Norte SP' },
    { id: 'ENTREGA-0848', cliente: 'Cliente B (Guarulhos)', veiculo: 'VAN-012', motorista: 'Carlos Oliveira', status: 'Entregando', progresso: 95, proximaSaida: '2026-05-31 15:00', localizacao: '-23.4569, -46.5332', proximoProximo: 'Saída à loja' },
    { id: 'ENTREGA-0849', cliente: 'Cliente C (Campinas)', veiculo: 'CAM-015', motorista: 'Maria Santos', status: 'Parado', progresso: 42, proximaSaida: '2026-05-31 16:15', localizacao: '-23.0033, -47.0898', proximoProximo: 'Retomando em 10min' },
    { id: 'ENTREGA-0850', cliente: 'Cliente D (Sorocaba)', veiculo: 'MOTO-034', motorista: 'Rafael Costa', status: 'Atrasado', progresso: 55, proximaSaida: '2026-05-31 17:45', localizacao: '-23.4953, -47.4567', proximoProximo: 'Tráfego intenso' },
    { id: 'ENTREGA-0851', cliente: 'Cliente E (São Bernardo)', veiculo: 'CAM-023', motorista: 'Pedro Lima', status: 'Em rota', progresso: 68, proximaSaida: '2026-05-31 18:00', localizacao: '-23.6956, -46.5644', proximoProximo: 'Próxima parada: 3km' },
  ];

  const statusColor = (status) => {
    switch (status) {
      case 'Em rota': return 'bg-green-900 text-green-200';
      case 'Entregando': return 'bg-blue-900 text-blue-200';
      case 'Parado': return 'bg-orange-900 text-orange-200';
      case 'Atrasado': return 'bg-red-900 text-red-200';
      default: return 'bg-slate-700 text-slate-200';
    }
  };

  return (
    <div className="w-full h-full space-y-4">
      {/* Mapa Placeholder */}
      <Card className="bg-slate-800 border-slate-700 h-72">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            Rastreamento em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent className="h-80 bg-slate-700/50 rounded-lg border border-slate-600 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400">Mapa interativo com rastreamento GPS em tempo real</p>
            <p className="text-xs text-slate-500 mt-1">Integração com sistema de GPS dos veículos</p>
          </div>
        </CardContent>
      </Card>

      {/* Status de Entregas */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Total em Trânsito</p>
            <p className="text-2xl font-bold text-cyan-400">{deliveries.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">No Prazo</p>
            <p className="text-2xl font-bold text-green-400">3</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Parado/Atraso</p>
            <p className="text-2xl font-bold text-orange-400">2</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Tempo Médio</p>
            <p className="text-2xl font-bold text-cyan-400">3h 45m</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista Detalhada */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Detalhes de Entrega</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {deliveries.map((delivery) => (
            <div
              key={delivery.id}
              className="bg-slate-700/50 p-4 rounded-lg border border-slate-600 cursor-pointer hover:border-cyan-600 transition-all"
              onClick={() => setSelectedDelivery(selectedDelivery?.id === delivery.id ? null : delivery)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-white text-sm">{delivery.id}</p>
                  <p className="text-xs text-slate-400">{delivery.cliente}</p>
                </div>
                <Badge className={statusColor(delivery.status)}>
                  {delivery.status}
                </Badge>
              </div>

              {/* Barra de Progresso */}
              <div className="mb-2">
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                    style={{ width: `${delivery.progresso}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">{delivery.progresso}% do percurso</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-2">
                <div>
                  <p className="text-slate-500">Veículo</p>
                  <p className="text-cyan-400 font-mono">{delivery.veiculo}</p>
                </div>
                <div>
                  <p className="text-slate-500">Motorista</p>
                  <p className="text-slate-300">{delivery.motorista}</p>
                </div>
                <div>
                  <p className="text-slate-500">Próx. Saída</p>
                  <p className="text-slate-300">{delivery.proximaSaida}</p>
                </div>
                <div>
                  <p className="text-slate-500">Próximo</p>
                  <p className={delivery.status === 'Atrasado' ? 'text-red-400' : 'text-slate-300'}>
                    {delivery.proximoProximo}
                  </p>
                </div>
              </div>

              {/* Expandido */}
              {selectedDelivery?.id === delivery.id && (
                <div className="mt-3 pt-3 border-t border-slate-600 space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span className="text-slate-400">Localização: {delivery.localizacao}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="w-3 h-3 text-orange-400" />
                    <span className="text-slate-400">ETA: 14:45 | Atraso previsto: 15min</span>
                  </div>
                  {delivery.status === 'Atrasado' && (
                    <div className="flex items-center gap-2 text-xs bg-red-900/20 p-2 rounded border border-red-600/30">
                      <AlertCircle className="w-3 h-3 text-red-400" />
                      <span className="text-red-300">Tráfego intenso detectado. Rota alternativa sugerida.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Estatísticas do Dia</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-700/50 p-3 rounded">
            <p className="text-slate-400">Entregas Completas</p>
            <p className="text-lg font-bold text-green-400">127</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded">
            <p className="text-slate-400">Taxa Sucesso</p>
            <p className="text-lg font-bold text-cyan-400">96.2%</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded">
            <p className="text-slate-400">Tempo Médio</p>
            <p className="text-lg font-bold text-blue-400">3h 42m</p>
          </div>
          <div className="bg-slate-700/50 p-3 rounded">
            <p className="text-slate-400">Ocorrências</p>
            <p className="text-lg font-bold text-orange-400">3</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}