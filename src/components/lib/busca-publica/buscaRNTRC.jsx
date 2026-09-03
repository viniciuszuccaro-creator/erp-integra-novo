// Regra-Mãe 3: Extraído de BuscaDadosPublicos.jsx — validação de RNTRC de transportadora (ANTT)
import { base44 } from '@/api/base44Client';

export async function buscarDadosRNTRC(rntrc) {
  try {
    const resultado = await base44.integrations.Core.InvokeLLM({
      prompt: `Valide o código RNTRC ${rntrc} no registro da ANTT (Agência Nacional de Transportes Terrestres).
      
      Retorne:
      - valido (true/false)
      - situacao (Ativo, Suspenso, Cancelado)
      - tipo_registro (ETC, TAC, CTC)
      - categoria (se disponível)
      
      Se RNTRC não encontrado, retorne {"erro": "RNTRC não encontrado"}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          erro: { type: "string" },
          valido: { type: "boolean" },
          situacao: { type: "string" },
          tipo_registro: { type: "string" },
          categoria: { type: "string" }
        }
      }
    });

    if (resultado.erro) {
      throw new Error(resultado.erro);
    }

    return {
      sucesso: true,
      dados: resultado
    };

  } catch (error) {
    return {
      sucesso: false,
      erro: error.message || 'Erro ao validar RNTRC'
    };
  }
}