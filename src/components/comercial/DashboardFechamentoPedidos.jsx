import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, AlertTriangle, CheckCircle2, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { useFechamentoPedidos } from './fechamento-pedidos/useFechamentoPedidos';
import FechamentoMetricCard from './fechamento-pedidos/FechamentoMetricCard';
import FechamentoIAStats from './fechamento-pedidos/FechamentoIAStats';
import FechamentoAtividades from './fechamento-pedidos/FechamentoAtividades';
import { ShoppingCart, Package, DollarSign, Truck } from 'lucide-react';

export default function DashboardFechamentoPedidos({ windowMode = false, empresaId = null }) {
  const {
    estatisticasIA, pedidosFechados, pedidosComAutomacao, pedidosRecentes,
    movimentacoesAutomaticas, contasAutomaticas, entregasAutomaticas,
    pedidosProntosFechar, taxaAutomacao,
  } = useFechamentoPedidos(empresaId);

  const metricas = [
    { label: 'Pedidos Fechados (7d)', valor: pedidosFechados.length, total: pedidosRecentes.length, icon: ShoppingCart, cor: 'blue', percentual: pedidosRecentes.length > 0 ? (pedidosFechados.length / pedidosRecentes.length) * 100 : 0 },
    { label: 'Taxa Automação', valor: pedidosComAutomacao.length, total: pedidosFechados.length, icon: Zap, cor: 'purple', percentual: taxaAutomacao },
    { label: 'Itens Baixados', valor: movimentacoesAutomaticas.length, icon: Package, cor: 'green', badge: 'AUTO' },
    { label: 'Contas Geradas', valor: contasAutomaticas.length, icon: DollarSign, cor: 'orange', badge: 'AUTO' },
    { label: 'Entregas Criadas', valor: entregasAutomaticas.length, icon: Truck, cor: 'indigo', badge: 'AUTO' },
  ];

  const containerClass = windowMode ? 'w-full h-full flex flex-col overflow-hidden' : 'space-y-6 w-full h-full';
  const contentClass = windowMode ? 'flex-1 overflow-y-auto p-6 space-y-6' : 'space-y-6';

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        <Card className="border-2 border-blue-400 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-blue-600" />
                  Dashboard de Fechamento Automático
                  {estatisticasIA && (
                    <Badge className="bg-purple-600 text-white ml-2">
                      <Sparkles className="w-3 h-3 mr-1" /> IA Analytics
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-slate-600 mt-2">Sistema inteligente de monitoramento e análise preditiva</p>
              </div>
              <div className="text-right">
                <Badge className="bg-blue-600 text-white px-3 py-1 mb-2">V21.6 Final</Badge>
                {estatisticasIA && (
                  <div className="text-xs text-slate-600">
                    Últimos {estatisticasIA.diasAnalise} dias{empresaId && ' • Empresa específica'}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {metricas.map((metrica, idx) => <FechamentoMetricCard key={idx} metrica={metrica} />)}
        </div>

        {pedidosProntosFechar.length > 0 && (
          <Card className="border-2 border-orange-400 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-900">{pedidosProntosFechar.length} pedido(s) em Rascunho pronto(s) para fechar</p>
                    <p className="text-sm text-orange-700">Use o botão "🚀 Fechar Pedido" para processar automaticamente</p>
                  </div>
                </div>
                <Badge className="bg-orange-600 text-white">Ação Necessária</Badge>
              </div>
            </CardContent>
          </Card>
        )}

        <FechamentoIAStats estatisticasIA={estatisticasIA} />

        <Card>
          <CardHeader><CardTitle className="text-base">Performance do Sistema</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { icon: CheckCircle2, cor: 'green', label: 'Taxa de Sucesso', valor: `${taxaAutomacao.toFixed(0)}%`, sub: `${pedidosComAutomacao.length} de ${pedidosFechados.length} pedidos` },
                { icon: TrendingUp, cor: 'blue', label: 'Produtividade', valor: '10x', sub: 'Vs. processo manual' },
                { icon: Clock, cor: 'purple', label: 'Tempo Médio', valor: '~10s', sub: 'Por pedido completo' },
              ].map((p, idx) => {
                const Icon = p.icon;
                return (
                  <div key={idx} className={`bg-${p.cor}-50 p-4 rounded-lg border border-${p.cor}-200`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-5 h-5 text-${p.cor}-600`} />
                      <p className={`font-semibold text-${p.cor}-900`}>{p.label}</p>
                    </div>
                    <p className={`text-3xl font-bold text-${p.cor}-600`}>{p.valor}</p>
                    <p className={`text-xs text-${p.cor}-700 mt-1`}>{p.sub}</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <FechamentoAtividades pedidosComAutomacao={pedidosComAutomacao} />
      </div>
    </div>
  );
}