/**
 * Biblioteca de Exportação para Excel (CSV) — Agregador
 * Regra-Mãe 3: refatorado em módulos focados sob ./exportacao-excel/
 * API pública 100% preservada — todos os imports existentes continuam funcionando
 */
export {
  exportarPedidosExcel,
  exportarClientesExcel,
  exportarNotasFiscaisExcel,
} from './exportacao-excel/exportacoesComercial';

export {
  exportarContasReceberExcel,
  exportarContasPagarExcel,
  exportarDREExcel,
} from './exportacao-excel/exportacoesFinanceiro';

export {
  exportarEstoqueExcel,
  exportarMovimentacoesExcel,
  exportarOrdensProducaoExcel,
  exportarEntregasExcel,
} from './exportacao-excel/exportacoesOperacional';

export {
  exportarFornecedoresExcel,
  exportarColaboradoresExcel,
  exportarGenericoExcel,
} from './exportacao-excel/exportacoesPessoas';

import { exportarPedidosExcel } from './exportacao-excel/exportacoesComercial';
import { exportarClientesExcel } from './exportacao-excel/exportacoesComercial';
import { exportarNotasFiscaisExcel } from './exportacao-excel/exportacoesComercial';
import { exportarContasReceberExcel, exportarContasPagarExcel, exportarDREExcel } from './exportacao-excel/exportacoesFinanceiro';
import { exportarEstoqueExcel, exportarMovimentacoesExcel, exportarOrdensProducaoExcel, exportarEntregasExcel } from './exportacao-excel/exportacoesOperacional';
import { exportarFornecedoresExcel, exportarColaboradoresExcel, exportarGenericoExcel } from './exportacao-excel/exportacoesPessoas';

export default {
  exportarPedidosExcel,
  exportarClientesExcel,
  exportarContasReceberExcel,
  exportarContasPagarExcel,
  exportarEstoqueExcel,
  exportarMovimentacoesExcel,
  exportarDREExcel,
  exportarOrdensProducaoExcel,
  exportarEntregasExcel,
  exportarNotasFiscaisExcel,
  exportarFornecedoresExcel,
  exportarColaboradoresExcel,
  exportarGenericoExcel
};