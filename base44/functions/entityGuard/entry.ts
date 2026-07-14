import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Rate-limit por IP
const __RL = globalThis.__egRate || (globalThis.__egRate = new Map());
const __WINDOW_MS = 30_000;
const __MAX_REQ = 120;

// Cache de permissões por usuário (evita chamar auth.me() a cada request)
const __PERM_CACHE = globalThis.__egPermCache || (globalThis.__egPermCache = new Map());
const __DECISION_CACHE = globalThis.__egDecisionCache || (globalThis.__egDecisionCache = new Map());
let __BACKEND_PAUSED_UNTIL = globalThis.__egBackendPausedUntil || 0;
const __PERM_TTL = 900_000; // 15 min
const __DECISION_TTL = 300_000; // 5 min

// === Funções puras de normalização (module-level para evitar TDZ no catch) ===
const normalize = (a) => {
  if (!a) return 'visualizar';
  const s = String(a).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const map = {
    ver: 'visualizar', view: 'visualizar', read: 'visualizar', listar: 'visualizar', consultar: 'visualizar', visualizar: 'visualizar', status: 'visualizar',
    delete: 'excluir', remove: 'excluir', apagar: 'excluir', excluir: 'excluir',
    create: 'criar', add: 'criar', importar: 'criar', criar: 'criar',
    emitir: 'emitir', enviar: 'enviar', gerar: 'gerar',
    update: 'editar', edit: 'editar', corrigir: 'editar', gerenciar: 'editar', executar: 'editar', registrar: 'editar', atualizar: 'editar', editar: 'editar',
    approve: 'aprovar', aprovar: 'aprovar', approvar: 'aprovar', validar: 'aprovar',
    rejeitar: 'rejeitar', reject: 'rejeitar',
    export: 'exportar', exportar: 'exportar', imprimir: 'exportar', print: 'exportar',
    cancel: 'cancelar', cancelar: 'cancelar',
    // Vol 3.1: Receber, pagar, liquidar e conciliar são permissões SEPARADAS (manual proíbe colapsar)
    liquidar: 'liquidar', baixar: 'liquidar',
    pagar: 'pagar',
    receber: 'receber', cobrar: 'receber',
    conciliar: 'conciliar',
    inativar: 'inativar', desativar: 'inativar', suspender: 'inativar',
    restaurar: 'restaurar', reativar: 'restaurar',
    desfazer: 'desfazer', estornar: 'desfazer', reverter: 'desfazer',
    transferir: 'transferir', rastrear: 'rastrear', roteirizar: 'roteirizar',
    apontar: 'apontar', concluir: 'concluir', inventario: 'inventario',
    desconto: 'desconto', assinar: 'assinar', renovar: 'renovar', responder: 'responder',
    duplicar: 'duplicar', testar: 'testar',
    configurar: 'configurar', config: 'configurar',
    auditar: 'auditar', audit: 'auditar', backup: 'backup',
    seguranca: 'seguranca',
    parar: 'parar', inspecionar: 'inspecionar', separar: 'separar', conferir: 'conferir',
    expedir: 'expedir', entregar: 'entregar', contar: 'contar', ajustar: 'ajustar',
    solicitar: 'solicitar', desligar: 'desligar', fechar: 'fechar', abrir: 'abrir',
    administrar: 'administrar', calcular: 'calcular',
  };
  return map[s] || s;
};

const normalizeModule = (s) => {
  if (!s) return 'Sistema';
  const norm = String(s).normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const aliases = {
    financeiro: 'Financeiro', financeiroecontabil: 'Financeiro',
    compras: 'Compras', comprasesuprimentos: 'Compras',
    comercial: 'Comercial', comercialevendas: 'Comercial',
    estoque: 'Estoque', estoqueealmoxarifado: 'Estoque',
    expedicao: 'Expedição', expedicaologistica: 'Expedição',
    producao: 'Produção', producaoemanufatura: 'Produção',
    crm: 'CRM', crmrelacionamento: 'CRM',
    fiscal: 'Fiscal', fiscaletributario: 'Fiscal',
    rh: 'RH', recursoshumanos: 'RH',
    dashboard: 'Dashboard', dashboardcorporativo: 'Dashboard',
    relatorios: 'Relatórios', relatorioseanalises: 'Relatórios',
    agenda: 'Agenda', agendacalendario: 'Agenda',
    cadastros: 'Cadastros', cadastrosgerais: 'Cadastros',
    contratos: 'Contratos', gestaodecontratos: 'Contratos',
    hubatendimento: 'HubAtendimento', hubdeatendimento: 'HubAtendimento', hub: 'HubAtendimento',
    administracao: 'Sistema', administracaosistema: 'Sistema', sistema: 'Sistema',
  };
  return aliases[norm] || s || 'Sistema';
};

const READ_ONLY_ACTIONS = ['visualizar', 'ver', 'view', 'read', 'listar', 'consultar', 'status'];

// Vol 3.4: Sinônimos com backward compat — liquidar no perfil concede pagar/receber/conciliar
const ACTION_SYNONYMS = {
  'pagar': ['pagar', 'liquidar'],
  'receber': ['receber', 'liquidar'],
  'conciliar': ['conciliar', 'liquidar'],
  'estornar': ['estornar', 'desfazer', 'liquidar'],
  'rejeitar': ['rejeitar', 'aprovar'],
  'desconto': ['desconto', 'aprovar'],
  'abrir': ['abrir'],
  'fechar': ['fechar', 'concluir'],
};

// Helper: verifica se array de permissões do perfil contém a ação desejada (com normalização)
// CRÍTICO: normaliza ambos os lados para evitar mismatch (perfil tem "ver", busca por "visualizar")
const arrHasAction = (arr, desired, isReadOnly) => {
  if (!Array.isArray(arr)) return false;
  const synonyms = ACTION_SYNONYMS[desired] || [desired];
  return arr.some(v => synonyms.includes(normalize(v)))
    || (isReadOnly && arr.some(v => normalize(v) === 'visualizar'));
};

// Entidades que só admin pode criar/editar/excluir (controle de acesso e segurança)
const ADMIN_ONLY_WRITE_ENTITIES = new Set([
  'PerfilAcesso', 'User', 'ConfiguracaoSeguranca', 'ConfiguracaoSistema',
  'ConfiguracaoBackup', 'ConfiguracaoMonitoramento', 'GovernancaEmpresa',
  'PermissaoEmpresaModulo', 'ConfiguracaoNFe',
  'ApiExterna', 'Webhook', 'JobAgendado', 'EventoNotificacao',
  'ChatbotCanal', 'ChatbotIntent', 'TokenRefresh', 'SessaoUsuario',
  'BackupAutomatico', 'MonitoramentoSistema',
]);

// Entidades cuja leitura também é restrita (dados sensíveis)
const ADMIN_ONLY_READ_ENTITIES = new Set([
  'AuditLog', 'ConfiguracaoSeguranca', 'GovernancaEmpresa',
  'TokenRefresh', 'SessaoUsuario',
  'LogFiscal', 'LogCobranca', 'LogsIA', 'LogPerformance',
  'AuditoriaAcesso', 'AuditoriaGPS', 'AuditoriaIA', 'AuditoriaGlobal',
  'MonitoramentoSistema', 'AlertaPerformance',
]);

// === Vol 2.1: Classificação de dados por entidade ===
// Determina leitura, escrita, compartilhamento, consolidação, propagação e retenção.
const ENTITY_DATA_CLASSIFICATION = {
  // Dados mestre compartilhados (Cadastro Gerais) — group_id obrigatório, empresa_id opcional
  MASTER_SHARED: new Set([
    'Cliente', 'Fornecedor', 'Transportadora', 'Representante', 'ContatoB2B',
    'Produto', 'Servico', 'KitProduto', 'GrupoProduto', 'Marca', 'SetorAtividade',
    'UnidadeMedida', 'TabelaNCM', 'CondicaoComercial', 'SegmentoCliente',
    'RegiaoAtendimento', 'Cargo', 'Departamento', 'Turno', 'MoedaIndice',
    'TipoDespesa', 'TipoFrete', 'Banco', 'LocalEstoque', 'RotaPadrao',
    'Veiculo', 'Motorista', 'CentroResultado', 'CentroOperacao',
    'CentroCusto', 'PlanoDeContas', 'FormaPagamento', 'TabelaPreco',
    'TabelaPrecoItem', 'GrupoEmpresarial', 'Empresa',
  ]),
  // Parâmetros com variação empresarial — empresa_id obrigatório
  PARAMETER_COMPANY: new Set([
    'ConfiguracaoNFe', 'ConfiguracaoSistema', 'GatewayPagamento',
    'ConfiguracaoBoletos', 'ConfiguracaoWhatsApp', 'ConfiguracaoCobrancaEmpresa',
    'ConfigFiscalEmpresa', 'ConfiguracaoCanal', 'ConfiguracaoProducao',
    'ConfiguracaoMonitoramento', 'ConfiguracaoSeguranca', 'ConfiguracaoBackup',
    'ConfiguracaoDespesaRecorrente', 'ConfiguracaoIntegracaoMarketplace',
    'ConfiguracaoGatewayPagamento', 'ParametroPortalCliente',
    'ParametroConciliacaoBancaria', 'ParametroRoteirizacao',
    'ParametroCaixaDiario', 'ParametroRecebimentoNFe',
    'PermissaoEmpresaModulo', 'ContaBancariaEmpresa',
  ]),
  // Dados operacionais — empresa_id obrigatório, consolidados no grupo
  OPERATIONAL: new Set([
    'Pedido', 'OrcamentoCliente', 'OrdemCompra', 'SolicitacaoCompra',
    'ContaReceber', 'ContaPagar', 'CaixaMovimento', 'MovimentacaoEstoque',
    'TransferenciaFilial', 'Inventario', 'Entrega', 'Romaneio', 'Rota',
    'OrdemProducao', 'ApontamentoProducao', 'SeparacaoConferencia',
    'ConciliacaoPedido', 'RateioFinanceiro', 'ExtratoBancario',
    'ConciliacaoBancaria', 'MovimentoCartao', 'CaixaOrdemLiquidacao',
    'LancamentoContabil', 'DRE', 'SPEDFiscal', 'Comissao',
    'Oportunidade', 'Interacao', 'Campanha', 'Evento', 'Contrato',
    'ImportacaoXMLNFe', 'PedidoExterno', 'PedidoEtapa', 'EntregaItens',
    'InspecaoQualidade', 'OperadorCaixa',
  ]),
  // Dados fiscais — empresa_id obrigatório, retenção longa
  FISCAL: new Set(['NotaFiscal', 'TabelaFiscal', 'TabelaDIFAL', 'LogFiscal']),
  // Dados confidenciais — acesso restrito, LGPD
  CONFIDENTIAL: new Set([
    'Colaborador', 'Ferias', 'Ponto', 'MonitoramentoRH',
    'SessaoUsuario', 'TokenRefresh',
  ]),
  // Logs imutáveis — sem exclusão, sem edição
  IMMUTABLE_LOG: new Set([
    'AuditLog', 'AuditoriaAcesso', 'AuditoriaGPS', 'AuditoriaIA',
    'AuditoriaGlobal', 'LogCobranca', 'LogsIA', 'LogPerformance',
    'AlertaPerformance', 'MonitoramentoSistema', 'BackupAutomatico',
    'SyncReport', 'SyncMap',
  ]),
  // Dados de tecnologia/configuração — admin only
  TECHNOLOGY: new Set([
    'ApiExterna', 'Webhook', 'JobAgendado', 'EventoNotificacao',
    'ModeloDocumento', 'ModeloDocumentoLogistico', 'ChatbotCanal',
    'ChatbotIntent', 'ChatbotIntents', 'ChatbotInteracao',
    'IAConfig', 'CatalogoWeb', 'PerfilAcesso', 'GovernancaEmpresa',
    'ConversaOmnicanal', 'MensagemOmnicanal', 'PagamentoOmnichannel',
    'BaseConhecimento', 'DocumentacaoTecnica',
  ]),
};

// Retorna a classificação de uma entidade
function getEntityClassification(entityName) {
  for (const [category, set] of Object.entries(ENTITY_DATA_CLASSIFICATION)) {
    if (set.has(entityName)) return category;
  }
  return 'OPERATIONAL'; // default: operacional
}

// === Vol 2.2: Validação de contexto multiempresa baseada em classificação ===
function validateMultiempresaContext(entityName, data, user, desired) {
  const classification = getEntityClassification(entityName);
  const isWrite = ['criar', 'editar', 'excluir'].includes(desired);
  if (!isWrite) return { valid: true, classification };

  const groupId = data?.group_id || null;
  const empresaId = data?.empresa_id || null;

  // MASTER_SHARED: group_id obrigatório, empresa_id opcional
  if (classification === 'MASTER_SHARED') {
    if (!groupId) return { valid: false, classification, reason: 'Dados mestre requerem group_id' };
    return { valid: true, classification };
  }

  // PARAMETER_COMPANY: empresa_id obrigatório
  if (classification === 'PARAMETER_COMPANY') {
    if (!empresaId && !groupId) return { valid: false, classification, reason: 'Parâmetros requerem empresa_id ou group_id' };
    return { valid: true, classification };
  }

  // OPERACIONAL, FISCAL, CONFIDENTIAL: empresa_id obrigatório
  if (['OPERATIONAL', 'FISCAL', 'CONFIDENTIAL'].includes(classification)) {
    if (!empresaId && !groupId) return { valid: false, classification, reason: `${classification} requer empresa_id ou group_id` };
    return { valid: true, classification };
  }

  // IMMUTABLE_LOG: bloqueia escrita (exceto admin, já verificado antes)
  if (classification === 'IMMUTABLE_LOG') {
    return { valid: false, classification, reason: 'Logs imutáveis não podem ser alterados' };
  }

  // TECHNOLOGY: admin only (já verificado antes, mas fail-closed)
  if (classification === 'TECHNOLOGY') {
    return { valid: false, classification, reason: 'Configurações de tecnologia requerem admin' };
  }

  // Vol 3.4: Exclusão lógica obrigatória — dados corporativos não podem ser excluídos fisicamente
  // Deve usar inativação/arquivamento. Apenas dados temporários expressamente autorizados podem ser excluídos.
  if (desired === 'excluir') {
    const NO_PHYSICAL_DELETE = new Set([
      // Mestres compartilhados
      'Cliente', 'Fornecedor', 'Transportadora', 'Representante', 'ContatoB2B',
      'Produto', 'Servico', 'KitProduto', 'GrupoProduto', 'Marca', 'SetorAtividade',
      'UnidadeMedida', 'TabelaNCM', 'CondicaoComercial', 'SegmentoCliente',
      'RegiaoAtendimento', 'Cargo', 'Departamento', 'Turno', 'MoedaIndice',
      'TipoDespesa', 'TipoFrete', 'Banco', 'LocalEstoque', 'RotaPadrao',
      'Veiculo', 'Motorista', 'CentroResultado', 'CentroOperacao',
      'CentroCusto', 'PlanoDeContas', 'FormaPagamento', 'TabelaPreco',
      'TabelaPrecoItem', 'GrupoEmpresarial', 'Empresa',
      // Fiscais (retenção longa obrigatória)
      'NotaFiscal', 'TabelaFiscal', 'TabelaDIFAL',
      // Financeiros (trilha imutável)
      'ContaReceber', 'ContaPagar', 'CaixaMovimento', 'LancamentoContabil',
      'ConciliacaoBancaria', 'RateioFinanceiro', 'ExtratoBancario',
      'MovimentoCartao', 'CaixaOrdemLiquidacao', 'DRE', 'SPEDFiscal',
      // Confidenciais LGPD
      'Colaborador', 'Ferias', 'Ponto',
      // Operacionais com trilha
      'Pedido', 'OrdemCompra', 'SolicitacaoCompra', 'OrdemProducao',
      'ApontamentoProducao', 'Entrega', 'Romaneio', 'MovimentacaoEstoque',
      'Inventario', 'Contrato', 'Evento', 'Comissao',
    ]);
    if (NO_PHYSICAL_DELETE.has(entityName)) {
      return { valid: false, classification, reason: `Exclusão física bloqueada para ${entityName} — use inativação/arquivamento (Vol 3.4)` };
    }
  }

  return { valid: true, classification };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Ping de automação
    if (!body || Object.keys(body).length === 0 || body._automation === true) {
      return Response.json({ ok: true, status: 'healthy' });
    }

    // === Variáveis derivadas (definidas antes de qualquer uso) ===
    const moduleName = normalizeModule(body?.module || 'Sistema');
    const section = body?.section || null;
    const desired = normalize(body?.action || 'visualizar');
    const isReadOnly = READ_ONLY_ACTIONS.includes(desired);
    const targetEntity = body?.entity_name;

    // Cooldown por rate-limit
    if (Date.now() < __BACKEND_PAUSED_UNTIL) {
      // Fail-open apenas para leitura; fail-closed para escrita durante cooldown
      return Response.json({ allowed: isReadOnly, _fallback: true, reason: 'entityGuard em cooldown por rate-limit' });
    }

    // Rate limit por IP
    try {
      const ip = (req.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
      const now = Date.now();
      const list = __RL.get(ip) || [];
      const kept = list.filter((t) => now - t < __WINDOW_MS);
      kept.push(now);
      __RL.set(ip, kept);
      if (kept.length > __MAX_REQ) {
        return Response.json({ allowed: false, error: 'rate_limited' }, { status: 429 });
      }
    } catch {}

    // Autenticação — usa cache para não consumir créditos a cada chamada
    let user = null;
    try {
      const authToken = req.headers.get('authorization') || '';
      const cacheKey = authToken.slice(-32);
      const cached = __PERM_CACHE.get(cacheKey);
      if (cached && Date.now() - cached.ts < __PERM_TTL) {
        user = cached.user;
      } else {
        user = await base44.auth.me();
        if (user && cacheKey) {
          __PERM_CACHE.set(cacheKey, { user, ts: Date.now() });
          if (__PERM_CACHE.size > 500) {
            const oldest = __PERM_CACHE.keys().next().value;
            __PERM_CACHE.delete(oldest);
          }
        }
      }
    } catch {}

    if (!user) return Response.json({ allowed: false, error: 'Unauthorized' }, { status: 401 });

    // Admin sempre tem acesso
    if (user?.role === 'admin') {
      return Response.json({ allowed: true });
    }

    // === Proteção do módulo Sistema: exclusivo de admin para qualquer ação além leitura ===
    if (moduleName === 'Sistema' && !isReadOnly) {
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email || 'Usuário',
          usuario_id: user.id,
          acao: 'Bloqueio',
          modulo: 'Sistema',
          tipo_auditoria: 'seguranca',
          entidade: targetEntity || section || 'Sistema',
          descricao: `RBAC: não-admin tentou ${desired} no módulo Sistema`,
          empresa_id: body?.empresa_id || null,
          group_id: body?.group_id || null,
          data_hora: new Date().toISOString(),
        });
      } catch {}
      return Response.json({ allowed: false, reason: 'Módulo Sistema requer perfil admin' }, { status: 403 });
    }

    // === Proteção de entidades críticas ===
    // AuditLog é imutável para não-admins
    if (targetEntity === 'AuditLog' && ['criar', 'editar', 'excluir'].includes(desired)) {
      return Response.json({ allowed: false, reason: 'AuditLog é imutável' }, { status: 403 });
    }
    // Entidades de controle de acesso: só admin pode escrever
    if (ADMIN_ONLY_WRITE_ENTITIES.has(targetEntity) && ['criar', 'editar', 'excluir'].includes(desired)) {
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email || 'Usuário',
          usuario_id: user.id,
          acao: 'Bloqueio',
          modulo: moduleName,
          tipo_auditoria: 'seguranca',
          entidade: targetEntity,
          descricao: `RBAC: não-admin tentou ${desired} em entidade protegida ${targetEntity}`,
          empresa_id: body?.empresa_id || null,
          group_id: body?.group_id || null,
          data_hora: new Date().toISOString(),
        });
      } catch {}
      return Response.json({ allowed: false, reason: `${targetEntity} requer perfil admin` }, { status: 403 });
    }
    // Entidades de leitura sensível: só admin pode ler
    if (ADMIN_ONLY_READ_ENTITIES.has(targetEntity) && isReadOnly && user?.role !== 'admin') {
      return Response.json({ allowed: false, reason: `${targetEntity} requer perfil admin para leitura` }, { status: 403 });
    }

    // === Cache de decisão ===
    const normalizeKey = (value) => String(value || '')
      .normalize('NFD').replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const sectionAliases = {
      controledeacesso: 'acessos', gestaoacessos: 'acessos', acessos: 'acessos', perfis: 'acessos', usuarios: 'acessos',
      configuracoesgerais: 'configuracoes', configuracoes: 'configuracoes', configuracao: 'configuracoes',
      integracoes: 'integracoes', integracao: 'integracoes',
      ia: 'ia', iaeotimizacao: 'ia',
      seguranca: 'seguranca', segurança: 'seguranca',
      auditoria: 'auditoria', backup: 'backup', propagacao: 'propagacao',
      notificacoes: 'notificacoes', notificações: 'notificacoes',
    };

    const findNode = (root, key) => {
      if (!root || typeof root !== 'object') return undefined;
      const target = sectionAliases[normalizeKey(key)] || normalizeKey(key);
      const found = Object.keys(root).find((candidate) => normalizeKey(candidate) === target || sectionAliases[normalizeKey(candidate)] === target);
      return found ? root[found] : undefined;
    };

    const decisionKey = JSON.stringify({ u: user?.id, r: user?.role, m: moduleName, s: body?.section, a: desired, e: targetEntity });
    const decisionCached = __DECISION_CACHE.get(decisionKey);
    if (decisionCached && Date.now() - decisionCached.ts < __DECISION_TTL) {
      return Response.json({ allowed: decisionCached.allowed, _cached: true });
    }

    // === Verificação de perfil de acesso (fail-closed para escrita sem perfil) ===
    let allowed = false;
    try {
      if (user?.perfil_acesso_id) {
        const perfil = await base44.asServiceRole.entities.PerfilAcesso.get(user.perfil_acesso_id);
        const perms = perfil?.permissoes;
        if (perms) {
          const modNode = findNode(perms, moduleName);
          if (modNode) {
            if (!section) {
              allowed = Object.values(modNode).some((node) => {
                if (Array.isArray(node)) return arrHasAction(node, desired, isReadOnly);
                if (node && typeof node === 'object') return Object.values(node).some((v) => arrHasAction(v, desired, isReadOnly));
                return false;
              });
            } else {
              const path = Array.isArray(section) ? section : String(section).split('.').filter(Boolean);
              let cursor = modNode;
              for (const seg of path) { if (!cursor) break; cursor = findNode(cursor, seg); }
              if (Array.isArray(cursor)) allowed = arrHasAction(cursor, desired, isReadOnly);
              else if (cursor && typeof cursor === 'object') {
                const stack = [cursor];
                while (stack.length && !allowed) {
                  const node = stack.pop();
                  if (Array.isArray(node)) {                   if (arrHasAction(node, desired, isReadOnly)) allowed = true; }
                  else if (node && typeof node === 'object') Object.values(node).forEach(v => stack.push(v));
                }
              }
            }
          }
        }
      } else {
        // Sem perfil configurado: fail-open apenas para leitura, fail-closed para escrita
        allowed = isReadOnly;
      }
    } catch {
      // Erro ao buscar perfil: fail-open apenas para leitura, fail-closed para escrita
      allowed = isReadOnly;
    }

    // === RLS de escopo multiempresa: previne escalada horizontal ===
    if (allowed && ['criar', 'editar', 'excluir'].includes(desired)) {
      const reqEmpresaId = body?.empresa_id || null;
      const reqGroupId = body?.group_id || null;
      if (reqEmpresaId && user?.empresa_id && reqEmpresaId !== user.empresa_id) {
        // Vol 3.5: Verifica empresas_vinculadas — usuário pode ter acesso a múltiplas empresas
        const userEmpresasVinculadas = Array.isArray(user?.empresas_vinculadas) ? user.empresas_vinculadas : [];
        const hasEmpresaAccess = userEmpresasVinculadas.includes(reqEmpresaId);
        const userGroupId = user?.group_id || null;
        if (!hasEmpresaAccess && (!reqGroupId || !userGroupId || reqGroupId !== userGroupId)) {
          allowed = false;
          try {
            await base44.asServiceRole.entities.AuditLog.create({
              usuario: user.full_name || user.email || 'Usuário',
              usuario_id: user.id,
              acao: 'Bloqueio',
              modulo: moduleName,
              tipo_auditoria: 'seguranca',
              entidade: targetEntity || moduleName,
              descricao: `RLS: acesso negado ao escopo empresa ${reqEmpresaId} por usuário de empresa ${user.empresa_id}`,
              empresa_id: reqEmpresaId,
              group_id: reqGroupId,
              data_hora: new Date().toISOString(),
            });
          } catch (rlsErr) { console.error('RLS audit log falhou:', rlsErr); }
        }
      }
    }

    // === Vol 2.2: Validação de contexto multiempresa baseada em classificação de dados ===
    if (allowed && ['criar', 'editar', 'excluir'].includes(desired) && targetEntity) {
      const ctxCheck = validateMultiempresaContext(targetEntity, body, user, desired);
      if (!ctxCheck.valid) {
        allowed = false;
        try {
          await base44.asServiceRole.entities.AuditLog.create({
            usuario: user.full_name || user.email || 'Usuário',
            usuario_id: user.id,
            acao: 'Bloqueio',
            modulo: moduleName,
            tipo_auditoria: 'seguranca',
            entidade: targetEntity,
            descricao: `Multiempresa: ${ctxCheck.reason} (${ctxCheck.classification})`,
            empresa_id: body?.empresa_id || null,
            group_id: body?.group_id || null,
            data_hora: new Date().toISOString(),
          });
        } catch {}
      }
    }

    __DECISION_CACHE.set(decisionKey, { allowed, ts: Date.now() });
    if (__DECISION_CACHE.size > 1000) {
      const oldest = __DECISION_CACHE.keys().next().value;
      __DECISION_CACHE.delete(oldest);
    }
    return Response.json({ allowed });

  } catch (err) {
    const status = err?.status || err?.response?.status;
    if (status === 429 || status === 502 || (typeof status === 'number' && status >= 500)) {
      __BACKEND_PAUSED_UNTIL = Date.now() + 120000;
      globalThis.__egBackendPausedUntil = __BACKEND_PAUSED_UNTIL;
    }
    // Fail-closed para escrita em exceções; fail-open apenas para leitura
    const fallbackAction = normalize(body?.action || 'visualizar');
    const isRead = READ_ONLY_ACTIONS.includes(fallbackAction);
    return Response.json({ allowed: isRead, _fallback: true });
  }
});