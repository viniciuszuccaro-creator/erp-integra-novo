import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function PlanoMelhoriaDashboardFinal() {
  const [metricas, setMetricas] = useState({
    progressoGeral: 85,
    bloqueadores: 2,
    riscos: 4,
    acoesCriticas: 5,
    proximasAcoes: [],
  });
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  // Carrega dados em tempo real do PlanoMelhoriaItem com contexto multiempresa
  const { data: items = [] } = useQuery({
    queryKey: ["planoMelhoria", "items", contextoKey],
    queryFn: async () => {
      try {
        return await filterInContext('PlanoMelhoriaItem', {}, "-updated_date", 100);
      } catch {
        return [];
      }
    },
  });

  // Calcula métricas dinamicamente
  useEffect(() => {
    if (items.length > 0) {
      const concluidos = items.filter((i) => i.status === "Concluído").length;
      const emExecucao = items.filter((i) => i.status === "Em Execução").length;
      const criticos = items.filter((i) => i.prioridade === "Crítica").length;
      const progresso = Math.round((concluidos / items.length) * 100);

      setMetricas({
        progressoGeral: progresso,
        bloqueadores: criticos,
        riscos: 4,
        acoesCriticas: criticos + emExecucao,
        proximasAcoes: items.slice(0, 5),
      });
    }
  }, [items]);

  const kpis = [
    {
      titulo: "Progresso Geral",
      valor: `${metricas.progressoGeral}%`,
      cor: "from-blue-600 to-blue-400",
      icon: TrendingUp,
    },
    {
      titulo: "Bloqueadores Críticos",
      valor: metricas.bloqueadores,
      cor: "from-red-600 to-red-400",
      icon: AlertCircle,
    },
    {
      titulo: "Ações Críticas",
      valor: metricas.acoesCriticas,
      cor: "from-orange-600 to-orange-400",
      icon: Clock,
    },
    {
      titulo: "Tarefas Concluídas",
      valor: `${items.filter((i) => i.status === "Concluído").length}`,
      cor: "from-green-600 to-green-400",
      icon: CheckCircle2,
    },
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6 rounded-lg">
        <h2 className="text-2xl font-black mb-1">Dashboard Final — Plano de Melhoria V21.5</h2>
        <p className="text-slate-300 text-sm">Ciclo 20 — Fevereiro 2027 | Regra-Mãe: Acrescentar • Reorganizar • Conectar • Melhorar</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <Card key={i} className={`bg-gradient-to-br ${kpi.cor} text-white`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold">{kpi.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-end justify-between">
                <p className="text-3xl font-black">{kpi.valor}</p>
                <Icon className="w-6 h-6 opacity-50" />
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Resumo Executivo */}
      <Card className="border-slate-200">
        <CardHeader className="border-b pb-3">
          <CardTitle className="text-sm font-bold">Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600 font-semibold mb-1">Status Geral</p>
              <div className="flex items-center gap-2">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                    style={{ width: `${metricas.progressoGeral}%` }}
                  />
                </div>
                <span className="font-bold text-slate-900">{metricas.progressoGeral}%</span>
              </div>
            </div>
            <div>
              <p className="text-slate-600 font-semibold mb-1">Próximas Datas Críticas</p>
              <ul className="text-xs space-y-0.5">
                <li>• 28 Mai: Sincronização Grupo</li>
                <li>• 02 Jun: Release Candidato</li>
                <li>• 09 Jun: Go-Live V21.5</li>
              </ul>
            </div>
            <div>
              <p className="text-slate-600 font-semibold mb-1">Módulos Prioritários</p>
              <div className="flex flex-wrap gap-1">
                <Badge className="bg-blue-100 text-blue-700 text-[10px]">Comercial (95%)</Badge>
                <Badge className="bg-green-100 text-green-700 text-[10px]">Estoque (92%)</Badge>
                <Badge className="bg-orange-100 text-orange-700 text-[10px]">Logística (78%)</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Check */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            Status de Saúde — Projeto
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-white rounded border border-green-200">
              <p className="text-slate-600 font-semibold">Equipe</p>
              <p className="text-green-700 font-bold">100% Alocada</p>
            </div>
            <div className="p-2 bg-white rounded border border-green-200">
              <p className="text-slate-600 font-semibold">Comunicação</p>
              <p className="text-green-700 font-bold">Semanal + Diária</p>
            </div>
            <div className="p-2 bg-white rounded border border-green-200">
              <p className="text-slate-600 font-semibold">Testes</p>
              <p className="text-green-700 font-bold">85% Cobertura</p>
            </div>
            <div className="p-2 bg-white rounded border border-green-200">
              <p className="text-slate-600 font-semibold">Deploy</p>
              <p className="text-green-700 font-bold">Pronto</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}