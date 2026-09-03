/**
 * Exportações Comercial: Pedidos, Clientes, Notas Fiscais
 * Regra-Mãe 3: extraído de exportacaoExcel.jsx — comportamento preservado
 */
import { converterParaCSV, baixarCSV, nomeArquivoComData } from './csvCore';
import { validarEAuditarExportacao } from './auditoriaExportacao';

/**
 * Exporta Pedidos para Excel
 */
export function exportarPedidosExcel(pedidos, contexto = {}) {
  validarEAuditarExportacao(contexto, 'Pedidos', 'Pedidos');
  const colunas = [
    { key: 'numero_pedido', label: 'Nº Pedido' },
    { key: 'data_pedido', label: 'Data', tipo: 'date' },
    { key: 'cliente_nome', label: 'Cliente' },
    { key: 'vendedor', label: 'Vendedor' },
    { key: 'status', label: 'Status' },
    { key: 'valor_produtos', label: 'Valor Produtos', tipo: 'moeda' },
    { key: 'valor_desconto', label: 'Desconto', tipo: 'moeda' },
    { key: 'valor_frete', label: 'Frete', tipo: 'moeda' },
    { key: 'valor_total', label: 'Valor Total', tipo: 'moeda' },
    { key: 'forma_pagamento', label: 'Forma Pagamento' },
    { key: 'condicao_pagamento', label: 'Condição' },
    { key: 'nfe_numero', label: 'NF-e' },
  ];

  const csv = converterParaCSV(pedidos, colunas);
  baixarCSV(nomeArquivoComData('pedidos'), csv);
}

/**
 * Exporta Clientes para Excel
 */
export function exportarClientesExcel(clientes, contexto = {}) {
  validarEAuditarExportacao(contexto, 'Clientes', 'Clientes');
  const colunas = [
    { key: 'nome', label: 'Nome/Razão Social' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'cpf', label: 'CPF' },
    { key: 'cnpj', label: 'CNPJ' },
    { key: 'inscricao_estadual', label: 'IE' },
    { key: 'email', label: 'E-mail' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'estado', label: 'UF' },
    { key: 'vendedor_responsavel', label: 'Vendedor' },
    { key: 'status', label: 'Status' },
    { key: 'classificacao_abc', label: 'Classe ABC' },
    { key: 'valor_compras_12meses', label: 'Compras 12m', tipo: 'moeda' },
  ];

  const dadosFormatados = clientes.map(c => ({
    ...c,
    email: c.contatos?.find(ct => ct.tipo === 'E-mail')?.valor || c.email || '-',
    telefone: c.contatos?.find(ct => ct.tipo === 'Telefone')?.valor || c.telefone || '-',
    cidade: c.endereco_principal?.cidade || '-',
    estado: c.endereco_principal?.estado || '-',
  }));

  const csv = converterParaCSV(dadosFormatados, colunas);
  baixarCSV(nomeArquivoComData('clientes'), csv);
}

/**
 * Exporta Notas Fiscais para Excel
 */
export function exportarNotasFiscaisExcel(notas, contexto = {}) {
  validarEAuditarExportacao(contexto, 'NF-e', 'NF-e');
  const colunas = [
    { key: 'numero', label: 'Número' },
    { key: 'serie', label: 'Série' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'cliente_fornecedor', label: 'Cliente/Fornecedor' },
    { key: 'data_emissao', label: 'Emissão', tipo: 'date' },
    { key: 'chave_acesso', label: 'Chave de Acesso' },
    { key: 'valor_produtos', label: 'Valor Produtos', tipo: 'moeda' },
    { key: 'valor_icms', label: 'ICMS', tipo: 'moeda' },
    { key: 'valor_ipi', label: 'IPI', tipo: 'moeda' },
    { key: 'valor_total', label: 'Valor Total', tipo: 'moeda' },
    { key: 'status', label: 'Status' },
    { key: 'protocolo_autorizacao', label: 'Protocolo' },
  ];

  const csv = converterParaCSV(notas, colunas);
  baixarCSV(nomeArquivoComData('notas_fiscais'), csv);
}