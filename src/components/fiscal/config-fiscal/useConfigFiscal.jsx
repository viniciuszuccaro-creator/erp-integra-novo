import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";
import { useToast } from "@/components/ui/use-toast";

/**
 * Hook extraído de ConfigFiscalAutomatica.jsx
 * Estado, queries e mutation de configuração fiscal por empresa.
 */
export default function useConfigFiscal({ empresaId, groupId }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUser();

  const { data: empresa } = useQuery({ queryKey: ['empresa', empresaId], queryFn: async () => await base44.entities.Empresa.get(empresaId), enabled: !!empresaId });
  const { data: config } = useQuery({ queryKey: ['config-fiscal', empresaId], queryFn: async () => { const configs = await base44.entities.ConfigFiscalEmpresa.filter({ empresa_id: empresaId }); return configs[0] || null; }, enabled: !!empresaId });

  const [formData, setFormData] = useState({
    ambiente_nfe: "Homologação", provedor_nf: "Nenhum", api_url: "", api_key: "",
    serie_nfe: "1", serie_nfce: "1", serie_nfse: "1", proximo_numero_nfe: 1, proximo_numero_nfce: 1, proximo_numero_nfse: 1,
    certificado_tipo: "A1", senha_certificado: "", data_validade_certificado: "",
    cfop_padrao_dentro_estado: "5102", cfop_padrao_fora_estado: "6102",
    aliquota_padrao_icms: 18, aliquota_padrao_pis: 1.65, aliquota_padrao_cofins: 7.6, aliquota_padrao_ipi: 0, aliquota_padrao_iss: 5,
    observacoes_padrao_nfe: "", emite_nfe: true, emite_nfce: false, emite_nfse: false, permite_emissao_sem_estoque: false
  });

  useEffect(() => {
    if (config) {
      setFormData({
        ambiente_nfe: config.ambiente || "Homologação", provedor_nf: config.provedor_nf || "Nenhum", api_url: config.api_url || "", api_key: config.api_key || "",
        serie_nfe: config.serie_nfe || "1", serie_nfce: config.serie_nfce || "1", serie_nfse: config.serie_nfse || "1",
        proximo_numero_nfe: config.proximo_numero_nfe || 1, proximo_numero_nfce: config.proximo_numero_nfce || 1, proximo_numero_nfse: config.proximo_numero_nfse || 1,
        certificado_tipo: config.certificado_tipo || "A1", senha_certificado: config.senha_certificado || "", data_validade_certificado: config.data_validade_certificado || "",
        cfop_padrao_dentro_estado: config.cfop_padrao_dentro_estado || "5102", cfop_padrao_fora_estado: config.cfop_padrao_fora_estado || "6102",
        aliquota_padrao_icms: config.aliquota_padrao_icms || 18, aliquota_padrao_pis: config.aliquota_padrao_pis || 1.65, aliquota_padrao_cofins: config.aliquota_padrao_cofins || 7.6,
        aliquota_padrao_ipi: config.aliquota_padrao_ipi || 0, aliquota_padrao_iss: config.aliquota_padrao_iss || 5,
        observacoes_padrao_nfe: config.observacoes_padrao_nfe || "", emite_nfe: config.emite_nfe !== false, emite_nfce: config.emite_nfce || false,
        emite_nfse: config.emite_nfse || false, permite_emissao_sem_estoque: config.permite_emissao_sem_estoque || false
      });
    }
  }, [config]);

  const salvarMutation = useMutation({
    mutationFn: async () => {
      if (!empresaId) throw new Error("Selecione uma empresa antes de salvar a configuracao fiscal.");
      const diasExpiracao = formData.data_validade_certificado ? Math.floor((new Date(formData.data_validade_certificado) - new Date()) / (1000 * 60 * 60 * 24)) : null;
      const alertas = [];
      if (diasExpiracao !== null && diasExpiracao < 30) alertas.push({ tipo: "certificado_vencendo", mensagem: `Certificado expira em ${diasExpiracao} dias`, data: new Date().toISOString() });
      if (!formData.arquivo_certificado && formData.certificado_tipo === "A1") alertas.push({ tipo: "configuracao_incompleta", mensagem: "Certificado A1 não enviado", data: new Date().toISOString() });

      const dadosCompletos = {
        empresa_id: empresaId, group_id: groupId || empresa?.group_id || empresa?.grupo_id || null,
        empresa_nome: empresa?.nome_fantasia || empresa?.razao_social, razao_social: empresa?.razao_social, nome_fantasia: empresa?.nome_fantasia,
        cnpj: empresa?.cnpj, inscricao_estadual: empresa?.inscricao_estadual, inscricao_municipal: empresa?.inscricao_municipal,
        regime_tributario: empresa?.regime_tributario || "Simples Nacional", cnpj_emitente: empresa?.cnpj, uf_emitente: empresa?.endereco?.estado || "",
        ...formData, certificado_expira_em_dias: diasExpiracao, alertas, data_ultima_verificacao_certificado: new Date().toISOString(),
        historico_alteracoes: [...(config?.historico_alteracoes || []), { data: new Date().toISOString(), usuario: user?.email || "Sistema", campo_alterado: "configuracao_geral", valor_anterior: JSON.stringify(config || {}), valor_novo: JSON.stringify(formData) }]
      };

      if (config?.id) { const result = await base44.entities.ConfigFiscalEmpresa.update(config.id, dadosCompletos); return { ...result, __auditAction: "Edicao", __auditPrevious: config }; }
      const result = await base44.entities.ConfigFiscalEmpresa.create(dadosCompletos); return { ...result, __auditAction: "Criacao" };
    },
    onSuccess: async (result) => {
      queryClient.invalidateQueries({ queryKey: ['config-fiscal'] });
      try {
        await base44.entities.AuditLog.create({
          usuario: user?.full_name || user?.email || "Sistema", usuario_id: user?.id || null,
          empresa_id: empresaId || null, group_id: groupId || empresa?.group_id || empresa?.grupo_id || null,
          acao: result?.__auditAction || "Edicao", modulo: "Fiscal", entidade: "ConfigFiscalEmpresa",
          registro_id: result?.id || config?.id || null, descricao: "Configuracao fiscal da empresa salva",
          dados_anteriores: result?.__auditPrevious || null, dados_novos: formData, sucesso: true, data_hora: new Date().toISOString()
        });
      } catch (e) { console.warn("[Fiscal] Falha ao auditar:", e); }
      toast({ title: "✅ Configuração fiscal salva!" });
    },
    onError: (error) => { toast({ title: "Erro ao salvar configuracao fiscal", description: String(error?.message || error), variant: "destructive" }); }
  });

  const certificadoValido = formData.data_validade_certificado && new Date(formData.data_validade_certificado) > new Date();
  const diasRestantes = formData.data_validade_certificado ? Math.floor((new Date(formData.data_validade_certificado) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return { empresa, config, formData, setFormData, salvarMutation, certificadoValido, diasRestantes };
}