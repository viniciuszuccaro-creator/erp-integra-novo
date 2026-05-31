import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, TrendingDown, AlertTriangle } from 'lucide-react';

export default function CopilotFinancialIntelligence() {
  const [view, setView] = useState('fluxo');

  const fluxoCaixa = [
    { dia: '31/5', entrada: 42000, saida: 28000, saldo: 185000 },
    { dia: '1/6', entrada: 15000, saida: 42000, saldo: 158000 },
    { dia: '2/6', entrada: 0, saida: 8000, saldo: 150000 },
    { dia: '3/6', entrada: 65000, saida: 35000, saldo: 180000 },
    { dia: '4/6', entrada: 22000, saida: 18000, saldo: 184000 },
    { dia: '5/6', entrada: 0, saida: 12000, saldo: 172000 },
  ];

  const rentabilidade = [
    { produto: 'CA-50', margem: 18, volume: 250 },
    { produto: 'CA-60', margem: 22, volume: 180 },
    { produto: 'Tubo Gal.', margem: 16, volume: 320 },
    { produto: 'Parafuso', margem: 12, volume: 500 },
    { produto: 'Chapa', margem: 14, volume: 400 },
  ];

  const alertas = [
    { titulo: 'Inadimplência R$180k', descricao: '12 clientes em atraso', cor: 'text-red-400' },
    { titulo: 'Fluxo Negativo em 2 dias', descricao: 'Saída > Entrada. Reavaliar prazos?', cor: 'text-yellow-400' },
    { titulo: 'Produto com Menor Margem', descricao: 'Parafuso M12 em 12%. Revisão de preço sugerida.', cor: 'text-orange-400' },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Alertas Críticos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {alertas.map((alerta, idx) => (
          <Card key={idx} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex gap-2">
                <AlertTriangle className={`w-5 h-5 ${alerta.cor} shrink-0 mt-0.5`} />
                <div>
                  <p className={`text-sm font-bold ${alerta.cor}`}>{alerta.titulo}</p>
                  <p className="text-xs text-slate-400">{alerta.descricao}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['fluxo', 'rentabilidade'].map(v => (
          <button key={v} onClick={() => setView(v)} className={`px-3 py-2 text-sm rounded-lg font-semibold ${view === v ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {v === 'fluxo' ? 'Fluxo de Caixa' : 'Rentabilidade'}
          </button>
        ))}
      </div>

      {/* Fluxo de Caixa */}
      {view === 'fluxo' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Previsão Fluxo 7 Dias
            </CardTitle>
          </CardHeader>
          <CardContent className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={fluxoCaixa}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="dia" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} formatter={(v) => `R$ ${v.toLocaleString()}`} />
                <Bar dataKey="entrada" fill="#10b981" name="Entrada" />
                <Bar dataKey="saida" fill="#ef4444" name="Saída" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Rentabilidade */}
      {view === 'rentabilidade' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Análise Rentabilidade por Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rentabilidade.map((r, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-slate-700/50 rounded">
                  <span className="text-sm text-slate-300">{r.produto}</span>
                  <div className="flex gap-4">
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Margem</p>
                      <p className="text-sm font-bold text-emerald-400">{r.margem}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Volume/mês</p>
                      <p className="text-sm font-bold text-blue-400">{r.volume}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-yellow-400 mt-3 flex gap-2">
              <TrendingDown className="w-4 h-4 shrink-0" />
              Recomendação: Aumentar preço de Parafuso M12 em 8% (margem → 20%)
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}