import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useToast } from "@/components/ui/use-toast";

const CONFIG_DEFAULT = {
  ativo: false, provedor_cobranca: "Nenhum", api_url: "", api_key: "", api_token: "",
  client_id: "", client_secret: "", conta_id: "",
  habilitar_boleto: true, habilitar_pix: true, habilitar_cartao: false,
  dias_vencimento_padrao: 3, multa_pos_vencimento_percent: 2, juros_ao_dia_percent: 0.033,
  desconto_antecipacao_percent: 0,
  mensagem_padrao_boleto: "Não receber após o vencimento. Sujeito a multa e juros.",
  mensagem_padrao_pix: "PIX válido por 24h",
  pix_chave: "", pix_tipo: "CNPJ",
  enviar_email_automatico: true, enviar_whatsapp_automatico: false,
  modo_simulacao: true, webhook_url: "", webhook_token: ""
};

/**
 * Hook extraído de ConfiguracaoCobranca.jsx
 * Gerencia estado, queries e mutations da configuração de cobrança por empresa
 */
export function useConfigCobranca() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { filterInContext, grupoAtual, empresaAtual, contexto } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const [empresaSelecionada, setEmpresaSelecionada] = useState(null);
  const [config, setConfig] = useState(CONFIG_DEFAULT);

  const { data: configsExistentes = [] } = useQuery({
    queryKey: ['configs-cobranca', contextoKey],
    queryFn: () => filterInContext('ConfiguracaoCobrancaEmpresa', {}, '-updated_date', 999),
    enabled: !!contexto,
  });

  const salvarMutation = useMutation({
    mutationFn: async () => {
      const dadosConfig = {
        group_id: empresaSelecionada.group_id || empresaSelecionada.grupo_id,
        empresa_id: empresaSelecionada.id,
        empresa_nome: empresaSelecionada.nome_fantasia || empresaSelecionada.razao_social,
        ...config,
        status_conexao: config.ativo ? "configurado" : "nao_configurado"
      };
      const existente = configsExistentes.find(c => c.empresa_id === empresaSelecionada.id);
      if (existente) {
        return await base44.entities.ConfiguracaoCobrancaEmpresa.update(existente.id, dadosConfig);
      }
      return await base44.entities.ConfiguracaoCobrancaEmpresa.create(dadosConfig);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configs-cobranca'] });
      toast({ title: "✅ Configuração de cobrança salva!" });
    },
  });

  const carregarConfig = (empresa) => {
    setEmpresaSelecionada(empresa);
    const existente = configsExistentes.find(c => c.empresa_id === empresa.id);
    if (existente) {
      setConfig(existente);
    } else {
      setConfig({ ...CONFIG_DEFAULT, pix_chave: empresa.cnpj, pix_tipo: "CNPJ" });
    }
  };

  return {
    configsExistentes, empresaSelecionada, config, setConfig,
    salvarMutation, carregarConfig
  };
}