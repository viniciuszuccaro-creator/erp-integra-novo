/**
 * Validações gerais (número, idade)
 * Regra-Mãe 3: extraído de validacoes.jsx — comportamento preservado
 */

/**
 * Valida se é número válido
 * @param {any} valor - Valor a validar
 * @returns {boolean} - true se é número válido
 */
export function validarNumero(valor) {
  return !isNaN(parseFloat(valor)) && isFinite(valor);
}

/**
 * Calcula idade
 * @param {string} dataNascimento - Data no formato YYYY-MM-DD
 * @returns {number} - Idade em anos
 */
export function calcularIdade(dataNascimento) {
  if (!dataNascimento) return 0;
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade;
}