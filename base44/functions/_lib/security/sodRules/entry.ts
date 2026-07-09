// Regras e detecção de Segregação de Funções (SoD)
// Fonte única de verdade — sincronizada com securityPoliciesValidator/entry.ts e sodValidator/entry.ts
// 14 regras cobrindo intra-módulo, inter-módulo e acesso indevido a Sistema/AuditLog.

export const SOD_RULES = [
  { modulo: 'Financeiro', conflito: ['aprovar', 'liquidar'], severidade: 'Alta', descricao: 'Quem aprova pagamentos não deve liquidar.' },
  { modulo: 'Financeiro', conflito: ['criar', 'excluir'], severidade: 'Média', descricao: 'Quem cria lançamentos não deve excluir.' },
  { modulo: 'Financeiro', conflito: ['aprovar', 'criar'], severidade: 'Alta', descricao: 'Quem aprova no Financeiro não deve criar.' },
  { modulo: 'Financeiro', conflito: ['aprovar', 'editar'], severidade: 'Alta', descricao: 'Quem aprova no Financeiro não deve editar.' },
  { modulo: 'Financeiro', conflito: ['aprovar', 'excluir'], severidade: 'Crítica', descricao: 'Quem aprova no Financeiro não deve excluir.' },
  { modulo: 'Comercial', conflito: ['editar', 'aprovar'], severidade: 'Média', descricao: 'Quem edita não deve aprovar descontos.' },
  { modulo: 'Comercial', conflito: ['criar', 'aprovar'], severidade: 'Média', descricao: 'Quem cria pedidos não deve aprová-los.' },
  { modulo: 'Fiscal', conflito: ['emitir', 'cancelar'], severidade: 'Alta', descricao: 'Separar emissão e cancelamento fiscal.' },
  { modulo: 'Fiscal', conflito: ['emitir', 'aprovar'], severidade: 'Média', descricao: 'Separar emissão e aprovação fiscal.' },
  { modulo: 'Compras', conflito: ['criar', 'aprovar'], severidade: 'Alta', descricao: 'Quem aprova compras não deve criar.' },
  { modulo: 'Compras', conflito: ['aprovar', 'editar'], severidade: 'Alta', descricao: 'Quem aprova compras não deve editar.' },
  { modulo: 'Estoque', conflito: ['transferir', 'excluir'], severidade: 'Média', descricao: 'Quem transfere não deve excluir movimentações.' },
  { modulo: 'RH', conflito: ['editar', 'aprovar'], severidade: 'Média', descricao: 'Quem edita dados de RH não deve aprovar.' },
  { modulo: 'Sistema', conflito: ['criar', 'editar'], severidade: 'Crítica', descricao: 'Criar usuários e editar perfis (escalada de privilégio).' },
];

export function detectSodConflicts(permissoes) {
  const conflitos = [];
  let severidadeMax = null;

  for (const regra of SOD_RULES) {
    const mod = permissoes?.[regra.modulo];
    if (!mod) continue;
    const secoes = Object.values(mod || {});
    const acoesPresentes = new Set();
    for (const lista of secoes) {
      if (Array.isArray(lista)) for (const ac of lista) acoesPresentes.add(String(ac).toLowerCase());
    }
    if (regra.conflito.every((ac) => acoesPresentes.has(ac))) {
      conflitos.push({
        tipo_conflito: `${regra.modulo}:${regra.conflito.join('+')}`,
        descricao: regra.descricao,
        severidade: regra.severidade,
        data_deteccao: new Date().toISOString(),
      });
      if (!severidadeMax || prioridade(regra.severidade) > prioridade(severidadeMax)) {
        severidadeMax = regra.severidade;
      }
    }
  }
  return { conflitos, severidadeMax };
}

function prioridade(level) {
  return { 'Baixa': 1, 'Média': 2, 'Alta': 3, 'Crítica': 4 }[level] || 0;
}