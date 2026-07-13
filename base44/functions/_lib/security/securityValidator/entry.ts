// Função utilitária consolidada de validações de segurança
// CONSOLIDADO: detectSodConflicts agora usa SOD_RULES data-driven (mirror de sodRules/entry.ts)
// Mantém funções extras: detectSecurityAlerts + detectFlowInconsistencies

// === SOD_RULES — data-driven, sincronizado com sodRules/entry.ts ===
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
  { modulo: 'Estoque', conflito: ['criar', 'aprovar'], severidade: 'Alta', codigo: 'EST-MOV-001', descricao: 'Quem cria movimentações não deve aprovar.' },
  { modulo: 'Estoque', conflito: ['transferir', 'excluir'], severidade: 'Média', codigo: 'EST-TR-001', descricao: 'Quem transfere não deve excluir movimentações.' },
  { modulo: 'RH', conflito: ['editar', 'aprovar'], severidade: 'Média', codigo: 'RH-SAL-001', descricao: 'Quem edita dados de RH não deve aprovar.' },
  { modulo: 'Sistema', conflito: ['criar', 'editar'], severidade: 'Crítica', codigo: 'ADM-USR-001', descricao: 'Criar usuários e editar perfis (escalada de privilégio).' },
  { modulo: 'AuditLog', conflito: ['excluir'], severidade: 'Crítica', codigo: 'LOG-SEC-001', descricao: 'Perfil pode deletar registros de auditoria (não permitido).' },
  { modulo: 'Produção', conflito: ['aprovar'], crossModulo: 'Compras', crossConflito: ['criar'], severidade: 'Média', codigo: 'PRD-OC-001', descricao: 'Aprovar produção + criar requisição de compra.' },
];

function prioridade(level) {
  return { 'Baixa': 1, 'Média': 2, 'Alta': 3, 'Crítica': 4 }[level] || 0;
}

// Extrai ações de qualquer nó (array ou objeto aninhado)
function extractActions(node) {
  if (!node) return [];
  if (Array.isArray(node)) return node.map(a => String(a).toLowerCase());
  if (typeof node === 'object') return Object.values(node).flatMap(v => extractActions(v));
  return [];
}

// detectSodConflicts — agora data-driven via SOD_RULES (sincronizado com sodRules/entry.ts)
function detectSodConflicts(permissoes = {}) {
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

// Detecta alertas de segurança nos logs
function detectSecurityAlerts(logs, windowMinutes = 15) {
  const countBy = (arr, fn) => arr.reduce((acc, v) => {
    const k = fn(v);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  const byAction = countBy(logs, (l) => l.acao || '');
  const suspicious = [];

  // Muitas exclusões em curto período
  if ((byAction['Exclusão'] || 0) >= 5) {
    suspicious.push({
      tipo: 'Exclusões em massa',
      severidade: 'Alta',
      detalhes: `Exclusões recentes: ${byAction['Exclusão']}`
    });
  }

  // Alterações em PerfilAcesso
  const perfilChanges = logs.filter((l) =>
    l.entidade === 'PerfilAcesso' && (l.acao === 'Criação' || l.acao === 'Edição')
  );
  if (perfilChanges.length >= 3) {
    suspicious.push({
      tipo: 'Mudanças frequentes de perfil',
      severidade: 'Média',
      detalhes: `${perfilChanges.length} mudanças em ${windowMinutes} min`
    });
  }

  // Muitos bloqueios de acesso
  const blocks = logs.filter((l) => l.acao === 'Bloqueio');
  if (blocks.length >= 10) {
    suspicious.push({
      tipo: 'Muitos bloqueios de acesso',
      severidade: 'Média',
      detalhes: `${blocks.length} bloqueios em ${windowMinutes} min`
    });
  }

  // RBAC negações
  const rbacBlocks = logs.filter((l) =>
    l.acao === 'Bloqueio' && (l.tipo_auditoria === 'seguranca' || /RBAC backend negou/i.test(l.descricao || ''))
  );
  if (rbacBlocks.length >= 5) {
    suspicious.push({
      tipo: 'RBAC backend negações',
      severidade: 'Média',
      detalhes: `${rbacBlocks.length} negações em ${windowMinutes} min`
    });
  }

  // Funções lentas (>1500ms)
  const funcLatency = logs.filter((l) =>
    l.entidade === 'FunctionLatency' && (Number(l?.duracao_ms) || 0) > 1500
  );
  if (funcLatency.length >= 5) {
    const max = Math.max(...funcLatency.map((l) => Number(l?.duracao_ms) || 0));
    suspicious.push({
      tipo: 'Funções lentas',
      severidade: max > 3000 ? 'Alta' : 'Média',
      detalhes: `${funcLatency.length} chamadas >1500ms (pico ${Math.round(max)}ms)`
    });
  }

  return suspicious;
}

// Detecta inconsistências de fluxo (Pedido → Entrega → NotaFiscal)
function detectFlowInconsistencies(pedido, entregas, notasFiscais) {
  const issues = [];
  const status = pedido?.status || 'Rascunho';
  const hasEntrega = Array.isArray(entregas) && entregas.length > 0;
  const hasNF = Array.isArray(notasFiscais) && notasFiscais.length > 0;

  if ((status === 'Faturado' || status === 'Pronto para Faturar') && !hasNF) {
    issues.push('Pedido sem Nota Fiscal associada.');
  }
  if ((status === 'Em Expedição' || status === 'Em Trânsito' || status === 'Entregue') && !hasEntrega) {
    issues.push('Pedido sem Entrega vinculada.');
  }
  if (status === 'Entregue' && hasEntrega) {
    const ok = entregas.some((e) => !!e?.data_entrega);
    if (!ok) issues.push('Entrega sem data de entrega registrada.');
  }

  return issues;
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({
    ok: true, status: 'healthy', module: '_lib/security/securityValidator',
    consolidated: true, sodRulesCount: SOD_RULES.length
  });
});