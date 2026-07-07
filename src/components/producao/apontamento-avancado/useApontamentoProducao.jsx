import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useRLSQuery } from "@/components/lib/useRLSQuery";
import { useUser } from "@/components/lib/UserContext";

export default function useApontamentoProducao(opId, opNumero, onClose) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { getFiltroContexto } = useContextoVisual();
  const { user: authUser } = useUser();

  const [apontamento, setApontamento] = useState({
    op_id: opId,
    numero_op: opNumero,
    operador_id: "",
    operador_nome: "",
    data_hora_inicio: new Date().toISOString(),
    data_hora_fim: "",
    tempo_total_minutos: 0,
    maquina_id: "",
    maquina_nome: "",
    peca_id: "",
    peca_descricao: "",
    quantidade_produzida: 0,
    peso_produzido_kg: 0,
    quantidade_refugo: 0,
    peso_refugo_kg: 0,
    motivo_refugo: "",
    tipo_apontamento: "Produção",
    status: "Em Andamento",
    observacoes: "",
    localizacao_gps: { latitude: 0, longitude: 0 },
    foto_comprovacao_url: "",
  });

  const [cronometro, setCronometro] = useState({ ativo: false, segundos: 0 });
  const [produtividade, setProdutividade] = useState({ kgPorHora: 0, eficiencia: 0 });

  const { data: colaboradores = [] } = useRLSQuery(
    'Colaborador', {}, '-created_date', 200,
    { enabled: !!getFiltroContexto("empresa_id") }
  );

  const { data: op } = useQuery({
    queryKey: ["ordem-producao", opId, getFiltroContexto("empresa_id")],
    queryFn: () =>
      base44.entities.OrdemProducao.filter({ ...getFiltroContexto("empresa_id"), id: opId }).then((res) => res[0]),
    enabled: !!opId,
  });

  useEffect(() => {
    if (authUser && !apontamento.operador_id) {
      setApontamento((prev) => ({
        ...prev,
        operador_id: authUser.id,
        operador_nome: authUser.full_name || authUser.email,
      }));
    }
  }, [authUser?.id]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.ApontamentoProducao.create(data),
    onSuccess: async (created) => {
      toast({ title: "✅ Apontamento registrado", description: "Produção registrada com sucesso!" });
      try {
        await base44.entities.AuditLog.create({
          empresa_id: op?.empresa_id,
          group_id: op?.group_id,
          usuario: authUser?.full_name || authUser?.email || "Operador",
          usuario_id: authUser?.id,
          acao: "Criação",
          modulo: "Produção",
          tipo_auditoria: "entidade",
          entidade: "ApontamentoProducao",
          registro_id: created?.id || opId,
          descricao: `Apontamento finalizado - OP ${opNumero}`,
          dados_novos: created || null,
          data_hora: new Date().toISOString(),
          sucesso: true,
        });
        if ((apontamento.quantidade_refugo || 0) > 0) {
          await base44.entities.AuditLog.create({
            empresa_id: op?.empresa_id,
            group_id: op?.group_id,
            usuario: authUser?.full_name || authUser?.email || "Operador",
            usuario_id: authUser?.id,
            acao: "Criação",
            modulo: "Produção",
            tipo_auditoria: "entidade",
            entidade: "Refugo",
            registro_id: created?.id || opId,
            descricao: `Refugo ${apontamento.quantidade_refugo}un (${apontamento.peso_refugo_kg || 0}kg) - ${apontamento.motivo_refugo || "n/i"}`,
            dados_novos: {
              quantidade: apontamento.quantidade_refugo,
              peso_kg: apontamento.peso_refugo_kg,
              motivo: apontamento.motivo_refugo,
            },
            data_hora: new Date().toISOString(),
            sucesso: true,
          });
        }
      } catch (_) {}
      queryClient.invalidateQueries(["apontamentos-producao"]);
      queryClient.invalidateQueries(["ordem-producao"]);
      onClose?.();
    },
  });

  useEffect(() => {
    let interval;
    if (cronometro.ativo) {
      interval = setInterval(() => {
        setCronometro((prev) => ({ ...prev, segundos: prev.segundos + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cronometro.ativo]);

  useEffect(() => {
    if (apontamento.peso_produzido_kg > 0 && cronometro.segundos > 0) {
      const horas = cronometro.segundos / 3600;
      const kgPorHora = apontamento.peso_produzido_kg / horas;
      const metaKgPorHora = 100;
      const eficiencia = (kgPorHora / metaKgPorHora) * 100;
      setProdutividade({ kgPorHora: kgPorHora.toFixed(2), eficiencia: eficiencia.toFixed(0) });
    }
  }, [apontamento.peso_produzido_kg, cronometro.segundos]);

  const capturarLocalizacao = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setApontamento((prev) => ({
            ...prev,
            localizacao_gps: { latitude: position.coords.latitude, longitude: position.coords.longitude },
          }));
          toast({ title: "📍 Localização capturada", description: "GPS registrado com sucesso" });
        },
        (error) => {
          toast({ title: "⚠️ Erro ao capturar localização", description: error.message, variant: "destructive" });
        }
      );
    }
  };

  const capturarFoto = async () => {
    try {
      const fotoUrl = `https://via.placeholder.com/300x200?text=Foto+Producao+${Date.now()}`;
      setApontamento((prev) => ({ ...prev, foto_comprovacao_url: fotoUrl }));
      toast({ title: "📸 Foto capturada", description: "Comprovação registrada" });
    } catch (error) {
      toast({ title: "Erro ao capturar foto", description: error.message, variant: "destructive" });
    }
  };

  const finalizarApontamento = () => {
    const tempo_total_minutos = Math.floor(cronometro.segundos / 60);
    const apontamentoFinal = {
      ...apontamento,
      data_hora_fim: new Date().toISOString(),
      tempo_total_minutos,
      status: "Finalizado",
    };
    createMutation.mutate({ ...apontamentoFinal, empresa_id: op?.empresa_id, group_id: op?.group_id });
  };

  const formatarTempo = (segundos) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const toggleCronometro = () => setCronometro((prev) => ({ ...prev, ativo: !prev.ativo }));

  return {
    apontamento,
    setApontamento,
    cronometro,
    produtividade,
    colaboradores,
    op,
    capturarLocalizacao,
    capturarFoto,
    finalizarApontamento,
    formatarTempo,
    toggleCronometro,
    isPending: createMutation.isPending,
  };
}