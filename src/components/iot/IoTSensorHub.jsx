/**
 * IoTSensorHub v1.0
 * Hub central de sensores IoT conectados
 * Passo 27: Integração de dispositivos físicos ao ERP
 * Regra-Mãe: w-full, h-full, real-time, multi-empresa, IA preditiva
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wifi, AlertTriangle, TrendingUp, Zap, Gauge } from 'lucide-react';

const SENSORES = [
  {
    id: 'SENSOR-001',
    localizacao: 'Máquina CNC-A (Produção)',
    tipo: 'Temperatura',
    valor_atual: 67.8,
    valor_normal: '65-70°C',
    status: 'ok',
    empresa: 'Zuccaro SP',
    sinal: 95,
  },
  {
    id: 'SENSOR-002',
    localizacao: 'Máquina CNC-B (Produção)',
    tipo: 'Vibração',
    valor_atual: 8.2,
    valor_normal: '<5mm/s',
    status: 'alerta',
    empresa: 'Zuccaro SP',
    sinal: 78,
  },
  {
    id: 'SENSOR-003',
    localizacao: 'Compressor (Ar Comprimido)',
    tipo: 'Pressão',
    valor_atual: 7.8,
    valor_normal: '8-8.5 bar',
    status: 'critico',
    empresa: 'Zuccaro MG',
    sinal: 45,
  },
  {
    id: 'SENSOR-004',
    localizacao: 'Forno de Secagem (Pintura)',
    tipo: 'Umidade',
    valor_atual: 35,
    valor_normal: '30-40%',
    status: 'ok',
    empresa: 'Zuccaro MG',
    sinal: 88,
  },
];

export default function IoTSensorHub() {
  const [sensores, setSensores] = useState(SENSORES);
  const [filtroEmpresa, setFiltroEmpresa] = useState('todas');

  useEffect(() => {
    // Simular atualização de sensores a cada 3s (real-time IoT)
    const interval = setInterval(() => {
      setSensores((prev) =>
        prev.map((s) => ({
          ...s,
          valor_atual: parseFloat((Math.random() * 20 + (parseFloat(s.valor_atual) - 10)).toFixed(1)),
          sinal: Math.min(100, Math.max(30, s.sinal + (Math.random() - 0.5) * 10)),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status) => ({
    ok: 'bg-green-100 border-green-400 text-green-800',
    alerta: 'bg-amber-100 border-amber-400 text-amber-800',
    critico: 'bg-red-100 border-red-400 text-red-800',
  }[status]);

  const getStatusIcon = (status) => ({ ok: '✅', alerta: '⚠️', critico: '🔴' }[status]);

  const empresas = [...new Set(sensores.map((s) => s.empresa))];
  const sensoresFiltrados = filtroEmpresa === 'todas' ? sensores : sensores.filter((s) => s.empresa === filtroEmpresa);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-cyan-50 overflow-auto">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
          <Wifi className="w-8 h-8 text-cyan-600 animate-pulse" />
          IoT Sensor Hub
        </h2>
        <Badge className="px-4 py-2 bg-cyan-100 text-cyan-800">{sensoresFiltrados.length} Ativos</Badge>
      </div>

      {/* Filtro por Empresa */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {['todas', ...empresas].map((empresa) => (
          <button
            key={empresa}
            onClick={() => setFiltroEmpresa(empresa)}
            className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
              filtroEmpresa === empresa
                ? 'bg-cyan-600 text-white'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {empresa === 'todas' ? 'Todas' : empresa}
          </button>
        ))}
      </div>

      {/* Grid de Sensores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1 overflow-y-auto">
        {sensoresFiltrados.map((sensor) => (
          <Card key={sensor.id} className={`p-4 rounded-lg border-2 ${getStatusColor(sensor.status)}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-bold text-sm">{sensor.localizacao}</p>
                  <span className="text-xl">{getStatusIcon(sensor.status)}</span>
                </div>
                <p className="text-xs opacity-75">{sensor.id}</p>
              </div>
              <div className="text-right">
                <p className="text-xs opacity-75">Tipo</p>
                <p className="font-bold text-sm">{sensor.tipo}</p>
              </div>
            </div>

            <div className="bg-white/50 p-3 rounded-lg mb-3">
              <div className="flex items-end gap-2">
                <div>
                  <p className="text-xs opacity-75 mb-1">Valor Atual</p>
                  <p className="text-2xl font-bold text-slate-900">{sensor.valor_atual}</p>
                </div>
                <div className="flex-1">
                  <p className="text-xs opacity-75 mb-1">Normal</p>
                  <p className="text-xs font-semibold text-slate-700">{sensor.valor_normal}</p>
                </div>
              </div>
            </div>

            {/* Sinal Wifi + Empresa */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                <span className="font-semibold">{sensor.sinal}%</span>
              </div>
              <span className="opacity-75">{sensor.empresa}</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-3 gap-3 border-t border-cyan-200 pt-3">
        <Card className="p-3 bg-green-50 rounded-lg border border-green-200">
          <p className="text-xs text-slate-600 mb-1">Operacionais</p>
          <p className="text-2xl font-bold text-green-600">
            {sensoresFiltrados.filter((s) => s.status === 'ok').length}
          </p>
        </Card>
        <Card className="p-3 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-xs text-slate-600 mb-1">Alertas</p>
          <p className="text-2xl font-bold text-amber-600">
            {sensoresFiltrados.filter((s) => s.status === 'alerta').length}
          </p>
        </Card>
        <Card className="p-3 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xs text-slate-600 mb-1">Críticos</p>
          <p className="text-2xl font-bold text-red-600">
            {sensoresFiltrados.filter((s) => s.status === 'critico').length}
          </p>
        </Card>
      </div>
    </div>
  );
}