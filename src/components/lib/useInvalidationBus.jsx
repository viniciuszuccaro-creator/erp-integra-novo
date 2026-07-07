/**
 * useInvalidationBus — Fase 2
 * Barramento de invalidação seletiva por subscription.
 * Conecta os eventos de real-time das entidades ao React Query,
 * invalidando apenas as queries relevantes sem broadcast global.
 */
import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Mapa: entidade → query keys a invalidar no React Query
// Cada entidade inclui [entityName] como prefixo para invalidar useRLSQuery keys
// (formato: ['EntityName', scopeKey, criteriosKey, order, limit])
const ENTITY_QUERY_KEYS = {
  Cliente:             [['Cliente'], ['entityListSorted', 'Cliente'], ['Cliente', 'count']],
  Fornecedor:          [['Fornecedor'], ['entityListSorted', 'Fornecedor'], ['Fornecedor', 'count']],
  Transportadora:      [['Transportadora'], ['entityListSorted', 'Transportadora'], ['Transportadora', 'count']],
  Colaborador:         [['Colaborador'], ['entityListSorted', 'Colaborador'], ['Colaborador', 'count']],
  Produto:             [['Produto'], ['entityListSorted', 'Produto'], ['Produto', 'count']],
  Pedido:              [['Pedido'], ['entityListSorted', 'Pedido'], ['Pedido', 'count'], ['pedidos']],
  ContaReceber:        [['ContaReceber'], ['entityListSorted', 'ContaReceber'], ['ContaReceber', 'count'], ['contasReceber']],
  ContaPagar:          [['ContaPagar'], ['entityListSorted', 'ContaPagar'], ['ContaPagar', 'count'], ['contasPagar']],
  Entrega:             [['Entrega'], ['entityListSorted', 'Entrega'], ['Entrega', 'count'], ['entregas']],
  NotaFiscal:          [['NotaFiscal'], ['entityListSorted', 'NotaFiscal'], ['NotaFiscal', 'count']],
  OrdemCompra:         [['OrdemCompra'], ['entityListSorted', 'OrdemCompra'], ['OrdemCompra', 'count']],
  MovimentacaoEstoque: [['MovimentacaoEstoque'], ['entityListSorted', 'MovimentacaoEstoque'], ['MovimentacaoEstoque', 'count']],
  Oportunidade:        [['Oportunidade'], ['entityListSorted', 'Oportunidade'], ['Oportunidade', 'count']],
  Representante:       [['Representante'], ['entityListSorted', 'Representante'], ['Representante', 'count']],
  ContatoB2B:          [['ContatoB2B'], ['entityListSorted', 'ContatoB2B'], ['ContatoB2B', 'count']],
  SegmentoCliente:     [['SegmentoCliente'], ['entityListSorted', 'SegmentoCliente'], ['SegmentoCliente', 'count']],
  RegiaoAtendimento:   [['RegiaoAtendimento'], ['entityListSorted', 'RegiaoAtendimento'], ['RegiaoAtendimento', 'count']],
  CentroCusto:         [['CentroCusto'], ['entityListSorted', 'CentroCusto'], ['CentroCusto', 'count']],
  PlanoDeContas:       [['PlanoDeContas'], ['entityListSorted', 'PlanoDeContas'], ['PlanoDeContas', 'count']],
  FormaPagamento:      [['FormaPagamento'], ['entityListSorted', 'FormaPagamento'], ['FormaPagamento', 'count']],
  Banco:               [['Banco'], ['entityListSorted', 'Banco'], ['Banco', 'count']],
  GatewayPagamento:    [['GatewayPagamento'], ['entityListSorted', 'GatewayPagamento'], ['GatewayPagamento', 'count']],
  Marca:               [['Marca'], ['entityListSorted', 'Marca'], ['Marca', 'count']],
  GrupoProduto:        [['GrupoProduto'], ['entityListSorted', 'GrupoProduto'], ['GrupoProduto', 'count']],
  UnidadeMedida:       [['UnidadeMedida'], ['entityListSorted', 'UnidadeMedida'], ['UnidadeMedida', 'count']],
  TabelaNCM:           [['TabelaNCM'], ['entityListSorted', 'TabelaNCM'], ['TabelaNCM', 'count']],
  TabelaPreco:         [['TabelaPreco'], ['entityListSorted', 'TabelaPreco'], ['TabelaPreco', 'count']],
  CondicaoComercial:   [['CondicaoComercial'], ['entityListSorted', 'CondicaoComercial'], ['CondicaoComercial', 'count']],
  SetorAtividade:      [['SetorAtividade'], ['entityListSorted', 'SetorAtividade'], ['SetorAtividade', 'count']],
  Cargo:               [['Cargo'], ['entityListSorted', 'Cargo'], ['Cargo', 'count']],
  Departamento:        [['Departamento'], ['entityListSorted', 'Departamento'], ['Departamento', 'count']],
  Turno:               [['Turno'], ['entityListSorted', 'Turno'], ['Turno', 'count']],
  Veiculo:             [['Veiculo'], ['entityListSorted', 'Veiculo'], ['Veiculo', 'count']],
  Motorista:           [['Motorista'], ['entityListSorted', 'Motorista'], ['Motorista', 'count']],
  RotaPadrao:          [['RotaPadrao'], ['entityListSorted', 'RotaPadrao'], ['RotaPadrao', 'count']],
  TipoFrete:           [['TipoFrete'], ['entityListSorted', 'TipoFrete'], ['TipoFrete', 'count']],
  LocalEstoque:        [['LocalEstoque'], ['entityListSorted', 'LocalEstoque'], ['LocalEstoque', 'count']],
  Servico:             [['Servico'], ['entityListSorted', 'Servico'], ['Servico', 'count']],
  KitProduto:          [['KitProduto'], ['entityListSorted', 'KitProduto'], ['KitProduto', 'count']],
  MoedaIndice:         [['MoedaIndice'], ['entityListSorted', 'MoedaIndice'], ['MoedaIndice', 'count']],
  CentroResultado:     [['CentroResultado'], ['entityListSorted', 'CentroResultado'], ['CentroResultado', 'count']],
  CentroOperacao:      [['CentroOperacao'], ['entityListSorted', 'CentroOperacao'], ['CentroOperacao', 'count']],
  Evento:              [['Evento'], ['entityListSorted', 'Evento'], ['Evento', 'count']],
  Ferias:              [['Ferias'], ['entityListSorted', 'Ferias'], ['Ferias', 'count']],
  Ponto:               [['Ponto'], ['entityListSorted', 'Ponto'], ['Ponto', 'count']],
  Contrato:            [['Contrato'], ['entityListSorted', 'Contrato'], ['Contrato', 'count']],
  SolicitacaoCompra:   [['SolicitacaoCompra'], ['entityListSorted', 'SolicitacaoCompra'], ['SolicitacaoCompra', 'count']],
  OrdemProducao:       [['OrdemProducao'], ['entityListSorted', 'OrdemProducao'], ['OrdemProducao', 'count']],
  ApontamentoProducao: [['ApontamentoProducao'], ['entityListSorted', 'ApontamentoProducao'], ['ApontamentoProducao', 'count']],
  Romaneio:            [['Romaneio'], ['entityListSorted', 'Romaneio'], ['Romaneio', 'count']],
  Inventario:          [['Inventario'], ['entityListSorted', 'Inventario'], ['Inventario', 'count']],
  TransferenciaFilial: [['TransferenciaFilial'], ['entityListSorted', 'TransferenciaFilial'], ['TransferenciaFilial', 'count']],
  CatalogoWeb:         [['CatalogoWeb'], ['entityListSorted', 'CatalogoWeb'], ['CatalogoWeb', 'count']],
  OperadorCaixa:       [['OperadorCaixa'], ['entityListSorted', 'OperadorCaixa'], ['OperadorCaixa', 'count']],
  TabelaFiscal:        [['TabelaFiscal'], ['entityListSorted', 'TabelaFiscal'], ['TabelaFiscal', 'count']],
  Empresa:             [['Empresa'], ['entityListSorted', 'Empresa'], ['Empresa', 'count'], ['empresas']],
  ConfiguracaoSistema: [['ConfiguracaoSistema'], ['entityListSorted', 'ConfiguracaoSistema'], ['configuracaoSistema'], ['config-sistema'], ['config-center-v2'], ['config-global'], ['configs-ia-geral']],
  IAConfig:            [['IAConfig'], ['entityListSorted', 'IAConfig'], ['configs-ia-geral']],
  AuditLog:            [['AuditLog'], ['entityListSorted', 'AuditLog']],
  Notificacao:         [['Notificacao'], ['entityListSorted', 'Notificacao']],
  PerfilAcesso:        [['PerfilAcesso'], ['entityListSorted', 'PerfilAcesso']],
  GrupoEmpresarial:    [['GrupoEmpresarial'], ['entityListSorted', 'GrupoEmpresarial'], ['empresas']],
  ApiExterna:          [['ApiExterna'], ['entityListSorted', 'ApiExterna']],
  ChatbotCanal:        [['ChatbotCanal'], ['entityListSorted', 'ChatbotCanal']],
  ChatbotIntent:       [['ChatbotIntent'], ['entityListSorted', 'ChatbotIntent']],
  ChatbotIntents:      [['ChatbotIntents'], ['entityListSorted', 'ChatbotIntents']],
  JobAgendado:         [['JobAgendado'], ['entityListSorted', 'JobAgendado']],
  Webhook:             [['Webhook'], ['entityListSorted', 'Webhook']],
  EventoNotificacao:   [['EventoNotificacao'], ['entityListSorted', 'EventoNotificacao']],
  ModeloDocumento:     [['ModeloDocumento'], ['entityListSorted', 'ModeloDocumento']],
  ChatbotInteracao:    [['ChatbotInteracao'], ['entityListSorted', 'ChatbotInteracao']],
  ImportacaoXMLNFe:    [['ImportacaoXMLNFe'], ['entityListSorted', 'ImportacaoXMLNFe']],
  SolicitacaoAprovacao:[['SolicitacaoAprovacao'], ['entityListSorted', 'SolicitacaoAprovacao']],
  SeparacaoConferencia:[['SeparacaoConferencia'], ['entityListSorted', 'SeparacaoConferencia']],
  ConciliacaoPedido:  [['ConciliacaoPedido'], ['entityListSorted', 'ConciliacaoPedido']],
  RateioFinanceiro:    [['RateioFinanceiro'], ['entityListSorted', 'RateioFinanceiro']],
  ConciliacaoBancaria: [['ConciliacaoBancaria'], ['entityListSorted', 'ConciliacaoBancaria']],
  ExtratoBancario:     [['ExtratoBancario'], ['entityListSorted', 'ExtratoBancario']],
  CaixaMovimento:      [['CaixaMovimento'], ['entityListSorted', 'CaixaMovimento']],
  MovimentoCartao:     [['MovimentoCartao'], ['entityListSorted', 'MovimentoCartao']],
  CaixaOrdemLiquidacao:[['CaixaOrdemLiquidacao'], ['entityListSorted', 'CaixaOrdemLiquidacao']],
  LancamentoContabil:  [['LancamentoContabil'], ['entityListSorted', 'LancamentoContabil']],
  DRE:                 [['DRE'], ['entityListSorted', 'DRE']],
  SPEDFiscal:          [['SPEDFiscal'], ['entityListSorted', 'SPEDFiscal']],
  LogFiscal:           [['LogFiscal'], ['entityListSorted', 'LogFiscal']],
  MonitoramentoSistema:[['MonitoramentoSistema'], ['entityListSorted', 'MonitoramentoSistema']],
  AlertaPerformance:   [['AlertaPerformance'], ['entityListSorted', 'AlertaPerformance']],
  LogPerformance:      [['LogPerformance'], ['entityListSorted', 'LogPerformance']],
  BackupAutomatico:    [['BackupAutomatico'], ['entityListSorted', 'BackupAutomatico']],
  ConfiguracaoBackup:  [['ConfiguracaoBackup'], ['entityListSorted', 'ConfiguracaoBackup']],
  ConfiguracaoMonitoramento: [['ConfiguracaoMonitoramento'], ['entityListSorted', 'ConfiguracaoMonitoramento']],
  ConfiguracaoSeguranca: [['ConfiguracaoSeguranca'], ['entityListSorted', 'ConfiguracaoSeguranca']],
  GovernancaEmpresa:   [['GovernancaEmpresa'], ['entityListSorted', 'GovernancaEmpresa']],
  AuditoriaGlobal:     [['AuditoriaGlobal'], ['entityListSorted', 'AuditoriaGlobal']],
  AuditoriaAcesso:     [['AuditoriaAcesso'], ['entityListSorted', 'AuditoriaAcesso']],
  AuditoriaGPS:        [['AuditoriaGPS'], ['entityListSorted', 'AuditoriaGPS']],
  AuditoriaIA:        [['AuditoriaIA'], ['entityListSorted', 'AuditoriaIA']],
  LogsIA:              [['LogsIA'], ['entityListSorted', 'LogsIA']],
  LogCobranca:        [['LogCobranca'], ['entityListSorted', 'LogCobranca']],
  PlanoMelhoriaItem:  [['PlanoMelhoriaItem'], ['entityListSorted', 'PlanoMelhoriaItem']],
  TabelaDIFAL:        [['TabelaDIFAL'], ['entityListSorted', 'TabelaDIFAL']],
  ConversaOmnicanal:  [['ConversaOmnicanal'], ['entityListSorted', 'ConversaOmnicanal']],
  MensagemOmnicanal:  [['MensagemOmnicanal'], ['entityListSorted', 'MensagemOmnicanal']],
  PagamentoOmnichannel:[['PagamentoOmnichannel'], ['entityListSorted', 'PagamentoOmnichannel']],
  SessaoUsuario:      [['SessaoUsuario'], ['entityListSorted', 'SessaoUsuario']],
  TokenRefresh:       [['TokenRefresh'], ['entityListSorted', 'TokenRefresh']],
  ConfiguracaoIntegracaoMarketplace: [['ConfiguracaoIntegracaoMarketplace'], ['entityListSorted', 'ConfiguracaoIntegracaoMarketplace']],
  DocumentacaoTecnica: [['DocumentacaoTecnica'], ['entityListSorted', 'DocumentacaoTecnica']],
  ParametroOrigemPedido: [['ParametroOrigemPedido'], ['entityListSorted', 'ParametroOrigemPedido']],
  ConfigFiscalEmpresa: [['ConfigFiscalEmpresa'], ['entityListSorted', 'ConfigFiscalEmpresa']],
  PermissaoEmpresaModulo: [['PermissaoEmpresaModulo'], ['entityListSorted', 'PermissaoEmpresaModulo']],
  MonitoramentoRH:     [['MonitoramentoRH'], ['entityListSorted', 'MonitoramentoRH']],
  InspecaoQualidade:   [['InspecaoQualidade'], ['entityListSorted', 'InspecaoQualidade']],
  TabelaPrecoItem:    [['TabelaPrecoItem'], ['entityListSorted', 'TabelaPrecoItem']],
  PedidoEtapa:        [['PedidoEtapa'], ['entityListSorted', 'PedidoEtapa']],
  EntregaItens:       [['EntregaItens'], ['entityListSorted', 'EntregaItens']],
  PedidoExterno:      [['PedidoExterno'], ['entityListSorted', 'PedidoExterno']],
};

// Throttle de invalidação por entidade (evita flood de invalidações em eventos rápidos)
const INVALIDATE_THROTTLE_MS = 300;

/**
 * Hook que assina eventos real-time de uma lista de entidades e
 * invalida apenas as queries React Query afetadas.
 * 
 * @param {string[]} entities - lista de nomes de entidades para monitorar
 * @param {object}   options  - { enabled: bool }
 */
export function useInvalidationBus(entities = [], options = {}) {
  const { enabled = true } = options;
  const queryClient = useQueryClient();
  const lastInvalidateRef = useRef({});

  useEffect(() => {
    if (!enabled || !entities.length) return;

    const unsubs = entities.map((entityName) => {
      const api = base44.entities?.[entityName];
      if (!api?.subscribe) return null;

      return api.subscribe((evt) => {
        const now = Date.now();
        const last = lastInvalidateRef.current[entityName] || 0;
        if (now - last < INVALIDATE_THROTTLE_MS) return;
        lastInvalidateRef.current[entityName] = now;

        const baseKeys = ENTITY_QUERY_KEYS[entityName] || [[entityName], ['entityListSorted', entityName]];
        // Sempre inclui as query keys do VisualizadorUniversal (tabela de Cadastros) e contagens
        // + chaves de módulos consumidores para propagação cross-module em tempo real
        const keys = [
          ...baseKeys,
          ['viz-v33', entityName],
          ['entityCounts_v5'],
          ['dashboard'],
          ['crm'],
          ['comercial'],
          ['estoque'],
          ['financeiro'],
          ['compras'],
          ['expedicao'],
          ['producao'],
          ['rh'],
          ['fiscal'],
          ['relatorios'],
          ['cadastros'],
        ];
        // Invalidação assíncrona para não bloquear o handler
        setTimeout(() => {
          keys.forEach((qk) => {
            try {
              queryClient.invalidateQueries({ queryKey: qk, exact: false });
            } catch (_) {}
          });
        }, 0);
      });
    }).filter(Boolean);

    return () => { unsubs.forEach(u => { if (typeof u === 'function') u(); }); };
  }, [enabled, entities.join(','), queryClient]);
}

export default useInvalidationBus;