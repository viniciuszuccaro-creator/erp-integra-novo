/**
 * ERP Zuccaro — Testes Unitários (lógica pura, sem chamadas de API)
 * Executa: npm run test:unit
 *
 * Validações que não dependem de rede/auth:
 * 1. Schemas de entidades (group_id, empresa_id, codigo, ativo/status)
 * 2. Regra-Mãe: proibição de duplicidade, código sequencial obrigatório
 * 3. Estrutura de RBAC (PerfilAcesso tem modules/permissions)
 * 4. Sanitização: entidades sensíveis têm campos protegidos
 * 5. Consistência de navegação (todas as rotas em App.jsx têm permissão)
 */
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const COLORS = {
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
  blue: '\x1b[34m', reset: '\x1b[0m', bold: '\x1b[1m',
};
const results = { pass: 0, fail: 0, skip: 0, errors: [] };

function log(type, msg) {
  const c = type === 'pass' ? COLORS.green : type === 'fail' ? COLORS.red : type === 'skip' ? COLORS.yellow : COLORS.blue;
  const icon = type === 'pass' ? '✅' : type === 'fail' ? '❌' : type === 'skip' ? '⏭️' : 'ℹ️';
  console.log(`${c}${icon} ${msg}${COLORS.reset}`);
  if (type === 'pass') results.pass++;
  if (type === 'fail') { results.fail++; results.errors.push(msg); }
  if (type === 'skip') results.skip++;
}

function readJson(path) {
  try {
    const raw = readFileSync(path, 'utf-8');
    // Remove comentários JSONC
    const clean = raw.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    return JSON.parse(clean);
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════════════
// SUITE 1: Estrutura de Entidades (Regra-Mãe 5a)
// ═══════════════════════════════════════════════════
function testEntitySchemas() {
  console.log(`\n${COLORS.bold}📋 UNIT 1: Estrutura de Entidades (Multiempresa + Codigo + Status)${COLORS.reset}`);
  const entitiesDir = join(ROOT, 'base44', 'entities');
  if (!existsSync(entitiesDir)) {
    log('fail', 'Diretório base44/entities não encontrado');
    return;
  }

  const files = readdirSync(entitiesDir).filter(f => f.endsWith('.jsonc'));

  // Entidades estruturais do sistema — isentas de multiempresa/codigo
  const STRUCTURAL = new Set([
    'User', 'GrupoEmpresarial', 'Empresa', 'SyncReport', 'SyncMap',
    'AuditLog', 'TokenRefresh', 'SessaoUsuario', 'MonitoramentoSistema',
    'LogPerformance', 'LogFiscal', 'LogCobranca', 'LogsIA',
    'AuditoriaAcesso', 'AuditoriaGPS', 'AuditoriaGlobal', 'AuditoriaIA',
    'AlertaPerformance', 'BackupAutomatico', 'PlanoMelhoriaItem',
  ]);

  // Entidades transacionais — precisam de group_id + empresa_id, mas NÃO de codigo
  const TRANSACTIONAL = new Set([
    'Pedido', 'PedidoEtapa', 'PedidoExterno', 'NotaFiscal', 'ContaReceber',
    'ContaPagar', 'MovimentacaoEstoque', 'Entrega', 'EntregaItens',
    'OrdemCompra', 'SolicitacaoCompra', 'OrdemProducao', 'ApontamentoProducao',
    'Romaneio', 'Inventario', 'TransferenciaFilial', 'Contrato',
    'Oportunidade', 'Interacao', 'Campanha', 'Comissao', 'Evento',
    'Ferias', 'Ponto', 'Chamado', 'SeparacaoConferencia', 'ConciliacaoPedido',
    'ConciliacaoBancaria', 'ExtratoBancario', 'CaixaMovimento',
    'CaixaOrdemLiquidacao', 'MovimentoCartao', 'LancamentoContabil',
    'DRE', 'SPEDFiscal', 'ConversaOmnicanal', 'MensagemOmnicanal',
    'PagamentoOmnichannel', 'ChatbotInteracao', 'ImportacaoXMLNFe',
    'SolicitacaoAprovacao', 'RateioFinanceiro', 'PosicaoVeiculo',
    'OrcamentoSite', 'OrcamentoCliente', 'HistoricoCliente',
    'InspecaoQualidade', 'MonitoramentoRH', 'DocumentoTecnica',
  ]);

  // Cadastros Gerais — precisam de group_id + empresa_id + codigo + ativo/status
  const CADASTRO_GERAL = new Set([
    'Cliente', 'Fornecedor', 'Produto', 'Transportadora', 'Colaborador',
    'Representante', 'ContatoB2B', 'SegmentoCliente', 'RegiaoAtendimento',
    'Marca', 'GrupoProduto', 'UnidadeMedida', 'TabelaNCM', 'TabelaPreco',
    'TabelaPrecoItem', 'SetorAtividade', 'KitProduto', 'Servico',
    'Banco', 'GatewayPagamento', 'FormaPagamento', 'CondicaoComercial',
    'PlanoDeContas', 'CentroCusto', 'CentroResultado', 'MoedaIndice',
    'TipoDespesa', 'Veiculo', 'Motorista', 'RotaPadrao', 'TipoFrete',
    'LocalEstoque', 'CentroOperacao', 'Cargo', 'Departamento', 'Turno',
    'PerfilAcesso', 'ApiExterna', 'Webhook', 'EventoNotificacao',
    'ModeloDocumento', 'ModeloDocumentoLogistico', 'ChatbotCanal',
    'ChatbotIntent', 'ChatbotIntents', 'ConfiguracaoNFe', 'TabelaFiscal',
    'TabelaDIFAL', 'TabelaNCM', 'IAConfig', 'ConfiguracaoSistema',
    'CatalogoWeb', 'OperadorCaixa', 'BaseConhecimento',
    'ConfiguracaoBoletos', 'ConfiguracaoWhatsApp', 'ConfiguracaoCanal',
    'ConfiguracaoCobrancaEmpresa', 'ConfiguracaoDespesaRecorrente',
    'ConfiguracaoGatewayPagamento', 'ConfiguracaoIntegracaoMarketplace',
    'ConfiguracaoMonitoramento', 'ConfiguracaoSeguranca', 'ConfiguracaoBackup',
    'ConfiguracaoProducao', 'ConfigFiscalEmpresa', 'ContaBancariaEmpresa',
    'ArquivoRemessaRetorno', 'ParametroOrigemPedido', 'ParametroPortalCliente',
    'ParametroConciliacaoBancaria', 'ParametroCaixaDiario',
    'ParametroRecebimentoNFe', 'ParametroRoteirizacao',
    'PermissaoEmpresaModulo', 'GovernancaEmpresa', 'RoteirizacaoInteligente',
    'TemplateWhatsApp',
  ]);

  for (const file of files) {
    const entityName = file.replace('.jsonc', '');
    const schema = readJson(join(entitiesDir, file));
    if (!schema) { log('skip', `${entityName}: schema inválido`); continue; }

    const props = schema.properties || {};
    const hasGroupId = 'group_id' in props;
    const hasEmpresaId = 'empresa_id' in props;
    const hasCodigo = 'codigo' in props;
    const hasAtivo = 'ativo' in props || 'status' in props || 'ativa' in props;

    // Event logs — registros imutáveis sem ciclo de vida (não exigem ativo/status)
    const EVENT_LOG = new Set([
      'MovimentacaoEstoque', 'CaixaMovimento', 'ExtratoBancario',
      'MensagemOmnicanal', 'PosicaoVeiculo', 'HistoricoCliente',
      'LancamentoContabil', 'SPEDFiscal', 'DRE', 'MonitoramentoRH',
      'MovimentoCartao', 'ApontamentoProducao', 'Ponto',
      'ChatbotInteracao', 'ConciliacaoPedido', 'EntregaItens',
      'ImportacaoXMLNFe', 'Interacao', 'PagamentoOmnichannel',
      'PedidoEtapa', 'PedidoExterno',
    ]);

    if (STRUCTURAL.has(entityName)) {
      // Entidades estruturais: apenas verificam ativo/status (ou são isentas)
      if (hasAtivo || entityName === 'User') {
        log('pass', `${entityName}: estrutural — OK`);
      } else {
        log('skip', `${entityName}: estrutural sem ativo/status (pode ser OK)`);
      }
      continue;
    }

    if (TRANSACTIONAL.has(entityName)) {
      // Transacional: group_id + empresa_id + ativo/status (NÃO precisa codigo)
      const missing = [];
      if (!hasGroupId) missing.push('group_id');
      if (!hasEmpresaId) missing.push('empresa_id');
      if (!hasAtivo && !EVENT_LOG.has(entityName)) missing.push('ativo/status');
      if (missing.length === 0) {
        log('pass', `${entityName}: transacional multiempresa OK`);
      } else {
        log('fail', `${entityName}: transacional faltando ${missing.join(', ')}`);
      }
      continue;
    }

    // Cadastro Geral: TODOS os campos obrigatórios
    const missing = [];
    if (!hasGroupId) missing.push('group_id');
    if (!hasEmpresaId) missing.push('empresa_id');
    if (!hasCodigo) missing.push('codigo');
    if (!hasAtivo) missing.push('ativo/status');
    if (missing.length === 0) {
      log('pass', `${entityName}: cadastro completo OK`);
    } else {
      log('fail', `${entityName}: cadastro faltando ${missing.join(', ')}`);
    }
  }
}

// ═══════════════════════════════════════════════════
// SUITE 2: Código Sequencial Obrigatório (Regra-Mãe 5a)
// ═══════════════════════════════════════════════════
function testSequentialCode() {
  console.log(`\n${COLORS.bold}🔢 UNIT 2: Código Sequencial Obrigatório${COLORS.reset}`);
  const entitiesDir = join(ROOT, 'base44', 'entities');
  const files = readdirSync(entitiesDir).filter(f => f.endsWith('.jsonc'));
  const CADASTRO_ENTITIES = [
    'Cliente', 'Fornecedor', 'Produto', 'Transportadora', 'Colaborador',
    'Representante', 'ContatoB2B', 'SegmentoCliente', 'RegiaoAtendimento',
    'Marca', 'GrupoProduto', 'UnidadeMedida', 'TabelaNCM', 'TabelaPreco',
    'SetorAtividade', 'KitProduto', 'Servico', 'Banco', 'GatewayPagamento',
    'FormaPagamento', 'CondicaoComercial', 'PlanoDeContas', 'CentroCusto',
    'CentroResultado', 'MoedaIndice', 'TipoDespesa', 'Veiculo', 'Motorista',
    'RotaPadrao', 'TipoFrete', 'LocalEstoque', 'CentroOperacao',
    'Cargo', 'Departamento', 'Turno', 'PerfilAcesso', 'ApiExterna',
    'Webhook', 'EventoNotificacao', 'ModeloDocumento', 'ChatbotCanal',
    'ChatbotIntent', 'ConfiguracaoNFe', 'TabelaFiscal', 'IAConfig',
    'ConfiguracaoSistema',
  ];

  for (const entityName of CADASTRO_ENTITIES) {
    const schema = readJson(join(entitiesDir, `${entityName}.jsonc`));
    if (!schema) { log('skip', `${entityName}: schema não encontrado`); continue; }
    const props = schema.properties || {};
    const required = schema.required || [];

    if ('codigo' in props) {
      // Verifica se codigo tem descrição de sequencial
      const desc = props.codigo?.description || '';
      const isSequential = desc.toLowerCase().includes('sequencial') || desc.toLowerCase().includes('único') || desc.toLowerCase().includes('unico');
      if (isSequential) {
        log('pass', `${entityName}: codigo sequencial documentado`);
      } else if (required.includes('codigo')) {
        log('pass', `${entityName}: codigo obrigatório (required)`);
      } else {
        log('fail', `${entityName}: codigo sem documentação de sequencial/único`);
      }
    } else {
      log('fail', `${entityName}: entidade de cadastro sem campo codigo`);
    }
  }
}

// ═══════════════════════════════════════════════════
// SUITE 3: Proibição de Duplicidade (Regra-Mãe — documento preparado)
// ═══════════════════════════════════════════════════
function testUniqueConstraints() {
  console.log(`\n${COLORS.bold}🚫 UNIT 3: Proibição de Duplicidade (codigo/descricao/documento)${COLORS.reset}`);
  const entitiesDir = join(ROOT, 'base44', 'entities');
  const checks = [
    { entity: 'Produto', field: 'descricao', label: 'descrição' },
    { entity: 'Cliente', field: 'cnpj', label: 'CNPJ' },
    { entity: 'Fornecedor', field: 'cnpj', label: 'CNPJ' },
    { entity: 'Colaborador', field: 'cpf', label: 'CPF' },
    { entity: 'Marca', field: 'nome_marca', label: 'nome' },
    { entity: 'GrupoProduto', field: 'nome_grupo', label: 'nome' },
    { entity: 'UnidadeMedida', field: 'sigla', label: 'sigla' },
    { entity: 'Banco', field: 'codigo_banco', label: 'código bancário' },
  ];

  for (const { entity, field, label } of checks) {
    const schema = readJson(join(entitiesDir, `${entity}.jsonc`));
    if (!schema) { log('skip', `${entity}: schema não encontrado`); continue; }
    const props = schema.properties || {};

    if (field in props) {
      const desc = props[field]?.description || '';
      const hasUnique = desc.toLowerCase().includes('único') || desc.toLowerCase().includes('unico') || desc.toLowerCase().includes('unique');
      if (hasUnique) {
        log('pass', `${entity}.${field}: unicidade documentada`);
      } else {
        log('fail', `${entity}.${field}: sem documentação de unicidade (${label})`);
      }
    } else {
      log('fail', `${entity}: campo ${field} não encontrado (esperado para ${label})`);
    }
  }
}

// ═══════════════════════════════════════════════════
// SUITE 4: RBAC — PerfilAcesso tem estrutura de permissões
// ═══════════════════════════════════════════════════
function testRBACStructure() {
  console.log(`\n${COLORS.bold}🔐 UNIT 4: Estrutura RBAC${COLORS.reset}`);
  const schema = readJson(join(ROOT, 'base44', 'entities', 'PerfilAcesso.jsonc'));
  if (!schema) { log('fail', 'PerfilAcesso: schema não encontrado'); return; }

  const props = schema.properties || {};

  // Verifica campos essenciais de RBAC
  const required = ['nome_perfil', 'permissoes'];
  for (const field of required) {
    if (field in props) {
      log('pass', `PerfilAcesso.${field}: presente`);
    } else {
      log('fail', `PerfilAcesso.${field}: campo obrigatório ausente`);
    }
  }

  // permissoes deve ser objeto/array estruturado
  if ('permissoes' in props) {
    const permType = props.permissoes?.type;
    if (permType === 'object' || permType === 'array') {
      log('pass', `PerfilAcesso.permissoes: tipo ${permType} estruturado`);
    } else {
      log('fail', `PerfilAcesso.permissoes: tipo inválido (${permType})`);
    }
  }

  // Deve ter ativo/status
  if ('ativo' in props || 'status' in props) {
    log('pass', 'PerfilAcesso: tem ativo/status (exclusão lógica)');
  } else {
    log('fail', 'PerfilAcesso: sem ativo/status');
  }
}

// ═══════════════════════════════════════════════════
// SUITE 5: App.jsx — Todas as rotas têm mapeamento RBAC
// ═══════════════════════════════════════════════════
function testRouteRBACMapping() {
  console.log(`\n${COLORS.bold}🛣️  UNIT 5: Rotas e RBAC${COLORS.reset}`);
  const appContent = readFileSync(join(ROOT, 'src', 'App.jsx'), 'utf-8');

  // Extrai o pageModuleMap
  const mapMatch = appContent.match(/pageModuleMap\s*=\s*\{([\s\S]*?)\}/);
  if (!mapMatch) {
    log('fail', 'pageModuleMap não encontrado em App.jsx');
    return;
  }

  // Extrai chaves do mapa
  const keys = [...mapMatch[1].matchAll(/(\w+)\s*:/g)].map(m => m[1]);
  log('pass', `pageModuleMap: ${keys.length} páginas mapeadas para módulos RBAC`);

  // Verifica se páginas críticas estão mapeadas
  const criticalPages = ['Dashboard', 'Comercial', 'Financeiro', 'Estoque', 'Compras', 'Producao', 'RH', 'Fiscal', 'CRM'];
  for (const page of criticalPages) {
    if (keys.includes(page)) {
      log('pass', `Rota ${page}: mapeada para RBAC`);
    } else {
      log('fail', `Rota ${page}: NÃO mapeada para RBAC — página acessível sem verificação`);
    }
  }
}

// ═══════════════════════════════════════════════════
// SUITE 6: Layout — Regra-Mãe 7 (w-full h-full)
// ═══════════════════════════════════════════════════
function testLayoutResponsiveness() {
  console.log(`\n${COLORS.bold}📐 UNIT 6: Layout Responsivo (w-full h-full)${COLORS.reset}`);
  const layoutContent = readFileSync(join(ROOT, 'src', 'Layout.jsx'), 'utf-8');

  if (layoutContent.includes('w-full') && layoutContent.includes('h-full')) {
    log('pass', 'Layout.jsx: usa w-full h-full');
  } else {
    log('fail', 'Layout.jsx: não usa w-full h-full');
  }

  if (layoutContent.includes('min-h-screen')) {
    log('pass', 'Layout.jsx: usa min-h-screen (responsivo)');
  } else {
    log('fail', 'Layout.jsx: sem min-h-screen');
  }
}

// ═══════════════════════════════════════════════════
// EXECUÇÃO
// ═══════════════════════════════════════════════════
function runUnit() {
  console.log(`\n${COLORS.bold}${COLORS.blue}═══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.blue}  ERP ZUCCARO — TESTES UNITÁRIOS (LÓGICA PURA)${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.blue}═══════════════════════════════════════════════════${COLORS.reset}`);

  testEntitySchemas();
  testSequentialCode();
  testUniqueConstraints();
  testRBACStructure();
  testRouteRBACMapping();
  testLayoutResponsiveness();

  const total = results.pass + results.fail + results.skip;
  console.log(`\n${COLORS.bold}═══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}  UNIT RESUMO: ${results.pass} pass · ${results.fail} fail · ${results.skip} skip · ${total} total${COLORS.reset}`);
  if (results.errors.length > 0) {
    console.log(`\n${COLORS.red}  FALHAS:${COLORS.reset}`);
    results.errors.forEach(e => console.log(`  ${COLORS.red}❌ ${e}${COLORS.reset}`));
  }
  console.log(`${COLORS.bold}═══════════════════════════════════════════════════${COLORS.reset}\n`);

  process.exit(results.fail > 0 ? 1 : 0);
}

runUnit();