/**
 * Hook de Fluxos Automáticos do Pedido V21.6 COMPLETO — Barrel re-export
 * Refatorado: cada domínio de fluxo agora tem seu próprio módulo em fluxoPedido/
 *
 * ✅ FLUXO COMPLETO:
 * - Validação de crédito
 * - Baixa de estoque automática
 * - Geração de Contas a Receber
 * - Criação de Entrega/Retirada
 * - Atualização de status
 * - Cancelamento com estorno
 *
 * Integrado com: AutomacaoFluxoPedido.jsx
 * Regra-Mãe: Sempre melhorar, nunca apagar
 */
export { aprovarPedidoCompleto, validarLimiteCredito, atualizarLimiteCreditoCliente } from './fluxoPedido/aprovarPedido';
export { faturarPedidoCompleto } from './fluxoPedido/faturarPedido';
export { concluirOPCompleto } from './fluxoPedido/concluirOP';
export { cancelarPedidoCompleto } from './fluxoPedido/cancelarPedido';
export { executarFechamentoCompleto, validarEstoqueCompleto, obterEstatisticasAutomacao } from './fluxoPedido/fechamentoAutomatico';

export default {};