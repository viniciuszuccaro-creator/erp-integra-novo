/**
 * Exportações Estoque/Produção/Logística: Estoque, Movimentações, OPs, Entregas
 * Regra-Mãe 3: extraído de exportacaoExcel.jsx — comportamento preservado
 */
import { converterParaCSV, baixarCSV, nomeArquivoComData } from './csvCore';
import { validarEAuditarExportacao } from './auditoriaExportacao';

/**
 * Exporta Estoque para Excel
 */
export function exportarEstoqueExcel(produtos, contexto = {}) {
  validarEAuditarExportacao(contexto, 'Estoque', 'Estoque');
  const colunas = [
    { key: 'codigo', label: 'Código' },
    { key: 'descricao', label: 'Descrição' },
    { key: 'grupo', label: 'Grupo' },
    { key: 'unidade_medida', label: 'Unidade' },
    { key: 'estoque_atual', label: 'Estoque Atual', tipo: 'numero' },
    { key: 'estoque_reservado', label: 'Reservado', tipo: 'numero' },
    { key: 'estoque_disponivel', label: 'Disponível', tipo: 'numero' },
    { key: 'estoque_minimo', label: 'Mínimo', tipo: 'numero' },
    { key: 'custo_medio', label: 'Custo Médio', tipo: 'moeda' },
    { key: 'preco_venda', label: 'Preço Venda', tipo: 'moeda' },
    { key: 'localizacao', label: 'Localização' },
    { key: 'status', label: 'Status' },
  ];

  const csv = converterParaCSV(produtos, colunas);
  baixarCSV(nomeArquivoComData('estoque'), csv);
}

/**
 * Exporta Movimentações de Estoque para Excel
 */
export function exportarMovimentacoesExcel(movimentacoes, contexto = {}) {
  validarEAuditarExportacao(contexto, 'Movimentações', 'Movimentações');
  const colunas = [
    { key: 'data_movimentacao', label: 'Data/Hora', tipo: 'date' },
    { key: 'tipo_movimento', label: 'Tipo' },
    { key: 'produto_descricao', label: 'Produto' },
    { key: 'quantidade', label: 'Quantidade', tipo: 'numero' },
    { key: 'unidade_medida', label: 'Unidade' },
    { key: 'estoque_anterior', label: 'Estoque Anterior', tipo: 'numero' },
    { key: 'estoque_atual', label: 'Estoque Atual', tipo: 'numero' },
    { key: 'documento', label: 'Documento' },
    { key: 'responsavel', label: 'Responsável' },
    { key: 'motivo', label: 'Motivo' },
  ];

  const csv = converterParaCSV(movimentacoes, colunas);
  baixarCSV(nomeArquivoComData('movimentacoes_estoque'), csv);
}

/**
 * Exporta Ordens de Produção para Excel
 */
export function exportarOrdensProducaoExcel(ops, contexto = {}) {
  validarEAuditarExportacao(contexto, 'OPs', 'OPs');
  const colunas = [
    { key: 'numero_op', label: 'Nº OP' },
    { key: 'numero_pedido', label: 'Pedido' },
    { key: 'cliente_nome', label: 'Cliente' },
    { key: 'data_emissao', label: 'Emissão', tipo: 'date' },
    { key: 'data_prevista_conclusao', label: 'Prev. Conclusão', tipo: 'date' },
    { key: 'setor_responsavel', label: 'Setor' },
    { key: 'operador_responsavel', label: 'Operador' },
    { key: 'status', label: 'Status' },
    { key: 'peso_teorico_total_kg', label: 'Peso Teórico (kg)', tipo: 'numero' },
    { key: 'peso_real_total_kg', label: 'Peso Real (kg)', tipo: 'numero' },
    { key: 'percentual_conclusao', label: '% Conclusão', tipo: 'numero' },
  ];

  const csv = converterParaCSV(ops, colunas);
  baixarCSV(nomeArquivoComData('ordens_producao'), csv);
}

/**
 * Exporta Entregas para Excel
 */
export function exportarEntregasExcel(entregas, contexto = {}) {
  validarEAuditarExportacao(contexto, 'Entregas', 'Entregas');
  const colunas = [
    { key: 'numero_pedido', label: 'Pedido' },
    { key: 'cliente_nome', label: 'Cliente' },
    { key: 'cidade', label: 'Cidade' },
    { key: 'data_previsao', label: 'Previsão', tipo: 'date' },
    { key: 'data_entrega', label: 'Entrega Real', tipo: 'date' },
    { key: 'motorista', label: 'Motorista' },
    { key: 'placa', label: 'Placa' },
    { key: 'status', label: 'Status' },
    { key: 'volumes', label: 'Volumes', tipo: 'numero' },
    { key: 'peso_total_kg', label: 'Peso (kg)', tipo: 'numero' },
  ];

  const dadosFormatados = entregas.map(e => ({
    ...e,
    cidade: e.endereco_entrega_completo?.cidade || '-',
  }));

  const csv = converterParaCSV(dadosFormatados, colunas);
  baixarCSV(nomeArquivoComData('entregas'), csv);
}