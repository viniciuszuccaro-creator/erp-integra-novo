import { useQuery } from "@tanstack/react-query";
import useContextoVisual from "@/components/lib/useContextoVisual";

const ORIGEM_MAP = {
  Manual: "ERP",
  Site: "Site",
  "E-commerce": "E-commerce",
  Chatbot: "Chatbot",
  WhatsApp: "WhatsApp",
  Portal: "Portal Cliente",
  Marketplace: "Marketplace",
  API: "API",
  App: "App Mobile",
};

const CORES = {
  blue: "#3b82f6",
  green: "#22c55e",
  purple: "#a855f7",
  orange: "#f97316",
  red: "#ef4444",
  yellow: "#eab308",
  pink: "#ec4899",
  cyan: "#06b6d4",
};

export default function useDashboardCanais(empresaId) {
  const { empresaAtual, grupoAtual, filterInContext } = useContextoVisual();
  const resolvedEmpresaId = empresaId || empresaAtual?.id;
  const groupId = grupoAtual?.id || empresaAtual?.group_id;
  const contextKey = resolvedEmpresaId || groupId || "sem-contexto";
  const contextoValido = contextKey !== "sem-contexto";

  const { data: parametros = [], isLoading: loadingParametros } = useQuery({
    queryKey: ["parametros-origem-pedido", contextKey],
    queryFn: () => filterInContext("ParametroOrigemPedido", {}, "canal", 200),
    initialData: [],
    enabled: contextoValido,
  });

  const { data: pedidos = [], isLoading: loadingPedidos } = useQuery({
    queryKey: ["pedidos", contextKey],
    queryFn: () => filterInContext("Pedido", {}, "-created_date", 500),
    initialData: [],
    enabled: contextoValido,
  });

  const calcularMetricas = () => {
    const metricas = {};
    parametros.forEach((param) => {
      const pedidosCanal = pedidos.filter((p) => {
        const canalPedido = ORIGEM_MAP[p.origem_pedido] || p.origem_pedido;
        return canalPedido === param.canal;
      });
      const totalPedidos = pedidosCanal.length;
      const valorTotal = pedidosCanal.reduce((sum, p) => sum + (p.valor_total || 0), 0);
      const pedidosAprovados = pedidosCanal.filter(
        (p) => p.status === "Aprovado" || p.status === "Faturado" || p.status === "Entregue"
      ).length;
      const taxaConversao = totalPedidos > 0 ? (pedidosAprovados / totalPedidos) * 100 : 0;
      const ticketMedio = totalPedidos > 0 ? valorTotal / totalPedidos : 0;
      metricas[param.canal] = {
        nome: param.nome,
        canal: param.canal,
        tipo: param.tipo_criacao,
        cor: param.cor_badge,
        ativo: param.ativo,
        totalPedidos,
        valorTotal,
        pedidosAprovados,
        taxaConversao,
        ticketMedio,
      };
    });
    return metricas;
  };

  const metricas = calcularMetricas();
  const canaisAtivos = Object.values(metricas).filter((m) => m.ativo);
  const totalGeralPedidos = canaisAtivos.reduce((sum, m) => sum + m.totalPedidos, 0);
  const totalGeralValor = canaisAtivos.reduce((sum, m) => sum + m.valorTotal, 0);

  const dadosBarras = Object.values(metricas)
    .filter((m) => m.totalPedidos > 0)
    .sort((a, b) => b.totalPedidos - a.totalPedidos)
    .slice(0, 8);

  const dadosPizza = Object.values(metricas)
    .filter((m) => m.totalPedidos > 0)
    .map((m) => ({ name: m.canal, value: m.totalPedidos }));

  const insights = (() => {
    const list = [];
    const melhorConversao = Object.values(metricas)
      .filter((m) => m.totalPedidos > 0)
      .sort((a, b) => b.taxaConversao - a.taxaConversao)[0];
    if (melhorConversao) {
      list.push({ tipo: "success", texto: `🏆 Canal com melhor conversão: ${melhorConversao.nome} (${melhorConversao.taxaConversao.toFixed(0)}%)` });
    }
    const maiorVolume = Object.values(metricas).sort((a, b) => b.totalPedidos - a.totalPedidos)[0];
    if (maiorVolume && maiorVolume.totalPedidos > 0) {
      list.push({ tipo: "info", texto: `📊 Canal com maior volume: ${maiorVolume.nome} (${maiorVolume.totalPedidos} pedidos)` });
    }
    const maiorTicket = Object.values(metricas)
      .filter((m) => m.totalPedidos > 0)
      .sort((a, b) => b.ticketMedio - a.ticketMedio)[0];
    if (maiorTicket) {
      list.push({ tipo: "success", texto: `💰 Maior ticket médio: ${maiorTicket.nome} (R$ ${maiorTicket.ticketMedio.toFixed(2)})` });
    }
    const canaisInativos = parametros.filter((p) => !p.ativo).length;
    if (canaisInativos > 0) {
      list.push({ tipo: "warning", texto: `⚠️ ${canaisInativos} canal(is) inativo(s) - considere ativar para aumentar vendas` });
    }
    const canaisManuais = Object.values(metricas).filter((m) => m.tipo === "Manual" && m.totalPedidos > 5);
    if (canaisManuais.length > 0) {
      list.push({ tipo: "info", texto: `🤖 Oportunidade: ${canaisManuais.length} canal(is) manual(is) com volume alto - considere automação` });
    }
    return list;
  })();

  return {
    metricas,
    parametros,
    canaisAtivos,
    totalGeralPedidos,
    totalGeralValor,
    dadosBarras,
    dadosPizza,
    insights,
    CORES,
    isLoading: loadingParametros || loadingPedidos,
    contextoValido,
  };
}