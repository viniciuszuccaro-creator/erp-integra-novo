import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Crown, Users, AlertCircle, Sparkles } from 'lucide-react';

const SEGMENTS = [
  { name: 'VIP', value: 20, count: 249, revenue: 'R$ 1.2M', icon: Crown, color: '#f59e0b' },
  { name: 'Regular', value: 45, count: 559, revenue: 'R$ 890k', icon: Users, color: '#10b981' },
  { name: 'At-Risk', value: 20, count: 248, revenue: 'R$ 180k', icon: AlertCircle, color: '#ef4444' },
  { name: 'Prospect', value: 15, count: 189, revenue: 'R$ 52k', icon: Sparkles, color: '#8b5cf6' },
];

const PIE_DATA = SEGMENTS.map(s => ({ name: s.name, value: s.value, color: s.color }));

const SEGMENT_GROWTH = [
  { segment: 'VIP', 'Mês Atual': 249, 'Mês Anterior': 235 },
  { segment: 'Regular', 'Mês Atual': 559, 'Mês Anterior': 548 },
  { segment: 'At-Risk', 'Mês Atual': 248, 'Mês Anterior': 263 },
  { segment: 'Prospect', 'Mês Atual': 189, 'Mês Anterior': 172 },
];

export default function SegmentationPanel() {
  return (
    <div className="w-full space-y-4">
      {/* Pie Chart */}
      <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
        <CardHeader>
          <CardTitle className="text-slate-200">Distribuição de Segmentos</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={PIE_DATA}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} (${value}%)`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {PIE_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Segment Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SEGMENTS.map((seg) => {
          const SegIcon = seg.icon;
          return (
            <Card key={seg.name} className="bg-gradient-to-br from-slate-900/60 to-slate-950/60 border-slate-800/30">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <SegIcon className="w-4 h-4" style={{ color: seg.color }} />
                    <span className="font-semibold text-slate-200">{seg.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-300 bg-white/5 px-2 py-1 rounded">{seg.value}%</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>{seg.count} clientes</span>
                  <span>{seg.revenue}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Growth Comparison */}
      <Card className="bg-gradient-to-br from-emerald-950/60 to-slate-950/60 border-emerald-900/30">
        <CardHeader>
          <CardTitle className="text-slate-200 text-sm">Crescimento de Segmentos (Mês)</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={SEGMENT_GROWTH}>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="segment" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
              <Bar dataKey="Mês Anterior" fill="#64748b" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Mês Atual" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}