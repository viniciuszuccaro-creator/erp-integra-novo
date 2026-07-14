// Regras e detecção de Segregação de Funções (SoD)
// Fonte única de verdade — CONSOLIDADO com securityValidator/entry.ts e sodValidator/entry.ts
// 17 regras cobrindo intra-módulo, inter-módulo, cross-módulo e acesso indevido a Sistema/AuditLog.

const SOD_RULES = [
  { modulo: 'Financeiro', conflito: ['aprovar', 'liquidar'], severidade: 'Alta', codigo: 'FIN-PAG-001', descricao: 'Quem aprova pagamentos não deve liquidar.' },
  { modulo: 'Financeiro', conflito: ['criar', 'excluir'], severidade: 'Média', codigo: 'FIN-CR-001', descricao: 'Quem cria lançamentos não deve excluir.' },
  { modulo: 'Financeiro', conflito: ['aprovar', 'criar'], severidade: 'Alta', codigo: 'FIN-AP-001', descricao: 'Quem aprova no Financeiro não deve criar.' },
  { modulo: 'Financeiro', conflito: ['aprovar', 'editar'], severidade: 'Alta', codigo: 'FIN-ED-001', descricao: 'Quem aprova no Financeiro não deve editar.' },
  { modulo: 'Financeiro', conflito: ['aprovar', 'excluir'], severidade: 'Crítica', codigo: 'FIN-EX-001', descricao: 'Quem aprova no Financeiro não deve excluir.' },
  { modulo: 'Comercial', conflito: ['editar', 'aprovar'], severidade: 'Média', codigo: 'COM-DESC-001', descricao: 'Quem edita não deve aprovar descontos.' },
  { modulo: 'Comercial', conflito: ['criar', 'aprovar'], severidade: 'Média', codigo: 'COM-CR-001', descricao: 'Quem cria pedidos não deve aprová-los.' },
  { modulo: 'Fiscal', conflito: ['emitir', 'cancelar'], severidade: 'Alta', codigo: 'FIS-NFE-001', descricao: 'Separar emissão e cancelamento fiscal.' },
  { modulo: 'Fiscal', conflito: ['emitir', 'aprovar'], severidade: 'Média', codigo: 'FIS-AP-001', descricao: 'Separar emissão e aprovação fiscal.' },
  { modulo: 'Compras', conflito: ['criar', 'aprovar'], severidade: 'Alta', codigo: 'CMP-OC-001', descricao: 'Quem aprova compras não deve criar.' },
  { modulo: 'Compras', conflito: ['aprovar', 'editar'], severidade: 'Alta', codigo: 'CMP-ED-001', descricao: 'Quem aprova compras não deve editar.' },
  { modulo: 'Compras', conflito: ['criar', 'baixar'], severidade: 'Alta', codigo: 'CMP-RCB-001', descricao: 'Vol 6.1: Quem cria ordem de compra não deve receber mercadoria.' },
  { modulo: 'Estoque', conflito: ['criar', 'aprovar'], severidade: 'Alta', codigo: 'EST-MOV-001', descricao: 'Quem cria movimentações não deve aprovar.' },
  { modulo: 'Estoque', conflito: ['transferir', 'excluir'], severidade: 'Média', codigo: 'EST-TR-001', descricao: 'Quem transfere não deve excluir movimentações.' },
  { modulo: 'RH', conflito: ['editar', 'aprovar'], severidade: 'Média', codigo: 'RH-SAL-001', descricao: 'Quem edita dados de RH não deve aprovar.' },
  { modulo: 'Sistema', conflito: ['criar', 'editar'], severidade: 'Crítica', codigo: 'ADM-USR-001', descricao: 'Criar usuários e editar perfis (escalada de privilégio).' },
  { modulo: 'AuditLog', conflito: ['excluir'], severidade: 'Crítica', codigo: 'LOG-SEC-001', descricao: 'Perfil pode deletar registros de auditoria (não permitido).' },
  { modulo: 'Produção', conflito: ['aprovar'], crossModulo: 'Compras', crossConflito: ['criar'], severidade: 'Média', codigo: 'PRD-OC-001', descricao: 'Aprovar produção + criar requisição de compra.' },
  // Vol 10.2: Segregação de funções no Caixa — usuários separados para receber, pagar, conferir, abrir, fechar e estornar
  { modulo: 'Financeiro', conflito: ['receber', 'pagar'], severidade: 'Alta', codigo: 'FIN-CAIXA-001', descricao: 'Quem recebe não deve pagar (segregação de caixa).' },
  { modulo: 'Financeiro', conflito: ['liquidar', 'conciliar'], severidade: 'Alta', codigo: 'FIN-CAIXA-002', descricao: 'Quem liquida não deve conciliar (prevenção de fraude).' },
  { modulo: 'Financeiro', conflito: ['liquidar', 'desfazer'], severidade: 'Crítica', codigo: 'FIN-CAIXA-003', descricao: 'Quem liquida não deve estornar (prevenção de desvio).' },
  { modulo: 'Financeiro', conflito: ['abrir', 'fechar'], severidade: 'Alta', codigo: 'FIN-CAIXA-004', descricao: 'Quem abre o caixa não deve fechar (dual control).' },
  { modulo: 'Financeiro', conflito: ['receber', 'conciliar'], severidade: 'Alta', codigo: 'FIN-CAIXA-005', descricao: 'Quem recebe não deve conciliar (independência).' },
  { modulo: 'Financeiro', conflito: ['pagar', 'conciliar'], severidade: 'Alta', codigo: 'FIN-CAIXA-006', descricao: 'Quem paga não deve conciliar (independência).' },
];

function extractActions(node) {
  if (!node) return [];
  if (Array.isArray(node)) return node.map(a => String(a).toLowerCase());
  if (typeof node === 'object') return Object.values(node).flatMap(v => extractActions(v));
  return [];
}

function detectSodConflicts(permissoes) {
  const conflitos = [];
  let severidadeMax = null;

  for (const regra of SOD_RULES) {
    // Regra cross-módulo (ex: Produção aprovar + Compras criar)
    if (regra.crossModulo) {
      const modAcoes = new Set(extractActions(permissoes?.[regra.modulo]));
      const crossModAcoes = new Set(extractActions(permissoes?.[regra.crossModulo]));
      if (regra.conflito.every((ac) => modAcoes.has(ac)) && regra.crossConflito.every((ac) => crossModAcoes.has(ac))) {
        conflitos.push({
          regra: regra.codigo,
          tipo_conflito: `${regra.modulo}+${regra.crossModulo}:${[...regra.conflito, ...regra.crossConflito].join('+')}`,
          descricao: regra.descricao,
          severidade: regra.severidade,
          data_deteccao: new Date().toISOString(),
        });
        if (!severidadeMax || prioridade(regra.severidade) > prioridade(severidadeMax)) {
          severidadeMax = regra.severidade;
        }
      }
      continue;
    }

    // Regra intra-módulo
    const mod = permissoes?.[regra.modulo] || permissoes?.[regra.modulo === 'Sistema' ? 'Administração' : regra.modulo];
    if (!mod) continue;
    const acoesPresentes = new Set(extractActions(mod));

    if (regra.conflito.every((ac) => acoesPresentes.has(ac))) {
      conflitos.push({
        regra: regra.codigo,
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

  return { conflitos, severidadeMax: severidadeMax || 'Baixa' };
}

function prioridade(level) {
  return { 'Baixa': 1, 'Média': 2, 'Alta': 3, 'Crítica': 4 }[level] || 0;
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({
    ok: true, status: 'healthy', module: '_lib/security/sodRules',
    consolidated: true, rulesCount: SOD_RULES.length
  });
});