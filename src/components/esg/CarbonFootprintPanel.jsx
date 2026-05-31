import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { Leaf, TrendingDown, Factory, Truck, Zap } from 'lucide-react';

export default function CarbonFootprintPanel() {
  const [view, setView] = useState('evolucao');

  const evolucao = [
    { mes: 'Jan', escopo1: 124, escopo2: 89, escopo3: 210, total: 423 },
    { mes: 'Fev', escopo1: 118, escopo2: 85, escopo3: 198, total: 401 },
    { mes: 'Mar', escopo1: 115, escopo2: 83, escopo3: 190, total: 388 },
    { mes: 'Abr', escopo1: 112, escopo2: 79, escopo3: 185, total: 376 },
    { mes: 'Mai', escopo1: 108, escopo2: 76, escopo3: 178, total: 362 },
  ];

  const porFonte = [
    { fonte: 'Produção', emissao: 108, icone: Factory, cor: '#ef4444', pct: 30 },
    { fonte: 'Logística', emissao: 89, icone: Truck, cor: '#f59e0b', pct: 25 },
    { fonte: 'Energia Elétrica', emissao: 76, icone: Zap, cor: '#3b82f6', pct: 21 },
    { fonte: 'Cadeia de Fornecedores', emissao: 62, icone: Leaf, cor: '#10b981', pct: 17 },
    { fonte: 'Outros', emissao: 27, icone: Leaf, cor: '#6b7280', pct: 7 },
  ];

  const metas = [
    { meta: 'Redução 15% vs 2025', progresso: 64, status: 'Em progresso' },
    { meta: 'Carbono Neutro 2030', progresso: 22, status: 'Iniciado' },
    { meta: 'Energia Renovável 50%', progresso: 38, status: 'Em progresso' },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-emerald-900/30 border-emerald-600">
          <CardContent className="p-3">
            <p className="text-xs text-emerald-400">Emissão Mensal</p>
            <p className="text-xl font-bold text-emerald-400">362 tCO₂</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Redução vs Jan</p>
            <p className="text-xl font-bold text-emerald-400">-14.4%</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Intensidade</p>
            <p className="text-xl font-bold text-blue-400">0.42 kg/R$</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Score Clima</p>
            <p className="text-xl font-bold text-purple-400">B+</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {['evolucao', 'fontes', 'metas'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-2 text-sm rounded-lg font-semibold ${view === v ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {v === 'evolucao' ? 'Evolução' : v === 'fontes' ? 'Por Fonte' : 'Metas'}
          </button>
        ))}
      </div>

      {/* Evolução */}
      {view === 'evolucao' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Emissões por Escopo (tCO₂eq)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="mes" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Legend />
                <Area type="monotone" dataKey="escopo1" stroke="#ef4444" fill="#ef444420" name="Escopo 1" stackId="1" />
                <Area type="monotone" dataKey="escopo2" stroke="#3b82f6" fill="#3b82f620" name="Escopo 2" stackId="1" />
                <Area type="monotone" dataKey="escopo3" stroke="#f59e0b" fill="#f59e0b20" name="Escopo 3" stackId="1" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Por Fonte */}
      {view === 'fontes' && (
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-4 space-y-3">
            {porFonte.map((f, idx) => {
              const Icon = f.icone;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 shrink-0" style={{ color: f.cor }} />
                  <div className="flex-1">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{f.fonte}</span>
                      <span className="font-bold text-white">{f.emissao} tCO₂ ({f.pct}%)</span>
                    </div>
                    <div className="bg-slate-700 rounded-full h-2">
                      <div className="h-2 rounded-full" style={{ width: `${f.pct * 3}%`, background: f.cor }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Metas */}
      {view === 'metas' && (
        <div className="space-y-3">
          {metas.map((m, idx) => (
            <Card key={idx} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex justify-between mb-2">
                  <p className="font-semibold text-white text-sm">{m.meta}</p>
                  <span className="text-xs text-slate-400">{m.status}</span>
                </div>
                <div className="flex justify-between mb-1 text-xs">
                  <span className="text-slate-400">Progresso</span>
                  <span className="font-bold text-emerald-400">{m.progresso}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${m.progresso}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}