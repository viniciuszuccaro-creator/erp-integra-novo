import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Users, MessageSquare, Lightbulb } from 'lucide-react';

export default function CollectiveInsightsPanel() {
  const topicos = [
    { topico: 'NF-e & Fiscal', discussoes: 142, solucoes: 138, satisfacao: 97 },
    { topico: 'Gestão Financeira', discussoes: 98, solucoes: 90, satisfacao: 92 },
    { topico: 'Configurações RBAC', discussoes: 76, solucoes: 71, satisfacao: 93 },
    { topico: 'Estoque & WMS', discussoes: 65, solucoes: 60, satisfacao: 92 },
    { topico: 'Logística & Entrega', discussoes: 54, solucoes: 49, satisfacao: 91 },
  ];

  const tendencias = [
    { mes: 'Jan', artigos: 82, busca: 210 },
    { mes: 'Fev', artigos: 95, busca: 248 },
    { mes: 'Mar', artigos: 110, busca: 295 },
    { mes: 'Abr', artigos: 128, busca: 315 },
    { mes: 'Mai', artigos: 142, busca: 342 },
  ];

  const insights = [
    { tipo: 'Padrão', descricao: '73% das dúvidas sobre NF-e ocorrem na 2ª semana do mês', impacto: 'Alto', acao: 'Criar alerta proativo' },
    { tipo: 'Oportunidade', descricao: 'Artigos sobre SPED têm 40% menos conteúdo que a demanda real', impacto: 'Médio', acao: 'Expandir categoria' },
    { tipo: 'Eficiência', descricao: 'Busca semântica reduz em 68% o tempo para encontrar respostas', impacto: 'Alto', acao: 'Promover busca IA' },
  ];

  const colaboradores = [
    { nome: 'Ana Oliveira', contribuicoes: 34, badges: ['Especialista Fiscal', 'Top Contributor'] },
    { nome: 'Carlos Santos', contribuicoes: 28, badges: ['RBAC Expert'] },
    { nome: 'Maria Lima', contribuicoes: 22, badges: ['Financeiro Pro'] },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Tendência de uso */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Crescimento do Conhecimento (5 meses)</CardTitle>
        </CardHeader>
        <CardContent className="h-44">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={tendencias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="mes" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Line type="monotone" dataKey="artigos" stroke="#6366f1" name="Artigos" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="busca" stroke="#10b981" name="Buscas" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Tópicos */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Top Tópicos por Engajamento</CardTitle>
        </CardHeader>
        <CardContent className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topicos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="topico" type="category" stroke="#94a3b8" width={100} tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Bar dataKey="discussoes" fill="#6366f1" name="Discussões" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Insights da IA */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-amber-400" /> Insights Gerados pela IA
        </h3>
        {insights.map((ins, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700 border-l-4 border-l-amber-500">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={ins.tipo === 'Padrão' ? 'bg-blue-900 text-blue-200' : ins.tipo === 'Oportunidade' ? 'bg-purple-900 text-purple-200' : 'bg-emerald-900 text-emerald-200'}>
                      {ins.tipo}
                    </Badge>
                    <Badge className={ins.impacto === 'Alto' ? 'bg-red-900 text-red-200' : 'bg-amber-900 text-amber-200'}>
                      {ins.impacto}
                    </Badge>
                  </div>
                  <p className="text-sm text-white">{ins.descricao}</p>
                  <p className="text-xs text-indigo-400 mt-1">→ {ins.acao}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Top Colaboradores */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Top Colaboradores</h3>
        {colaboradores.map((c, i) => (
          <Card key={i} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">{c.nome[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{c.nome}</p>
                  <p className="text-xs text-slate-400">{c.contribuicoes} contribuições</p>
                </div>
                <div className="flex gap-1 flex-wrap justify-end shrink-0 max-w-[120px]">
                  {c.badges.map(b => (
                    <span key={b} className="text-xs bg-indigo-900 text-indigo-200 px-1.5 py-0.5 rounded">{b}</span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}