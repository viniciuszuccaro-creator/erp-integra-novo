/**
 * Validações e formatações de documentos fiscais (CPF, CNPJ)
 * Regra-Mãe 3: extraído de validacoes.jsx — comportamento preservado
 */

/**
 * Valida CPF
 * @param {string} cpf - CPF com ou sem máscara
 * @returns {boolean} - true se válido
 */
export function validarCPF(cpf) {
  if (!cpf) return false;

  // Remove caracteres não numéricos
  cpf = cpf.replace(/\D/g, '');

  // Verifica se tem 11 dígitos
  if (cpf.length !== 11) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Validação do primeiro dígito verificador
  let soma = 0;
  for (let i = 0; i < 9; i++) {
    soma += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let resto = soma % 11;
  let digitoVerificador1 = resto < 2 ? 0 : 11 - resto;

  if (parseInt(cpf.charAt(9)) !== digitoVerificador1) return false;

  // Validação do segundo dígito verificador
  soma = 0;
  for (let i = 0; i < 10; i++) {
    soma += parseInt(cpf.charAt(i)) * (11 - i);
  }
  resto = soma % 11;
  let digitoVerificador2 = resto < 2 ? 0 : 11 - resto;

  if (parseInt(cpf.charAt(10)) !== digitoVerificador2) return false;

  return true;
}

/**
 * Valida CNPJ
 * @param {string} cnpj - CNPJ com ou sem máscara
 * @returns {boolean} - true se válido
 */
export function validarCNPJ(cnpj) {
  if (!cnpj) return false;

  // Remove caracteres não numéricos
  cnpj = cnpj.replace(/\D/g, '');

  // Verifica se tem 14 dígitos
  if (cnpj.length !== 14) return false;

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Validação do primeiro dígito verificador
  let tamanho = cnpj.length - 2;
  let numeros = cnpj.substring(0, tamanho);
  let digitos = cnpj.substring(tamanho);
  let soma = 0;
  let pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(0)) return false;

  // Validação do segundo dígito verificador
  tamanho = tamanho + 1;
  numeros = cnpj.substring(0, tamanho);
  soma = 0;
  pos = tamanho - 7;

  for (let i = tamanho; i >= 1; i--) {
    soma += numeros.charAt(tamanho - i) * pos--;
    if (pos < 2) pos = 9;
  }

  resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
  if (resultado != digitos.charAt(1)) return false;

  return true;
}

/**
 * Formata CPF
 * @param {string} cpf - CPF sem formatação
 * @returns {string} - CPF formatado (000.000.000-00)
 */
export function formatarCPF(cpf) {
  if (!cpf) return '';
  cpf = cpf.replace(/\D/g, '');
  if (cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata CNPJ
 * @param {string} cnpj - CNPJ sem formatação
 * @returns {string} - CNPJ formatado (00.000.000/0000-00)
 */
export function formatarCNPJ(cnpj) {
  if (!cnpj) return '';
  cnpj = cnpj.replace(/\D/g, '');
  if (cnpj.length !== 14) return cnpj;
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formata CPF ou CNPJ automaticamente
 * @param {string} valor - CPF ou CNPJ
 * @returns {string} - Valor formatado
 */
export function formatarCPFCNPJ(valor) {
  if (!valor) return '';
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length <= 11) {
    return formatarCPF(numeros);
  } else {
    return formatarCNPJ(numeros);
  }
}

/**
 * Valida CPF ou CNPJ
 * @param {string} valor - CPF ou CNPJ
 * @returns {boolean} - true se válido
 */
export function validarCPFCNPJ(valor) {
  if (!valor) return false;
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length === 11) {
    return validarCPF(numeros);
  } else if (numeros.length === 14) {
    return validarCNPJ(numeros);
  }

  return false;
}

/**
 * Validar CPF/CNPJ em tempo real (com tipo explícito)
 * @param {string} documento - Documento com ou sem máscara
 * @param {string} tipo - 'cpf' ou 'cnpj'
 * @returns {boolean} - true se válido
 */
export const validarDocumento = (documento, tipo) => {
  const limpo = documento.replace(/[^\d]/g, '');

  if (tipo === 'cpf' || tipo === 'CPF') {
    if (limpo.length !== 11) return false;

    // Verificar dígitos repetidos
    if (/^(\d)\1+$/.test(limpo)) return false;

    // Validar dígitos verificadores
    let soma = 0;
    for (let i = 0; i < 9; i++) {
      soma += parseInt(limpo.charAt(i)) * (10 - i);
    }
    let resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(limpo.charAt(9))) return false;

    soma = 0;
    for (let i = 0; i < 10; i++) {
      soma += parseInt(limpo.charAt(i)) * (11 - i);
    }
    resto = (soma * 10) % 11;
    if (resto === 10 || resto === 11) resto = 0;
    if (resto !== parseInt(limpo.charAt(10))) return false;

    return true;
  }

  if (tipo === 'cnpj' || tipo === 'CNPJ') {
    if (limpo.length !== 14) return false;

    // Verificar dígitos repetidos
    if (/^(\d)\1+$/.test(limpo)) return false;

    // Validar dígitos verificadores
    let tamanho = limpo.length - 2;
    let numeros = limpo.substring(0, tamanho);
    const digitos = limpo.substring(tamanho);
    let soma = 0;
    let pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(0))) return false;

    tamanho = tamanho + 1;
    numeros = limpo.substring(0, tamanho);
    soma = 0;
    pos = tamanho - 7;

    for (let i = tamanho; i >= 1; i--) {
      soma += numeros.charAt(tamanho - i) * pos--;
      if (pos < 2) pos = 9;
    }

    resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
    if (resultado !== parseInt(digitos.charAt(1))) return false;

    return true;
  }

  return false;
};