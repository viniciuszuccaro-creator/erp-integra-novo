// Regra-Mãe 3: Extraído de BuscaDadosPublicos.jsx — busca de CNPJ na Receita Federal (backend + fallback BrasilAPI)
import { base44 } from '@/api/base44Client';

export async function buscarDadosCNPJ(cnpj) {
  const cnpjLimpo = cnpj?.replace(/\D/g, '') || '';

  console.log('🔍 [Frontend] Iniciando busca CNPJ:', cnpjLimpo);

  if (cnpjLimpo.length !== 14) {
    console.error('❌ [Frontend] CNPJ inválido:', cnpjLimpo);
    return {
      sucesso: false,
      erro: 'CNPJ deve ter 14 dígitos'
    };
  }

  // ===== TENTATIVA 1: Backend Function (se habilitado) =====
  try {
    console.log('📡 [Frontend] Tentando backend function...');
    const resultado = await base44.functions.ConsultarCNPJ({ cnpj: cnpjLimpo });

    console.log('📦 [Frontend] Backend retornou:', resultado);

    if (resultado && resultado.sucesso) {
      console.log('✅ [Frontend] Backend SUCESSO:', resultado.dados?.razao_social);
      return resultado;
    }

    if (resultado && !resultado.sucesso) {
      console.warn('⚠️ [Frontend] Backend sem sucesso:', resultado.erro);
      // Continua para fallback direto
    }
  } catch (error) {
    console.warn('⚠️ [Frontend] Backend não disponível:', error.message);
    // Fallback para busca direta no frontend
  }

  // ===== TENTATIVA 2: Busca Direta no Frontend (Fallback) =====
  console.log('🔄 [Frontend] Usando fallback direto (CORS livre)...');

  // Tentar BrasilAPI primeiro (tem CORS livre)
  try {
    console.log('📡 [Frontend] Chamando BrasilAPI direto...');
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjLimpo}`);

    console.log('📦 [Frontend] BrasilAPI status:', response.status);

    if (response.ok) {
      const dados = await response.json();
      console.log('✅ [Frontend] BrasilAPI SUCESSO:', dados.razao_social);

      if (dados.razao_social) {
        return {
          sucesso: true,
          fonte: 'BrasilAPI (Frontend)',
          dados: {
            razao_social: dados.razao_social || '',
            nome_fantasia: dados.nome_fantasia || dados.razao_social || '',
            inscricao_estadual: dados.inscricao_estadual || 'ISENTO',
            inscricao_municipal: dados.inscricao_municipal || '',
            situacao_cadastral: dados.descricao_situacao_cadastral || 'ATIVA',
            data_abertura: dados.data_inicio_atividade || '',
            porte: dados.porte || '',
            natureza_juridica: dados.descricao_natureza_juridica || '',
            cnae_principal: dados.cnae_fiscal_descricao || '',
            cnae_codigo: dados.cnae_fiscal?.toString() || '',
            capital_social: dados.capital_social?.toString() || '0',
            endereco_completo: {
              logradouro: dados.descricao_tipo_de_logradouro ?
                `${dados.descricao_tipo_de_logradouro} ${dados.logradouro || ''}`.trim() :
                dados.logradouro || '',
              numero: dados.numero || 'S/N',
              complemento: dados.complemento || '',
              bairro: dados.bairro || '',
              cidade: dados.municipio || '',
              uf: dados.uf || '',
              cep: dados.cep?.replace(/\D/g, '') || ''
            },
            telefone: dados.ddd_telefone_1 ? `${dados.ddd_telefone_1}`.replace(/\D/g, '') : '',
            email: dados.email || ''
          }
        };
      }
    }
  } catch (error) {
    console.error('❌ [Frontend] BrasilAPI falhou:', error.message);
  }

  // ===== TODAS AS TENTATIVAS FALHARAM =====
  console.error('❌ [Frontend] Todas as tentativas falharam');
  return {
    sucesso: false,
    erro: '❌ CNPJ não encontrado. Verifique se digitou corretamente ou tente novamente.'
  };
}