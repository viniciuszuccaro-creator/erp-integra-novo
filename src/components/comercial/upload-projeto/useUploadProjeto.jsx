import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

const EXTENSOES_PERMITIDAS = ['.pdf', '.jpg', '.jpeg', '.png', '.dwg'];

const IA_JSON_SCHEMA = {
  type: "object",
  properties: {
    pecas: {
      type: "array",
      items: {
        type: "object",
        properties: {
          identificador: { type: "string", description: "ID único da peça (P1, P2, C1, V1, etc)" },
          tipo_peca: { type: "string", enum: ["Coluna", "Viga", "Bloco", "Sapata", "Laje", "Estaca"], description: "Tipo de elemento estrutural" },
          quantidade: { type: "number", description: "Quantidade de peças iguais" },
          comprimento: { type: "number", description: "Comprimento em centímetros" },
          largura: { type: "number", description: "Largura em centímetros" },
          altura: { type: "number", description: "Altura em centímetros" },
          ferro_principal_bitola: { type: "string", description: "Bitola do ferro principal (ex: 12.5mm, 16.0mm)" },
          ferro_principal_quantidade: { type: "number", description: "Quantidade de barras de ferro principal" },
          estribo_bitola: { type: "string", description: "Bitola do estribo (ex: 6.3mm)" },
          estribo_distancia: { type: "number", description: "Distância entre estribos em cm" },
          observacoes: { type: "string", description: "Observações técnicas da peça" }
        },
        required: ["identificador", "tipo_peca", "quantidade"]
      }
    },
    resumo_projeto: {
      type: "object",
      properties: {
        nome_projeto: { type: "string" },
        total_pecas: { type: "number" },
        tipos_encontrados: { type: "array", items: { type: "string" } },
        observacoes_gerais: { type: "string" }
      }
    }
  }
};

const IA_PROMPT = `Você é um especialista em engenharia civil e análise de projetos estruturais.

Analise o projeto anexado e extraia TODAS as informações de peças estruturais (colunas, vigas, blocos, sapatas, lajes, estacas).

Para cada peça, identifique:
- ID único (P1, P2, C1, V1, etc) conforme nomenclatura do projeto
- Tipo de peça (Coluna, Viga, Bloco, etc)
- Quantidade de peças iguais
- Dimensões: comprimento, largura, altura (em cm)
- Armadura: bitola e quantidade de ferro principal
- Estribos: bitola e espaçamento (distância entre eles em cm)
- Observações técnicas relevantes

IMPORTANTE:
- Se não conseguir identificar alguma dimensão específica, use 0
- Se houver peças repetidas, agrupe pela quantidade
- Mantenha os IDs originais do projeto quando possível
- Para estribos, use bitolas comuns: 4.2mm, 5.0mm, 6.3mm
- Para ferro principal, use: 8.0mm, 10.0mm, 12.5mm, 16.0mm, 20.0mm, 25.0mm

Retorne um JSON estruturado com todas as peças encontradas e um resumo do projeto.`;

/**
 * Hook extraído de UploadProjetoModal.jsx
 * Gerencia upload de arquivo, processamento IA e confirmação de peças
 */
export function useUploadProjeto({ onClose, onPecasExtraidas }) {
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [resultado, setResultado] = useState(null);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const extensao = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
    if (!EXTENSOES_PERMITIDAS.includes(extensao)) {
      toast({ title: "❌ Arquivo não suportado", description: "Use arquivos PDF, JPG, PNG ou DWG", variant: "destructive" });
      return;
    }
    setArquivo(file);
    setResultado(null);
  };

  const processarComIA = async () => {
    if (!arquivo) {
      toast({ title: "❌ Nenhum arquivo selecionado", description: "Selecione um arquivo de projeto primeiro", variant: "destructive" });
      return;
    }

    try {
      setProcessando(true);
      setProgresso(10);
      toast({ title: "📤 Enviando arquivo...", description: "Fazendo upload do projeto" });

      const uploadResponse = await base44.integrations.Core.UploadFile({ file: arquivo });
      const fileUrl = uploadResponse.file_url;

      setProgresso(50);
      toast({ title: "🤖 Processando com IA...", description: "Analisando o projeto e extraindo informações" });

      const iaResponse = await base44.integrations.Core.InvokeLLM({
        prompt: IA_PROMPT,
        file_urls: [fileUrl],
        response_json_schema: IA_JSON_SCHEMA
      });

      setProgresso(90);

      if (!iaResponse?.pecas || iaResponse.pecas.length === 0) {
        throw new Error("Nenhuma peça foi identificada no projeto");
      }

      setResultado(iaResponse);
      setProgresso(100);
      toast({ title: "✅ Análise Concluída!", description: `${iaResponse.pecas.length} peças identificadas no projeto` });
    } catch (error) {
      console.error("Erro ao processar com IA:", error);
      toast({ title: "❌ Erro no Processamento", description: error.message || "Não foi possível processar o projeto", variant: "destructive" });
      setResultado(null);
    } finally {
      setProcessando(false);
    }
  };

  const confirmarPecas = () => {
    if (!resultado?.pecas) return;
    onPecasExtraidas(resultado.pecas, resultado.resumo_projeto);
    onClose();
    toast({ title: "✅ Peças Importadas!", description: `${resultado.pecas.length} peças adicionadas ao orçamento` });
  };

  const resetar = () => {
    setArquivo(null);
    setResultado(null);
    setProgresso(0);
  };

  return { arquivo, processando, progresso, resultado, handleFileChange, processarComIA, confirmarPecas, resetar };
}