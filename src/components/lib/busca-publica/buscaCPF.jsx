// Regra-Mãe 3: Extraído de BuscaDadosPublicos.jsx — validação de CPF (algoritmo oficial, local)

export async function buscarDadosCPF(cpf) {
  const cpfLimpo = cpf.replace(/\D/g, '');

  if (cpfLimpo.length !== 11) {
    return {
      sucesso: false,
      erro: 'CPF deve ter 11 dígitos'
    };
  }

  // Validação local usando algoritmo oficial
  if (/^(\d)\1{10}$/.test(cpfLimpo)) {
    return {
      sucesso: false,
      erro: 'CPF inválido'
    };
  }

  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
  }
  let resto = 11 - (soma % 11);
  let digito1 = resto > 9 ? 0 : resto;

  if (digito1 !== parseInt(cpfLimpo.charAt(9))) {
    return {
      sucesso: false,
      erro: 'CPF inválido'
    };
  }

  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
  }
  resto = 11 - (soma % 11);
  let digito2 = resto > 9 ? 0 : resto;

  if (digito2 !== parseInt(cpfLimpo.charAt(10))) {
    return {
      sucesso: false,
      erro: 'CPF inválido'
    };
  }

  const formatado = cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');

  return {
    sucesso: true,
    dados: {
      valido: true,
      formatado: formatado
    }
  };
}