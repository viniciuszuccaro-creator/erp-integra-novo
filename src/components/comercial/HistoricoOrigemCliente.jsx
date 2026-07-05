import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import BadgeOrigemPedido from "./BadgeOrigemPedido";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { History, TrendingUp, ShoppingCart } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * V21.6 - Histórico de Origens de um Cliente
 * Mostra preferências e padrões de compra por canal
 */
export default function HistoricoOrigemCliente({ clienteId, compact = false }) {
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  
  const { data: pedidosCliente = [], isLoading } = useQuery({
    queryKey: ['pedidos-cliente', clienteId, contextoKey],
    queryFn: () => filterInContext('Pedido', { cliente_id: clienteId }),
    initialData: [],
    enabled: !!clienteId
  });

  if (!clienteId || isLoading) return null;
  if (pedidosCliente.length === 0) return null;

  // Agrupar por origem
  const porOrigem = pedidosCliente.reduce((acc, p) => {
    const origem = p.origem_pedido || 'Manual';
    if (!acc[origem]) {
      acc[origem] = { count: 0, valor: 0 };
    }
    acc[origem].count++;
    acc[origem].valor += (p.valor_total || 0);
    return acc;
  }, {});

  // Dados para gráfico de pizza
  const dadosPizza = Object.entries(porOrigem).map(([origem, dados]) => ({
    name: origem,
    value: dados.count,
    valor: dados.valor
  })).sort((a, b) => b.value - a.value);

  const CORES = ['#3b82f6', '#22c55e', '#a855f7', '#f97316', '#ef4444', '#eab308', '#ec4899', '#06b6d4'];

  // Origem preferida
  const origemPreferida = dadosPizza[0];
  const percentualPreferida = (origemPreferida.value / pedidosCliente.length) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border">
        <History className="w-4 h-4 text-slate-600" />
        <div className="flex-1">
          <p className="text-xs text-slate-600">Canal Preferido:</p>
          <BadgeOrigemPedido origemPedido={origemPreferida.name} showLock={false} />
        </div>
        <Badge className="bg-blue-100 text-blue-700">
          {percentualPreferida.toFixed(0)}%
        </Badge>
      </div>
    );
  }

  return (
    <Card className="border-blue-300 bg-gradient-to-br from-blue-50 to-slate-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="w-5 h-5 text-blue-600" />
          📊 Histórico de Canais
        </CardTitle>
        <p className="text-xs text-slate-600 mt-1">
          Análise de {pedidosCliente.length} pedidos deste cliente
        </p>
      </CardHeader>
      <CardContent>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Gráfico de Pizza */}
          <div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={dadosPizza}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosPizza.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} pedidos (R$ ${props.payload.valor.toFixed(2)})`,
                    name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Lista de Origens */}
          <div className="space-y-2">
            {dadosPizza.map((origem, idx) => {
              const percentual = (origem.value / pedidosCliente.length) * 100;
              const ticketMedio = origem.valor / origem.value;

              return (
                <div key={idx} className="p-3 bg-white rounded-lg border hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <BadgeOrigemPedido origemPedido={origem.name} showLock={false} />
                    <Badge className="bg-slate-100 text-slate-700">
                      {percentual.toFixed(0)}%
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      {origem.value} pedidos
                    </span>
                    <span className="text-green-600 font-semibold">
                      R$ {ticketMedio.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Insight Principal */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <TrendingUp className="w-4 h-4 inline mr-1" />
            <strong>Canal Preferido:</strong> {origemPreferida.name} ({percentualPreferida.toFixed(0)}% dos pedidos)
          </p>
        </div>

      </CardContent>
    </Card>
  );
}