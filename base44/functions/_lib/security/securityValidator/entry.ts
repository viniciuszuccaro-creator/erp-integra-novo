// Função utilitária consolidada de validações de segurança
// Consolida: securityAlerts + sodValidator + conflictPolicy

export function detectSodConflicts(permissoes = {}) {
  const perms = permissoes || {};
  const conflitos = [];

  // Extrai ações de qualquer nó (array ou objeto aninhado)
  const extractActions = (node) => {
    if (!node) return [];
    if (Array.isArray(node)) return node.map(a => String(a).toLowerCase());
    if (typeof node === 'object') return Object.values(node).flatMap(v => extractActions(v));
    return [];
  };
  const hasAny = (node, ...actions) => {
    const acts = extractActions(node);
    return actions.some(a => acts.includes(a));
  };

  const fin = perms['Financeiro'] || {};
  const com = perms['Comercial'] || {};
  const sys = perms['Sistema'] || perms['Administração'] || {};
  const fis = perms['Fiscal'] || {};
  const aud = perms['AuditLog'] || {};
  const est = perms['Estoque'] || {};
  const cmp = perms['Compras'] || {};
  const rh  = perms['RH'] || {};
  const adm = perms['Administração'] || perms['Sistema'] || {};
  const prod = perms['Produção'] || perms['Producao'] || {};

  // FIN-PAG-001: Aprovação e Liquidação de Pagamentos
  if (hasAny(fin, 'aprovar') && hasAny(fin, 'liquidar', 'pago')) {
    conflitos.push({ regra: 'FIN-PAG-001', severidade: 'Alta', descricao: 'Mesmo perfil pode aprovar e liquidar pagamentos.' });
  }

  // COM-DESC-001: Edição e Aprovação de Descontos
  if (hasAny(com, 'desconto', 'editar') && hasAny(com, 'aprovar')) {
    conflitos.push({ regra: 'COM-DESC-001', severidade: 'Média', descricao: 'Mesmo perfil pode editar e aprovar descontos.' });
  }

  // SYS-RBAC-001: Admin de Acessos + Leitura de Auditoria
  if (hasAny(sys, 'editar', 'criar') && hasAny(sys, 'ver', 'visualizar') && extractActions(sys).length >= 2) {
    conflitos.push({ regra: 'SYS-RBAC-001', severidade: 'Crítica', descricao: 'Perfil administra acessos e visualiza trilhas sensíveis.' });
  }

  // FIS-NFE-001: Emissão e Cancelamento de NF-e
  if (hasAny(fis, 'criar', 'emitir') && hasAny(fis, 'excluir', 'cancelar')) {
    conflitos.push({ regra: 'FIS-NFE-001', severidade: 'Alta', descricao: 'Mesmo perfil pode emitir e cancelar documentos fiscais.' });
  }

  // LOG-SEC-001: Deletar Logs de Auditoria
  if (hasAny(aud, 'excluir', 'deletar')) {
    conflitos.push({ regra: 'LOG-SEC-001', severidade: 'Crítica', descricao: 'Perfil pode deletar registros de auditoria (não permitido).' });
  }

  // EST-MOV-001: Criar e Aprovar Movimentações de Estoque
  if (hasAny(est, 'criar') && hasAny(est, 'aprovar')) {
    conflitos.push({ regra: 'EST-MOV-001', severidade: 'Alta', descricao: 'Mesmo perfil pode criar e aprovar movimentações de estoque.' });
  }

  // CMP-OC-001: Criar OC e Liquidar Pagamento
  if (hasAny(cmp, 'criar') && hasAny(fin, 'liquidar', 'pago')) {
    conflitos.push({ regra: 'CMP-OC-001', severidade: 'Alta', descricao: 'Mesmo perfil pode criar Ordem de Compra e liquidar pagamentos.' });
  }

  // RH-SAL-001: Editar Salário e Aprovar Folha
  if (hasAny(rh, 'editar') && hasAny(rh, 'aprovar')) {
    conflitos.push({ regra: 'RH-SAL-001', severidade: 'Média', descricao: 'Mesmo perfil pode editar dados salariais e aprovar folha de pagamento.' });
  }

  // ADM-USR-001: Criar Usuários + Editar Perfis (escalada de privilégio)
  if (hasAny(adm, 'criar') && hasAny(adm, 'editar')) {
    conflitos.push({ regra: 'ADM-USR-001', severidade: 'Crítica', descricao: 'Mesmo perfil pode criar usuários e editar perfis de acesso (escalada de privilégio).' });
  }

  // PRD-OC-001: Aprovar Produção + Criar Requisição de Compra
  if (hasAny(prod, 'aprovar') && hasAny(cmp, 'criar')) {
    conflitos.push({ regra: 'PRD-OC-001', severidade: 'Média', descricao: 'Mesmo perfil pode aprovar ordens de produção e criar requisições de compra.' });
  }

  const order = { Baixa: 1, Média: 2, Alta: 3, Crítica: 4 };
  const severidadeMax = conflitos.length > 0
    ? conflitos.reduce((max, item) => order[item.severidade] > order[max] ? item.severidade : max, 'Baixa')
    : 'Baixa';

  return { conflitos, severidadeMax };
}

// Detecta alertas de segurança nos logs
export function detectSecurityAlerts(logs, windowMinutes = 15) {
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
export function detectFlowInconsistencies(pedido, entregas, notasFiscais) {
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