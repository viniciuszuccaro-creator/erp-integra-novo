/**
 * Biblioteca de Validações e Utilidades — Agregador
 * Regra-Mãe 3: refatorado em módulos focados sob ./validacoes/
 * API pública 100% preservada — todos os imports existentes continuam funcionando
 */

// Documentos fiscais (CPF/CNPJ)
export {
  validarCPF,
  validarCNPJ,
  formatarCPF,
  formatarCNPJ,
  formatarCPFCNPJ,
  validarCPFCNPJ,
  validarDocumento,
} from './documentos';

// Contato e endereço
export {
  formatarTelefone,
  validarEmail,
  formatarCEP,
} from './contato';

// Formatações e utilidades de texto
export {
  formatarMoeda,
  formatarPercentual,
  removerAcentos,
  gerarSlug,
  truncarTexto,
} from './formatacao';

// Validações gerais
export {
  validarNumero,
  calcularIdade,
} from './gerais';

// Validações de negócio (V12.0)
export {
  validarLimiteCredito,
  validarEstoquePedido,
  validarPrecoMinimo,
} from './negocio';