/**
 * SupplierDashboard v1.0
 * Dashboard personalizado para fornecedores
 * Regra-Mãe: w-full, h-full, multi-empresa, acesso granular
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, DollarSign, AlertCircle } from 'lucide-react';

const METRICAS_FORNECEDOR = {
  vendas_mes: 145000,
  pedidos_pendentes: 8,
  taxa_entrega: 98.5,
  score_performance: 4.8,
};

const PEDIDOS_RECENTES = [
  {
    id: 'OC-5432',
    cliente: 'Zuccaro Filial SP',
    itens: 150,
    valor: 32450,
    status: 'confirmado',
    prazo: '7 dias',
  },
  {
    id: 'OC-5431',
    cliente: 'Zuccaro Filial MG',
    itens: 89,
    valor: 18900,
    status: 'entregue',
    prazo: '3 dias',
  },
  {
    id: 'OC-5430',
    cliente: 'Zuccaro Filial RJ',
    itens: 234,
    valor: 54320,
    status: 'processando',
    prazo: '5 dias',
  },
];

export default function SupplierDashboard() {
  const [metricas] = useState(METRICAS_FORNECEDOR);
  const [pedidos] = useState(PEDIDOS_RECENTES);

  const getStatusColor = (status) => {
    const colors = {
      confirmado: 'bg-blue-100 text-blue-800',
      entregue: 'bg-green-100 text-green-800',
      processando: 'bg-amber-100 text-amber-800',
    };
    return colors[status] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-green-50 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard Fornecedor</h2>
          <p className="text-slate-600 mt-1">Bem-vindo, Fornecedor ABC Ltda!</p>
        </div>
        <Badge className="px-4 py-2 bg-green-100 text-green-800 text-lg">Ativo</Badge>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Vendas Mês', value: `R$ ${metricas.vendas_mes.toLocaleString('pt-BR')}`, icon: DollarSign, cor: 'text-green-600' },
          { label: 'Pedidos Pendentes', value: metricas.pedidos_pendentes, icon: Package, cor: 'text-blue-600' },
          { label: 'Taxa Entrega', value: `${metricas.taxa_entrega}%`, icon: TrendingUp, cor: 'text-purple-600' },
          { label: 'Score', value: metricas.score_performance, icon: AlertCircle, cor: 'text-amber-600' },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-600 mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{kpi.value}</p>
                </div>
                <Icon className={`w-8 h-8 ${kpi.cor}`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Pedidos Recentes */}
      <Card className="p-6 bg-white rounded-lg shadow-md flex-1 overflow-auto">
        <h3 className="font-bold text-lg mb-4">Pedidos Recentes</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 text-slate-600">Pedido</th>
                <th className="text-left py-2 text-slate-600">Cliente</th>
                <th className="text-left py-2 text-slate-600">Itens</th>
                <th className="text-left py-2 text-slate-600">Valor</th>
                <th className="text-left py-2 text-slate-600">Status</th>
                <th className="text-left py-2 text-slate-600">Prazo</th>
              </tr>
            </thead>
            <tbody>
              {pedidos.map((pedido) => (
                <tr key={pedido.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-3 font-semibold text-slate-900">{pedido.id}</td>
                  <td className="py-3 text-slate-600">{pedido.cliente}</td>
                  <td className="py-3 text-slate-600">{pedido.itens}</td>
                  <td className="py-3 text-slate-600">R$ {pedido.valor.toLocaleString('pt-BR')}</td>
                  <td className="py-3">
                    <Badge className={getStatusColor(pedido.status)}>
                      {pedido.status === 'confirmado' ? '✓ Confirmado' : pedido.status === 'entregue' ? '✓ Entregue' : '⏳ Processando'}
                    </Badge>
                  </td>
                  <td className="py-3 text-slate-600">{pedido.prazo}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}