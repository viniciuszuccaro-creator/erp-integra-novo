/**
 * EmployeeProductivityPanel v1.0 — Passo 38
 * Dashboard de produtividade por colaborador em tempo real
 * Regra-Mãe: w-full h-full, IA, análise comportamental
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Zap, Clock, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const EMPLOYEES = [
  {
    id: 1,
    nome: 'João Silva',
    departamento: 'Vendas',
    cargo: 'Vendedor Sr.',
    produtividade: 94,
    meta: 100,
    horasEfetivas: 8.4,
    pedidosCriados: 28,
    receita: 'R$ 342k',
    tendencia: 'up',
    scores: { qualidade: 92, prazos: 96, clientes: 89 },
  },
  {
    id: 2,
    nome: 'Maria Santos',
    departamento: 'Estoque',
    cargo: 'Gerente Almoxarife',
    produtividade: 87,
    meta: 100,
    horasEfetivas: 8.1,
    movimentacoes: 156,
    acuracidade: '99.2%',
    tendencia: 'down',
    scores: { qualidade: 98, prazos: 85, eficiencia: 88 },
  },
  {
    id: 3,
    nome: 'Pedro Costa',
    departamento: 'Produção',
    cargo: 'Operador CNC',
    produtividade: 91,
    meta: 100,
    horasEfetivas: 8.3,
    pecas: 847,
    refugo: '0.8%',
    tendencia: 'up',
    scores: { qualidade: 99, prazos: 89, seguranca: 100 },
  },
];

const HORA_DATA = [
  { hora: '8h', usuarios: 48 },
  { hora: '10h', usuarios: 52 },
  { hora: '12h', usuarios: 38 },
  { hora: '14h', usuarios: 55 },
  { hora: '16h', usuarios: 49 },
  { hora: '18h', usuarios: 32 },
];

export default function EmployeeProductivityPanel({ empresa }) {
  return (
    <div className="w-full h-full flex flex-col gap-4 p-5 bg-gradient-to-br from-slate-900 to-emerald-950 overflow-auto">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 flex-shrink-0">
        <Zap className="w-5 h-5 text-emerald-400" />
        Produtividade de Colaboradores — {empresa}
      </h2>

      {/* Atividade por Hora */}
      <Card className="p-4 bg-white/5 border border-white/10 rounded-xl flex-shrink-0">
        <p className="text-sm font-semibold text-white mb-3">📊 Atividade ao Longo do Dia</p>
        <ResponsiveContainer width="100%" height={150}>
          <BarChart data={HORA_DATA}>
            <XAxis dataKey="hora" tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #059669', borderRadius: 8 }} />
            <Bar dataKey="usuarios" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Colaboradores */}
      <div className="space-y-3">
        {EMPLOYEES.map((emp) => (
          <Card key={emp.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{emp.nome}</p>
                <p className="text-xs text-slate-400">{emp.cargo} • {emp.departamento}</p>
              </div>
              <div className="text-right">
                <Badge className={`${emp.tendencia === 'up' ? 'bg-green-500/20 text-green-300' : 'bg-amber-500/20 text-amber-300'}`}>
                  {emp.tendencia === 'up' ? '📈' : '📉'} {emp.produtividade}%
                </Badge>
              </div>
            </div>

            {/* Produtividade */}
            <div className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-400">Produtividade</span>
                <span className="text-xs font-bold text-white">{emp.produtividade}/{emp.meta}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${(emp.produtividade / emp.meta) * 100}%` }} />
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-2 text-xs mb-3">
              <div className="bg-white/10 p-2 rounded">
                <p className="text-slate-400">Horas Efetivas</p>
                <p className="font-bold text-white">{emp.horasEfetivas}h</p>
              </div>
              <div className="bg-white/10 p-2 rounded">
                <p className="text-slate-400">Meta</p>
                <p className="font-bold text-emerald-400">{emp.departamento === 'Vendas' ? emp.receita : emp.departamento === 'Estoque' ? emp.acuracidade : emp.refugo}</p>
              </div>
              <div className="bg-white/10 p-2 rounded">
                <p className="text-slate-400">Principal</p>
                <p className="font-bold text-white">{emp.departamento === 'Vendas' ? emp.pedidosCriados + 'pd' : emp.departamento === 'Estoque' ? emp.movimentacoes + 'mv' : emp.pecas + 'pç'}</p>
              </div>
            </div>

            {/* Scores */}
            <div className="flex gap-1 text-xs">
              {Object.entries(emp.scores).map(([key, value]) => (
                <div key={key} className="flex-1 bg-white/10 p-1.5 rounded text-center">
                  <p className="text-slate-400 capitalize text-[10px]">{key}</p>
                  <p className={`font-bold ${value >= 95 ? 'text-green-400' : value >= 85 ? 'text-emerald-300' : 'text-amber-300'}`}>{value}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}