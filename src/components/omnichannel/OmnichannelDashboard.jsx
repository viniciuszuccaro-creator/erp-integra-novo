/**
 * OmnichannelDashboard v1.0
 * Dashboard omnichannel: todos os canais unificados + métricas
 * Regra-Mãe: w-full, h-full, multi-empresa, IA, inovação
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, ShoppingCart, Mail, Phone, Globe, TrendingUp, Users } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

const CANAIS = [
  { id: 'whatsapp', nome: 'WhatsApp', icon: MessageCircle, cor: 'bg-green-500' },
  { id: 'ecommerce', nome: 'E-commerce', icon: ShoppingCart, cor: 'bg-blue-500' },
  { id: 'email', nome: 'E-mail', icon: Mail, cor: 'bg-purple-500' },
  { id: 'telefone', nome: 'Telefone', icon: Phone, cor: 'bg-orange-500' },
  { id: 'marketplace', nome: 'Marketplace', icon: Globe, cor: 'bg-red-500' },
  { id: 'portal', nome: 'Portal Cliente', icon: Users, cor: 'bg-cyan-500' },
];

export default function OmnichannelDashboard() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [metricas, setMetricas] = useState({});
  const [pedidosPorCanal, setPedidosPorCanal] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!empresaAtual?.id && !grupoAtual?.id) return;
    loadMetricas();
  }, [empresaAtual?.id, grupoAtual?.id]);

  const loadMetricas = async () => {
    setLoading(true);
    try {
      // Buscar pedidos por canal
      const pedidos = await base44.entities.Pedido.filter({
        ...(empresaAtual?.id ? { empresa_id: empresaAtual.id } : {}),
        ...(grupoAtual?.id ? { group_id: grupoAtual.id } : {}),
      });

      // Agrupar por canal
      const porCanal = {};
      pedidos.forEach((p) => {
        const canal = p.origem_pedido || 'Manual';
        if (!porCanal[canal]) porCanal[canal] = { count: 0, valor: 0 };
        porCanal[canal].count++;
        porCanal[canal].valor += p.valor_total || 0;
      });

      setPedidosPorCanal(porCanal);

      // Métricas gerais
      setMetricas({
        total_pedidos: pedidos.length,
        total_receita: pedidos.reduce((s, p) => s + (p.valor_total || 0), 0),
        canais_ativos: Object.keys(porCanal).length,
        ticket_medio:
          pedidos.length > 0
            ? pedidos.reduce((s, p) => s + (p.valor_total || 0), 0) / pedidos.length
            : 0,
      });
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <Globe className="w-8 h-8 text-blue-600" />
        Omnichannel - Visão Unificada de Canais
      </h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Pedidos', value: metricas.total_pedidos || 0, fmt: 'n' },
          { label: 'Receita Total', value: metricas.total_receita || 0, fmt: 'r' },
          { label: 'Canais Ativos', value: metricas.canais_ativos || 0, fmt: 'n' },
          { label: 'Ticket Médio', value: metricas.ticket_medio || 0, fmt: 'r' },
        ].map((kpi, idx) => (
          <Card key={idx} className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-xs text-slate-600 mb-1">{kpi.label}</p>
            <p className="text-2xl font-bold text-slate-900">
              {kpi.fmt === 'r'
                ? `R$ ${kpi.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
                : kpi.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Canais */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Performance por Canal
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {CANAIS.map((canal) => {
            const dados = pedidosPorCanal[canal.nome] || pedidosPorCanal[canal.id] || { count: 0, valor: 0 };
            const Icon = canal.icon;
            return (
              <div key={canal.id} className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:shadow-md transition-all">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${canal.cor}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="font-semibold text-slate-900">{canal.nome}</p>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pedidos</span>
                    <span className="font-bold text-slate-900">{dados.count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Receita</span>
                    <span className="font-bold text-slate-900">
                      R$ {dados.valor.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">% do Total</span>
                    <span className="font-bold text-blue-600">
                      {metricas.total_pedidos > 0
                        ? ((dados.count / metricas.total_pedidos) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>

                {/* Barra de progresso */}
                <div className="mt-3 bg-slate-200 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${canal.cor}`}
                    style={{
                      width: `${
                        metricas.total_pedidos > 0
                          ? Math.min((dados.count / metricas.total_pedidos) * 100, 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Button onClick={loadMetricas} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
        {loading ? 'Atualizando...' : '🔄 Atualizar Métricas'}
      </Button>
    </div>
  );
}