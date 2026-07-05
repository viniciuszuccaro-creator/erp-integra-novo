import { imprimirHTML } from './pdfUtils';

/**
 * Gera PDF de Ordem de Produção
 */
export function gerarPDFOrdemProducao(op, empresa = {}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>OP ${op.numero_op}</title>
      <style>
        @media print { @page { margin: 1cm; size: A4; } }
        body { font-family: Arial, sans-serif; font-size: 10pt; }
        .header { background: #7c3aed; color: white; padding: 15px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 18pt; }
        .info-box { border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; background: #fafafa; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        table th, table td { border: 1px solid #ccc; padding: 6px; font-size: 9pt; }
        table th { background: #e0e7ff; font-weight: bold; }
        .checklist { margin-top: 20px; border: 2px solid #7c3aed; padding: 10px; }
        .checkbox { display: inline-block; width: 15px; height: 15px; border: 2px solid #333; margin-right: 8px; vertical-align: middle; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ORDEM DE PRODUÇÃO Nº ${op.numero_op}</h1>
        <div>Cliente: ${op.cliente_nome} | Pedido: ${op.numero_pedido}</div>
      </div>
      <div class="info-box">
        <strong>Data Emissão:</strong> ${new Date(op.data_emissao).toLocaleDateString('pt-BR')} | 
        <strong>Previsão Início:</strong> ${op.data_prevista_inicio ? new Date(op.data_prevista_inicio).toLocaleDateString('pt-BR') : '-'} | 
        <strong>Previsão Conclusão:</strong> ${op.data_prevista_conclusao ? new Date(op.data_prevista_conclusao).toLocaleDateString('pt-BR') : '-'}
      </div>
      <div class="info-box">
        <strong>Setor:</strong> ${op.setor_responsavel || '-'} | 
        <strong>Operador:</strong> ${op.operador_responsavel || '-'} | 
        <strong>Prioridade:</strong> ${op.prioridade || 'Normal'}
      </div>
      <h3 style="color: #7c3aed; margin-top: 20px;">ITENS A PRODUZIR</h3>
      <table>
        <thead>
          <tr><th>Item</th><th>Tipo/Descrição</th><th>Qtd</th><th>Bitola Principal</th><th>Comprimento</th><th>Estribo</th><th>Peso (kg)</th></tr>
        </thead>
        <tbody>
          ${op.itens_producao?.map((item, idx) => `<tr><td style="text-align: center;">${idx + 1}</td><td>${item.tipo_peca} - ${item.elemento || ''}</td><td style="text-align: center;">${item.quantidade_pecas}</td><td>${item.bitola_principal} (${item.quantidade_barras_principal}x)</td><td>${item.comprimento_barra || 0}cm</td><td>${item.estribo_bitola || '-'} (${item.estribo_quantidade_calculada || 0}x)</td><td style="text-align: right;">${(item.peso_teorico_total || 0).toFixed(2)}</td></tr>`).join('') || '<tr><td colspan="7" style="text-align: center;">Nenhum item</td></tr>'}
        </tbody>
      </table>
      <div class="checklist">
        <h4 style="margin-top: 0;">CHECKLIST DE QUALIDADE</h4>
        <div><span class="checkbox"></span> Bitola principal conferida</div>
        <div><span class="checkbox"></span> Comprimento conferido</div>
        <div><span class="checkbox"></span> Dobras corretas</div>
        <div><span class="checkbox"></span> Estribos corretos</div>
        <div><span class="checkbox"></span> Peso bateu</div>
        <div><span class="checkbox"></span> Acabamento OK</div>
      </div>
      <div style="margin-top: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 50px;">
        <div style="text-align: center; padding-top: 50px; border-top: 1px solid #000;">Operador Responsável</div>
        <div style="text-align: center; padding-top: 50px; border-top: 1px solid #000;">Supervisor de Qualidade</div>
      </div>
    </body>
    </html>
  `;
  imprimirHTML(html);
}