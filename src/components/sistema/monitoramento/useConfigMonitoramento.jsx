import { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import usePermissions from "@/components/lib/usePermissions";
import { toast } from "sonner";

const DEFAULT_CONFIG = {
  ativo: true, nivel_monitoramento: "Intermediário", coleta_automatica: true,
  intervalo_coleta_segundos: 60, retencao_logs_dias: 30, retencao_logs_criticos_dias: 365,
  thresholds: { query_lenta_ms: 1000, api_lenta_ms: 2000, page_load_lenta_ms: 3000, export_lento_ms: 10000, cpu_alta_percent: 80, memoria_alta_percent: 85, taxa_erro_percent: 5, disponibilidade_minima_percent: 99 },
  monitorar_queries: true, monitorar_apis: true, monitorar_integracao: true, monitorar_exports: true,
  detectar_anomalias_ia: false, gerar_alertas_automaticos: true, notificar_email: true, emails_notificacao: [],
  agrupar_alertas_similares: true, janela_agrupamento_minutos: 15, alertar_apenas_criticos: false,
  ia_confianca_minima: 80, profiling_ativo: false, samplear_requisicoes: false, taxa_amostragem_percent: 100,
};

export default function useConfigMonitoramento({ empresaId, grupoId }) {
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual, carimbarContexto } = useContextoVisual();
  const { isAdmin, hasPermission } = usePermissions();
  const grupoAtivoId = grupoId || grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || (() => { try { return localStorage.getItem("group_atual_id"); } catch { return null; } })();
  const empresaAtivaId = empresaId || empresaAtual?.id || null;
  const scopeId = empresaAtivaId || grupoAtivoId || "sem-contexto";
  const scope = empresaAtivaId ? { empresa_id: empresaAtivaId } : grupoAtivoId ? { group_id: grupoAtivoId } : {};
  const contextoValido = scopeId !== "sem-contexto";
  const podeEditar = isAdmin() || hasPermission("Sistema", "Configurações", "editar") || hasPermission("Sistema", "Configuracoes", "editar") || hasPermission("Sistema", "Monitoramento", "editar");

  const { data: config, isLoading } = useQuery({
    queryKey: ["config-monitoramento", scopeId],
    queryFn: async () => {
      const configs = await base44.entities.ConfiguracaoMonitoramento.filter(scope);
      if (configs.length > 0) return configs[0];
      return { ...DEFAULT_CONFIG, empresa_id: empresaAtivaId || null, group_id: grupoAtivoId || null };
    },
    enabled: contextoValido,
  });

  const [formData, setFormData] = useState(config || DEFAULT_CONFIG);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => { if (config) setFormData(config); }, [config]);

  const salvarMutation = useMutation({
    mutationFn: async (data) => {
      const stamped = carimbarContexto({ ...data, empresa_id: empresaAtivaId || null, group_id: grupoAtivoId || null }, "empresa_id");
      const result = config?.id
        ? await base44.entities.ConfiguracaoMonitoramento.update(config.id, stamped)
        : await base44.entities.ConfiguracaoMonitoramento.create(stamped);
      try {
        const me = await base44.auth.me();
        await base44.entities.AuditLog.create({
          usuario: me?.full_name || me?.email || "Usuario", usuario_id: me?.id || null,
          acao: config?.id ? "Edição" : "Criação", modulo: "Sistema", tipo_auditoria: "sistema",
          entidade: "ConfiguracaoMonitoramento", registro_id: result?.id || config?.id,
          empresa_id: empresaAtivaId || null, group_id: grupoAtivoId || null,
          descricao: "Configuração de monitoramento atualizada", dados_novos: stamped,
          sucesso: true, data_hora: new Date().toISOString(),
        });
      } catch {}
      return result;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["config-monitoramento", scopeId] }); toast.success("✅ Configuração salva!"); },
    onError: (error) => { console.error("Erro ao salvar:", error); toast.error("❌ Erro ao salvar configuração"); },
    onSettled: () => setSalvando(false),
  });

  const handleSalvar = () => {
    if (!contextoValido) { toast.error("Selecione um grupo ou empresa antes de salvar."); return; }
    if (!podeEditar) { toast.error("Sem permissão para editar configurações de monitoramento."); return; }
    setSalvando(true);
    salvarMutation.mutate(formData);
  };

  return { config, isLoading, formData, setFormData, salvando, salvarMutation, contextoValido, podeEditar, handleSalvar };
}