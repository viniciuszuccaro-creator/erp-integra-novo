import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingDown, Clock, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const AT_RISK_CUSTOMERS = [
  { 
    id: 1,
    name: 'Estruturas & Ferro Ltda',
    riskScore: 92,
    lastPurchase: '45 dias atrás',
    signals: ['Sem compra 45+ dias', 'Redução 60% volume', 'NPS -8'],
    arpu: 'R$ 18k',
    ltv: 'R$ 320k',
  },
  {
    id: 2,
    name: 'Construtora Silva Bros',
    riskScore: 78,
    lastPurchase: '32 dias atrás',
    signals: ['Redução 35% volume', '3 suporte reclamações', 'Sem acesso portal'],
    arpu: 'R$ 12k',
    ltv: 'R$ 180k',
  },
  {
    id: 3,
    name: 'Metalúrgica Industrial',
    riskScore: 73,
    lastPurchase: '28 dias atrás',
    signals: ['Frequência -25%', 'Ticket médio -30%', 'NPS 3'],
    arpu: 'R$ 8.5k',
    ltv: 'R$ 145k',
  },
  {
    id: 4,
    name: 'Reforma & Obra',
    riskScore: 68,
    lastPurchase: '18 dias atrás',
    signals: ['Redução 15% volume', 'Suporte 1 reclamação', 'Acesso reduzido'],
    arpu: 'R$ 6k',
    ltv: 'R$ 98k',
  },
];

const getRiskColor = (score) => {
  if (score >= 80) return 'bg-red-500/20 border-red-500/30 text-red-300';
  if (score >= 70) return 'bg-orange-500/20 border-orange-500/30 text-orange-300';
  return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
};

const getRiskIcon = (score) => {
  if (score >= 80) return '#ef4444';
  if (score >= 70) return '#f97316';
  return '#eab308';
};

export default function ChurnRiskPanel() {
  const totalAtRisk = AT_RISK_CUSTOMERS.length;
  const potentialLoss = AT_RISK_CUSTOMERS.reduce((sum, c) => sum + parseInt(c.arpu.replace(/\D/g, '')), 0);

  return (
    <div className="w-full space-y-4">
      {/* Risk Summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gradient-to-br from-red-950/60 to-slate-950/60 border-red-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Clientes em Risco</p>
                <p className="text-2xl font-bold text-red-400 mt-1">{totalAtRisk}</p>
              </div>
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-950/60 to-slate-950/60 border-orange-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Perda Potencial/Mês</p>
                <p className="text-2xl font-bold text-orange-400 mt-1">R$ {(potentialLoss / 1000).toFixed(0)}k</p>
              </div>
              <TrendingDown className="w-5 h-5 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Risk List */}
      <div className="space-y-3">
        {AT_RISK_CUSTOMERS.map((customer) => (
          <Card key={customer.id} className={`border ${getRiskColor(customer.riskScore)}`}>
            <CardContent className="pt-6 space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-200">{customer.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Última compra: {customer.lastPurchase}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-slate-300">{customer.riskScore}%</div>
                  <div className="text-xs text-slate-400">risco churn</div>
                </div>
              </div>

              {/* Signals */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Sinais de alerta:
                </p>
                <div className="flex flex-wrap gap-2">
                  {customer.signals.map((signal, idx) => (
                    <Badge key={idx} variant="outline" className="bg-white/5 border-white/20 text-xs">
                      {signal}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Footer: LTV + ARPU */}
              <div className="flex justify-between items-center pt-2 border-t border-white/10">
                <div className="text-xs">
                  <p className="text-slate-400">ARPU: <span className="text-slate-200 font-semibold">{customer.arpu}</span></p>
                  <p className="text-slate-400">LTV: <span className="text-slate-200 font-semibold">{customer.ltv}</span></p>
                </div>
                <button className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded text-xs font-semibold text-slate-300 transition-all">
                  Ações IA →
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}