import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, BarChart3, DollarSign, CheckCircle2 } from 'lucide-react';

export default function CicloXBIForecastDashboard() {
  const [timeframe, setTimeframe] = useState('30');

  const forecasts = [
    { label: 'Faturamento', value: 'R$ 485K', trend: '+12%', color: 'text-green-600' },
    { label: 'Margem Bruta', value: '38.2%', trend: '+1.8pp', color: 'text-blue-600' },
    { label: 'Caixa Final', value: 'R$ 127K', trend: '+8%', color: 'text-amber-600' },
    { label: 'Churn Risk', value: '2.1%', trend: '-0.3pp', color: 'text-red-600' },
  ];

  return (
    <Card className="w-full h-full bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <CardTitle>BI Preditivo 30/60/90</CardTitle>
          </div>
          <Badge className="bg-green-600">ML Ready</Badge>
        </div>
        <div className="flex gap-2 mt-3">
          {['7', '30', '60', '90'].map(t => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1 text-xs rounded-lg transition ${
                timeframe === t
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-slate-600 hover:bg-green-100'
              }`}
            >
              {t}d
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto space-y-4">
        {/* Forecasts Grid */}
        <div className="grid grid-cols-2 gap-2">
          {forecasts.map((f, i) => (
            <div key={i} className="bg-white p-3 rounded-lg border border-green-100">
              <p className="text-xs text-slate-500">{f.label}</p>
              <p className={`text-lg font-bold ${f.color}`}>{f.value}</p>
              <p className="text-xs text-slate-600 mt-1">{f.trend} vs período anterior</p>
            </div>
          ))}
        </div>

        {/* Model Details */}
        <div className="bg-white p-3 rounded-lg border border-green-100">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Modelo de BI
          </h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>• <strong>Algoritmo:</strong> Prophet + XGBoost ensemble</li>
            <li>• <strong>Features:</strong> 180 variáveis históricas + eventos</li>
            <li>• <strong>Acurácia (MAPE):</strong> 6.8% (dentro do esperado)</li>
            <li>• <strong>Atualização:</strong> Diária às 05:00 UTC</li>
            <li>• <strong>Cenários:</strong> Pessimista, base, otimista</li>
          </ul>
        </div>

        {/* Insights */}
        <div className="bg-white p-3 rounded-lg border border-green-100">
          <h4 className="text-sm font-semibold text-slate-900 mb-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Insights IA
          </h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>✓ Faturamento acelerado: +12% vs baseline</li>
            <li>✓ Sazonalidade detectada em Q3</li>
            <li>⚠ Margem sob pressão: revisar mix de vendas</li>
            <li>✓ Caixa em alta: oportunidade de reinvestimento</li>
          </ul>
        </div>

        {/* Endpoint */}
        <div className="bg-slate-900 text-slate-100 p-3 rounded-lg text-xs font-mono">
          <p className="text-slate-400">POST /functions/biForecastPreditivo</p>
          <p className="mt-1 text-green-400">✓ Ativo em produção</p>
        </div>
      </CardContent>
    </Card>
  );
}