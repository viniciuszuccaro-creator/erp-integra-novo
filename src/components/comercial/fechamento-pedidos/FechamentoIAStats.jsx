import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, Zap, BarChart3, Sparkles } from 'lucide-react';

export default function FechamentoIAStats({ estatisticasIA }) {
  if (!estatisticasIA) return null;
  return (
    <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Análise Inteligente (IA)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: Activity, cor: 'text-purple-600', label: 'Total Pedidos', valor: estatisticasIA.totalPedidos },
            { icon: CheckCircle2, cor: 'text-blue-600', label: 'Fechados', valor: estatisticasIA.pedidosFechados },
            { icon: Zap, cor: 'text-green-600', label: 'Automáticos', valor: estatisticasIA.pedidosAutomaticos },
            { icon: BarChart3, cor: 'text-orange-600', label: 'Taxa Auto', valor: `${estatisticasIA.taxaAutomacao.toFixed(0)}%` },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="bg-white/80 p-3 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className={`w-4 h-4 ${item.cor}`} />
                  <p className="text-xs text-slate-600">{item.label}</p>
                </div>
                <p className={`text-xl font-bold ${item.cor}`}>{item.valor}</p>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}