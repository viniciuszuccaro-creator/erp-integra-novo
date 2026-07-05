/**
 * Biblioteca de Exportação para PDF — Barrel re-export
 * Refatorado: cada tipo de documento agora tem seu próprio módulo em exportacao/
 */
export { gerarPDFPedido } from './exportacao/pdfPedido';
export { gerarPDFRomaneio } from './exportacao/pdfRomaneio';
export { gerarPDFNotaFiscal } from './exportacao/pdfNotaFiscal';
export { gerarPDFOrdemProducao } from './exportacao/pdfOrdemProducao';
export { gerarPDFRelatorio } from './exportacao/pdfRelatorio';

export default {};