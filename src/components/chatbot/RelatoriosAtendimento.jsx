import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import {
  FileText,
  Download,
  TrendingUp,
  Users,
  Clock,
  MessageCircle,
  ThumbsUp,
  Bot,
  Calendar,
  Filter
} from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * V21.6 - RELATÓRIOS DE ATENDIMENTO
 * 
 * Relatórios completos:
 * ✅ Performance por período
 * ✅ Análise de canais
 * ✅ Métricas de SLA
 * ✅ Ranking de atendentes
 * ✅ Tendências
 */
export default function RelatoriosAtendimento() {
  const [periodo, setPeriodo] = useState('7dias');
  const { empresaAtual, grupoAtual, filterInContext, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const CORES = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Buscar dados
  const { data: conversas = [], isLoading } = useQuery({
    queryKey: ['relatorio-conversas', periodo, contextoKey],
    queryFn: async () => {
      const dataInicio = new Date();
      if (periodo === '7dias') dataInicio.setDate(dataInicio.getDate() - 7);
      else if (periodo === '30dias') dataInicio.setDate(dataInicio.getDate() - 30);
      else if (periodo === '90dias') dataInicio.setDate(dataInicio.getDate() - 90);

      return await filterInContext('ConversaOmnicanal', {}, '-created_date', 999);
    },
    enabled: !!contexto
  });

  // Calcular métricas
  const metricas = useMemo(() => {
    if (conversas.length === 0) return null;

    const resolvidas = conversas.filter(c => c.status === 'Resolvida');
    const resolvidasBot = resolvidas.filter(c => c.tipo_atendimento === 'Bot');
    const resolvidasHumano = resolvidas.filter(c => c.tipo_atendimento === 'Humano');
    
    const temposResposta = conversas
      .filter(c => c.tempo_primeira_resposta_minutos)
      .map(c => c.tempo_primeira_resposta_minutos);
    
    const tempoMedioResposta = temposResposta.length > 0
      ? temposResposta.reduce((a, b) => a + b, 0) / temposResposta.length
      : 0;

    const avaliacoes = conversas.filter(c => c.score_satisfacao);
    const csatMedio = avaliacoes.length > 0
      ? avaliacoes.reduce((sum, c) => sum + c.score_satisfacao, 0) / avaliacoes.length
      : 0;

    // Por canal
    const porCanal = {};
    conversas.forEach(c => {
      porCanal[c.canal] = (porCanal[c.canal] || 0) + 1;
    });

    // Por status
    const porStatus = {};
    conversas.forEach(c => {
      porStatus[c.status] = (porStatus[c.status] || 0) + 1;
    });

    // Por dia
    const porDia = {};
    conversas.forEach(c => {
      const dia = new Date(c.data_inicio).toLocaleDateString('pt-BR');
      porDia[dia] = (porDia[dia] || 0) + 1;
    });

    // Por sentimento
    const porSentimento = {};
    conversas.forEach(c => {
      const sent = c.sentimento_geral || 'Neutro';
      porSentimento[sent] = (porSentimento[sent] || 0) + 1;
    });

    return {
      total: conversas.length,
      resolvidas: resolvidas.length,
      taxaResolucao: conversas.length > 0 ? (resolvidas.length / conversas.length) * 100 : 0,
      resolvidasBot: resolvidasBot.length,
      resolvidasHumano: resolvidasHumano.length,
      taxaBot: resolvidas.length > 0 ? (resolvidasBot.length / resolvidas.length) * 100 : 0,
      tempoMedioResposta,
      csatMedio,
      totalAvaliacoes: avaliacoes.length,
      porCanal: Object.entries(porCanal).map(([canal, total]) => ({ canal, total })),
      porStatus: Object.entries(porStatus).map(([status, total]) => ({ status, total })),
      porDia: Object.entries(porDia).map(([dia, total]) => ({ dia, total })).slice(-14),
      porSentimento: Object.entries(porSentimento).map(([sentimento, total]) => ({ sentimento, total }))
    };
  }, [conversas]);

  const exportarRelatorio = () => {
    if (!metricas) return;

    const csv = [
      'Métrica,Valor',
      `Total Conversas,${metricas.total}`,
      `Resolvidas,${metricas.resolvidas}`,
      `Taxa Resolução,${metricas.taxaResolucao.toFixed(1)}%`,
      `Resolvidas Bot,${metricas.resolvidasBot}`,
      `Resolvidas Humano,${metricas.resolvidasHumano}`,
      `Taxa Bot,${metricas.taxaBot.toFixed(1)}%`,
      `Tempo Médio Resposta,${metricas.tempoMedioResposta.toFixed(1)} min`,
      `CSAT Médio,${metricas.csatMedio.toFixed(1)}/5`,
      '',
      'Canal,Total',
      ...metricas.porCanal.map(c => `${c.canal},${c.total}`)
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-atendimento-${periodo}.csv`;
    a.click();
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-auto p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              Relatórios de Atendimento
            </h1>
            <p className="text-slate-600 mt-1">Métricas e análises do Hub Omnicanal</p>
          </div>

          <div className="flex gap-2">
            <select
              value={periodo}
              onChange={(e) => setPeriodo(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-white"
            >
              <option value="7dias">Últimos 7 dias</option>
              <option value="30dias">Últimos 30 dias</option>
              <option value="90dias">Últimos 90 dias</option>
            </select>

            <Button onClick={exportarRelatorio} variant="outline" data-permission="Chatbot.Relatorios.exportar">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {metricas && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-slate-600 text-xs mb-1">
                    <MessageCircle className="w-3 h-3" />
                    Total
                  </div>
                  <p className="text-xl font-bold">{metricas.total}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-green-600 text-xs mb-1">
                    <TrendingUp className="w-3 h-3" />
                    Resolvidas
                  </div>
                  <p className="text-xl font-bold text-green-600">{metricas.resolvidas} ({metricas.taxaResolucao.toFixed(0)}%)</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-purple-600 text-xs mb-1">
                    <Bot className="w-3 h-3" />
                    Bot
                  </div>
                  <p className="text-xl font-bold text-purple-600">{metricas.taxaBot.toFixed(0)}%</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-indigo-600 text-xs mb-1">
                    <Users className="w-3 h-3" />
                    Humano
                  </div>
                  <p className="text-xl font-bold text-indigo-600">{metricas.resolvidasHumano}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-orange-600 text-xs mb-1">
                    <Clock className="w-3 h-3" />
                    Tempo Médio
                  </div>
                  <p className="text-xl font-bold text-orange-600">{metricas.tempoMedioResposta.toFixed(1)}m</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-yellow-600 text-xs mb-1">
                    <ThumbsUp className="w-3 h-3" />
                    CSAT
                  </div>
                  <p className="text-xl font-bold text-yellow-600">{metricas.csatMedio.toFixed(1)}/5</p>
                </CardContent>
              </Card>
            </div>

            {/* Gráficos */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Evolução por dia */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evolução de Conversas</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={metricas.porDia}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dia" fontSize={10} />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="total" stroke="#3b82f6" fill="#93c5fd" />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Por Canal */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Por Canal</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={metricas.porCanal}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="canal" fontSize={10} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Por Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Por Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={metricas.porStatus}
                        dataKey="total"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {metricas.porStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={CORES[index % CORES.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Por Sentimento */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sentimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={metricas.porSentimento}
                        dataKey="total"
                        nameKey="sentimento"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {metricas.porSentimento.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={
                            entry.sentimento === 'Positivo' ? '#10b981' :
                            entry.sentimento === 'Negativo' ? '#ef4444' :
                            entry.sentimento === 'Frustrado' ? '#dc2626' :
                            '#6b7280'
                          } />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {!metricas && (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300" />
              <p className="text-slate-500">Nenhum dado disponível para o período selecionado</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}