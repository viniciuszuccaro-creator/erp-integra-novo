/**
 * ERP Zuccaro — Testes E2E (Fluxos de Ponta a Ponta)
 * Executa: npm run test:e2e
 *
 * Estes testes são checklists estruturados de fluxos críticos.
 * Para execução automatizada com interação real da UI, use o
 * Testing Agent (ícone de tubo de ensaio no painel lateral).
 *
 * Este script valida que os PRÉ-REQUISITOS de cada fluxo existem
 * (entidades, funções backend, rotas) e imprime o checklist
 * para execução manual ou via Testing Agent.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..');

const COLORS = {
  green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m',
  blue: '\x1b[34m', reset: '\x1b[0m', bold: '\x1b[1m', cyan: '\x1b[36m',
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

function fileExists(path) { return existsSync(join(ROOT, path)); }

// ═══════════════════════════════════════════════════
// FLUXOS E2E — Pré-requisitos + Checklist
// ═══════════════════════════════════════════════════
const FLOWS = [
  {
    name: 'F1: Pedido Comercial → Aprovação → Faturamento → NF-e',
    prerequisites: [
      { type: 'file', path: 'src/pages/Comercial.jsx' },
      { type: 'file', path: 'src/components/comercial/PedidoFormCompleto.jsx' },
      { type: 'file', path: 'base44/functions/onPedidoCreated/entry.ts' },
      { type: 'file', path: 'base44/functions/onPedidoApprovalRequested/entry.ts' },
      { type: 'file', path: 'base44/functions/onPedidoReadyToInvoice/entry.ts' },
      { type: 'file', path: 'base44/functions/nfeActions/entry.ts' },
    ],
    steps: [
      '1. Login como vendedor → /Comercial → "Novo Pedido"',
      '2. Selecionar cliente, adicionar itens de revenda, definir forma de pagamento',
      '3. Salvar pedido (status: Rascunho → Aguardando Aprovação se desconto > margem mínima)',
      '4. Login como gerente → Central de Aprovações → aprovar desconto',
      '5. Pedido muda para Aprovado → automação onPedidoCreated dispara reserva de estoque',
      '6. Avançar para Pronto para Faturar → onPedidoReadyToInvoice dispara',
      '7. Faturar → gerar NF-e via nfeActions → status: Faturado',
      '8. Verificar: estoque movimentado, conta a receber criada, auditoria registrada',
    ],
  },
  {
    name: 'F2: Multiempresa — Cadastro no Grupo → Propagação → Empresa',
    prerequisites: [
      { type: 'file', path: 'src/components/administracao-sistema/propagacao/PropagacaoIndex.jsx' },
      { type: 'file', path: 'base44/functions/syncGroupCompany/entry.ts' },
      { type: 'file', path: 'base44/functions/propagateGroupData/entry.ts' },
      { type: 'file', path: 'base44/functions/syncBidirectional/entry.ts' },
    ],
    steps: [
      '1. Login como admin → /Cadastros → cadastrar Produto no contexto Grupo',
      '2. Produto criado com group_id + empresa_id especificada',
      '3. Automação syncGroupCompany propaga para todas as empresas do grupo',
      '4. Trocar contexto para Empresa A → produto aparece',
      '5. Trocar contexto para Empresa B → produto aparece (cadastro único compartilhado)',
      '6. Verificar: SyncReport registra propagação bem-sucedida',
      '7. Tela Propagação mostra status automático (não botão manual)',
    ],
  },
  {
    name: 'F3: RBAC — Usuário sem permissão não vê botão de Baixa Manual',
    prerequisites: [
      { type: 'file', path: 'src/components/lib/RBACButton.jsx' },
      { type: 'file', path: 'src/components/lib/RBACRoute.jsx' },
      { type: 'file', path: 'src/components/security/ProtectedSection.jsx' },
      { type: 'file', path: 'base44/functions/entityGuard/entry.ts' },
    ],
    steps: [
      '1. Login como usuário com perfil "Vendedor" (sem financeiro.caixa.baixa-manual)',
      '2. Navegar para /Financeiro → Contas a Receber',
      '3. Verificar: botão "Baixa Manual" NÃO aparece (RBACButton retorna null)',
      '4. Login como admin → mesmo perfil tem botão visível',
      '5. Tentar chamar backend diretamente → entityGuard bloqueia (403)',
    ],
  },
  {
    name: 'F4: Portal do Cliente — Timeout e Erro',
    prerequisites: [
      { type: 'file', path: 'src/pages/PortalCliente.jsx' },
      { type: 'file', path: 'base44/functions/portalToken/entry.ts' },
    ],
    steps: [
      '1. Acessar portal via link com token válido',
      '2. Dashboard carrega com pedidos, entregas, boletos',
      '3. Simular rede lenta → timeout após 15s → tela de erro com "Tentar novamente"',
      '4. Clicar "Tentar novamente" → recarrega página',
      '5. Verificar: sem carregamento infinito (spinner não fica girando indefinidamente)',
    ],
  },
  {
    name: 'F5: App Motorista — Entrega Offline',
    prerequisites: [
      { type: 'file', path: 'src/components/mobile/useEntregasMotorista.jsx' },
      { type: 'file', path: 'src/components/mobile/EntregaListaView.jsx' },
      { type: 'file', path: 'src/pages/EntregasMobile.jsx' },
    ],
    steps: [
      '1. Login como motorista → /EntregasMobile',
      '2. Lista de entregas carrega (online)',
      '3. Desligar rede → modo offline ativa',
      '4. Selecionar entrega → coletar assinatura, foto, recebedor',
      '5. Confirmar entrega → fica na fila offline',
      '6. Ligar rede → fila sincroniza automaticamente',
      '7. Verificar: badge "pendentes: N"some quando sync completa',
    ],
  },
  {
    name: 'F6: Produção → Ordem de Produção → Apontamento → Conclusão',
    prerequisites: [
      { type: 'file', path: 'src/pages/Producao.jsx' },
      { type: 'file', path: 'src/components/producao/FormularioOrdemProducao.jsx' },
      { type: 'file', path: 'src/components/producao/ApontamentoProducao.jsx' },
      { type: 'file', path: 'base44/functions/onOrdemProducaoGroupReplication/entry.ts' },
    ],
    steps: [
      '1. Login como operador → /Producao → "Nova OP"',
      '2. Selecionar produto, quantidade, data prevista',
      '3. Salvar OP → status: Aberta',
      '4. Iniciar apontamento de produção (quantidade produzida, refugo)',
      '5. Concluir OP → status: Concluída',
      '6. Verificar: estoque de produto acabado atualizado, refugo registrado',
      '7. Propagação bidirecional sincroniza OP no grupo',
    ],
  },
  {
    name: 'F7: Financeiro — Conciliação Bancária com IA',
    prerequisites: [
      { type: 'file', path: 'src/components/financeiro/ConciliacaoBancaria.jsx' },
      { type: 'file', path: 'src/components/financeiro/ConciliacaoAutomaticaIA.jsx' },
      { type: 'file', path: 'base44/functions/iaFinanceAnomalyScan/entry.ts' },
    ],
    steps: [
      '1. Login como financeiro → /Financeiro → Conciliação',
      '2. Importar extrato bancário (OFX/CSV)',
      '3. IA sugere matches com score de confiança',
      '4. Revisar matches > 90% → conciliar automaticamente',
      '5. Matches divergentes → revisão manual',
      '6. Verificar: divergências registradas, auditoria completa',
    ],
  },
  {
    name: 'F8: Cadastros — Importação Inteligente (código externo → interno)',
    prerequisites: [
      { type: 'file', path: 'src/components/estoque/ImportadorProdutosPlanilha.jsx' },
      { type: 'file', path: 'src/components/estoque/ImportadorProdutosPlanilha.jsx' },
      { type: 'file', path: 'base44/functions/parseSpreadsheet/entry.ts' },
    ],
    steps: [
      '1. Login como admin → /Cadastros → Produtos → Importar',
      '2. Upload de planilha com produtos (código externo do fornecedor)',
      '3. Sistema mantém código externo e gera próximo código interno sequencial',
      '4. Verificar: nenhum código duplicado (Regra-Mãe proibição de duplicidade)',
      '5. Produtos criados com group_id + empresa_id',
    ],
  },
];

function runE2E() {
  console.log(`\n${COLORS.bold}${COLORS.blue}═══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.blue}  ERP ZUCCARO — TESTES E2E (FLUXOS DE PONTA A PONTA)${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.blue}═══════════════════════════════════════════════════${COLORS.reset}\n`);
  console.log(`${COLORS.cyan}ℹ️  Para execução automatizada da UI, use o Testing Agent${COLORS.reset}`);
  console.log(`${COLORS.cyan}    (ícone de tubo de ensaio no painel lateral).${COLORS.reset}`);
  console.log(`${COLORS.cyan}    Este script valida PRÉ-REQUISITOS e imprime checklists.${COLORS.reset}\n`);

  for (const flow of FLOWS) {
    console.log(`\n${COLORS.bold}${COLORS.yellow}── ${flow.name} ──${COLORS.reset}`);

    // Verifica pré-requisitos
    let allPrereqOk = true;
    for (const prereq of flow.prerequisites) {
      if (prereq.type === 'file') {
        if (fileExists(prereq.path)) {
          log('pass', `Pré-req: ${prereq.path}`);
        } else {
          log('fail', `Pré-req AUSENTE: ${prereq.path}`);
          allPrereqOk = false;
        }
      }
    }

    if (allPrereqOk) {
      log('pass', `Pré-requisitos completos — fluxo pronto para execução`);
      console.log(`${COLORS.blue}  📝 Checklist:${COLORS.reset}`);
      flow.steps.forEach(s => console.log(`     ${COLORS.blue}${s}${COLORS.reset}`));
    } else {
      log('fail', `Pré-requisitos incompletos — fluxo NÃO pode ser executado`);
    }
  }

  // Resumo
  const total = results.pass + results.fail + results.skip;
  console.log(`\n${COLORS.bold}═══════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.bold}  E2E RESUMO: ${results.pass} pass · ${results.fail} fail · ${results.skip} skip · ${total} total${COLORS.reset}`);
  console.log(`${COLORS.bold}  Fluxos definidos: ${FLOWS.length}${COLORS.reset}`);
  if (results.errors.length > 0) {
    console.log(`\n${COLORS.red}  PRÉ-REQUISITOS AUSENTES:${COLORS.reset}`);
    results.errors.forEach(e => console.log(`  ${COLORS.red}❌ ${e}${COLORS.reset}`));
  }
  console.log(`${COLORS.bold}═══════════════════════════════════════════════════${COLORS.reset}\n`);

  process.exit(results.fail > 0 ? 1 : 0);
}

runE2E();