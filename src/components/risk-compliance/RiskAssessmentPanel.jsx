import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';

export default function RiskAssessmentPanel() {
  const riscos = [
    { id: 'R001', categoria: 'Operacional', descricao: 'Falha de infraestrutura crítica', score: 8.5, probabilidade: 'Média', impacto: 'Alto' },
    { id: 'R002', categoria: 'Financeiro', descricao: 'Fraude em pagamentos internacionais', score: 7.2, probabilidade: 'Baixa', impacto: 'Crítico' },
    { id: 'R003', categoria: 'Compliance', descricao: 'Não-conformidade fiscal municipal', score: 6.1, probabilidade: 'Média', impacto: 'Médio' },
    { id: 'R004', categoria: 'Segurança', descricao: 'Vulnerabilidade de dados do cliente', score: 9.1, probabilidade: 'Baixa', impacto: 'Crítico' },
    { id: 'R005', categoria: 'Reputacional', descricao: 'Incidente de privacidade de dados', score: 7.8, probabilidade: 'Média', impacto: 'Alto' },
  ];

  const distribuicaoRisco = [
    { name: 'Operacional', value: 32, fill: '#f59e0b' },
    { name: 'Financeiro', value: 28, fill: '#ef4444' },
    { name: 'Compliance', value: 18, fill: '#3b82f6' },
    { name: 'Segurança', value: 15, fill: '#8b5cf6' },
    { name: 'Reputacional', value: 7, fill: '#ec4899' },
  ];

  const tendencias = [
    { mês: 'Jan', valor: 5.8 },
    { mês: 'Fev', valor: 6.1 },
    { mês: 'Mar', valor: 5.9 },
    { mês: 'Abr', valor: 6.4 },
    { mês: 'Mai', valor: 6.2 },
    { mês: 'Jun', valor: 6.2 },
  ];

  const getScoreColor = (score) => {
    if (score >= 8) return 'text-red-400 bg-red-900/30';
    if (score >= 6) return 'text-amber-400 bg-amber-900/30';
    return 'text-yellow-400 bg-yellow-900/30';
  };

  const getImpactoIcon = (impacto) => {
    return impacto === 'Crítico' ? <TrendingUp className="w-4 h-4 text-red-400" /> : <TrendingDown className="w-4 h-4 text-amber-400" />;
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Distribuição de Riscos</CardTitle>
          </CardHeader>
          <CardContent className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribuicaoRisco} cx="50%" cy="50%" innerRadius={30} outerRadius={60} paddingAngle={2} dataKey="value">
                  {distribuicaoRisco.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-white">Tendência de Risco (6 meses)</CardTitle>
          </CardHeader>
          <CardContent className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tendencias}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="mês" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" domain={[0, 10]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
                <Bar dataKey="valor" fill="#f59e0b" name="Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Riscos Ativos */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Top 5 Riscos Identificados</h3>
        {riscos.map(r => (
          <Card key={r.id} className={`${getScoreColor(r.score)} border-slate-700`}>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="font-semibold text-white text-sm">{r.descricao}</p>
                  </div>
                  <span className={`text-lg font-bold`}>{r.score.toFixed(1)}</span>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className="bg-slate-700 text-slate-200 text-xs">{r.categoria}</Badge>
                  <Badge className="bg-slate-700 text-slate-200 text-xs">{r.probabilidade}</Badge>
                  <Badge className={r.impacto === 'Crítico' ? 'bg-red-900 text-red-200' : 'bg-amber-900 text-amber-200'}>
                    {r.impacto}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Matriz Probabilidade x Impacto */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Matriz Probabilidade vs Impacto</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-green-900/30 p-2 rounded border border-green-700 text-green-200 text-center">Baixo Risco</div>
            <div className="bg-amber-900/30 p-2 rounded border border-amber-700 text-amber-200 text-center">Risco Médio</div>
            <div className="bg-red-900/30 p-2 rounded border border-red-700 text-red-200 text-center">Alto Risco</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}