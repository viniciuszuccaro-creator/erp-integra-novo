import { useState } from "react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

/**
 * Hook: lógica de IA fiscal (validar e aplicar sugestões)
 */
export default function useTabelaFiscalIA(podeUsarIA, podeSalvar) {
  const [validandoIA, setValidandoIA] = useState(false);
  const [sugestaoIA, setSugestaoIA] = useState(null);

  const handleValidarIA = async (formData) => {
    if (!podeUsarIA) { toast.error("Sem permissão para validar tabela fiscal com IA."); return null; }
    setValidandoIA(true);
    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um especialista fiscal brasileiro. Analise esta configuração tributária e sugira as alíquotas corretas:
Regime: ${formData.regime_tributario}
Cenário: ${formData.cenario_operacao}
NCM: ${formData.ncm}
CFOP: ${formData.cfop}
Destino: ${formData.destino_operacao}
Tipo Cliente: ${formData.tipo_cliente}
Sugira: CST/CSOSN apropriado, Alíquotas de ICMS, PIS, COFINS, IPI, Possíveis alertas, Legislação de base.`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            icms_cst_sugerido: { type: "string" },
            icms_aliquota_sugerida: { type: "number" },
            pis_cst_sugerido: { type: "string" },
            pis_aliquota_sugerida: { type: "number" },
            cofins_cst_sugerido: { type: "string" },
            cofins_aliquota_sugerida: { type: "number" },
            alertas: { type: "array", items: { type: "string" } },
            recomendacao: { type: "string" },
            legislacao: { type: "string" }
          }
        }
      });
      setSugestaoIA(resultado);
      toast.success("✨ IA analisou a configuração fiscal");
      return resultado;
    } catch (error) {
      toast.error("Erro na validação IA: " + error.message);
      return null;
    } finally {
      setValidandoIA(false);
    }
  };

  const handleAplicarSugestaoIA = (setFormData) => {
    if (!sugestaoIA) return;
    if (!podeSalvar) { toast.error("Sem permissão para aplicar sugestões na tabela fiscal."); return; }
    setFormData(prev => ({
      ...prev,
      icms_cst_csosn: sugestaoIA.icms_cst_sugerido || prev.icms_cst_csosn,
      icms_aliquota: sugestaoIA.icms_aliquota_sugerida || prev.icms_aliquota,
      pis_cst: sugestaoIA.pis_cst_sugerido || prev.pis_cst,
      pis_aliquota: sugestaoIA.pis_aliquota_sugerido || prev.pis_aliquota,
      cofins_cst: sugestaoIA.cofins_cst_sugerido || prev.cofins_cst,
      cofins_aliquota: sugestaoIA.cofins_aliquota_sugerida || prev.cofins_aliquota,
      validado_ia: true,
      ultima_validacao_ia: new Date().toISOString(),
      confianca_ia: 85,
      legislacao_base: sugestaoIA.legislacao
    }));
    toast.success("✅ Sugestões da IA aplicadas");
  };

  return { validandoIA, sugestaoIA, handleValidarIA, handleAplicarSugestaoIA };
}