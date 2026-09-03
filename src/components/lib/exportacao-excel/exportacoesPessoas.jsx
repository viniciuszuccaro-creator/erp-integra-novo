/**
 * Exportações Pessoas/Genérico: Fornecedores, Colaboradores, Genérico
 * Regra-Mãe 3: extraído de exportacaoExcel.jsx — comportamento preservado
 */
import { converterParaCSV, baixarCSV, nomeArquivoComData } from './csvCore';
import { validarEAuditarExportacao } from './auditoriaExportacao';

/**
 * Exporta Fornecedores para Excel
 */
export function exportarFornecedoresExcel(fornecedores, contexto = {}) {
  validarEAuditarExportacao(contexto, 'Fornecedores', 'Fornecedores');
  const colunas = [
    { key: 'nome', label: 'Nome' },
    { key: 'cnpj', label: 'CNPJ' },
    { key: 'categoria', label: 'Categoria' },
    { key: 'email', label: 'E-mail' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'estado', label: 'UF' },
    { key: 'quantidade_compras', label: 'Qtd Compras', tipo: 'numero' },
    { key: 'valor_total_compras', label: 'Valor Total', tipo: 'moeda' },
    { key: 'nota_media', label: 'Nota Média', tipo: 'numero' },
    { key: 'status', label: 'Status' },
  ];

  const csv = converterParaCSV(fornecedores, colunas);
  baixarCSV(nomeArquivoComData('fornecedores'), csv);
}

/**
 * Exporta Colaboradores para Excel
 */
export function exportarColaboradoresExcel(colaboradores, contexto = {}) {
  validarEAuditarExportacao(contexto, 'Colaboradores', 'Colaboradores');
  const colunas = [
    { key: 'nome_completo', label: 'Nome' },
    { key: 'cpf', label: 'CPF' },
    { key: 'cargo', label: 'Cargo' },
    { key: 'departamento', label: 'Departamento' },
    { key: 'data_admissao', label: 'Admissão', tipo: 'date' },
    { key: 'salario', label: 'Salário', tipo: 'moeda' },
    { key: 'tipo_contrato', label: 'Contrato' },
    { key: 'email', label: 'E-mail' },
    { key: 'telefone', label: 'Telefone' },
    { key: 'status', label: 'Status' },
  ];

  const csv = converterParaCSV(colaboradores, colunas);
  baixarCSV(nomeArquivoComData('colaboradores'), csv);
}

/**
 * Exporta Genérico para Excel
 */
export function exportarGenericoExcel(dados, colunas, nomeArquivo, contexto = {}) {
  validarEAuditarExportacao(contexto, nomeArquivo || 'Genérico', nomeArquivo || 'Genérico');
  const csv = converterParaCSV(dados, colunas);
  const arquivo = nomeArquivo || nomeArquivoComData('exportacao');
  baixarCSV(arquivo, csv);
}