/**
 * Exportações Financeiro: Contas a Receber, Contas a Pagar, DRE
 * Regra-Mãe 3: extraído de exportacaoExcel.jsx — comportamento preservado
 */
import { converterParaCSV, baixarCSV, nomeArquivoComData } from './csvCore';
import { validarEAuditarExportacao } from './auditoriaExportacao';

/**
 * Exporta Contas a Receber para Excel
 */
export function exportarContasReceberExcel(contas, contexto = {}) {
  validarEAuditarExportacao(contexto, 'CR', 'ContasReceber');
  const colunas = [
    { key: 'descricao', label: 'Descrição' },
    { key: 'cliente', label: 'Cliente' },
    { key: 'numero_documento', label: 'Documento' },
    { key: 'data_emissao', label: 'Emissão', tipo: 'date' },
    { key: 'data_vencimento', label: 'Vencimento', tipo: 'date' },
    { key: 'valor', label: 'Valor', tipo: 'moeda' },
    { key: 'valor_recebido', label: 'Recebido', tipo: 'moeda' },
    { key: 'status', label: 'Status' },
    { key: 'forma_recebimento', label: 'Forma' },
    { key: 'data_recebimento', label: 'Data Receb.', tipo: 'date' },
  ];

  const csv = converterParaCSV(contas, colunas);
  baixarCSV(nomeArquivoComData('contas_receber'), csv);
}

/**
 * Exporta Contas a Pagar para Excel
 */
export function exportarContasPagarExcel(contas, contexto = {}) {
  validarEAuditarExportacao(contexto, 'CP', 'ContasPagar');
  const colunas = [
    { key: 'descricao', label: 'Descrição' },
    { key: 'fornecedor', label: 'Fornecedor' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'numero_documento', label: 'Documento' },
    { key: 'data_emissao', label: 'Emissão', tipo: 'date' },
    { key: 'data_vencimento', label: 'Vencimento', tipo: 'date' },
    { key: 'valor', label: 'Valor', tipo: 'moeda' },
    { key: 'valor_pago', label: 'Pago', tipo: 'moeda' },
    { key: 'status', label: 'Status' },
    { key: 'forma_pagamento', label: 'Forma' },
    { key: 'data_pagamento', label: 'Data Pag.', tipo: 'date' },
  ];

  const csv = converterParaCSV(contas, colunas);
  baixarCSV(nomeArquivoComData('contas_pagar'), csv);
}

/**
 * Exporta DRE para Excel
 */
export function exportarDREExcel(dre, contexto = {}) {
  validarEAuditarExportacao(contexto, 'DRE', 'DRE');
  const dados = [
    { conta: 'RECEITA BRUTA', valor: dre.receita_bruta },
    { conta: '(-) Deduções e Impostos', valor: -dre.deducoes_impostos },
    { conta: '= RECEITA LÍQUIDA', valor: dre.receita_liquida },
    { conta: '(-) CPV', valor: -dre.cpv },
    { conta: '= LUCRO BRUTO', valor: dre.lucro_bruto },
    { conta: '(-) Despesas Administrativas', valor: -dre.despesas_administrativas },
    { conta: '(-) Despesas Comerciais', valor: -dre.despesas_comerciais },
    { conta: '(-) Despesas Financeiras', valor: -dre.despesas_financeiras },
    { conta: '= LUCRO OPERACIONAL', valor: dre.lucro_operacional },
    { conta: '(+/-) Resultado Não Operacional', valor: dre.resultado_nao_operacional },
    { conta: '= LUCRO ANTES DOS TRIBUTOS', valor: dre.lucro_antes_tributos },
    { conta: '(-) IR e CSLL', valor: -dre.ir_csll },
    { conta: '= LUCRO LÍQUIDO', valor: dre.lucro_liquido },
  ];

  const colunas = [
    { key: 'conta', label: 'Conta' },
    { key: 'valor', label: 'Valor', tipo: 'moeda' },
  ];

  const csv = converterParaCSV(dados, colunas);
  baixarCSV(`DRE_${dre.periodo}_${new Date().toISOString().split('T')[0]}.csv`, csv);
}