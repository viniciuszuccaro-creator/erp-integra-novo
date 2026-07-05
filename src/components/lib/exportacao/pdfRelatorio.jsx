import { imprimirHTML } from './pdfUtils';

/**
 * Gera PDF de Relatório Genérico
 */
export function gerarPDFRelatorio(titulo, dados, colunas, empresa = {}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${titulo}</title>
      <style>
        @media print { @page { margin: 1cm; size: A4 landscape; } }
        body { font-family: Arial, sans-serif; font-size: 9pt; }
        .header { text-align: center; margin-bottom: 20px; }
        .header h1 { margin: 0; font-size: 18pt; color: #1e40af; }
        table { width: 100%; border-collapse: collapse; }
        table th, table td { border: 1px solid #cbd5e1; padding: 6px; font-size: 9pt; }
        table th { background: #dbeafe; font-weight: bold; }
        .footer { margin-top: 20px; text-align: center; font-size: 8pt; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${titulo}</h1>
        <div>Gerado em ${new Date().toLocaleString('pt-BR')}</div>
      </div>
      <table>
        <thead>
          <tr>${colunas.map(col => `<th>${col.label}</th>`).join('')}</tr>
        </thead>
        <tbody>
          ${dados.map(row => `<tr>${colunas.map(col => `<td>${row[col.key] || '-'}</td>`).join('')}</tr>`).join('')}
        </tbody>
      </table>
      <div class="footer">${empresa.nome_fantasia || 'ERP Zuccaro'} - Total de ${dados.length} registros</div>
    </body>
    </html>
  `;
  imprimirHTML(html);
}