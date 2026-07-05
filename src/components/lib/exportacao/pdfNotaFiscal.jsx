import { imprimirHTML } from './pdfUtils';

/**
 * Gera PDF de NF-e (DANFE Simplificado)
 */
export function gerarPDFNotaFiscal(nfe, empresa = {}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>NF-e ${nfe.numero}</title>
      <style>
        @media print { @page { margin: 0.5cm; size: A4; } }
        body { font-family: 'Courier New', monospace; font-size: 9pt; margin: 0; padding: 10px; }
        .danfe-header { border: 2px solid #000; padding: 10px; margin-bottom: 10px; }
        .danfe-title { text-align: center; font-size: 14pt; font-weight: bold; margin-bottom: 10px; }
        .chave-acesso { text-align: center; font-size: 8pt; margin-top: 5px; word-break: break-all; }
        .section { border: 1px solid #000; padding: 5px; margin-bottom: 5px; }
        .section-title { background: #000; color: #fff; padding: 3px 5px; font-weight: bold; margin: -5px -5px 5px -5px; }
        table { width: 100%; border-collapse: collapse; font-size: 8pt; }
        table th, table td { border: 1px solid #000; padding: 3px; }
        table th { background: #e5e7eb; font-weight: bold; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
      </style>
    </head>
    <body>
      <div class="danfe-header">
        <div class="danfe-title">DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA</div>
        <div class="text-center" style="font-size: 11pt; margin: 10px 0;">NF-e Nº ${nfe.numero} - Série ${nfe.serie}</div>
        ${nfe.chave_acesso ? `<div class="chave-acesso">CHAVE DE ACESSO: ${nfe.chave_acesso.match(/.{1,4}/g)?.join(' ') || nfe.chave_acesso}</div>` : ''}
      </div>
      <div class="section">
        <div class="section-title">EMITENTE</div>
        <div><strong>${empresa.razao_social || empresa.nome_fantasia}</strong></div>
        <div>CNPJ: ${empresa.cnpj} | IE: ${empresa.inscricao_estadual || '-'}</div>
        <div>${empresa.endereco?.logradouro}, ${empresa.endereco?.numero} - ${empresa.endereco?.cidade}/${empresa.endereco?.estado}</div>
      </div>
      <div class="section">
        <div class="section-title">DESTINATÁRIO</div>
        <div><strong>${nfe.cliente_fornecedor}</strong></div>
        <div>CPF/CNPJ: ${nfe.cliente_cpf_cnpj || '-'}</div>
        ${nfe.cliente_endereco ? `<div>${nfe.cliente_endereco.logradouro}, ${nfe.cliente_endereco.numero} - ${nfe.cliente_endereco.cidade}/${nfe.cliente_endereco.estado}</div>` : ''}
      </div>
      <table style="margin-top: 10px;">
        <thead>
          <tr><th style="width: 40px;">Item</th><th>Descrição</th><th style="width: 60px;">NCM</th><th style="width: 50px;">Qtd</th><th style="width: 80px;">Valor Unit.</th><th style="width: 100px;">Valor Total</th></tr>
        </thead>
        <tbody>
          ${nfe.itens?.map((item, idx) => `<tr><td class="text-center">${idx + 1}</td><td>${item.descricao}</td><td class="text-center">${item.ncm || '-'}</td><td class="text-right">${item.quantidade}</td><td class="text-right">R$ ${(item.valor_unitario || 0).toFixed(2)}</td><td class="text-right">R$ ${(item.valor_total || 0).toFixed(2)}</td></tr>`).join('') || '<tr><td colspan="6" class="text-center">Nenhum item</td></tr>'}
        </tbody>
      </table>
      <div style="display: grid; grid-template-columns: 1fr 300px; gap: 10px; margin-top: 10px;">
        <div class="section">
          <div class="section-title">DADOS ADICIONAIS</div>
          <div style="font-size: 8pt;">${nfe.observacoes || 'Sem observações'}</div>
        </div>
        <div class="section">
          <div class="section-title">CÁLCULO DO IMPOSTO</div>
          <div style="font-size: 8pt;">
            <div>Base ICMS: R$ ${(nfe.base_calculo_icms || 0).toFixed(2)}</div>
            <div>Valor ICMS: R$ ${(nfe.valor_icms || 0).toFixed(2)}</div>
            <div>Valor IPI: R$ ${(nfe.valor_ipi || 0).toFixed(2)}</div>
            <div style="margin-top: 5px; padding-top: 5px; border-top: 1px solid #000; font-weight: bold;">TOTAL: R$ ${(nfe.valor_total || 0).toFixed(2)}</div>
          </div>
        </div>
      </div>
      ${nfe.status === 'Autorizada' && nfe.protocolo_autorizacao ? `<div style="margin-top: 10px; text-align: center; font-size: 8pt; border: 1px solid #000; padding: 5px;"><strong>NF-e AUTORIZADA</strong> - Protocolo: ${nfe.protocolo_autorizacao} - Data: ${new Date(nfe.data_autorizacao).toLocaleString('pt-BR')}</div>` : ''}
      <div style="margin-top: 15px; text-align: center; font-size: 7pt; color: #666;">Este documento é uma representação gráfica simplificada da NF-e. Consulte a autenticidade em: www.nfe.fazenda.gov.br/portal</div>
    </body>
    </html>
  `;
  imprimirHTML(html);
}