import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Heart, BookOpen, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function SocialImpactPanel() {
  const indicadores = [
    { titulo: 'Colaboradores Totais', valor: '342', variacao: '+12 vs 2025', icone: Users, cor: 'text-blue-400' },
    { titulo: 'Diversidade (mulheres)', valor: '38%', variacao: '+3pp vs meta 40%', icone: Heart, cor: 'text-pink-400' },
    { titulo: 'Horas de Treinamento', valor: '4.2h', variacao: 'Média por colaborador/mês', icone: BookOpen, cor: 'text-yellow-400' },
    { titulo: 'Índice de Satisfação', valor: '82%', variacao: '+5pp vs 2025', icone: TrendingUp, cor: 'text-emerald-400' },
  ];

  const programasSociais = [
    { nome: 'Aprendizes em Formação', beneficiados: 24, status: 'Ativo' },
    { nome: 'Doações Comunidade Local', beneficiados: 320, status: 'Ativo' },
    { nome: 'Qualificação Profissional', beneficiados: 58, status: 'Ativo' },
    { nome: 'Saúde Mental no Trabalho', beneficiados: 342, status: 'Ativo' },
  ];

  const treinamentoPorArea = [
    { area: 'Operacional', horas: 5.2 },
    { area: 'Comercial', horas: 3.8 },
    { area: 'Financeiro', horas: 4.1 },
    { area: 'RH', horas: 6.4 },
    { area: 'TI', horas: 7.2 },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* KPIs Sociais */}
      <div className="grid grid-cols-2 gap-3">
        {indicadores.map((ind, idx) => {
          const Icon = ind.icone;
          return (
            <Card key={idx} className="bg-slate-800 border-slate-700">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <Icon className={`w-6 h-6 shrink-0 ${ind.cor}`} />
                  <div>
                    <p className="text-xs text-slate-400">{ind.titulo}</p>
                    <p className={`text-xl font-bold ${ind.cor}`}>{ind.valor}</p>
                    <p className="text-xs text-slate-500 mt-1">{ind.variacao}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Treinamento por Área */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Horas de Treinamento por Área (média/mês)</CardTitle>
        </CardHeader>
        <CardContent className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={treinamentoPorArea}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="area" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Bar dataKey="horas" fill="#10b981" name="Horas" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Programas Sociais */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Programas Sociais Ativos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {programasSociais.map((p, idx) => (
            <div key={idx} className="flex justify-between items-center p-2 bg-slate-700/50 rounded text-sm">
              <div>
                <p className="font-semibold text-white">{p.nome}</p>
                <p className="text-xs text-slate-400">{p.beneficiados} beneficiados</p>
              </div>
              <span className="px-2 py-1 rounded text-xs bg-emerald-900 text-emerald-200">{p.status}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}