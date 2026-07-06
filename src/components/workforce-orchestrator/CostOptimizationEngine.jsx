import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Check } from 'lucide-react';

export default function CostOptimizationEngine() {
  const optimizations = [
    {
      descricao: 'Realoque João Silva (SP) → MG',
      economia: 'R$ 42,000',
      periodo: '6 meses',
      implementacao: 'Imediata',
      confianca: 95,
      status: 'Recomendado',
    },
    {
      descricao: 'Contrate 1 QA interno vs 2 terceirizados',
      economia: 'R$ 35,000',
      periodo: '12 meses',
      implementacao: 'Julho',
      confianca: 88,
      status: 'Análise',
    },
    {
      descricao: 'Cross-train Maria Santos (Designer) em frontend',
      economia: 'R$ 28,500',
      periodo: '6 meses',
      implementacao: 'Junho',
      confianca: 82,
      status: 'Planejado',
    },
    {
      descricao: 'Consolidar 2 operações em SP reduz overhead',
      economia: 'R$ 50,000',
      periodo: '3 meses',
      implementacao: 'Imediata',
      confianca: 91,
      status: 'Recomendado',
    },
  ];

  const costData = [
    { cenario: 'Atual', custo: 850, economia: 0 },
    { cenario: 'Realoque João', custo: 808, economia: 42 },
    { cenario: 'QA Interno', custo: 773, economia: 77 },
    { cenario: 'Otimizado', custo: 695, economia: 155 },
  ];

  const statusConfig = {
    'Recomendado': 'bg-emerald-500/20 text-emerald-400',
    'Análise': 'bg-amber-500/20 text-amber-400',
    'Planejado': 'bg-blue-500/20 text-blue-400',
    'Implementado': 'bg-cyan-500/20 text-cyan-400',
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* KPIs */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-6 py-4 bg-white/5 border-b border-white/10">
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Custo Atual (mensal)</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">R$ 850k</div>
          <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-0">5 colaboradores</Badge>
        </Card>
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Potencial Economia</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">R$ 155k</div>
          <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-0">18.2% redução</Badge>
        </Card>
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">ROI Médio</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">8.3x</div>
          <Badge className="mt-2 bg-cyan-500/20 text-cyan-400 border-0">Implementação</Badge>
        </Card>
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Iniciativas Ativas</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">4</div>
          <Badge className="mt-2 bg-amber-500/20 text-amber-400 border-0">2 imediatas</Badge>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Gráfico de Cenários */}
        <Card className="bg-white/10 border-white/20 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Cenários de Custo (R$ mil/mês)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={costData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
              <XAxis dataKey="cenario" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }} />
              <Legend />
              <Bar dataKey="custo" fill="#3b82f6" name="Custo Mensal" />
              <Bar dataKey="economia" fill="#10b981" name="Economia" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recomendações */}
        <Card className="bg-white/10 border-white/20 p-4">
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Otimizações Recomendadas pela IA
          </h3>
          <div className="space-y-3">
            {optimizations.map((opt, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-white">{opt.descricao}</h4>
                      <Badge className={`text-xs border-0 ${statusConfig[opt.status]}`}>{opt.status}</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-3 text-xs">
                      <div>
                        <p className="text-slate-400">Economia</p>
                        <p className="text-emerald-400 font-semibold mt-0.5">{opt.economia}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Período</p>
                        <p className="text-cyan-400 font-semibold mt-0.5">{opt.periodo}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Implementação</p>
                        <p className="text-blue-400 font-semibold mt-0.5">{opt.implementacao}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Confiança IA</p>
                        <p className="text-amber-400 font-semibold mt-0.5">{opt.confianca}%</p>
                      </div>
                    </div>
                  </div>
                  {opt.status === 'Recomendado' && (
                    <Button data-permission="Sistema.CostOptimizationEngine.aprovar" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white flex-shrink-0 mt-1">
                      <Check className="w-3 h-3 mr-1" />
                      Aprovar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Análise */}
        <Card className="bg-emerald-500/10 border-emerald-500/30 p-4">
          <h4 className="text-sm font-semibold text-emerald-400 mb-2">📊 Análise Detalhada</h4>
          <ul className="text-xs text-slate-300 space-y-2">
            <li>• A operação de SP tem <strong>65% de overhead</strong> vs MG. Consolidação economiza R$ 50k/3 meses.</li>
            <li>• QA interno custa R$ 35k/ano menos que terceirizado. ROI em 4.5 meses.</li>
            <li>• Maria Santos tem potencial em frontend. Treinamento de 3 semanas + economia de R$ 28.5k/6 meses.</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}