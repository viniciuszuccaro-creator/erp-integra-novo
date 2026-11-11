import React from 'react';
import { createRoot } from 'react-dom/client';

/**
 * Sistema de Impressão Formatada
 * V12.0 - Documentos profissionais
 */

// Template de Pedido
export const ImprimirPedido = ({ pedido, empresa, titulo = 'PEDIDO' }) => {
  const conteudo = `
    <html>
      <head>
        <title>Pedido ${pedido.numero_pedido}</title>
        <style>
          @media print {
            @page { margin: 2cm; }
            body { font-family: Arial, sans-serif; }
          }
          .header { 
            display: flex; 
            justify-content: space-between; 
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 20px;
          }
          .empresa { font-size: 20px; font-weight: bold; }
          .pedido-info { text-align: right; }
          .cliente-box { 
            background: #f5f5f5; 
            padding: 15px; 
            margin: 20px 0;
            border-radius: 8px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
          }
          th { 
            background: #333; 
            color: white; 
            padding: 12px; 
            text-align: left;
          }
          td { 
            border-bottom: 1px solid #ddd; 
            padding: 10px;
          }
          .totais { 
            text-align: right; 
            margin-top: 20px;
            font-size: 16px;
          }
          .totais strong { font-size: 20px; color: #059669; }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="empresa">${empresa?.nome_fantasia || 'Empresa'}</div>
            <div>${empresa?.cnpj || ''}</div>
            <div>${empresa?.endereco?.cidade || ''}, ${empresa?.endereco?.estado || ''}</div>
          </div>
          <div class="pedido-info">
            <div style="font-size: 24px; font-weight: bold;">${titulo}</div>
            <div style="font-size: 20px;">#${pedido.numero_pedido}</div>
            <div>Data: ${new Date(pedido.data_pedido).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        <div class="cliente-box">
          <strong>Cliente:</strong> ${pedido.cliente_nome}<br>
          <strong>CPF/CNPJ:</strong> ${pedido.cliente_cpf_cnpj || ''}<br>
          ${pedido.endereco_entrega_principal?.logradouro ? `
            <strong>Endereço de Entrega:</strong><br>
            ${pedido.endereco_entrega_principal.logradouro}, ${pedido.endereco_entrega_principal.numero}<br>
            ${pedido.endereco_entrega_principal.cidade}/${pedido.endereco_entrega_principal.estado} - CEP: ${pedido.endereco_entrega_principal.cep}
          ` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th>Descrição</th>
              <th style="text-align: center;">Qtd</th>
              <th style="text-align: right;">Valor Unit.</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(pedido.itens_revenda || []).map((item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${item.descricao}</td>
                <td style="text-align: center;">${item.quantidade} ${item.unidade || 'UN'}</td>
                <td style="text-align: right;">R$ ${item.preco_unitario?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                <td style="text-align: right;">R$ ${item.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="totais">
          <div>Subtotal: R$ ${pedido.valor_produtos?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          ${pedido.desconto_geral_pedido_valor > 0 ? `
            <div>Desconto: R$ ${pedido.desconto_geral_pedido_valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          ` : ''}
          ${pedido.valor_frete > 0 ? `
            <div>Frete: R$ ${pedido.valor_frete.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
          ` : ''}
          <div style="margin-top: 10px;">
            <strong>TOTAL: R$ ${pedido.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        <div style="margin-top: 30px;">
          <strong>Forma de Pagamento:</strong> ${pedido.forma_pagamento}<br>
          ${pedido.numero_parcelas > 1 ? `<strong>Parcelas:</strong> ${pedido.numero_parcelas}x<br>` : ''}
          ${pedido.data_prevista_entrega ? `<strong>Previsão de Entrega:</strong> ${new Date(pedido.data_prevista_entrega).toLocaleDateString('pt-BR')}<br>` : ''}
        </div>

        ${pedido.observacoes_publicas ? `
          <div style="margin-top: 20px; padding: 15px; background: #f0f9ff; border-left: 4px solid #3b82f6;">
            <strong>Observações:</strong><br>
            ${pedido.observacoes_publicas}
          </div>
        ` : ''}

        <div class="footer">
          Documento gerado automaticamente pelo Sistema ERP Integra<br>
          ${new Date().toLocaleString('pt-BR')}
        </div>
      </body>
    </html>
  `;

  const janela = window.open('', '_blank');
  janela.document.write(conteudo);
  janela.document.close();
  janela.print();
};

// Template de Romaneio
export const ImprimirRomaneio = ({ romaneio, empresa, entregas }) => {
  const conteudo = `
    <html>
      <head>
        <title>Romaneio ${romaneio.numero_romaneio}</title>
        <style>
          @media print {
            @page { margin: 1.5cm; }
          }
          body { font-family: Arial, sans-serif; font-size: 12px; }
          .header { 
            display: flex; 
            justify-content: space-between;
            border-bottom: 3px solid #000;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .romaneio-numero { 
            font-size: 32px; 
            font-weight: bold;
            color: #059669;
          }
          table { 
            width: 100%; 
            border-collapse: collapse;
            margin: 15px 0;
          }
          th { 
            background: #1e293b; 
            color: white; 
            padding: 8px; 
            text-align: left;
            font-size: 11px;
          }
          td { 
            border: 1px solid #ddd; 
            padding: 8px;
            font-size: 11px;
          }
          .assinatura { 
            margin-top: 40px;
            padding-top: 20px;
            display: flex;
            justify-content: space-between;
          }
          .linha-assinatura {
            width: 45%;
            border-top: 2px solid #000;
            padding-top: 10px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <strong style="font-size: 18px;">${empresa?.nome_fantasia || 'Empresa'}</strong><br>
            ${empresa?.endereco?.cidade || ''}, ${empresa?.endereco?.estado || ''}<br>
            Tel: ${empresa?.contato?.telefone || ''}
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: bold;">ROMANEIO DE CARGA</div>
            <div class="romaneio-numero">${romaneio.numero_romaneio}</div>
            <div>Data: ${new Date(romaneio.data_romaneio).toLocaleDateString('pt-BR')}</div>
          </div>
        </div>

        <div style="background: #f1f5f9; padding: 12px; margin: 15px 0; border-radius: 6px;">
          <strong>Motorista:</strong> ${romaneio.motorista || ''} | 
          <strong>Veículo:</strong> ${romaneio.veiculo || ''} | 
          <strong>Placa:</strong> ${romaneio.placa || ''}<br>
          <strong>Total de Entregas:</strong> ${romaneio.quantidade_entregas || 0} | 
          <strong>Peso Total:</strong> ${romaneio.peso_total_kg?.toFixed(2) || '0'} kg
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;">Seq</th>
              <th style="width: 25%;">Cliente</th>
              <th style="width: 35%;">Endereço</th>
              <th style="width: 15%;">Pedido</th>
              <th style="width: 10%;">Volumes</th>
              <th style="width: 10%;">Peso</th>
            </tr>
          </thead>
          <tbody>
            ${(entregas || []).map((entrega, idx) => `
              <tr>
                <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
                <td>${entrega.cliente_nome}</td>
                <td>
                  ${entrega.endereco_entrega_completo?.logradouro}, ${entrega.endereco_entrega_completo?.numero}<br>
                  <small>${entrega.endereco_entrega_completo?.bairro} - ${entrega.endereco_entrega_completo?.cidade}/${entrega.endereco_entrega_completo?.estado}</small>
                </td>
                <td>${entrega.numero_pedido || ''}</td>
                <td style="text-align: center;">${entrega.volumes || 1}</td>
                <td style="text-align: right;">${entrega.peso_total_kg?.toFixed(2) || '0.00'} kg</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        ${romaneio.observacoes ? `
          <div style="margin: 20px 0; padding: 12px; background: #fef3c7; border-left: 4px solid #f59e0b;">
            <strong>Observações:</strong><br>
            ${romaneio.observacoes}
          </div>
        ` : ''}

        <div class="assinatura">
          <div class="linha-assinatura">
            <strong>Motorista</strong><br>
            ${romaneio.motorista || ''}
          </div>
          <div class="linha-assinatura">
            <strong>Conferente</strong><br>
            Data: ___/___/___
          </div>
        </div>

        <div style="text-align: center; margin-top: 40px; font-size: 10px; color: #666;">
          ERP Integra - Romaneio gerado em ${new Date().toLocaleString('pt-BR')}
        </div>
      </body>
    </html>
  `;

  const janela = window.open('', '_blank');
  janela.document.write(conteudo);
  janela.document.close();
  janela.print();
};

// Template de NF-e (DANFE simplificado)
export const ImprimirDANFESimplificado = ({ nfe, empresa }) => {
  // Similar ao pedido, mas com layout de DANFE
  const conteudo = `
    <html>
      <head>
        <title>NF-e ${nfe.numero}/${nfe.serie}</title>
        <style>
          @media print { @page { margin: 1cm; } }
          body { font-family: Arial, sans-serif; font-size: 11px; }
          .danfe-header { 
            border: 2px solid #000;
            padding: 10px;
            margin-bottom: 10px;
          }
          .nfe-numero {
            font-size: 24px;
            font-weight: bold;
            text-align: center;
          }
          .chave-acesso {
            font-family: monospace;
            font-size: 10px;
            text-align: center;
            margin: 10px 0;
          }
          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1px solid #000; padding: 6px; }
          th { background: #e5e7eb; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="danfe-header">
          <div class="nfe-numero">NF-e Nº ${nfe.numero} - Série ${nfe.serie}</div>
          <div class="chave-acesso">${nfe.chave_acesso || 'Chave de Acesso: Aguardando autorização'}</div>
        </div>
        
        <div style="border: 1px solid #000; padding: 10px; margin: 10px 0;">
          <strong>EMITENTE:</strong> ${empresa?.razao_social || ''}<br>
          CNPJ: ${empresa?.cnpj || ''}<br>
          ${empresa?.endereco?.logradouro || ''}, ${empresa?.endereco?.numero || ''} - ${empresa?.endereco?.cidade || ''}/${empresa?.endereco?.estado || ''}
        </div>

        <div style="border: 1px solid #000; padding: 10px; margin: 10px 0;">
          <strong>DESTINATÁRIO:</strong> ${nfe.cliente_fornecedor || ''}<br>
          ${nfe.cliente_cpf_cnpj ? `CPF/CNPJ: ${nfe.cliente_cpf_cnpj}` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>Cód</th>
              <th>Descrição</th>
              <th>NCM</th>
              <th>Qtd</th>
              <th>Un</th>
              <th>Vl Unit</th>
              <th>Vl Total</th>
            </tr>
          </thead>
          <tbody>
            ${(nfe.itens || []).map(item => `
              <tr>
                <td>${item.codigo_produto || ''}</td>
                <td>${item.descricao}</td>
                <td>${item.ncm || ''}</td>
                <td style="text-align: right;">${item.quantidade}</td>
                <td>${item.unidade}</td>
                <td style="text-align: right;">R$ ${item.valor_unitario?.toFixed(2)}</td>
                <td style="text-align: right;">R$ ${item.valor_total?.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="text-align: right; margin-top: 20px; font-size: 14px;">
          <div>Valor Total: <strong style="font-size: 18px;">R$ ${nfe.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong></div>
        </div>

        <div style="margin-top: 30px; text-align: center; font-size: 10px;">
          ${nfe.status === 'Autorizada' ? 
            `✅ NF-e AUTORIZADA - Protocolo: ${nfe.protocolo_autorizacao || ''}` :
            `⚠️ NF-e em ${nfe.status}`
          }
        </div>
      </body>
    </html>
  `;

  const janela = window.open('', '_blank');
  janela.document.write(conteudo);
  janela.document.close();
  janela.print();
};