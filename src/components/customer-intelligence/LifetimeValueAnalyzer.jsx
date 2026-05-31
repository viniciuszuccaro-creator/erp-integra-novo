import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { TrendingUp, DollarSign } from 'lucide-react';

const LTV_CAC_DATA = [
  { name: 'Cliente A', ltv: 450000, cac: 8500, roi: 52 },
  { name: 'Cliente B', ltv: 280000, cac: 6200, roi: 45 },
  { name: 'Cliente C', ltv: 720000, cac: 12000, roi: 59 },
  { name: 'Cliente D', ltv: 145000, cac: 4800, roi: 29 },
  { name: 'Cliente E', ltv: 580000, cac: 9500, roi: 60 },
];

const TOP_CUSTOMERS = [
  { rank: 1, name: 'Construtora MRV', ltv: 'R$ 720k', contribution: '18%', monthlyArpu: 'R$ 12k' },
  { rank: 2, name: 'Ind. Siderúrgica Vale', ltv: 'R$ 580k', contribution: '15%', monthlyArpu: 'R$ 9.5k' },
  { rank: 3, name: 'Metal Arts Ltda', ltv: 'R$ 450k', contribution: '11%', monthlyArpu: 'R$ 7.2k' },
  { rank: 4, name: 'Arquitetura & Estrutura', ltv: 'R$ 320k', contribution: '8%', monthlyArpu: 'R$ 5.1k' },
  { rank: 5, name: 'Reforma & Cia', ltv: 'R$ 280k', contribution: '7%', monthlyArpu: 'R$ 4.5k' },
];

export default function LifetimeValueAnalyzer() {
  const avgLtv = (LTV_CAC_DATA.reduce((sum, x) => sum + x.ltv, 0) / LTV_CAC_DATA.length).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  const totalRevenue = LTV_CAC_DATA.reduce((sum, x) => sum + x.ltv, 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'});
  const avgRoi = (LTV_CAC_DATA.reduce((sum, x) => sum + x.roi, 0) / LTV_CAC_DATA.length).toFixed(0);

  return (
    <div className="w-full space-y-4">
      {/* Overview KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">LTV Médio</p>
                <p className="text-lg font-bold text-emerald-400 mt-1">{avgLtv}</p>
              </div>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
          <CardContent className="pt-6">
            <div>
              <p className="text-xs text-slate-400">Receita Total</p>
              <p className="text-lg font-bold text-blue-400 mt-1">{totalRevenue}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">ROI Médio</p>
                <p className="text-lg font-bold text-amber-400 mt-1">{avgRoi}x</p>
              </div>
              <TrendingUp className="w-5 h-5 text-amber-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scatter: LTV vs CAC */}
      <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
        <CardHeader>
          <CardTitle className="text-slate-200">LTV vs Custo de Aquisição</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="cac" name="CAC (R$)" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis dataKey="ltv" name="LTV (R$)" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip 
                cursor={{ strokeDasharray: '3 3' }}
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value) => value.toLocaleString('pt-BR')}
              />
              <Scatter name="Clientes" data={LTV_CAC_DATA} fill="#10b981" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top 5 Customers */}
      <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
        <CardHeader>
          <CardTitle className="text-slate-200 text-sm">Top 5 Clientes (por LTV)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {TOP_CUSTOMERS.map((cust) => (
            <div key={cust.rank} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-400 text-sm">#{cust.rank}</span>
                  <span className="text-sm text-slate-200">{cust.name}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{cust.monthlyArpu}/mês • {cust.contribution} do total</p>
              </div>
              <span className="text-sm font-semibold text-emerald-400">{cust.ltv}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}