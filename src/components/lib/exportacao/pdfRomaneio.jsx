import { imprimirHTML } from './pdfUtils';

/**
 * Gera PDF de Romaneio
 */
export function gerarPDFRomaneio(romaneio, entregas = [], empresa = {}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Romaneio ${romaneio.numero_romaneio}</title>
      <style>
        @media print { @page { margin: 1cm; size: A4 landscape; } body { margin: 0; padding: 0; } }
        body { font-family: Arial, sans-serif; font-size: 10pt; color: #333; }
        .header { background: #1e40af; color: white; padding: 15px; margin-bottom: 15px; }
        .header h1 { margin: 0; font-size: 20pt; }
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 15px; }
        .info-item { background: #f1f5f9; padding: 8px; border-radius: 4px; }
        .info-label { font-weight: bold; font-size: 9pt; color: #64748b; }
        table { width: 100%; border-collapse: collapse; font-size: 9pt; }
        table thead { background: #334155; color: white; }
        table th { border: 1px solid #475569; padding: 6px; text-align: left; }
        table td { border: 1px solid #cbd5e1; padding: 6px; }
        .assinatura-box { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; }
        .assinatura { text-align: center; padding-top: 50px; border-top: 1px solid #333; }
        .footer { margin-top: 20px; text-align: center; font-size: 8pt; color: #64748b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>ROMANEIO DE ENTREGA</h1>
        <div>Nº ${romaneio.numero_romaneio} - ${new Date(romaneio.data_romaneio).toLocaleDateString('pt-BR')}</div>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">MOTORISTA</div>
          <div>${romaneio.motorista}</div>
          <div style="font-size: 8pt; color: #64748b;">${romaneio.motorista_telefone || ''}</div>
        </div>
        <div class="info-item">
          <div class="info-label">VEÍCULO</div>
          <div>${romaneio.veiculo || '-'}</div>
          <div style="font-size: 8pt; color: #64748b;">Placa: ${romaneio.placa || '-'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">RESUMO</div>
          <div>${romaneio.quantidade_entregas || 0} entregas</div>
          <div style="font-size: 8pt; color: #64748b;">${romaneio.quantidade_volumes || 0} volumes - ${(romaneio.peso_total_kg || 0).toFixed(0)} kg</div>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">Seq</th><th>Cliente</th><th>Endereço</th><th>Cidade</th><th style="width: 100px;">Pedido</th><th style="width: 80px;">Volumes</th><th style="width: 120px;">Assinatura</th>
          </tr>
        </thead>
        <tbody>
          ${entregas.map((entrega, idx) => `<tr><td style="text-align: center; font-weight: bold;">${idx + 1}</td><td>${entrega.cliente_nome}</td><td>${entrega.endereco_entrega_completo?.logradouro || ''}, ${entrega.endereco_entrega_completo?.numero || ''}</td><td>${entrega.endereco_entrega_completo?.cidade || ''}</td><td>${entrega.numero_pedido}</td><td style="text-align: center;">${entrega.volumes || 1}</td><td style="height: 40px;"></td></tr>`).join('')}
        </tbody>
      </table>
      <div class="assinatura-box">
        <div class="assinatura"><div>Motorista</div></div>
        <div class="assinatura"><div>Conferente</div></div>
        <div class="assinatura"><div>Responsável Expedição</div></div>
      </div>
      <div class="footer">Emitido em ${new Date().toLocaleString('pt-BR')} - ERP Zuccaro</div>
    </body>
    </html>
  `;
  imprimirHTML(html);
}