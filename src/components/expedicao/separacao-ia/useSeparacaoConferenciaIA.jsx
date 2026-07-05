import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function useSeparacaoConferenciaIA(pedidoId, onClose) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { filterInContext, empresaAtual, grupoAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || "sem-grupo"}-${empresaAtual?.id || "sem-empresa"}`;

  const [separacao, setSeparacao] = useState({
    pedido_id: pedidoId,
    separador_id: "",
    separador_nome: "",
    data_inicio: new Date().toISOString(),
    data_conclusao: "",
    tempo_total_minutos: 0,
    itens_separados: [],
    divergencias: [],
    status: "Em Separação",
    localizacao_atual: "",
    rota_otimizada_ia: [],
    peso_conferido_kg: 0,
    foto_comprovacao_url: "",
    observacoes: "",
  });

  const [codigoBarras, setCodigoBarras] = useState("");
  const [cronometro, setCronometro] = useState({ ativo: true, segundos: 0 });
  const [desempenho, setDesempenho] = useState({ itensPorHora: 0, acuracia: 100 });

  const { data: pedido } = useQuery({
    queryKey: ["pedido", pedidoId, contextoKey],
    queryFn: () =>
      filterInContext("Pedido", {}, "-created_date", 999).then((ps) =>
        ps.find((p) => p.id === pedidoId)
      ),
    enabled: !!contexto && !!pedidoId,
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos", contextoKey],
    queryFn: () => filterInContext("Produto", {}, "descricao", 999),
    enabled: !!contexto,
  });

  const { data: colaboradores = [] } = useQuery({
    queryKey: ["colaboradores", contextoKey],
    queryFn: () => filterInContext("Colaborador", {}, "nome_completo", 999),
    enabled: !!contexto,
  });

  const validarIAMutation = useMutation({
    mutationFn: async (item) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `Analise a separação do item:
Item: ${item.descricao}
Qtd Pedida: ${item.quantidade_pedida}
Qtd Separada: ${item.quantidade_separada || 0}
Peso Esperado: ${item.peso_total_kg || 0} kg
Peso Conferido: ${item.peso_conferido || 0} kg
Identifique divergências, sugira similares se em falta, classifique risco Baixo/Médio/Alto.`,
        response_json_schema: {
          type: "object",
          properties: {
            divergencia_quantidade: { type: "boolean" },
            divergencia_peso: { type: "boolean" },
            produtos_similares: { type: "array", items: { type: "string" } },
            risco: { type: "string" },
            acoes_sugeridas: { type: "array", items: { type: "string" } },
          },
        },
      });
    },
  });

  const otimizarRotaMutation = useMutation({
    mutationFn: async (itens) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `Otimize a rota de picking para ${itens.length} itens.
Itens: ${JSON.stringify(itens.map((i) => ({ produto: i.produto_descricao, localizacao: i.localizacao || "N/D" })))}
Gere rota otimizada minimizando distância, agrupando por área.`,
        response_json_schema: {
          type: "object",
          properties: {
            rota_otimizada: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  ordem: { type: "number" },
                  produto: { type: "string" },
                  localizacao: { type: "string" },
                  distancia_estimada_m: { type: "number" },
                },
              },
            },
            distancia_total_m: { type: "number" },
            tempo_estimado_min: { type: "number" },
          },
        },
      });
    },
  });

  useEffect(() => {
    if (!cronometro.ativo) return;
    const interval = setInterval(() => {
      setCronometro((prev) => ({ ...prev, segundos: prev.segundos + 1 }));
    }, 1000);
    return () => clearInterval(interval);
  }, [cronometro.ativo]);

  useEffect(() => {
    if (separacao.itens_separados.length > 0 && cronometro.segundos > 0) {
      const horas = cronometro.segundos / 3600;
      const itensPorHora = separacao.itens_separados.length / horas;
      const totalItens = pedido?.itens_revenda?.length || 1;
      const acuracia = (separacao.itens_separados.length / totalItens) * 100;
      setDesempenho({
        itensPorHora: itensPorHora.toFixed(1),
        acuracia: acuracia.toFixed(0),
      });
    }
  }, [separacao.itens_separados, cronometro.segundos, pedido]);

  const handleScanCodigoBarras = async () => {
    if (!codigoBarras) return;
    const produto = produtos.find(
      (p) => p.codigo_barras === codigoBarras || p.codigo === codigoBarras
    );

    if (!produto) {
      toast({
        title: "❌ Código não encontrado",
        description: "Produto não cadastrado",
        variant: "destructive",
      });
      setCodigoBarras("");
      return;
    }

    const itemPedido = pedido?.itens_revenda?.find((i) => i.produto_id === produto.id);
    if (!itemPedido) {
      toast({
        title: "⚠️ Item não está no pedido",
        description: "Código não encontrado neste pedido",
        variant: "destructive",
      });
      setCodigoBarras("");
      return;
    }

    const novoItem = {
      produto_id: produto.id,
      descricao: produto.descricao,
      quantidade_pedida: itemPedido.quantidade,
      quantidade_separada: 1,
      peso_conferido: produto.peso_liquido_kg || 0,
      localizacao: produto.localizacao || "N/A",
      data_hora_separacao: new Date().toISOString(),
    };

    setSeparacao((prev) => ({
      ...prev,
      itens_separados: [...prev.itens_separados, novoItem],
    }));

    try {
      const validacao = await validarIAMutation.mutateAsync(novoItem);
      if (validacao?.divergencia_quantidade || validacao?.divergencia_peso) {
        setSeparacao((prev) => ({
          ...prev,
          divergencias: [...prev.divergencias, { item: produto.descricao, validacao }],
        }));
        toast({
          title: "⚠️ Divergência detectada",
          description: `Verifique ${produto.descricao}`,
          variant: "destructive",
        });
      } else {
        toast({ title: "✅ Item separado", description: produto.descricao });
      }
    } catch {
      // IA indisponível — continua sem validação
      toast({ title: "✅ Item separado", description: produto.descricao });
    }

    setCodigoBarras("");
  };

  const handleOtimizarRota = async () => {
    if (!pedido?.itens_revenda) return;
    toast({ title: "🤖 Otimizando rota...", description: "IA processando..." });
    try {
      const resultado = await otimizarRotaMutation.mutateAsync(pedido.itens_revenda);
      setSeparacao((prev) => ({ ...prev, rota_otimizada_ia: resultado.rota_otimizada }));
      toast({
        title: "✅ Rota otimizada!",
        description: `${resultado.distancia_total_m}m • ${resultado.tempo_estimado_min} min`,
      });
    } catch {
      toast({ title: "⚠️ IA indisponível", description: "Tente novamente mais tarde", variant: "destructive" });
    }
  };

  const finalizarSeparacao = () => {
    const tempo_total_minutos = Math.floor(cronometro.segundos / 60);
    const registro = {
      ...separacao,
      data_conclusao: new Date().toISOString(),
      tempo_total_minutos,
      status: "Concluída",
    };
    toast({
      title: "✅ Separação concluída!",
      description: `${separacao.itens_separados.length} itens separados`,
    });
    queryClient.invalidateQueries(["pedido"]);
    onClose?.();
  };

  const formatarTempo = (segundos) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return {
    separacao,
    codigoBarras,
    setCodigoBarras,
    cronometro,
    desempenho,
    pedido,
    colaboradores,
    handleScanCodigoBarras,
    handleOtimizarRota,
    finalizarSeparacao,
    formatarTempo,
  };
}