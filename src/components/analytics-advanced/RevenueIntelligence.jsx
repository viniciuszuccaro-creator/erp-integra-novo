/**
 * RevenueIntelligence v1.0
 * Inteligência de Receita por segmento, canal e produto
 * Passo 33: Decomposição de receita com IA
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const RECEITA_CANAL = [
  { canal: 'Direto', valor: 420000 },
  { canal: 'Portal', valor: 187000 },
  { canal: 'WhatsApp', valor: 143000 },
  { canal: 'Marketplace', valor: 97000 },
];

const RECEITA_SEGMENTO = [
  { name: 'Metalúrgica', value: 38, color: '#7c3aed' },
  { name: 'Construtora', value: 27, color: '#2563eb' },
  { name: 'Indústria', value: 21, color: '#059669' },
  { name: 'Outros', value: 14, color: '#d97706' },
];

export default function RevenueIntelligence({ empresa }) {
  const total = RECEITA_CANAL.reduce((acc, c) => acc + c.valor, 0);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-violet-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Target className="w-6 h-6 text-violet-400" />
        Revenue Intelligence
      </h2>

      {/* Total */}
      <Card className="p-5 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-400/40 rounded-lg">
        <p className="text-sm text-slate-400">Receita Total (Mês)</p>
        <p className="text-4xl font-black text-white mt-1">
          R$ {(total / 1000).toFixed(0)}k
        </p>
        <Badge className="mt-2 bg-green-500/20 text-green-300">+8.6% vs mês anterior</Badge>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Por Canal */}
        <Card className="p-4 bg-white/5 border border-violet-500/30 rounded-lg">
          <p className="text-sm font-semibold text-white mb-3">Por Canal de Venda</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={RECEITA_CANAL} layout="vertical">
              <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fill: '#94a3b8', fontSize: 10 }} />
              <YAxis type="category" dataKey="canal" tick={{ fill: '#94a3b8', fontSize: 11 }} width={65} />
              <Tooltip
                formatter={(v) => [`R$ ${(v / 1000).toFixed(0)}k`]}
                contentStyle={{ background: '#1e293b', border: '1px solid #7c3aed44', borderRadius: 8, color: '#fff' }}
              />
              <Bar dataKey="valor" fill="#7c3aed" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Por Segmento */}
        <Card className="p-4 bg-white/5 border border-violet-500/30 rounded-lg">
          <p className="text-sm font-semibold text-white mb-3">Por Segmento de Cliente</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie data={RECEITA_SEGMENTO} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value">
                  {RECEITA_SEGMENTO.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`${v}%`]} contentStyle={{ background: '#1e293b', border: '1px solid #7c3aed44', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {RECEITA_SEGMENTO.map((seg) => (
                <div key={seg.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                  <p className="text-xs text-slate-300">{seg.name}</p>
                  <p className="text-xs font-bold text-white ml-auto">{seg.value}%</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}