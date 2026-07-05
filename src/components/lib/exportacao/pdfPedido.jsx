import { imprimirHTML } from './pdfUtils';

/**
 * Gera PDF de Pedido
 * @param {object} pedido - Dados do pedido
 * @param {object} empresa - Dados da empresa
 */
export function gerarPDFPedido(pedido, empresa = {}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Pedido ${pedido.numero_pedido}</title>
      <style>
        @media print {
          @page { margin: 1cm; size: A4; }
          body { margin: 0; padding: 0; }
        }
        body { font-family: Arial, sans-serif; font-size: 11pt; color: #333; line-height: 1.4; }
        .header { display: flex; justify-content: space-between; align-items: start; border-bottom: 3px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
        .logo { font-size: 24pt; font-weight: bold; color: #2563eb; }
        .info-empresa { text-align: right; font-size: 9pt; }
        .titulo-documento { text-align: center; background: #2563eb; color: white; padding: 10px; font-size: 18pt; font-weight: bold; margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
        .info-box { border: 1px solid #ddd; padding: 10px; border-radius: 5px; }
        .info-box h3 { margin: 0 0 10px 0; font-size: 12pt; color: #2563eb; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        .info-row { display: flex; margin-bottom: 5px; }
        .info-label { font-weight: bold; width: 140px; flex-shrink: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 10pt; }
        table thead { background: #f1f5f9; }
        table th { border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-weight: bold; }
        table td { border: 1px solid #cbd5e1; padding: 8px; }
        .text-right { text-align: right; }
        .totais { margin-top: 20px; display: flex; justify-content: flex-end; }
        .totais-box { border: 2px solid #2563eb; padding: 15px; width: 300px; background: #f8fafc; }
        .total-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .total-final { font-size: 14pt; font-weight: bold; color: #2563eb; border-top: 2px solid #2563eb; margin-top: 8px; padding-top: 8px; }
        .footer { margin-top: 30px; border-top: 1px solid #ddd; padding-top: 15px; font-size: 9pt; text-align: center; color: #64748b; }
        .observacoes { margin-top: 20px; border: 1px solid #ddd; padding: 10px; background: #fef3c7; }
        .badge { display: inline-block; padding: 3px 8px; border-radius: 3px; font-size: 9pt; font-weight: bold; }
        .badge-aprovado { background: #dcfce7; color: #166534; }
        .badge-rascunho { background: #f1f5f9; color: #475569; }
        .badge-urgente { background: #fee2e2; color: #991b1b; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">${empresa.nome_fantasia || 'ERP Zuccaro'}</div>
          <div style="font-size: 9pt; color: #64748b; margin-top: 5px;">${empresa.razao_social || ''}</div>
        </div>
        <div class="info-empresa">
          <div><strong>CNPJ:</strong> ${empresa.cnpj || '-'}</div>
          <div><strong>IE:</strong> ${empresa.inscricao_estadual || '-'}</div>
          <div>${empresa.endereco?.logradouro || ''}, ${empresa.endereco?.numero || ''}</div>
          <div>${empresa.endereco?.cidade || ''} - ${empresa.endereco?.estado || ''}</div>
          <div>${empresa.contato?.telefone || ''}</div>
        </div>
      </div>
      <div class="titulo-documento">PEDIDO Nº ${pedido.numero_pedido}</div>
      <div class="info-grid">
        <div class="info-box">
          <h3>Dados do Cliente</h3>
          <div class="info-row"><span class="info-label">Cliente:</span><span>${pedido.cliente_nome}</span></div>
          <div class="info-row"><span class="info-label">CPF/CNPJ:</span><span>${pedido.cliente_cpf_cnpj || '-'}</span></div>
          ${pedido.contatos_cliente?.[0] ? `<div class="info-row"><span class="info-label">Contato:</span><span>${pedido.contatos_cliente[0].valor}</span></div>` : ''}
          <div class="info-row"><span class="info-label">Endereço:</span><span>${pedido.endereco_entrega_principal?.logradouro || ''}, ${pedido.endereco_entrega_principal?.numero || ''} - ${pedido.endereco_entrega_principal?.cidade || ''}/${pedido.endereco_entrega_principal?.estado || ''}</span></div>
        </div>
        <div class="info-box">
          <h3>Dados do Pedido</h3>
          <div class="info-row"><span class="info-label">Data:</span><span>${new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</span></div>
          ${pedido.vendedor ? `<div class="info-row"><span class="info-label">Vendedor:</span><span>${pedido.vendedor}</span></div>` : ''}
          <div class="info-row"><span class="info-label">Status:</span><span class="badge badge-${pedido.status === 'Aprovado' ? 'aprovado' : 'rascunho'}">${pedido.status}</span></div>
          ${pedido.prioridade === 'Urgente' ? `<div class="info-row"><span class="info-label">Prioridade:</span><span class="badge badge-urgente">URGENTE</span></div>` : ''}
          <div class="info-row"><span class="info-label">Forma Pagamento:</span><span>${pedido.forma_pagamento || '-'}</span></div>
          <div class="info-row"><span class="info-label">Condição:</span><span>${pedido.condicao_pagamento || '-'}</span></div>
        </div>
      </div>
      ${pedido.itens_revenda?.length > 0 ? `
        <h3 style="margin-top: 25px; color: #2563eb;">Itens de Revenda</h3>
        <table>
          <thead><tr><th style="width: 50px;">Item</th><th>Descrição</th><th style="width: 80px;">Qtd</th><th style="width: 100px;">Valor Unit.</th><th style="width: 120px;">Valor Total</th></tr></thead>
          <tbody>
            ${pedido.itens_revenda.map((item, idx) => `<tr><td class="text-right">${idx + 1}</td><td>${item.descricao}</td><td class="text-right">${item.quantidade} ${item.unidade || 'UN'}</td><td class="text-right">R$ ${item.preco_unitario.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td><td class="text-right">R$ ${item.valor_item.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>`).join('')}
          </tbody>
        </table>
      ` : ''}
      ${pedido.itens_producao?.length > 0 ? `
        <h3 style="margin-top: 25px; color: #2563eb;">Itens de Produção</h3>
        <table>
          <thead><tr><th style="width: 50px;">Item</th><th>Descrição</th><th style="width: 80px;">Qtd</th><th style="width: 100px;">Peso (kg)</th><th style="width: 120px;">Valor Total</th></tr></thead>
          <tbody>
            ${pedido.itens_producao.map((item, idx) => `<tr><td class="text-right">${idx + 1}</td><td>${item.tipo_peca} - ${item.identificador || ''}<br/><small>${item.comprimento || 0}cm x ${item.largura || 0}cm - Bitola: ${item.ferro_principal_bitola || '-'}</small></td><td class="text-right">${item.quantidade}</td><td class="text-right">${(item.peso_total_kg || 0).toFixed(2)}</td><td class="text-right">R$ ${(item.preco_venda_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td></tr>`).join('')}
          </tbody>
        </table>
      ` : ''}
      <div class="totais">
        <div class="totais-box">
          <div class="total-row"><span>Subtotal:</span><span>R$ ${(pedido.valor_produtos || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
          ${pedido.valor_desconto > 0 ? `<div class="total-row" style="color: #dc2626;"><span>Desconto:</span><span>- R$ ${pedido.valor_desconto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>` : ''}
          ${pedido.valor_frete > 0 ? `<div class="total-row"><span>Frete:</span><span>R$ ${pedido.valor_frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>` : ''}
          <div class="total-row total-final"><span>TOTAL:</span><span>R$ ${(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
        </div>
      </div>
      ${pedido.observacoes_publicas ? `<div class="observacoes"><strong>Observações:</strong><br/>${pedido.observacoes_publicas}</div>` : ''}
      <div class="footer">
        <div>Documento gerado em ${new Date().toLocaleString('pt-BR')}</div>
        <div style="margin-top: 5px;">ERP Zuccaro - Sistema de Gestão Empresarial</div>
      </div>
    </body>
    </html>
  `;
  imprimirHTML(html);
}