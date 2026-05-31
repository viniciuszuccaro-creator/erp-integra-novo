/**
 * CompensationOptimizer v1.0 — Passo 38
 * Otimização de compensação + equidade salarial com IA
 * Regra-Mãe: w-full h-full, IA, otimização financeira de RH
 */
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';

const SALARY_ANALYSIS = [
  {
    cargo: 'Vendedor Sr.',
    atual: 'R$ 5.800',
    mercado: 'R$ 6.400',
    desvio: -9.4,
    recomendacao: 'Aumentar 10%',
    impacto: 'Reduz risco rotatividade',
  },
  {
    cargo: 'Gerente Almoxarife',
    atual: 'R$ 4.200',
    mercado: 'R$ 4.100',
    desvio: +2.4,
    recomendacao: 'Manter',
    impacto: 'Posição competitiva adequada',
  },
  {
    cargo: 'Operador CNC',
    atual: 'R$ 3.600',
    mercado: 'R$ 3.800',
    desvio: -5.3,
    recomendacao: 'Aumentar 6%',
    impacto: 'Reter especialista crítico',
  },
  {
    cargo: 'Analista Financeiro',
    atual: 'R$ 6.100',
    mercado: 'R$ 7.200',
    desvio: -15.3,
    recomendacao: 'Aumentar 15%',
    impacto: '🚨 Urgente — risco saída',
  },
];

const BENEFICIOS = [
  { nome: 'Vale Alimentação', usuarios: 28, custo: 'R$ 12.6k/mês', utilizado: '98%' },
  { nome: 'Vale Transporte', usuarios: 34, custo: 'R$ 8.2k/mês', utilizado: '92%' },
  { nome: 'Plano de Saúde', usuarios: 32, custo: 'R$ 18.4k/mês', utilizado: '87%' },
  { nome: 'Vale Refeição', usuarios: 28, custo: 'R$ 10.8k/mês', utilizado: '95%' },
];

export default function CompensationOptimizer({ empresa }) {
  const totalImpacto = 0.10 * 5800 + 0.06 * 3600 + 0.15 * 6100; // Aproximado
  const totalBeneficios = 12.6 + 8.2 + 18.4 + 10.8; // em mil

  return (
    <div className="w-full h-full flex flex-col gap-4 p-5 bg-gradient-to-br from-slate-900 to-emerald-950 overflow-auto">
      <h2 className="text-xl font-bold text-white flex items-center gap-2 flex-shrink-0">
        <DollarSign className="w-5 h-5 text-emerald-400" />
        Otimização de Compensação — {empresa}
      </h2>

      {/* ROI Card */}
      <Card className="p-4 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-400/40 rounded-xl flex-shrink-0">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-slate-400">Impacto de Aumentos</p>
            <p className="text-2xl font-black text-white">R$ {(totalImpacto / 1000).toFixed(1)}k/mês</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Benefícios Totais</p>
            <p className="text-2xl font-black text-emerald-400">R$ {totalBeneficios.toFixed(1)}k/mês</p>
          </div>
        </div>
      </Card>

      {/* Análise Salarial */}
      <Card className="p-4 bg-white/5 border border-white/10 rounded-xl flex-shrink-0">
        <p className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-emerald-400" />
          Análise Salarial vs Mercado
        </p>
        <div className="space-y-2 text-xs">
          {SALARY_ANALYSIS.map((s) => (
            <div key={s.cargo} className="flex items-center gap-2 p-2 bg-white/5 rounded">
              <div className="flex-1">
                <p className="font-semibold text-white">{s.cargo}</p>
                <p className="text-slate-400">{s.atual} vs {s.mercado}</p>
              </div>
              <div className={`px-2 py-1 rounded font-bold ${
                s.desvio < -10 ? 'bg-red-500/20 text-red-300' :
                s.desvio < -5 ? 'bg-amber-500/20 text-amber-300' :
                'bg-green-500/20 text-green-300'
              }`}>
                {s.desvio > 0 ? '+' : ''}{s.desvio}%
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recomendações */}
      <div className="space-y-2">
        {SALARY_ANALYSIS.map((s) => (
          <Card key={s.cargo} className="p-3 bg-white/5 border border-white/10 rounded-xl">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-xs font-bold text-white">{s.recomendacao}</p>
                <p className="text-xs text-slate-400 mt-0.5">{s.impacto}</p>
              </div>
              <Badge className="bg-emerald-500/20 text-emerald-300 text-xs">{s.cargo}</Badge>
            </div>
          </Card>
        ))}
      </div>

      {/* Benefícios */}
      <Card className="p-4 bg-white/5 border border-white/10 rounded-xl flex-shrink-0">
        <p className="text-sm font-semibold text-white mb-3">🎁 Benefícios Ofertados</p>
        <div className="space-y-2 text-xs">
          {BENEFICIOS.map((b) => (
            <div key={b.nome} className="flex items-center justify-between p-2 bg-white/10 rounded">
              <div>
                <p className="font-semibold text-white">{b.nome}</p>
                <p className="text-slate-400">{b.usuarios} colaboradores • {b.custo}</p>
              </div>
              <Badge className="bg-teal-500/20 text-teal-300">{b.utilizado}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}