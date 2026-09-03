/**
 * Validações e formatações de contato e endereço (telefone, email, CEP)
 * Regra-Mãe 3: extraído de validacoes.jsx — comportamento preservado
 */

/**
 * Formata telefone brasileiro
 * @param {string} telefone - Telefone sem formatação
 * @returns {string} - Telefone formatado
 */
export function formatarTelefone(telefone) {
  if (!telefone) return '';
  telefone = telefone.replace(/\D/g, '');

  if (telefone.length === 11) {
    return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (telefone.length === 10) {
    return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }

  return telefone;
}

/**
 * Valida email
 * @param {string} email - Email
 * @returns {boolean} - true se válido
 */
export function validarEmail(email) {
  if (!email) return false;
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Formata CEP
 * @param {string} cep - CEP sem formatação
 * @returns {string} - CEP formatado (00000-000)
 */
export function formatarCEP(cep) {
  if (!cep) return '';
  cep = cep.replace(/\D/g, '');
  if (cep.length !== 8) return cep;
  return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
}