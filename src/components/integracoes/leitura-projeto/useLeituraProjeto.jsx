import { useState } from "react";
import { base44 } from "@/api/base44Client";

/**
 * Hook extraído de IALeituraProjeto.jsx
 * Encapsula state e lógica de processamento de IA para leitura de projetos.
 */
export default function useLeituraProjeto(configuracao, toast) {
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [modoLeitura, setModoLeitura] = useState('leitura_mista');

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const tiposAceitos = ['application/pdf', 'image/png', 'image/jpeg', 'application/dwg', 'application/dxf'];
    if (!tiposAceitos.some(type => file.type.includes(type)) && !file.name.match(/\.(pdf|dwg|dxf|png|jpg|jpeg)$/i)) {
      toast({ title: "⚠️ Tipo de arquivo não suportado", description: "Use PDF, DWG, DXF, PNG ou JPG", variant: "destructive" });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "⚠️ Arquivo muito grande", description: "Tamanho máximo: 10MB", variant: "destructive" });
      return;
    }

    setArquivo(file);
    setResultado(null);
  };

  const processarArquivo = async () => {
    if (!arquivo) {
      toast({ title: "⚠️ Selecione um arquivo", description: "Por favor, faça upload de um arquivo de projeto.", variant: "destructive" });
      return;
    }

    setProcessando(true);
    setResultado(null);

    try {
      const modoSimulacao = configuracao?.integracao_ia_producao?.modo_simulacao !== false;

      if (!modoSimulacao && configuracao?.integracao_ia_producao?.ativada) {
        await processarComIAReal();
      } else {
        await processarSimulado();
      }
    } catch (error) {
      console.error("Erro ao processar arquivo:", error);
      toast({ title: "❌ Erro no processamento", description: error.message || 'Ocorreu um erro ao processar o arquivo.', variant: "destructive" });
    } finally {
      setProcessando(false);
    }
  };

  const processarComIAReal = async () => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file: arquivo });

    const schema = {
      type: "object",
      properties: {
        tipo_projeto: { type: "string", enum: ["residencial", "comercial", "industrial", "outro"], description: "Tipo geral do projeto" },
        elementos_identificados: {
          type: "array",
          items: {
            type: "object",
            properties: {
              elemento: { type: "string", description: "Identificador do elemento (Ex: V1, C2)" },
              tipo_peca: { type: "string", enum: ["Coluna", "Viga", "Bloco", "Sapata", "Laje", "Estaca", "Estribo", "Pilar"], description: "Tipo de peça estrutural" },
              posicao: { type: "string", description: "Posição ou nível do elemento" },
              bitola_principal: { type: "string", description: "Bitola do ferro principal (Ex: 12.5mm, 16.0mm)" },
              quantidade_barras: { type: "number", description: "Quantidade de barras de ferro principal" },
              comprimento_mm: { type: "number", description: "Comprimento do elemento em milímetros" },
              largura_mm: { type: "number", description: "Largura da seção transversal em milímetros" },
              altura_mm: { type: "number", description: "Altura da seção transversal em milímetros" },
              estribo_bitola: { type: "string", description: "Bitola do estribo (Ex: 5.0mm, 6.3mm)" },
              estribo_espacamento: { type: "number", description: "Espaçamento dos estribos em centímetros" },
              confianca: { type: "number", description: "Nível de confiança da IA (0-100)" }
            },
            required: ["elemento", "tipo_peca", "bitola_principal", "quantidade_barras", "comprimento_mm", "confianca"]
          },
          description: "Lista de todos os elementos estruturais identificados"
        },
        observacoes: { type: "string", description: "Observações gerais sobre a leitura do projeto" }
      },
      required: ["elementos_identificados"]
    };

    const promptIA = `
Você é um engenheiro especialista em leitura de projetos estruturais.
Analise o projeto anexado e extraia TODOS os elementos estruturais (vigas, colunas, blocos, etc.) de acordo com o modo de leitura solicitado (${modoLeitura}).

Para cada elemento, identifique as propriedades no schema JSON.
Seja preciso e detalhado. Retorne apenas elementos que você tem certeza, com confianca mínima de 70%.
Forneça as dimensões em milímetros (mm) e espaçamento de estribos em centímetros (cm).
    `;

    const resposta = await base44.integrations.Core.InvokeLLM({
      prompt: promptIA,
      file_urls: [file_url],
      response_json_schema: schema
    });

    const totalConfianca = resposta.elementos_identificados.reduce((sum, el) => sum + el.confianca, 0);
    const confiancaGeral = resposta.elementos_identificados.length > 0 ? totalConfianca / resposta.elementos_identificados.length : 0;

    setResultado({ ...resposta, modo: 'real', confianca_geral: confiancaGeral });

    toast({
      title: "✅ Sucesso na leitura com IA!",
      description: `${resposta.elementos_identificados.length} elementos identificados pela IA!`,
      variant: "default"
    });
  };

  const processarSimulado = async () => {
    await new Promise(resolve => setTimeout(resolve, 3000));

    const pecasSimuladas = [
      { elemento: "V1", posicao: "N1", tipo_peca: "Viga", quantidade: 4, comprimento: 4500, largura: 150, altura: 400, ferro_principal_bitola: "12.5mm", ferro_principal_quantidade: 4, estribo_bitola: "6.3mm", estribo_largura: 150, estribo_altura: 400, estribo_distancia: 15, confianca: 95, status_leitura: "completo", observacoes_ia: "Viga identificada com alta confiança" },
      { elemento: "C1", posicao: "N1", tipo_peca: "Coluna", quantidade: 8, comprimento: 3000, largura: 200, altura: 200, ferro_principal_bitola: "16.0mm", ferro_principal_quantidade: 8, estribo_bitola: "6.3mm", estribo_largura: 200, estribo_altura: 200, estribo_distancia: 10, confianca: 88, status_leitura: "completo", observacoes_ia: "Coluna com seção quadrada" },
      { elemento: "V2", posicao: "N1", tipo_peca: "Viga", quantidade: 2, comprimento: 6500, largura: 120, altura: 350, ferro_principal_bitola: "10.0mm", ferro_principal_quantidade: 3, estribo_bitola: "5.0mm", estribo_distancia: 20, confianca: 72, status_leitura: "parcial", observacoes_ia: "Largura do estribo não identificada - preencher manualmente" }
    ];

    const elementosIdentificados = pecasSimuladas.map(p => ({
      elemento: p.elemento, tipo_peca: p.tipo_peca, posicao: p.posicao,
      bitola_principal: p.ferro_principal_bitola, quantidade_barras: p.ferro_principal_quantidade,
      comprimento_mm: p.comprimento, largura_mm: p.largura, altura_mm: p.altura,
      estribo_bitola: p.estribo_bitola, estribo_espacamento: p.estribo_distancia, confianca: p.confianca
    }));

    const totalConfianca = elementosIdentificados.reduce((sum, el) => sum + el.confianca, 0);
    const confiancaGeral = elementosIdentificados.length > 0 ? totalConfianca / elementosIdentificados.length : 0;
    const observacoesSimuladas = elementosIdentificados.map(el => `[Simulado] ${el.elemento}: ${el.confianca}% de confiança.`).join(' ');

    setResultado({
      tipo_projeto: "residencial",
      elementos_identificados: elementosIdentificados,
      observacoes: `Simulação concluída. Total de ${elementosIdentificados.length} elementos identificados. ${observacoesSimuladas}`,
      modo: 'simulado', confianca_geral: confiancaGeral,
    });

    toast({
      title: "✨ Projeto processado com IA (simulação)!",
      description: `${elementosIdentificados.length} elementos detectados. Confiança média: ${confiancaGeral.toFixed(0)}%`
    });
  };

  const limparResultados = () => setResultado(null);

  return {
    arquivo, processando, resultado, modoLeitura, setModoLeitura,
    handleUpload, processarArquivo, limparResultados,
  };
}