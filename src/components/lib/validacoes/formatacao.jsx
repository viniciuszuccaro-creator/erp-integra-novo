/**
 * Formatações e utilidades de texto
 * Regra-Mãe 3: extraído de validacoes.jsx — comportamento preservado
 */

/**
 * Formata valor monetário
 * @param {number} valor - Valor numérico
 * @returns {string} - Valor formatado em BRL
 */
export function formatarMoeda(valor) {
  if (valor === null || valor === undefined) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

/**
 * Formata percentual
 * @param {number} valor - Valor de 0 a 100
 * @returns {string} - Valor formatado com %
 */
export function formatarPercentual(valor) {
  if (valor === null || valor === undefined) return '0%';
  return `${valor.toFixed(2)}%`;
}

/**
 * Remove acentos de string
 * @param {string} texto - Texto com acentos
 * @returns {string} - Texto sem acentos
 */
export function removerAcentos(texto) {
  if (!texto) return '';
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Gera slug a partir de texto
 * @param {string} texto - Texto a converter
 * @returns {string} - Slug gerado
 */
export function gerarSlug(texto) {
  if (!texto) return '';
  return removerAcentos(texto)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Trunca texto
 * @param {string} texto - Texto a truncar
 * @param {number} limite - Limite de caracteres
 * @returns {string} - Texto truncado com ...
 */
export function truncarTexto(texto, limite = 50) {
  if (!texto) return '';
  if (texto.length <= limite) return texto;
  return texto.substring(0, limite) + '...';
}