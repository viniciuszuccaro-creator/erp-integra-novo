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
import { criarFonteConversao, carregarCentral360 } from './central360Fixtures.mjs';
import testDerivacaoOrcamento from './derivacaoOrcamento.test.mjs';

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

// Cenários puros da Central 360°: sem backend e sem simular homologação E2E.
async function testCentral360() {
  const source = readFileSync(join(ROOT, 'src/components/comercial/central-vendas-360/negociacaoUtils.jsx'), 'utf-8');
  const central = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  const check = (nome, resultado) => log(resultado ? 'pass' : 'fail', `Central 360: ${nome}`);
  const base = { id: 'exemplo', status: 'Pendente', data_validade: '2999-01-01', itens: [] };
  check('orçamento pendente válido em Abertos', central.orcamentoParaNegociacao(base).grupo === 'aberto');
  const vencido = central.orcamentoParaNegociacao({ ...base, data_validade: '2000-01-01' });
  check('vencido não é cancelado e permite revalidar', vencido.grupo === 'encerrado' && vencido.editavel);
  check('expirado mantém histórico separado', central.orcamentoParaNegociacao({ ...base, status: 'Expirado' }).grupo === 'encerrado');
  check('rejeitado não vira cancelamento', central.orcamentoParaNegociacao({ ...base, status: 'Rejeitado' }).grupo === 'encerrado');
  check('entregue separado de convertido', central.pedidoParaNegociacao({ id: 'p', status: 'Entregue' }).grupo === 'entregue');
  const misto = central.pedidoParaNegociacao({ id: 'p', itens_revenda: [{ quantidade: 2, valor_unitario: 5 }], itens_armado_padrao: [{ quantidade: 3, valor_unitario: 7 }], itens_corte_dobra: [{ quantidade: 1, valor_unitario: 9 }] });
  check('pedido misto preserva revenda e fabricação na leitura', misto.itens.map((i) => i.tipo).join(',') === 'revenda,fabricacao,fabricacao');
  check('normalização não inventa total em item gratuito', central.orcamentoParaNegociacao({ ...base, itens: [{ quantidade: 2, valor_unitario: 10, valor_total: 0 }] }).itens[0].valor_total === 0);
  check('totalização considera desconto', central.totalizarItens([{ quantidade: 2, valor_unitario: 10, desconto_percentual: 10 }]).total === 18);
  const tabela = readFileSync(join(ROOT, 'src/components/comercial/central-vendas-360/TabelaNegociacoes.jsx'), 'utf-8');
  const labels = [...tabela.match(/const COLUNAS = \[([\s\S]*?)\];/)[1].matchAll(/label: '([^']+)'/g)].map((m) => m[1]);
  check('12 colunas na ordem literal do dossiê', labels.join('|') === 'Nº Orçamento|Data|Cod Cliente|Nome Cliente|Origem|Nome Vendedor|Peso|Valor|Cidade|Condição Pagamento|Situação|Prazo');
}

// Consulta real do código de saldos com fontes controladas, sem alterar banco real.
async function testSaldosPedido() {
  const carregar = (path) => readFileSync(join(ROOT, path), 'utf-8');
  const url = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
  const calculoUrl = url(carregar('base44/functions/onEntregaUpdated/saldosCalculo.ts'));
  const comprovanteUrl = url(carregar('base44/functions/onEntregaUpdated/comprovante.ts'));
  const calc = await import(calculoUrl);
  const handlerSource = carregar('base44/functions/onEntregaUpdated/saldos.ts').replace("'./saldosCalculo.ts'", JSON.stringify(calculoUrl)).replace("'./comprovante.ts'", JSON.stringify(comprovanteUrl));
  const { consultarSaldosPedido } = await import(url(handlerSource));
  const check = (nome, ok) => log(ok ? 'pass' : 'fail', `Saldos por item: ${nome}`);
  const pedido = { id: '111111111111111111111111', group_id: '222222222222222222222222', empresa_id: '333333333333333333333333', updated_date: 'v1', itens_revenda: [{ produto_id: 'p', quantidade: 10, quantidade_faturada: 3, unidade: 'UN' }], itens_armado_padrao: [{ produto_id: 'fab', quantidade: 8, unidade: 'PC' }] };
  const permissoes = { separacao: true, producao: true, entregas: true, fiscal: true };
  const fontes = {
    entregas: [{ id: 'e1', status: 'Entregue', tipo_frete: 'CIF' }, { id: 'e2', status: 'Entregue', tipo_frete: 'Retira' }, { id: 'e3', status: 'Cancelado' }],
    itensEntrega: [{ entrega_id: 'e1', pedido_item_id: 'revenda-0', quantidade: 4, unidade: 'UN' }, { entrega_id: 'e2', pedido_item_id: 'revenda-0', quantidade: 2 }, { entrega_id: 'e3', pedido_item_id: 'revenda-0', quantidade: 50 }],
    separacoes: [{ status: 'concluido', tipo: 'separacao', itens: [{ item_pedido_id: 'revenda-0', quantidade_separada: 6 }] }, { status: 'concluido', tipo: 'conferencia', itens: [{ item_pedido_id: 'revenda-0', quantidade_separada: 6, quantidade_conferida: 5 }] }],
    ops: [{ status: 'Concluída', itens_vinculados: [{ pedido_id: pedido.id, item_id: 'armado-0', quantidade: 3, unidade: 'PC' }] }],
  };
  const resultado = calc.calcularSaldosPedido(pedido, fontes, permissoes);
  check('entrega e retirada parciais preservam saldo', resultado[0].entregue === 4 && resultado[0].retirada === 2 && resultado[0].saldo_atender === 4);
  check('cancelamento não soma quantidade', !resultado[0].divergencia);
  check('faturamento usa quantidade oficial e saldo próprio', resultado[0].faturada === 3 && resultado[0].saldo_faturar === 7);
  check('separação não duplica conferência', resultado[0].separada === 6 && resultado[0].conferida === 5);
  check('produção parcial preserva grupo de fabricação', resultado[1].produzida === 3 && resultado[0].produzida === null);
  check('quantidade faturada ausente não é inventada', resultado[1].faturada === null && resultado[1].saldo_faturar === null);
  const legado = calc.calcularSaldosPedido(pedido, { entregas: [{ id: 'legado', status: 'Entregue' }] }, permissoes);
  check('entrega legada sem itens não prova saldo zero', legado[0].entregue === null && legado[0].saldo_atender === null);
  const duplicado = { ...pedido, itens_revenda: [...pedido.itens_revenda, { ...pedido.itens_revenda[0] }] };
  check('produto repetido exige identidade de item', calc.resolverItem(calc.itensCanonicos(duplicado), { produto_id: 'p' }) === null);
  check('referência explícita errada não usa fallback por produto', calc.resolverItem(calc.itensCanonicos(pedido), { pedido_item_id: 'inexistente', produto_id: 'p' }) === null);
  check('unidades incompatíveis não são somadas', calc.resolverItem(calc.itensCanonicos(pedido), { pedido_item_id: 'revenda-0', unidade: 'KG' }) === null);
  const excesso = calc.calcularSaldosPedido({ ...pedido, itens_revenda: [{ ...pedido.itens_revenda[0], quantidade_faturada: 20 }] }, {}, permissoes);
  check('sobrefaturamento é sinalizado, não ocultado', excesso[0].divergencia && excesso[0].faturada === 20);
  const parcial = calc.calcularSaldosPedido(pedido, { ops: [{ status: 'Em Corte', progresso_fisico_kg: 10, itens_vinculados: [{ item_id: 'armado-0', quantidade: 8 }] }] }, permissoes);
  check('progresso em KG não vira peças produzidas', parcial[1].produzida === null);
  const oculto = calc.calcularSaldosPedido(pedido, fontes, {});
  check('RBAC oculta todos os dados de domínios não autorizados', oculto.every((i) => ['separada', 'conferida', 'produzida', 'entregue', 'retirada', 'faturada', 'saldo_atender', 'saldo_faturar'].every((k) => i[k] === null)));
  const chamadas = [];
  const entidade = (nome, pagina) => ({ filter: async (filtro, opcoes) => { chamadas.push({ nome, filtro, opcoes }); return pagina(filtro, opcoes); } });
  const entidades = {
    AuditLog: { create: async () => ({}) },
    Empresa: entidade('Empresa', (f) => ({ items: f.id === pedido.empresa_id && f.group_id === pedido.group_id ? [{ id: pedido.empresa_id }] : [] })),
    Pedido: entidade('Pedido', (f) => ({ items: f.id === pedido.id && f.group_id === pedido.group_id && f.empresa_id === pedido.empresa_id ? [pedido] : [] })),
    SeparacaoConferencia: entidade('SeparacaoConferencia', () => ({ items: [] })), OrdemProducao: entidade('OrdemProducao', () => ({ items: [] })),
    Entrega: entidade('Entrega', (f, o) => o.cursor ? ({ items: [fontes.entregas[1]], has_more: false }) : ({ items: [fontes.entregas[0]], has_more: true, next_cursor: 'pagina2' })),
    EntregaItens: entidade('EntregaItens', () => ({ items: fontes.itensEntrega.slice(0, 2) })),
  };
  const sdk = { asServiceRole: { entities: entidades } };
  const body = { pedido_id: pedido.id, group_id: pedido.group_id, empresa_id: pedido.empresa_id };
  const admin = { user: { id: 'admin', role: 'admin' } };
  const resp = await consultarSaldosPedido(sdk, admin, body); const dados = await resp.json();
  check('endpoint percorre páginas do pedido sem truncamento', resp.status === 200 && dados.itens[0].saldo_atender === 4 && chamadas.some((c) => c.opcoes.cursor === 'pagina2'));
  check('todas as consultas levam grupo e empresa explícitos', chamadas.every((c) => c.filtro.group_id === pedido.group_id && (c.nome === 'Empresa' || c.filtro.empresa_id === pedido.empresa_id)));
  const outra = await consultarSaldosPedido(sdk, admin, { ...body, empresa_id: '444444444444444444444444' });
  check('pedido de outra empresa é rejeitado', outra.status === 404);
  const usuario = { user: { id: 'v', role: 'user', empresas_vinculadas: [pedido.empresa_id] }, perfil: { ativo: true, permissoes: { Comercial: { Pedidos: ['ver'] } } } };
  chamadas.length = 0;
  const restrito = await consultarSaldosPedido(sdk, usuario, body); const restritos = await restrito.json();
  check('sem permissão de domínio não consulta fontes restritas', restrito.status === 200 && chamadas.every((c) => ['Empresa', 'Pedido'].includes(c.nome)) && restritos.itens[0].faturada === null);
  const semVinculo = await consultarSaldosPedido(sdk, { ...usuario, user: { ...usuario.user, empresas_vinculadas: [] } }, body);
  check('empresa sem vínculo protegido é bloqueada', semVinculo.status === 403);
  const semPerfil = await consultarSaldosPedido(sdk, { user: usuario.user }, body);
  check('usuário sem permissão não consulta pedido', semPerfil.status === 403);
  const invalido = await consultarSaldosPedido(sdk, admin, { ...body, group_id: { $ne: null } });
  check('contexto malicioso não chega ao filtro', invalido.status === 400);
  const proprio = await consultarSaldosPedido(sdk, { ...usuario, user: { ...usuario.user, restricoes_adicionais: { pode_ver_apenas_proprios_registros: true } } }, body);
  check('restrição de carteira impede pedido de outro responsável', proprio.status === 403);
  const bloqueado = await consultarSaldosPedido(sdk, { ...admin, user: { ...admin.user, bloqueado: true } }, body);
  check('usuário bloqueado não ganha exceção administrativa', bloqueado.status === 403);
}

// ═══════════════════════════════════════════════════
// EXECUÇÃO
// ═══════════════════════════════════════════════════
// Conversão executa o código de produção com fontes controladas; não é homologação E2E.
async function testConversaoPedido() {
  const ler = (p) => readFileSync(join(ROOT, p), 'utf-8');
  const url = (s) => `data:text/javascript;base64,${Buffer.from(s).toString('base64')}`;
  const { montarPedidoConversao, converterPedido, reservarNumeroPedido, endpoint } = await carregarCentral360(ROOT);
  const check = (nome, ok) => log(ok ? 'pass' : 'fail', `Conversão 360: ${nome}`);
  const clone = (v) => JSON.parse(JSON.stringify(v));
  const base = { id: '111111111111111111111111', group_id: '222222222222222222222222', empresa_id: '333333333333333333333333', cliente_id: '444444444444444444444444', cliente_nome: 'Cliente de teste', numero_orcamento: 'ORC-0001', status: 'Aprovado', updated_date: 'v1', condicoes_pagamento: 'À Vista', data_validade: '2999-01-01', prazo_entrega: '7 dias úteis', valor_total: 78, itens: [{ produto_id: '555555555555555555555555', descricao: 'Revenda', tipo: 'revenda', quantidade: 2, valor_unitario: 10, desconto_percentual: 10, valor_total: 18 }, { produto_id: '666666666666666666666666', descricao: 'Fabricação', tipo: 'fabricacao', quantidade: 3, valor_unitario: 20, valor_total: 60 }] };
  const user = { id: '777777777777777777777777', role: 'admin', full_name: 'Operador de teste' };
  const ctx = { user };
  const op = '11111111-1111-4111-8111-111111111111';
  const form = montarPedidoConversao(base, user, 'producao');
  const entrada = { acao: 'converter', orcamento_id: base.id, group_id: base.group_id, empresa_id: base.empresa_id, versao: 'v1', operacao_id: op, revisado: true, destino: 'producao', formulario: form };
  const criarFonte = criarFonteConversao({ converterPedido, base, user, entrada });
  check('itens de revenda e fabricação preservados e faturados em zero', form.itens_revenda.length === 1 && form.itens_armado_padrao.length === 1 && form.itens_revenda[0].quantidade_faturada === 0);
  check('total recalculado e desconto individual não é aplicado duas vezes', form.valor_total === 78 && form.itens_revenda[0].valor_total === 18 && form.desconto_geral_pedido_valor === 0);
  const totaisFonte = await import(url(ler('src/components/comercial/pedido/utils/computePedidoTotais.jsx')));
  check('formulário apresenta o mesmo total que o servidor', totaisFonte.computePedidoTotais(form).valor_total === 78);
  for (const [nome, alterar] of [
    ['cliente malicioso', (f) => { f.cliente_id = 'outro'; }], ['empresa maliciosa', (f) => { f.empresa_id = 'outra'; }],
    ['grupo malicioso', (f) => { f.group_id = 'outro'; }], ['preço alterado', (f) => { f.itens_revenda[0].valor_unitario = 1; }],
    ['quantidade alterada', (f) => { f.itens_revenda[0].quantidade = 1; }], ['desconto alterado', (f) => { f.itens_revenda[0].desconto_percentual = 0; }],
    ['frete que altera crédito aprovado', (f) => { f.valor_frete = 100; }], ['pagamento alterado', (f) => { f.forma_pagamento = 'Boleto'; }],
    ['tipo de fabricação convertido em revenda', (f) => { f.itens_revenda.push(...f.itens_armado_padrao); f.itens_armado_padrao = []; }],
  ]) {
    let bloqueou = false;
    try { const f = clone(form); alterar(f); montarPedidoConversao(base, user, 'producao', f); } catch { bloqueou = true; }
    check(`bloqueia ${nome}`, bloqueou);
  }
  const fabricacaoRetira = montarPedidoConversao(base, user, 'retira');
  check('retirada preserva fabricação e aguarda aprovação sem antecipar execução', fabricacaoRetira.itens_armado_padrao.length === 1 && fabricacaoRetira.tipo_frete === 'Retirada' && fabricacaoRetira.status === 'Aguardando Aprovação');
  const fHtml = { ...clone(form), observacoes_internas: '<b>Observação</b> javascript:teste' };
  check('texto não confiável é sanitizado', montarPedidoConversao(base, user, 'producao', fHtml).observacoes_internas === 'Observação teste');
  const caso = criarFonte();
  const resposta = await caso.executar();
  const sucesso = await resposta.json();
  check('converte no servidor e vincula as duas pontas', resposta.status === 200 && caso.estado.pedidos.length === 1 && caso.estado.orcamento.pedido_gerado_id === sucesso.pedido.id && caso.estado.orcamento.status === 'Convertido');
  check('pedido aguarda aprovação sem faturamento nem estoque artificial', sucesso.pedido.status === 'Aguardando Aprovação' && sucesso.pedido.valor_faturado === 0);
  check('número reservado no servidor e estado durável concluído', sucesso.pedido.numero_pedido === 'PED-000001' && caso.estado.orcamento.conversao_pedido.fase === 'concluida');
  check('validação de fechamento executada antes de criar', caso.estado.validacoes === 1);
  check('auditoria inclui antes/depois e ambos os contextos', caso.estado.logs.length >= 3 && caso.estado.logs.every((l) => l.group_id === base.group_id && l.empresa_id === base.empresa_id));
  const repetida = await (await caso.executar()).json();
  check('reenvio devolve pedido existente sem segunda criação', repetida.repetida === true && caso.estado.posts === 1);
  const concorrente = criarFonte();
  const versaoOriginal = clone(concorrente.estado.orcamento);
  const respostas = await Promise.all([concorrente.executar(entrada, versaoOriginal), concorrente.executar(entrada, versaoOriginal)]);
  check('duas confirmações concorrentes criam no máximo um pedido', concorrente.estado.posts === 1 && respostas.some((r) => r.status === 409));
  const perdido = criarFonte({ perderResposta: true });
  check('resposta perdida marca revisão sem declarar sucesso', (await perdido.executar()).status === 409 && perdido.estado.orcamento.conversao_pedido.fase === 'revisao');
  const recuperado = await (await perdido.executar()).json();
  check('pedido criado antes da falha é conciliado sem outro POST', recuperado.ok && perdido.estado.posts === 1 && perdido.estado.orcamento.status === 'Convertido');
  const incerto = criarFonte({ falharSemCriar: true });
  await incerto.executar(); await incerto.executar();
  check('resultado incerto sem vínculo não dispara criação automática', incerto.estado.posts === 1 && incerto.estado.pedidos.length === 0);
  const anteriorPost = criarFonte({ falharNumero: true });
  await anteriorPost.executar();
  check('falha anterior ao POST permite retomada segura', anteriorPost.estado.posts === 0 && anteriorPost.estado.orcamento.conversao_pedido.fase === 'preparada' && (await anteriorPost.executar()).status === 200);
  const interrompida = criarFonte();
  interrompida.estado.orcamento.conversao_pedido = { operacao_id: op, token: 'token-anterior', fase: 'preparando', destino: 'producao', versao_origem: 'v1', iniciada_em: '2000-01-01T00:00:00.000Z' };
  check('preparação interrompida antes do POST pode ser retomada com reserva condicional', (await interrompida.executar()).status === 200 && interrompida.estado.posts === 1);
  const versaoErrada = criarFonte();
  check('versão desatualizada não cria pedido', (await versaoErrada.executar({ ...entrada, versao: 'antiga' })).status === 409 && versaoErrada.estado.posts === 0);
  const alterado = criarFonte({ alterarOrigem: true });
  check('mudança de origem preserva pedido sem concluir vínculo incorreto', (await alterado.executar()).status === 409 && alterado.estado.posts === 1 && !alterado.estado.orcamento.pedido_gerado_id);
  const numeracao = criarFonte();
  const numeros = await Promise.all([reservarNumeroPedido(numeracao.client, base.group_id, base.empresa_id), reservarNumeroPedido(numeracao.client, base.group_id, base.empresa_id)]);
  check('reserva concorrente de número não repete sequência', new Set(numeros).size === 2);
  const legado = criarFonte(); legado.estado.pedidos.push({ group_id: base.group_id, empresa_id: base.empresa_id, numero_pedido: 'PED-000001' });
  check('número legado ocupado não é reutilizado', await reservarNumeroPedido(legado.client, base.group_id, base.empresa_id) === 'PED-000002');

  const chamar = (fonte, body) => { globalThis.__central360Cliente = fonte.client; return endpoint(new Request('https://teste.local', { method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } })); };
  const anonimo = criarFonte(); anonimo.estado.usuario = null;
  check('endpoint recusa chamada anônima', (await chamar(anonimo, entrada)).status === 401);
  const bloqueado = criarFonte(); bloqueado.estado.usuario = { ...user, bloqueado: true };
  check('endpoint recusa administrador bloqueado', (await chamar(bloqueado, entrada)).status === 403);
  const semPermissao = criarFonte(); semPermissao.estado.usuario = { ...user, role: 'user', grupos_vinculados: [base.group_id] };
  check('endpoint exige permissão granular para criar', (await chamar(semPermissao, entrada)).status === 403);
  const outraEmpresa = criarFonte();
  check('endpoint não lê proposta de outra empresa', (await chamar(outraEmpresa, { ...entrada, empresa_id: '999999999999999999999999' })).status === 404);
  const fin = criarFonte({ vencidos: true });
  check('endpoint revalida bloqueio financeiro antes de converter', (await chamar(fin, entrada)).status === 422 && fin.estado.posts === 0);
  const preparado = criarFonte();
  const respPreparo = await chamar(preparado, { ...entrada, acao: 'validar', preparar_pedido: true });
  const valorPreparo = await respPreparo.json();
  check('preparação não cria nem reserva número antecipadamente', respPreparo.status === 200 && valorPreparo.pedido_base.valor_total === 78 && preparado.estado.posts === 0 && !preparado.estado.empresa.sequencial_pedido_360);
  delete globalThis.__central360Cliente;
  for (const [entidade, campo] of [['Empresa', 'sequencial_pedido_360'], ['OrcamentoCliente', 'conversao_pedido']]) {
    check(`${campo} tem escrita protegida`, Boolean(readJson(join(ROOT, 'base44/entities', `${entidade}.jsonc`)).properties[campo].rls?.update?.user_condition));
  }
}

async function runUnit() {
  console.log(`\n${COLORS.bold}${COLORS.blue}═══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.blue}  ERP ZUCCARO — TESTES UNITÁRIOS (LÓGICA PURA)${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.blue}═══════════════════════════════════════════════════${COLORS.reset}`);

  testEntitySchemas();
  testSequentialCode();
  testUniqueConstraints();
  testRBACStructure();
  testRouteRBACMapping();
  testLayoutResponsiveness();
  await testCentral360();
  await testSaldosPedido();
  await testConversaoPedido();
  await testDerivacaoOrcamento(log, ROOT);

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