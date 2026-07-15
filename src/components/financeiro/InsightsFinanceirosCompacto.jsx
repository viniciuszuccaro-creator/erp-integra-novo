import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';

/**
 * INSIGHTS FINANCEIROS COMPACTO V22.0 ETAPA 2
 * Widget de insights e recomendações da IA - design estável e compacto
 */
export default function InsightsFinanceirosCompacto({ 
  saldo,
  contasVencidas,
  scoreIA = 85,
  automacaoAtiva = true
}) {
  const insights = [];
  
  if (saldo > 0) {
    insights.push({ 
      type: 'success', 
      icon: CheckCircle2, 
      text: `Saldo positivo de R$ ${(saldo / 1000).toFixed(0)}k previsto`,
      color: 'text-green-600'
    });
  } else if (saldo < 0) {
    insights.push({ 
      type: 'warning', 
      icon: AlertTriangle, 
      text: `Atenção: Saldo negativo de R$ ${Math.abs(saldo / 1000).toFixed(0)}k`,
      color: 'text-orange-600'
    });
  }

  if (contasVencidas > 10) {
    insights.push({ 
      type: 'alert', 
      icon: AlertTriangle, 
      text: `${contasVencidas} contas vencidas requerem atenção`,
      color: 'text-red-600'
    });
  }

  if (scoreIA > 80) {
    insights.push({ 
      type: 'info', 
      icon: Zap, 
      text: `IA operando com ${scoreIA}% de precisão`,
      color: 'text-blue-600'
    });
  }

  if (automacaoAtiva) {
    insights.push({ 
      type: 'success', 
      icon: TrendingUp, 
      text: 'Automação financeira ativa e funcional',
      color: 'text-purple-600'
    });
  }

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 min-h-[120px] max-h-[120px]">
      <CardHeader className="bg-gradient-to-r from-purple-100 to-pink-100 border-b px-2 py-1.5">
        <CardTitle className="text-xs flex items-center gap-1.5 text-purple-900">
          <Zap className="w-3 h-3 flex-shrink-0" />
          🤖 Insights IA
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2 overflow-auto">
        <div className="space-y-1">
          {insights.slice(0, 4).map((insight, idx) => {
            const Icon = insight.icon;
            return (
              <div key={idx} className="flex items-start gap-1.5 p-1.5 bg-white rounded-lg border border-purple-100 min-h-[32px]">
                <Icon className={`w-3 h-3 ${insight.color} flex-shrink-0 mt-0 />
                <p className="text-xs text-slate-700 leading-tight truncate">{insight.text}</p>
              </div>
            );
          })}
          
          {insights.length === 0 && (
            <div className="p-1.5 text-center text-xs text-slate-500">
              Monitorando...
            </div>
          )}
        </div>

        <div className="mt-1.5 p-1.5 bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg border border-blue-200">
          <div className="flex items-center gap-1.5">
            <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0 flex-shrink-0">
              V22.0
            </Badge>
            <p className="text-xs text-blue-800 truncate">
              100% operacional
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}