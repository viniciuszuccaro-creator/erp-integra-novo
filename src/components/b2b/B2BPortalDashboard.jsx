/**
 * B2BPortalDashboard v1.0
 * Dashboard para fornecedores, representantes e parceiros
 * Regra-Mãe: multi-partner, real-time, w-full h-full
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Package, DollarSign, Users, AlertCircle } from 'lucide-react';

const METRICAS_PARTNER = {
  vendas_mes: 45230,
  pedidos_pendentes: 8,
  comissoes_pendentes: 3450,
  satisfacao: 4.8,
  tempo_resposta_medio: '2.3h',
};

const PEDIDOS_RECENTES = [
  { id: 'PED-5432', cliente: 'Cliente A', valor: 2450, status: 'entregue', data: '2h' },
  { id: 'PED-5431', cliente: 'Cliente B', valor: 1890, status: 'em_transito', data: '4h' },
  { id: 'PED-5430', cliente: 'Cliente C', valor: 3200, status: 'processando', data: '6h' },
];

export default function B2BPortalDashboard() {
  const [partner] = useState({
    nome: 'João Silva Representante',
    empresa: 'Representações JCS',
    telefone: '(11) 98765-4321',
    email: 'joao@jcs.com.br',
    regiao: 'São Paulo',
    comissao_percentual: 8.5,
  });

  const getStatusColor = (status) => {
    const colors = {
      entregue: 'bg-green-50 text-green-700',
      em_transito: 'bg-blue-50 text-blue-700',
      processando: 'bg-amber-50 text-amber-700',
    };
    return colors[status];
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-purple-50 overflow-auto">
      {/* Header com Dados do Partner */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg p-6 shadow-lg">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">{partner.nome}</h1>
            <p className="text-purple-100 mt-1">{partner.empresa}</p>
          </div>
          <Badge className="bg-white/20 text-white border-white/30">Ativo</Badge>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-purple-100">Região</p>
            <p className="font-semibold">{partner.regiao}</p>
          </div>
          <div>
            <p className="text-purple-100">Comissão</p>
            <p className="font-semibold">{partner.comissao_percentual}%</p>
          </div>
          <div>
            <p className="text-purple-100">Telefone</p>
            <p className="font-semibold">{partner.telefone}</p>
          </div>
          <div>
            <p className="text-purple-100">Email</p>
            <p className="font-semibold text-xs">{partner.email}</p>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[
          {
            label: 'Vendas Este Mês',
            value: `R$ ${(METRICAS_PARTNER.vendas_mes / 1000).toFixed(1)}k`,
            icon: DollarSign,
            cor: 'text-green-600',
          },
          {
            label: 'Pedidos Pendentes',
            value: METRICAS_PARTNER.pedidos_pendentes,
            icon: Package,
            cor: 'text-blue-600',
          },
          {
            label: 'Comissões a Receber',
            value: `R$ ${METRICAS_PARTNER.comissoes_pendentes}`,
            icon: TrendingUp,
            cor: 'text-purple-600',
          },
        ].map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card key={idx} className="p-4 rounded-lg bg-white border border-slate-200">
              <Icon className={`w-5 h-5 ${kpi.cor} mb-2`} />
              <p className="text-xs text-slate-600 mb-1">{kpi.label}</p>
              <p className="text-lg font-bold text-slate-900">{kpi.value}</p>
            </Card>
          );
        })}
      </div>

      {/* Alertas */}
      <Card className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900">Atenção</p>
            <p className="text-sm text-amber-800 mt-1">Você tem 2 pedidos para processar e 1 comissão pendente de aprovação.</p>
          </div>
        </div>
      </Card>

      {/* Pedidos Recentes */}
      <Card className="p-4 rounded-lg bg-white border border-slate-200">
        <h3 className="font-bold text-slate-900 mb-3">Pedidos Recentes</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {PEDIDOS_RECENTES.map((pedido) => (
            <div key={pedido.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-slate-900">{pedido.id}</p>
                  <p className="text-xs text-slate-600">{pedido.cliente}</p>
                </div>
                <Badge className={getStatusColor(pedido.status)}>
                  {pedido.status === 'entregue' && '✅ Entregue'}
                  {pedido.status === 'em_transito' && '📦 Em Trânsito'}
                  {pedido.status === 'processando' && '⏳ Processando'}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-semibold text-slate-900">R$ {pedido.valor.toLocaleString('pt-BR')}</span>
                <span className="text-slate-500">{pedido.data}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Ver Todos Pedidos', icon: '📦' },
          { label: 'Consultar Comissões', icon: '💰' },
          { label: 'Relatório de Vendas', icon: '📊' },
          { label: 'Suporte', icon: '💬' },
        ].map((acao, idx) => (
          <button
            key={idx}
            className="p-3 rounded-lg bg-white border border-slate-200 hover:shadow-md transition-all flex flex-col items-center gap-2"
          >
            <span className="text-xl">{acao.icon}</span>
            <span className="text-xs font-semibold text-slate-700 text-center">{acao.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}