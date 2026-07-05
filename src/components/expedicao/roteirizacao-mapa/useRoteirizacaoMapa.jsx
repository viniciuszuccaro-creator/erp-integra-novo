import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import useContextoVisual from "@/components/lib/useContextoVisual";

function otimizarRotaNN(pontos, origem) {
  if (!pontos || pontos.length === 0) return [];
  if (pontos.length === 1) return pontos;

  const calcularDistancia = (p1, p2) => {
    const R = 6371;
    const dLat = (p2.latitude - p1.latitude) * Math.PI / 180;
    const dLon = (p2.longitude - p1.longitude) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(p1.latitude * Math.PI / 180) * Math.cos(p2.latitude * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const pontosRestantes = [...pontos];
  const rotaOtimizada = [];
  let pontoAtual = origem;

  while (pontosRestantes.length > 0) {
    let menorDistancia = Infinity;
    let indiceMaisProximo = -1;
    pontosRestantes.forEach((ponto, idx) => {
      const distancia = calcularDistancia(pontoAtual, ponto);
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        indiceMaisProximo = idx;
      }
    });
    if (indiceMaisProximo === -1) break;
    const pontoMaisProximo = pontosRestantes.splice(indiceMaisProximo, 1)[0];
    rotaOtimizada.push({
      ...pontoMaisProximo,
      sequencia: rotaOtimizada.length + 1,
      distancia_anterior_km: menorDistancia,
    });
    pontoAtual = pontoMaisProximo;
  }
  return rotaOtimizada;
}

export default function useRoteirizacaoMapa(entregas, motoristas, veiculos) {
  const [entregasSelecionadas, setEntregasSelecionadas] = useState([]);
  const [rotaOtimizada, setRotaOtimizada] = useState(null);
  const [motoristaSelecionado, setMotoristaSelecionado] = useState("");
  const [veiculoSelecionado, setVeiculoSelecionado] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const handleSelecionarEntrega = (entrega) => {
    if (entregasSelecionadas.find((e) => e.id === entrega.id)) {
      setEntregasSelecionadas(entregasSelecionadas.filter((e) => e.id !== entrega.id));
    } else {
      setEntregasSelecionadas([...entregasSelecionadas, entrega]);
    }
  };

  const handleOtimizarRota = async () => {
    if (entregasSelecionadas.length === 0) {
      toast({
        title: "⚠️ Nenhuma entrega selecionada",
        description: "Selecione pelo menos uma entrega para otimizar",
        variant: "destructive",
      });
      return;
    }

    setIsOptimizing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const origem = {
      latitude: empresaAtual?.endereco?.latitude || -23.55052,
      longitude: empresaAtual?.endereco?.longitude || -46.633308,
    };

    const pontosComCoordenadas = entregasSelecionadas
      .filter((e) => e.endereco_entrega_completo?.latitude && e.endereco_entrega_completo?.longitude)
      .map((e) => ({
        ...e,
        latitude: e.endereco_entrega_completo.latitude,
        longitude: e.endereco_entrega_completo.longitude,
      }));

    if (pontosComCoordenadas.length === 0) {
      toast({
        title: "⚠️ Entregas sem coordenadas GPS",
        description: "Cadastre latitude/longitude nos endereços das entregas.",
        variant: "destructive",
      });
      setIsOptimizing(false);
      return;
    }

    const rotaCalculada = otimizarRotaNN(pontosComCoordenadas, origem);
    const distanciaTotal = rotaCalculada.reduce((sum, p) => sum + (p.distancia_anterior_km || 0), 0);
    const velocidadeMediaKmH = 40;
    const tempoPorParadaMinutos = 15;
    const tempoViagemMinutos = (distanciaTotal / velocidadeMediaKmH) * 60;
    const tempoTotalParadasMinutos = rotaCalculada.length * tempoPorParadaMinutos;
    const tempoEstimado = tempoViagemMinutos + tempoTotalParadasMinutos;

    setRotaOtimizada({
      pontos: rotaCalculada,
      distancia_total_km: distanciaTotal,
      tempo_estimado_minutos: Math.round(tempoEstimado),
      algoritmo: "Nearest Neighbor",
      data_calculo: new Date().toISOString(),
    });

    setIsOptimizing(false);
    toast({
      title: "✅ Rota otimizada!",
      description: `${rotaCalculada.length} entregas • ${distanciaTotal.toFixed(1)} km • ${Math.round(tempoEstimado)} min`,
    });
  };

  const handleGerarRomaneio = async () => {
    if (!rotaOtimizada || !motoristaSelecionado || !veiculoSelecionado) {
      toast({
        title: "⚠️ Dados incompletos",
        description: "Selecione motorista, veículo e otimize a rota.",
        variant: "destructive",
      });
      return;
    }

    try {
      const motoristaNome =
        motoristas.find((m) => m.id === motoristaSelecionado)?.nome_completo || "Motorista";

      const rota = await base44.entities.Rota.create({
        empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id || empresaAtual?.group_id,
        nome_rota: `Rota ${new Date().toLocaleDateString("pt-BR")} - ${motoristaNome}`,
        data_rota: new Date().toISOString().split("T")[0],
        motorista_id: motoristaSelecionado,
        veiculo_id: veiculoSelecionado,
        pontos_entrega: rotaOtimizada.pontos.map((p) => ({
          sequencia: p.sequencia,
          entrega_id: p.id,
          cliente_nome: p.cliente_nome,
          endereco_completo: `${p.endereco_entrega_completo?.logradouro || ""}, ${p.endereco_entrega_completo?.numero || ""} - ${p.endereco_entrega_completo?.cidade || ""}`,
          latitude: p.latitude,
          longitude: p.longitude,
          status: "Pendente",
          tempo_estimado_parada_minutos: 15,
          horario_previsto: null,
        })),
        distancia_total_km: rotaOtimizada.distancia_total_km,
        tempo_total_previsto_minutos: rotaOtimizada.tempo_estimado_minutos,
        otimizada: true,
        algoritmo_usado: "Nearest Neighbor",
        status: "Planejada",
        progresso_percentual: 0,
        entregas_concluidas: 0,
        entregas_frustradas: 0,
        criado_por: "Sistema",
      });

      const romaneio = await base44.entities.Romaneio.create({
        empresa_id: empresaAtual?.id,
        group_id: grupoAtual?.id || empresaAtual?.group_id,
        numero_romaneio: `ROM-${Date.now()}`,
        data_romaneio: new Date().toISOString().split("T")[0],
        motorista_id: motoristaSelecionado,
        veiculo_id: veiculoSelecionado,
        rota_id: rota.id,
        entregas_ids: rotaOtimizada.pontos.map((p) => p.id),
        quantidade_entregas: rotaOtimizada.pontos.length,
        distancia_total_km: rotaOtimizada.distancia_total_km,
        tempo_previsto_minutos: rotaOtimizada.tempo_estimado_minutos,
        status: "Aberto",
        criado_por: "Sistema",
      });

      for (const ponto of rotaOtimizada.pontos) {
        await base44.entities.Entrega.update(ponto.id, {
          rota_id: rota.id,
          romaneio_id: romaneio.id,
          status: "Pronto para Expedir",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["entregas"] });
      queryClient.invalidateQueries({ queryKey: ["rotas"] });
      queryClient.invalidateQueries({ queryKey: ["romaneios"] });

      toast({
        title: "✅ Romaneio gerado!",
        description: `Rota "${rota.nome_rota}" com ${rotaOtimizada.pontos.length} entregas criada.`,
      });

      setEntregasSelecionadas([]);
      setRotaOtimizada(null);
      setMotoristaSelecionado("");
      setVeiculoSelecionado("");
    } catch (error) {
      toast({
        title: "❌ Erro ao gerar romaneio",
        description: "Ocorreu um erro ao salvar. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const entregasPendentes = entregas.filter(
    (e) => e.status === "Aguardando Separação" || e.status === "Pronto para Expedir"
  );

  return {
    entregasSelecionadas,
    rotaOtimizada,
    motoristaSelecionado,
    veiculoSelecionado,
    isOptimizing,
    entregasPendentes,
    setMotoristaSelecionado,
    setVeiculoSelecionado,
    handleSelecionarEntrega,
    handleOtimizarRota,
    handleGerarRomaneio,
  };
}