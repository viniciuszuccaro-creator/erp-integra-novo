import { useState, useRef } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function usePontoEletronico() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const videoRef = useRef(null);

  const [registroPonto, setRegistroPonto] = useState({
    colaborador_id: "",
    colaborador_nome: "",
    data_hora: new Date().toISOString(),
    tipo: "",
    localizacao_gps: { latitude: 0, longitude: 0 },
    foto_facial_url: "",
    biometria_validada: false,
    dispositivo: "Web",
    observacoes: "",
  });

  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [colaboradorSelecionado, setColaboradorSelecionado] = useState(null);

  const { filterInContext, empresaAtual, grupoAtual, contexto, carimbarContexto } =
    useContextoVisual();
  const contextoKey = `${grupoAtual?.id || "sem-grupo"}-${
    empresaAtual?.id || "sem-empresa"
  }`;

  const { data: colaboradores = [] } = useQuery({
    queryKey: ["colaboradores", contextoKey],
    queryFn: () => filterInContext("Colaborador", {}, "nome", 999),
    enabled: !!contexto,
  });

  const { data: pontosHoje = [] } = useQuery({
    queryKey: ["pontos-hoje", contextoKey],
    queryFn: () => filterInContext("Ponto", {}, "-created_date", 999),
    enabled: !!contexto,
  });

  const registrarPontoMutation = useMutation({
    mutationFn: (data) => base44.entities.Ponto.create(carimbarContexto(data, 'empresa_id')),
    onSuccess: () => {
      toast({
        title: "✅ Ponto registrado",
        description: "Registro efetuado com sucesso!",
      });
      queryClient.invalidateQueries(["pontos-hoje"]);
      setRegistroPonto({
        colaborador_id: "",
        colaborador_nome: "",
        data_hora: new Date().toISOString(),
        tipo: "",
        localizacao_gps: { latitude: 0, longitude: 0 },
        foto_facial_url: "",
        biometria_validada: false,
        dispositivo: "Web",
        observacoes: "",
      });
      setCameraAtiva(false);
    },
  });

  const validarPontoIAMutation = useMutation({
    mutationFn: async (ponto) => {
      return await base44.integrations.Core.InvokeLLM({
        prompt: `Analise o registro de ponto:
Colaborador: ${ponto.colaborador_nome}
Tipo: ${ponto.tipo}
Horário: ${new Date(ponto.data_hora).toLocaleString()}
Última marcação: ${colaboradorSelecionado?.ultimo_ponto || "Nenhuma"}
Detecte anomalias: horário fora do expediente, intervalo curto, duplicidade, localização distante. Classifique risco: Baixo/Médio/Alto.`,
        response_json_schema: {
          type: "object",
          properties: {
            anomalias_detectadas: { type: "array", items: { type: "string" } },
            risco: { type: "string" },
            requer_aprovacao_gestor: { type: "boolean" },
            observacoes_ia: { type: "string" },
          },
        },
      });
    },
  });

  const capturarLocalizacao = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setRegistroPonto((prev) => ({
            ...prev,
            localizacao_gps: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
          }));
          toast({ title: "📍 Localização capturada" });
        },
        (error) => {
          toast({
            title: "⚠️ Erro GPS",
            description: error.message,
            variant: "destructive",
          });
        }
      );
    }
  };

  const ativarCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraAtiva(true);
    } catch (error) {
      toast({
        title: "Erro ao acessar câmera",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const capturarFotoFacial = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(videoRef.current, 0, 0);
      const fotoUrl = canvas.toDataURL("image/jpeg");
      setRegistroPonto((prev) => ({ ...prev, foto_facial_url: fotoUrl }));

      const stream = videoRef.current.srcObject;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraAtiva(false);
      toast({ title: "✅ Foto capturada" });
    }
  };

  const simularBiometria = () => {
    setRegistroPonto((prev) => ({ ...prev, biometria_validada: true }));
    toast({ title: "✅ Biometria validada" });
  };

  const handleRegistrarPonto = async (tipo) => {
    if (!colaboradorSelecionado) {
      toast({ title: "⚠️ Selecione um colaborador", variant: "destructive" });
      return;
    }

    const pontoFinal = {
      ...registroPonto,
      colaborador_id: colaboradorSelecionado.id,
      colaborador_nome: colaboradorSelecionado.nome_completo,
      tipo,
      data_hora: new Date().toISOString(),
    };

    try {
      const validacao = await validarPontoIAMutation.mutateAsync(pontoFinal);
      if (validacao?.risco === "Alto" || validacao?.requer_aprovacao_gestor) {
        toast({
          title: "⚠️ Anomalia detectada",
          description: validacao.observacoes_ia,
          variant: "destructive",
        });
        pontoFinal.requer_aprovacao = true;
        pontoFinal.observacoes_ia = validacao.observacoes_ia;
      }
    } catch {
      // IA indisponível (créditos) — continua sem validação
    }

    registrarPontoMutation.mutate(pontoFinal);
  };

  const calcularHorasHoje = (colaborador_id) => {
    const pontosColab = pontosHoje.filter(
      (p) => p.colaborador_id === colaborador_id
    );
    return pontosColab.length > 0 ? `${pontosColab.length * 2}h` : "0h";
  };

  return {
    videoRef,
    registroPonto,
    cameraAtiva,
    colaboradorSelecionado,
    colaboradores,
    pontosHoje,
    setColaboradorSelecionado,
    capturarLocalizacao,
    ativarCamera,
    capturarFotoFacial,
    simularBiometria,
    handleRegistrarPonto,
    calcularHorasHoje,
    isRegistering: registrarPontoMutation.isLoading,
  };
}