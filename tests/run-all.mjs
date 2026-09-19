/**
 * ERP Zuccaro — Orquestrador de Testes Completo
 * Executa: npm test
 *
 * Executa na ordem: Unit → Integration → E2E
 * Para de executar próximas fases se a anterior falhar criticamente.
 */
import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COLORS = {
  green: '\x1b[32m', red: '\x1b[31m', blue: '\x1b[34m', yellow: '\x1b[33m',
  reset: '\x1b[0m', bold: '\x1b[1m', cyan: '\x1b[36m',
};

const phases = [
  { name: 'Unitário', script: 'unit/unit.test.mjs', required: true },
  { name: 'Integração', script: 'integration/integration.test.mjs', required: false },
  { name: 'Pré-requisitos E2E (sem execução da UI)', script: 'e2e/e2e-flows.test.mjs', required: false },
];

function runPhase(script) {
  return new Promise((resolve) => {
    const path = join(__dirname, script);
    const child = spawn(process.execPath, [path], { stdio: 'inherit', cwd: __dirname });
    child.on('error', (error) => {
      console.error(`Não foi possível executar ${script}: ${error.message}`);
      resolve(1);
    });
    child.on('close', (code) => resolve(code));
  });
}

async function main() {
  console.log(`\n${COLORS.bold}${COLORS.cyan}╔═══════════════════════════════════════════════════╗${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}║   ERP ZUCCARO — SUÍTE COMPLETA DE TESTES         ║${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.cyan}╚═══════════════════════════════════════════════════╝${COLORS.reset}\n`);

  let anyFail = false;
  let incomplete = false;

  for (const phase of phases) {
    console.log(`\n${COLORS.bold}${COLORS.blue}▶ FASE: ${phase.name}${COLORS.reset}\n`);
    const code = await runPhase(phase.script);

    if (code === 2) {
      incomplete = true;
      console.log(`\n${COLORS.yellow}⚠️ Fase ${phase.name} INCOMPLETA — não comprova funcionamento real.${COLORS.reset}`);
    } else if (code !== 0) {
      if (phase.required) {
        console.log(`\n${COLORS.red}❌ Fase ${phase.name} FALHOU (obrigatória) — parando execução.${COLORS.reset}`);
        anyFail = true;
        break;
      } else {
        console.log(`\n${COLORS.red}⚠️  Fase ${phase.name} teve falhas (não-obrigatória) — continuando.${COLORS.reset}`);
        anyFail = true;
      }
    } else {
      console.log(`\n${COLORS.green}✅ Fase ${phase.name} concluída com sucesso.${COLORS.reset}`);
    }
  }

  console.log(`\n${COLORS.bold}${COLORS.cyan}═══════════════════════════════════════════════════${COLORS.reset}`);
  if (anyFail) {
    console.log(`${COLORS.bold}${COLORS.red}  RESULTADO FINAL: FALHAS DETECTADAS${COLORS.reset}`);
  } else if (incomplete) {
    console.log(`${COLORS.bold}${COLORS.yellow}  RESULTADO FINAL: VALIDAÇÃO INCOMPLETA — PRODUÇÃO NÃO HOMOLOGADA${COLORS.reset}`);
  } else {
    console.log(`${COLORS.bold}${COLORS.green}  RESULTADO FINAL: TODOS OS TESTES PASSARAM${COLORS.reset}`);
  }
  console.log(`${COLORS.bold}${COLORS.cyan}═══════════════════════════════════════════════════${COLORS.reset}\n`);

  process.exit(anyFail ? 1 : incomplete ? 2 : 0);
}

main();
