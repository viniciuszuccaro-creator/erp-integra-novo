/**
 * SupplyChainDashboard v1.0
 * Dashboard de cadeia de suprimentos otimizada por IA
 * Regra-Mãe: w-full, h-full, multi-empresa, real-time
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Truck, Package, AlertTriangle } from 'lucide-react';

const NODES = [
  { id: 1, nome: 'Fornecedor A', tipo: 'fornecedor', status: 'ok', estoque: 2400, lead_time: 7 },
  { id: 2, nome: 'CD Principal', tipo: 'deposito', status: 'alerta', estoque: 890, lead_time: 1 },
  { id: 3, nome: 'Filial SP', tipo: 'filial', status: 'ok', estoque: 340, lead_time: 2 },
  { id: 4, nome: 'Filial MG', tipo: 'filial', status: 'critico', estoque: 45, lead_time: 3 },
  { id: 5, nome: 'Cliente A', tipo: 'cliente', status: 'ok', estoque: null, lead_time: null },
];

const KPI_SUPPLY = [
  { label: 'Fill Rate', value: '96.4%', trend: 'up', icon: Package },
  { label: 'Lead Time Médio', value: '4.2 dias', trend: 'down', icon: Truck },
  { label: 'OTIF', value: '94.1%', trend: 'up', icon: TrendingUp },
  { label: 'Giro de Estoque', value: '8.3x/ano', trend: 'up', icon: TrendingUp },
];

export default function SupplyChainDashboard() {
  const [nodes] = useState(NODES);

  const getNodeColor = (status) => ({
    ok: 'bg-green-100 border-green-400 text-green-800',
    alerta: 'bg-amber-100 border-amber-400 text-amber-800',
    critico: 'bg-red-100 border-red-400 text-red-800',
  }[status]);

  const getNodeIcon = (tipo) => ({ fornecedor: '🏭', deposito: '🏢', filial: '🏪', cliente: '👤' }[tipo]);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-teal-50 overflow-auto">
      <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <Truck className="w-8 h-8 text-teal-600" />
        Cadeia de Suprimentos
      </h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {KPI_SUPPLY.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">{kpi.label}</p>
                  <p className="text-xl font-bold text-slate-900">{kpi.value}</p>
                </div>
                <div className={kpi.trend === 'up' ? 'text-green-600' : 'text-red-500'}>
                  {kpi.trend === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Mapa Visual da Cadeia */}
      <Card className="p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">Mapa de Nós da Cadeia</h3>
        <div className="flex flex-wrap gap-3">
          {nodes.map((node) => (
            <div key={node.id} className={`p-4 rounded-lg border-2 min-w-[140px] ${getNodeColor(node.status)}`}>
              <p className="text-2xl mb-1">{getNodeIcon(node.tipo)}</p>
              <p className="font-bold text-sm">{node.nome}</p>
              <p className="text-xs capitalize">{node.tipo}</p>
              {node.estoque !== null && (
                <p className="text-xs mt-1">Estoque: <strong>{node.estoque}</strong></p>
              )}
              {node.lead_time !== null && (
                <p className="text-xs">Lead time: <strong>{node.lead_time}d</strong></p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Alertas */}
      <Card className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-bold text-red-900">Alertas Cadeia</p>
            <ul className="text-sm text-red-800 mt-1 space-y-1">
              <li>• Filial MG: estoque crítico (45 un) — repor em até 3 dias</li>
              <li>• CD Principal: estoque abaixo do mínimo — acionar Fornecedor A</li>
              <li>• Lead time Fornecedor B aumentou +2 dias esta semana</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}