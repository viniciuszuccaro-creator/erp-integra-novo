import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

/**
 * Hook extraído de ProdutoFormV22_Completo para encapsular funções de IA.
 * Refatoração P1 — Regra-Mãe: melhorar o existente, reduzir arquivos grandes.
 */
export default function useProdutoIA({ formData, setFormData }) {
  const [iaSugestao, setIaSugestao] = useState(null);
  const [processandoIA, setProcessandoIA] = useState(false);
  const [sugestoesIA, setSugestoesIA] = useState({});
  const [gerandoDescricaoSEO, setGerandoDescricaoSEO] = useState(false);
  const [gerandoImagem, setGerandoImagem] = useState(false);

  const analisarDescricaoIA = async (descricao) => {
    if (!descricao || descricao.length < 5) return;

    setProcessandoIA(true);

    try {
      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta descrição de produto: "${descricao}".

Se for uma bitola de aço (ex: "Barra 8mm 12m CA-50", "Vergalhão 10mm"), retorne:
- eh_bitola: true
- peso_teorico_kg_m: peso teórico em kg/m (tabela oficial):
  * 6.3mm = 0.245 kg/m
  * 8mm = 0.395 kg/m
  * 10mm = 0.617 kg/m
  * 12.5mm = 0.963 kg/m
  * 16mm = 1.578 kg/m
  * 20mm = 2.466 kg/m
  * 25mm = 3.853 kg/m
  * 32mm = 6.313 kg/m
- bitola_diametro_mm: diâmetro em mm
- tipo_aco: CA-25, CA-50 ou CA-60
- ncm: "7214.20.00" (vergalhões)
- grupo_produto: "Bitola"
- comprimento_barra_m: 12 (padrão)
- unidade_principal: "KG"
- unidades_secundarias: ["PÇ", "KG", "MT"]
- confianca: número de 0-100 indicando confiança

Caso contrário, sugira:
- grupo_produto adequado
- ncm provável
- unidade_principal e unidades_secundarias apropriadas
- confianca: número de 0-100`,
        response_json_schema: {
          type: "object",
          properties: {
            eh_bitola: { type: "boolean" },
            peso_teorico_kg_m: { type: "number" },
            bitola_diametro_mm: { type: "number" },
            tipo_aco: { type: "string" },
            ncm: { type: "string" },
            grupo_produto: { type: "string" },
            comprimento_barra_m: { type: "number" },
            unidade_principal: { type: "string" },
            unidades_secundarias: {
              type: "array",
              items: { type: "string" }
            },
            confianca: { type: "number" },
            explicacao: { type: "string" }
          }
        }
      });

      setIaSugestao(resultado);
      setSugestoesIA(prev => ({
        ...prev,
        classificacao_confianca: resultado.confianca
      }));
      toast.success('✨ IA analisou o produto!');
    } catch (error) {
      toast.error('Erro ao processar IA');
    } finally {
      setProcessandoIA(false);
    }
  };

  const aplicarSugestaoIA = () => {
    if (!iaSugestao) return;

    setFormData(prev => ({
      ...prev,
      eh_bitola: iaSugestao.eh_bitola || false,
      peso_teorico_kg_m: iaSugestao.peso_teorico_kg_m || 0,
      bitola_diametro_mm: iaSugestao.bitola_diametro_mm || 0,
      tipo_aco: iaSugestao.tipo_aco || 'CA-50',
      ncm: iaSugestao.ncm || '',
      grupo: iaSugestao.grupo_produto || prev.grupo,
      comprimento_barra_padrao_m: iaSugestao.comprimento_barra_m || 12,
      unidade_principal: iaSugestao.unidade_principal || 'KG',
      unidades_secundarias: iaSugestao.unidades_secundarias || ['KG']
    }));

    toast.success('✅ Sugestões aplicadas!');
    setIaSugestao(null);
  };

  const gerarDescricaoSEO = async () => {
    if (!formData.descricao) {
      toast.error("Preencha a descrição básica primeiro");
      return;
    }

    setGerandoDescricaoSEO(true);

    try {
      const descricaoSEO = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um especialista em SEO para e-commerce. 
        
        Crie uma descrição detalhada e otimizada para SEO para este produto: "${formData.descricao}"
        
        NCM: ${formData.ncm || 'Não informado'}
        Grupo: ${formData.grupo || 'Não informado'}
        É bitola: ${formData.eh_bitola ? 'Sim' : 'Não'}
        
        A descrição deve:
        - Ter 150-250 palavras
        - Incluir palavras-chave relevantes
        - Destacar benefícios e aplicações
        - Ser atrativa para vendas online
        - Incluir especificações técnicas se houver
        
        Retorne apenas o texto da descrição.`
      });

      setFormData(prev => ({
        ...prev,
        descricao_seo: descricaoSEO
      }));

      toast.success("✅ Descrição SEO gerada!");
    } catch (error) {
      toast.error("Erro ao gerar descrição");
    } finally {
      setGerandoDescricaoSEO(false);
    }
  };

  const gerarImagemIA = async () => {
    if (!formData.descricao) {
      toast.error("Preencha a descrição do produto primeiro");
      return;
    }

    setGerandoImagem(true);

    try {
      const { url } = await base44.integrations.Core.GenerateImage({
        prompt: `Product photography of ${formData.descricao}, professional lighting, white background, high quality, detailed, 4k`
      });

      setFormData(prev => ({
        ...prev,
        foto_produto_url: url
      }));

      toast.success("✅ Imagem gerada pela IA!");
    } catch (error) {
      toast.error("Erro ao gerar imagem");
    } finally {
      setGerandoImagem(false);
    }
  };

  return {
    iaSugestao,
    setIaSugestao,
    processandoIA,
    sugestoesIA,
    setSugestoesIA,
    gerandoDescricaoSEO,
    gerandoImagem,
    analisarDescricaoIA,
    aplicarSugestaoIA,
    gerarDescricaoSEO,
    gerarImagemIA,
  };
}