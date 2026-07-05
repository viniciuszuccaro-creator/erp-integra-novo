import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useToast } from "@/components/ui/use-toast";

const TRANSPORTADORA_DEFAULT = {
  provider: "Nenhum", api_url: "", api_token: "",
  calcular_frete_auto: false, enviar_rastreamento_auto: false
};

const WHATSAPP_DEFAULT = {
  provider: "Nenhum", api_url: "", api_token: "", enviar_auto: false,
  modelo_saida: "Seu pedido {{numero_pedido}} saiu para entrega. Previsão: {{data_prevista}}.",
  modelo_entregue: "Seu pedido {{numero_pedido}} foi entregue. Obrigado!",
  modelo_frustrada: "Tentativa de entrega do pedido {{numero_pedido}} não concluída. Motivo: {{motivo}}"
};

const EMAIL_DEFAULT = {
  enviar_auto: false,
  assunto_saida: "Seu pedido saiu para entrega",
  assunto_entregue: "Pedido entregue",
  corpo_saida: "", corpo_entregue: ""
};

/**
 * Hook extraído de ConfiguracaoExpedicao.jsx
 * Gerencia estado, queries e mutations das configurações de expedição
 */
export function useConfigExpedicao({ empresaId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { filterInContext, empresaAtual, grupoAtual } = useContextoVisual();
  const ctxEmpresaId = empresaId || empresaAtual?.id;
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${ctxEmpresaId || 'sem-empresa'}`;

  const { data: config } = useQuery({
    queryKey: ['config-expedicao', contextoKey],
    queryFn: async () => {
      const configs = await filterInContext('ConfiguracaoSistema', {
        chave: `expedicao_${ctxEmpresaId}`, categoria: "Integracoes"
      }, '-updated_date', 50);
      return configs[0] || null;
    },
    enabled: !!contextoKey,
  });

  const [configTransportadora, setConfigTransportadora] = useState(TRANSPORTADORA_DEFAULT);
  const [configWhatsApp, setConfigWhatsApp] = useState(WHATSAPP_DEFAULT);
  const [configEmail, setConfigEmail] = useState(EMAIL_DEFAULT);

  const salvarMutation = useMutation({
    mutationFn: async () => {
      const dadosConfig = {
        chave: `expedicao_${ctxEmpresaId}`,
        categoria: "Integracoes",
        empresa_id: ctxEmpresaId,
        group_id: grupoAtual?.id,
        integracao_transportadoras: configTransportadora,
        integracao_whatsapp: configWhatsApp,
        configuracoes_email: configEmail
      };
      if (config) {
        return await base44.entities.ConfiguracaoSistema.update(config.id, dadosConfig);
      }
      return await base44.entities.ConfiguracaoSistema.create(dadosConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-expedicao', contextoKey] });
      toast({ title: "✅ Configurações salvas!" });
    },
  });

  return {
    configTransportadora, setConfigTransportadora,
    configWhatsApp, setConfigWhatsApp,
    configEmail, setConfigEmail,
    salvarMutation
  };
}