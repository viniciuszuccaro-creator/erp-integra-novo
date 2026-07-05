import { Card, CardContent } from '@/components/ui/card';
import { Users, Package, DollarSign, TrendingUp } from 'lucide-react';

export default function RegiaoKPIs({ totais }) {
  const ticketMedio = totais.totalPedidos > 0 ? totais.totalVendas / totais.totalPedidos : 0;
  const kpis = [
    { icon: Users, cor: 'blue', label: 'Total Clientes', value: totais.totalClientes },
    { icon: Package, cor: 'purple', label: 'Total Pedidos', value: totais.totalPedidos },
    { icon: DollarSign, cor: 'green', label: 'Total Vendas', value: `R$ ${totais.totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
    { icon: TrendingUp, cor: 'orange', label: 'Ticket Médio', value: `R$ ${ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` },
  ];

  return (
    <div className="grid grid-cols-4 gap-4">
      {kpis.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-${kpi.cor}-100 rounded-lg flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 text-${kpi.cor}-600`} />
                </div>
                <div>
                  <p className="text-sm text-slate-600">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}