import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  DollarSign,
  ShoppingCart,
  Truck,
  AlertTriangle,
  Factory,
  Sparkles,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import useOperacionalBI from "./operacional-bi/useOperacionalBI";
import BIAssistantCard from "./operacional-bi/BIAssistantCard";

function DashboardOperacionalBI({ windowMode = false }) {
  const {
    periodoFiltro,
    setPeriodoFiltro,
    empresaAtual,
    estaNoGrupo,
    queryClient,
    pedidosFiltrados,
    kpis,
    semDados,
    erroGeral,
    dadosVendasMes,
    dadosOpsEvolucao,
  } = useOperacionalBI();

  const containerClass = windowMode
    ? "w-full h-full flex flex-col overflow-auto"
    : "w-full space-y-6 p-6 bg-gradient-to-br from-slate-50 to-blue-50";

  const KPI_CARDS = [
    {
      label: "Vendas Total",
      value: `R$ ${(kpis.totalVendas / 1000).toFixed(0)}k`,
      sub: `${pedidosFiltrados.length} pedidos`,
      icon: DollarSign,
      gradient: "from-blue-500 to-blue-600",
      badge: kpis.crescimentoVendas !== 0 ? {
        text: `${kpis.crescimentoVendas > 0 ? "↗" : "↘"} ${Math.abs(kpis.crescimentoVendas)}%`,
        color: kpis.crescimentoVendas > 0 ? "bg-green-500" : "bg-red-500",
      } : null,
    },
    { label: "Pedidos Abertos", value: kpis.pedidosAbertos, sub: "em andamento", icon: ShoppingCart, gradient: "from-green-500 to-green-600" },
    { label: "OPs Produção", value: kpis.opsEmProducao, sub: "ativas", icon: Factory, gradient: "from-purple-500 to-purple-600" },
    { label: "Entregas Pend.", value: kpis.entregasPendentes, sub: "em logística", icon: Truck, gradient: "from-orange-500 to-orange-600" },
    { label: "Contas Atrasadas", value: kpis.contasAtrasadas, sub: "atenção urgente", icon: AlertTriangle, gradient: "from-red-500 to-red-600" },
  ];

  return (
    <div className={`${containerClass} min-h-[760px]`}>
      <div className={windowMode ? "p-6 space-y-6 flex-1 overflow-auto" : "space-y-6 overflow-auto"}>
        {erroGeral && (
          <Alert className="border-red-300 bg-red-50">
            <AlertDescription className="flex items-center justify-between gap-3">
              <span>Erro ao carregar dados (possível limite de requisições).</span>
              <Button
                size="sm"
                variant="outline"
                data-permission="Dashboard.atualizar"
                onClick={() => queryClient.invalidateQueries({ predicate: () => true })}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {semDados && !erroGeral && (
          <Card className="border-2 border-amber-300 bg-amber-50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Sem dados para exibir</CardTitle>
              <Button
                size="sm"
                variant="outline"
                data-permission="Dashboard.atualizar"
                onClick={() => queryClient.invalidateQueries({ predicate: () => true })}
              >
                Atualizar
              </Button>
            </CardHeader>
            <CardContent className="text-sm text-amber-700">
              Nenhuma informação encontrada no contexto atual. Selecione uma empresa/grupo.
            </CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-8 h-8 text-purple-600" />
              Dashboard Operacional BI
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {estaNoGrupo ? "Visão Consolidada do Grupo" : empresaAtual?.nome_fantasia || empresaAtual?.razao_social} • IA e Análises Preditivas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={periodoFiltro} onValueChange={setPeriodoFiltro}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Esta Semana</SelectItem>
                <SelectItem value="mes">Este Mês</SelectItem>
                <SelectItem value="trimestre">Trimestre</SelectItem>
                <SelectItem value="ano">Ano</SelectItem>
              </SelectContent>
            </Select>
            <Badge className="bg-purple-600 px-3 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              IA Ativa
            </Badge>
          </div>
        </div>

        {/* KPIs essenciais — 5 cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-stretch">
          {KPI_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.label}
                className={`border-0 shadow-md h-full bg-gradient-to-br ${card.gradient} text-white hover:shadow-xl transition-all`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs opacity-90">{card.label}</p>
                      <p className="text-2xl font-bold">{card.value}</p>
                      <p className="text-xs opacity-75 mt-1">{card.sub}</p>
                      {card.badge && (
                        <Badge className={`mt-1 ${card.badge.color}`}>{card.badge.text}</Badge>
                      )}
                    </div>
                    <Icon className="w-8 h-8 opacity-80" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Gráficos redimensionáveis */}
        <ResizablePanelGroup direction="horizontal" className="w-full min-h-[540px]">
          <ResizablePanel defaultSize={50} minSize={30} className="pr-3">
            <Card className="border-0 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-base">Vendas por Mês</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px] md:h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosVendasMes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="valor" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </ResizablePanel>
          <ResizableHandle withHandle className="mx-1" />
          <ResizablePanel defaultSize={50} minSize={30} className="pl-3">
            <Card className="border-0 shadow-md h-full">
              <CardHeader>
                <CardTitle className="text-base">Evolução de Produção</CardTitle>
              </CardHeader>
              <CardContent className="h-[320px] md:h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosOpsEvolucao}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="ops" stroke="#8b5cf6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* Sugestões da IA — simplificado */}
        <BIAssistantCard kpis={kpis} />
      </div>
    </div>
  );
}

export default React.memo(DashboardOperacionalBI);