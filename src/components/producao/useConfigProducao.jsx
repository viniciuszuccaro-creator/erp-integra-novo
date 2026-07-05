import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

const DEFAULT_FORM = {
  perda_aco_percentual: 5,
  perda_arame_percentual: 10,
  preco_aco_kg: 8.5,
  preco_arame_kg: 12.0,
  tempo_corte_por_barra: 2,
  tempo_dobra_por_barra: 3,
  tempo_armacao_por_peca: 15,
  bloqueado_edicao: false,
  gerar_op_ao_aprovar: false,
  gerar_op_ao_faturar: false,
  permitir_op_sem_pedido: true,
  modo_integracao_estoque: "reserva",
  permitir_baixa_maior_teorico: false,
  produto_arame_recozido_id: "",
  produto_sucata_id: "",
  exigir_bitola_cadastrada: true,
  bloquear_op_sem_estoque: false,
  gerar_etiqueta_automatica: false,
  prazo_padrao_op_dias: 7,
};

export default function useConfigProducao({ empresaId }) {
  const queryClient = useQueryClient();
  const { filterInContext, grupoAtual, empresaAtual, contexto, carimbarContexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || "sem-grupo"}-${empresaAtual?.id || "sem-empresa"}`;

  const { data: user } = useQuery({ queryKey: ["currentUser"], queryFn: () => base44.auth.me() });
  const isAdmin = user?.role === "admin";

  const { data: config } = useQuery({
    queryKey: ["configProducao", empresaId],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoProducao.filter({ empresa_id: empresaId });
      return configs[0] || null;
    },
    enabled: !!empresaId,
  });

  const { data: produtos = [] } = useQuery({
    queryKey: ["produtos-bitola", contextoKey],
    queryFn: async () => {
      const todos = await filterInContext("Produto", {}, "descricao", 999);
      return todos.filter((p) => p.eh_bitola && p.status === "Ativo");
    },
    enabled: !!contexto,
  });

  const [formData, setFormData] = useState({ ...DEFAULT_FORM, empresa_id: empresaId });

  useEffect(() => {
    if (config) {
      setFormData({ ...DEFAULT_FORM, ...config, empresa_id: empresaId });
    } else {
      setFormData((prev) => ({ ...prev, empresa_id: empresaId }));
    }
  }, [config, empresaId]);

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      const historico = config?.historico_alteracoes || [];
      Object.keys(data).forEach((campo) => {
        if (data[campo] !== config?.[campo] && campo !== "bloqueado_edicao" && campo !== "historico_alteracoes") {
          historico.push({ data: new Date().toISOString(), usuario: user?.full_name, campo, valor_anterior: config?.[campo], valor_novo: data[campo] });
        }
      });
      const stamped = carimbarContexto({ ...data, chave: `config_producao_${empresaId}`, tipo: "Configuração Geral", historico_alteracoes: historico }, "empresa_id");
      if (config?.id) return await base44.entities.ConfiguracaoProducao.update(config.id, stamped);
      return await base44.entities.ConfiguracaoProducao.create(stamped);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["configProducao", empresaId] }); },
  });

  const toggleBloquear = useMutation({
    mutationFn: async (bloquear) => {
      const dados = { ...formData, bloqueado_edicao: bloquear, bloqueado_por: bloquear ? user?.full_name : null, bloqueado_em: bloquear ? new Date().toISOString() : null };
      const stamped = carimbarContexto({ ...dados, chave: `config_producao_${empresaId}`, tipo: "Configuração Geral" }, "empresa_id");
      if (config?.id) return await base44.entities.ConfiguracaoProducao.update(config.id, stamped);
      return await base44.entities.ConfiguracaoProducao.create(stamped);
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["configProducao", empresaId] }); },
  });

  const isDisabled = config?.bloqueado_edicao && !isAdmin;

  return { user, isAdmin, config, produtos, formData, setFormData, saveMutation, toggleBloquear, isDisabled };
}