// Regra-Mãe 3: Extraído de BuscaDadosPublicos.jsx — informações de NCM (código fiscal de produtos)
import { base44 } from '@/api/base44Client';

export async function buscarDadosNCM(ncm) {
  try {
    const ncmLimpo = ncm.replace(/\D/g, '');

    if (ncmLimpo.length !== 8) {
      throw new Error('NCM deve ter 8 dígitos');
    }

    const resultado = await base44.integrations.Core.InvokeLLM({
      prompt: `Busque informações oficiais do código NCM ${ncmLimpo} na tabela NCM brasileira (Nomenclatura Comum do Mercosul).
      
      Retorne:
      - descricao (descrição oficial do produto)
      - unidade (unidade padrão: KG, UN, MT, etc)
      - aliquota_ipi (% de IPI médio)
      - aliquota_pis (% de PIS padrão)
      - aliquota_cofins (% de COFINS padrão)
      - cest (código CEST se aplicável)
      - obs (observações sobre tributação especial)
      
      Se NCM inválido, retorne {"erro": "NCM não encontrado"}`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          erro: { type: "string" },
          descricao: { type: "string" },
          unidade: { type: "string" },
          aliquota_ipi: { type: "number" },
          aliquota_pis: { type: "number" },
          aliquota_cofins: { type: "number" },
          cest: { type: "string" },
          obs: { type: "string" }
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
      erro: error.message || 'Erro ao buscar NCM'
    };
  }
}