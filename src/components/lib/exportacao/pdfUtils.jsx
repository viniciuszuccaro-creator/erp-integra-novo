/**
 * Utilitário compartilhado para geração de PDFs via window.print()
 */

export function imprimirHTML(html) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    console.error('Não foi possível abrir a janela de impressão. Verifique o bloqueador de pop-ups.');
    return;
  }
  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => printWindow.print(), 250);
  };
}

export const FOOTER_PADRAO = `
  <div class="footer">
    Documento gerado em ${new Date().toLocaleString('pt-BR')} - ERP Zuccaro
  </div>
`;