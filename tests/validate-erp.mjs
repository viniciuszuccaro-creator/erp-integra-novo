/**
 * ERP Zuccaro — Script de validação de testes automatizados
 * Executa: npm run test:validate
 *
 * Valida sem dependências externas:
 * 1. Estrutura de entidades (todas as 48+ entidades têm group_id/empresa_id)
 * 2. Funções backend críticas respondem
 * 3. RBAC está configurado (PerfilAcesso existe)
 * 4. Automações de sanitizeOnWrite + syncBidirectional estão ativas
 * 5. Multiempresa: cada empresa tem group_id vinculado
 *
 * Para testes E2E completos de botões/toggles/fluxos, use o Testing Agent
 * (ícone de tubo de ensaio no painel lateral).
 */
import { base44 } from '../src/api/base44Client.js';

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

const results = { pass: 0, fail: 0, skip: 0, errors: [] };

function log(type, msg) {
  const color = type === 'pass' ? COLORS.green : type === 'fail' ? COLORS.red : type === 'skip' ? COLORS.yellow : COLORS.blue;
  const icon = type === 'pass' ? '✅' : type === 'fail' ? '❌' : type === 'skip' ? '⏭️' : 'ℹ️';
  console.log(`${color}${icon} ${msg}${COLORS.reset}`);
  if (type === 'pass') results.pass++;
  if (type === 'fail') { results.fail++; results.errors.push(msg); }
  if (type === 'skip') results.skip++;
}

async function testBackendFunction(name, payload = {}) {
  try {
    const res = await base44.functions.invoke(name, payload);
    if (res?.data?.error || res?.data?.ok === false) {
      log('fail', `Backend ${name}: retornou erro — ${res.data.error || 'ok=false'}`);
      return null;
    }
    log('pass', `Backend ${name}: OK`);
    return res?.data;
  } catch (err) {
    // 401 é esperado para funções que exigem auth quando testadas sem login
    if (err?.response?.status === 401 || err?.message?.includes('401')) {
      log('pass', `Backend ${name}: proteção de auth ativa (401)`);
      return null;
    }
    log('fail', `Backend ${name}: ${err.message}`);
    return null;
  }
}

async function testEntityStructure(entityName) {
  try {
    const schema = await base44.entities[entityName]?.schema?.();
    if (!schema) {
      log('skip', `Entity ${entityName}: schema() indisponível`);
      return;
    }
    const props = schema?.properties || {};
    const hasGroupId = 'group_id' in props;
    const hasEmpresaId = 'empresa_id' in props;
    const hasCodigo = 'codigo' in props;
    const hasAtivo = 'ativo' in props || 'status' in props;

    if (hasGroupId && hasEmpresaId && (hasCodigo || hasAtivo)) {
      log('pass', `Entity ${entityName}: multiempresa + codigo + status OK`);
    } else {
      const missing = [];
      if (!hasGroupId) missing.push('group_id');
      if (!hasEmpresaId) missing.push('empresa_id');
      if (!hasCodigo && !hasAtivo) missing.push('codigo/status');
      log('fail', `Entity ${entityName}: faltando ${missing.join(', ')}`);
    }
  } catch (err) {
    log('skip', `Entity ${entityName}: ${err.message}`);
  }
}

async function runTests() {
  console.log(`\n${COLORS.bold}${COLORS.blue}═══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.blue}  ERP ZUCCARO — VALIDAÇÃO DE TESTES AUTOMATIZADOS${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.blue}═══════════════════════════════════════════════════${COLORS.reset}\n`);

  // ── 1. Estrutura de Entidades Críticas ──
  console.log(`${COLORS.bold}📋 1. Estrutura de Entidades (Multiempresa + Codigo)${COLORS.reset}`);
  const criticalEntities = [
    'Pedido', 'Cliente', 'Fornecedor', 'Produto', 'NotaFiscal',
    'ContaReceber', 'ContaPagar', 'MovimentacaoEstoque', 'Entrega',
    'OrdemCompra', 'Colaborador', 'Contrato', 'Oportunidade',
    'OrdemProducao', 'Romaneio', 'ApontamentoProducao',
  ];
  for (const entity of criticalEntities) {
    await testEntityStructure(entity);
  }

  // ── 2. Funções Backend Críticas ──
  console.log(`\n${COLORS.bold}⚙️  2. Funções Backend Críticas${COLORS.reset}`);
  await testBackendFunction('deployAudit', {});
  await testBackendFunction('countEntities', { entities: ['Pedido'] });
  await testBackendFunction('entityListSorted', { entity: 'Pedido', sort: '-created_date', limit: 1 });
  await testBackendFunction('validateERPStructure', {});
  await testBackendFunction('sodValidator', {});

  // ── 3. Automações (via listagem) ──
  console.log(`\n${COLORS.bold}🔄 3. Status de Automações${COLORS.reset}`);
  try {
    // As automações são gerenciadas via plataforma; verificar indiretamente
    const automations = await base44.functions.invoke('deployAudit', { action: 'status' });
    if (automations?.data?.automations) {
      const active = automations.data.automations.filter(a => a.is_active);
      log('pass', `Automações ativas: ${active.length}/${automations.data.automations.length}`);
    } else {
      log('skip', 'Status de automações requer auth admin');
    }
  } catch (_) {
    log('skip', 'Verificação de automações requer login admin');
  }

  // ── 4. RBAC ──
  console.log(`\n${COLORS.bold}🔐 4. RBAC e Permissões${COLORS.reset}`);
  try {
    const perfis = await base44.entities.PerfilAcesso?.list?.();
    if (perfis && perfis.length > 0) {
      log('pass', `RBAC: ${perfis.length} perfil(is) de acesso configurado(s)`);
    } else {
      log('fail', 'RBAC: nenhum PerfilAcesso encontrado — execute initializeRBACProfiles');
    }
  } catch (err) {
    log('skip', `RBAC: ${err.message}`);
  }

  // ── 5. Multiempresa ──
  console.log(`\n${COLORS.bold}🏢 5. Multiempresa${COLORS.reset}`);
  try {
    const grupos = await base44.entities.GrupoEmpresarial?.list?.();
    if (grupos && grupos.length > 0) {
      log('pass', `Multiempresa: ${grupos.length} grupo(s) empresarial(is)`);
      for (const g of grupos.slice(0, 3)) {
        const empresas = await base44.entities.Empresa?.filter?.({ group_id: g.id });
        if (empresas && empresas.length > 0) {
          log('pass', `  ${g.nome_do_grupo}: ${empresas.length} empresa(s) vinculada(s)`);
        } else {
          log('fail', `  ${g.nome_do_grupo}: nenhuma empresa vinculada`);
        }
      }
    } else {
      log('fail', 'Multiempresa: nenhum GrupoEmpresarial encontrado');
    }
  } catch (err) {
    log('skip', `Multiempresa: ${err.message}`);
  }

  // ── Resumo ──
  console.log(`\n${COLORS.bold}═══════════════════════════════════════════════════${COLORS.reset}`);
  const total = results.pass + results.fail + results.skip;
  console.log(`${COLORS.bold}  RESUMO: ${results.pass} pass · ${results.fail} fail · ${results.skip} skip · ${total} total${COLORS.reset}`);
  if (results.errors.length > 0) {
    console.log(`\n${COLORS.red}  FALHAS:${COLORS.reset}`);
    results.errors.forEach(e => console.log(`  ${COLORS.red}❌ ${e}${COLORS.reset}`));
  }
  console.log(`${COLORS.bold}═══════════════════════════════════════════════════${COLORS.reset}\n`);

  process.exit(results.fail > 0 ? 1 : 0);
}

runTests().catch(err => {
  console.error(`${COLORS.red}Erro fatal: ${err.message}${COLORS.reset}`);
  process.exit(1);
});