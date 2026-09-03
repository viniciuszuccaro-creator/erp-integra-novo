// Regra-Mãe 3: Extraído de useContextoVisual.jsx — CRUD com carimbo multiempresa, sanitização e auditoria obrigatórias
import { base44 } from "@/api/base44Client";

export const MODULE_BY_ENTITY = {
  Cliente: 'CRM', Oportunidade: 'CRM', Interacao: 'CRM', Campanha: 'CRM', Pedido: 'Comercial', OrcamentoCliente: 'Comercial',
  Comissao: 'Comercial', NotaFiscal: 'Fiscal', Entrega: 'Expedição', Romaneio: 'Expedição', Rota: 'Expedição',
  Fornecedor: 'Compras', SolicitacaoCompra: 'Compras', OrdemCompra: 'Compras', Produto: 'Estoque',
  MovimentacaoEstoque: 'Estoque', TransferenciaFilial: 'Estoque', Inventario: 'Estoque',
  ContaPagar: 'Financeiro', ContaReceber: 'Financeiro', CaixaMovimento: 'Financeiro', ConciliacaoBancaria: 'Financeiro',
  LancamentoContabil: 'Financeiro', CentroCusto: 'Financeiro', PlanoDeContas: 'Financeiro', PlanoContas: 'Financeiro',
  Contrato: 'Contratos', Evento: 'Agenda', Chamado: 'Hub Atendimento',
  OrdemProducao: 'Produção', ApontamentoProducao: 'Produção',
  Colaborador: 'RH', Ferias: 'RH', Ponto: 'RH', User: 'Sistema'
};

// Vol 3.4: Exclusão lógica obrigatória para dados corporativos — converte delete em inativação
export const NO_PHYSICAL_DELETE_ENTITIES = new Set([
  'Cliente', 'Fornecedor', 'Transportadora', 'Representante', 'ContatoB2B',
  'Produto', 'Servico', 'KitProduto', 'GrupoProduto', 'Marca', 'SetorAtividade',
  'UnidadeMedida', 'TabelaNCM', 'CondicaoComercial', 'SegmentoCliente',
  'RegiaoAtendimento', 'Cargo', 'Departamento', 'Turno', 'MoedaIndice',
  'TipoDespesa', 'TipoFrete', 'Banco', 'LocalEstoque', 'RotaPadrao',
  'Veiculo', 'Motorista', 'CentroResultado', 'CentroOperacao',
  'CentroCusto', 'PlanoDeContas', 'FormaPagamento', 'TabelaPreco',
  'TabelaPrecoItem', 'GrupoEmpresarial', 'Empresa',
  'NotaFiscal', 'TabelaFiscal', 'TabelaDIFAL',
  'ContaReceber', 'ContaPagar', 'CaixaMovimento', 'LancamentoContabil',
  'ConciliacaoBancaria', 'RateioFinanceiro', 'ExtratoBancario',
  'MovimentoCartao', 'CaixaOrdemLiquidacao', 'DRE', 'SPEDFiscal',
  'Colaborador', 'Ferias', 'Ponto',
  'Pedido', 'OrdemCompra', 'SolicitacaoCompra', 'OrdemProducao',
  'ApontamentoProducao', 'Entrega', 'Romaneio', 'MovimentacaoEstoque',
  'Inventario', 'Contrato', 'Evento', 'Comissao',
  // Vol 3.6/3.7: Logs de segurança e auditoria nunca podem ser excluídos fisicamente
  'AuditLog', 'AuditoriaGlobal', 'AuditoriaAcesso', 'AuditoriaGPS', 'AuditoriaIA',
  'LogFiscal', 'LogCobranca', 'LogPerformance', 'LogsIA', 'AlertaPerformance',
  'SessaoUsuario', 'TokenRefresh', 'ConfiguracaoSeguranca',
]);

// Regra-Mãe 5c: Sanitização de entradas (proteção contra injeção/XSS)
export const sanitizeOnWrite = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const clean = (v) => typeof v === 'string'
    ? v.replace(/<\s*script[^>]*>[\s\S]*?<\s*\/\s*script\s*>/gi, '').replace(/javascript:\s*/gi, '')
    : v;
  const out = Array.isArray(obj) ? obj.map((x) => sanitizeOnWrite(x)) : Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, (v && typeof v === 'object') ? sanitizeOnWrite(v) : clean(v)]));
  return out;
};

// Regra-Mãe 5a/5d: CRUD sempre com contexto multiempresa e auditoria completa
export function createCrudHelpers(carimbarContexto) {
  const createInContext = async (entityName, dados, campo = 'empresa_id') => {
    const stamped = carimbarContexto(sanitizeOnWrite(dados), campo);
    if (!stamped.group_id && !stamped[campo]) {
      throw new Error('Contexto multiempresa obrigatório: defina grupo ou empresa');
    }
    const created = await base44.entities[entityName].create(stamped);
    try {
      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me())?.email || 'Usuário',
        acao: 'Criação', modulo: MODULE_BY_ENTITY[entityName] || 'Sistema', tipo_auditoria: 'entidade', entidade: entityName,
        descricao: `Criado registro em ${entityName}`,
        empresa_id: stamped[campo] || null, group_id: stamped.group_id || null,
        dados_anteriores: null, dados_novos: created,
        data_hora: new Date().toISOString()
      });
    } catch (e) { console.error('[useContextoVisual] Falha ao auditar criação:', e?.message || e); }
    return created;
  };

  const bulkCreateInContext = async (entityName, lista, campo = 'empresa_id') => {
    const stampedList = lista.map(item => {
      const s = carimbarContexto(sanitizeOnWrite(item), campo);
      if (!s.group_id && !s[campo]) {
        throw new Error('Contexto multiempresa obrigatório em item da lista');
      }
      return s;
    });
    const res = await base44.entities[entityName].bulkCreate(stampedList);
    try {
      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me())?.email || 'Usuário',
        acao: 'Criação', modulo: MODULE_BY_ENTITY[entityName] || 'Sistema', tipo_auditoria: 'entidade', entidade: entityName,
        descricao: `Criação em lote (${res?.length || stampedList.length})`,
        empresa_id: stampedList[0]?.[campo] || null, group_id: stampedList[0]?.group_id || null,
        dados_anteriores: null, dados_novos: { count: res?.length || stampedList.length },
        data_hora: new Date().toISOString()
      });
    } catch (e) { console.error('[useContextoVisual] Falha ao auditar criação em lote:', e?.message || e); }
    return res;
  };

  const updateInContext = async (entityName, id, dados, campo = 'empresa_id') => {
    const stamped = carimbarContexto(sanitizeOnWrite(dados), campo);
    if (!stamped.group_id && !stamped[campo]) {
      throw new Error('Contexto multiempresa obrigatório: defina grupo ou empresa');
    }
    const before = await base44.entities[entityName].get(id).catch(() => null);
    const updated = await base44.entities[entityName].update(id, stamped);
    try {
      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me())?.email || 'Usuário',
        acao: 'Edição', modulo: MODULE_BY_ENTITY[entityName] || 'Sistema', tipo_auditoria: 'entidade', entidade: entityName,
        descricao: `Atualizado registro ${id} em ${entityName}`,
        empresa_id: stamped[campo] || before?.[campo] || null, group_id: stamped.group_id || before?.group_id || null,
        dados_anteriores: before, dados_novos: updated,
        data_hora: new Date().toISOString()
      });
    } catch (e) { console.error('[useContextoVisual] Falha ao auditar edição:', e?.message || e); }
    return updated;
  };

  const deleteInContext = async (entityName, id) => {
    const before = await base44.entities[entityName].get(id).catch(() => null);

    // Vol 3.4: Dados corporativos usam exclusão lógica (inativação), não física
    if (NO_PHYSICAL_DELETE_ENTITIES.has(entityName)) {
      const inactivated = await base44.entities[entityName].update(id, {
        ativo: false,
        status: 'Inativo',
        _inactivated_at: new Date().toISOString(),
      });
      try {
        await base44.entities.AuditLog.create({
          usuario: (await base44.auth.me())?.email || 'Usuário',
          acao: 'Inativação', modulo: MODULE_BY_ENTITY[entityName] || 'Sistema', tipo_auditoria: 'entidade', entidade: entityName,
          descricao: `Inativação (exclusão lógica Vol 3.4) do registro ${id} em ${entityName}`,
          empresa_id: before?.empresa_id || null, group_id: before?.group_id || null,
          dados_anteriores: before, dados_novos: inactivated,
          data_hora: new Date().toISOString()
        });
      } catch (e) { console.error('[useContextoVisual] Falha ao auditar inativação (exclusão lógica):', e?.message || e); }
      return inactivated;
    }

    // Entidades temporárias/não-corporativas: exclusão física permitida com auditoria
    const res = await base44.entities[entityName].delete(id);
    try {
      await base44.entities.AuditLog.create({
        usuario: (await base44.auth.me())?.email || 'Usuário',
        acao: 'Exclusão', modulo: MODULE_BY_ENTITY[entityName] || 'Sistema', tipo_auditoria: 'entidade', entidade: entityName,
        descricao: `Excluído registro ${id} em ${entityName}`,
        empresa_id: before?.empresa_id || null, group_id: before?.group_id || null,
        dados_anteriores: before, dados_novos: null,
        data_hora: new Date().toISOString()
      });
    } catch (e) { console.error('[useContextoVisual] Falha ao auditar exclusão física:', e?.message || e); }
    return res;
  };

  return { createInContext, bulkCreateInContext, updateInContext, deleteInContext };
}