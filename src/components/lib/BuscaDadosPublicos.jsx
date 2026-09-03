/**
 * 🌐 BUSCA AUTOMÁTICA DE DADOS PÚBLICOS
 * V21.2 - Sistema de autocomplete inteligente
 * Regra-Mãe 3: Refatorado em módulos focados sob ./busca-publica/ — API e comportamento preservados
 *
 * Funcionalidades:
 * - CNPJ/CPF: Receita Federal via IA
 * - CEP: ViaCEP
 * - NCM: Tabela oficial + alíquotas
 * - RNTRC: Validação transportadoras
 */
export { buscarDadosCNPJ } from './busca-publica/buscaCNPJ';
export { buscarDadosCPF } from './busca-publica/buscaCPF';
export { buscarEnderecoCEP } from './busca-publica/buscaCEP';
export { buscarDadosNCM } from './busca-publica/buscaNCM';
export { buscarDadosRNTRC } from './busca-publica/buscaRNTRC';
export { BotaoBuscaAutomatica } from './busca-publica/BotaoBuscaAutomatica';
export { useBuscaAutomatica } from './busca-publica/useBuscaAutomatica';

import { buscarDadosCNPJ } from './busca-publica/buscaCNPJ';
import { buscarDadosCPF } from './busca-publica/buscaCPF';
import { buscarEnderecoCEP } from './busca-publica/buscaCEP';
import { buscarDadosNCM } from './busca-publica/buscaNCM';
import { buscarDadosRNTRC } from './busca-publica/buscaRNTRC';
import { BotaoBuscaAutomatica } from './busca-publica/BotaoBuscaAutomatica';
import { useBuscaAutomatica } from './busca-publica/useBuscaAutomatica';

export default {
  buscarDadosCNPJ,
  buscarDadosCPF,
  buscarEnderecoCEP,
  buscarDadosNCM,
  buscarDadosRNTRC,
  BotaoBuscaAutomatica,
  useBuscaAutomatica
};