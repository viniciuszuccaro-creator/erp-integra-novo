// Função utilitária consolidada de validações de segurança
// Consolida: securityAlerts + sodValidator + conflictPolicy

export function detectSodConflicts(permissoes = {}) {
  const perms = permissoes || {};
  const conflitos = [];

  // FIN-PAG-001: Aprovação e Liquidação de Pagamentos
  const finAncer = perms['Financeiro'] || [];
  if (Array.isArray(finAncer)) {
    const temAprovar = finAncer.includes('aprovar');
    const temLiquidar = finAncer.includes('liquidar') || finAncer.includes('pago');
    if (temAprovar && temLiquidar) {
      conflitos.push({
        regra: 'FIN-PAG-001',
        severidade: 'Alta',
        descricao: 'Mesmo perfil pode aprovar e liquidar pagamentos.'
      });
    }
  }

  // COM-DESC-001: Edição e Aprovação de Descontos
  const comercial = perms['Comercial'] || [];
  if (Array.isArray(comercial)) {
    const temDesconto = comercial.includes('desconto');
    const temAprovar = comercial.includes('aprovar');
    const temEditar = comercial.includes('editar');
    if (temDesconto && temAprovar && temEditar) {
      conflitos.push({
        regra: 'COM-DESC-001',
        severidade: 'Média',
        descricao: 'Mesmo perfil pode editar e aprovar desconto.'
      });
    }
  }

  // SYS-RBAC-001: Admin de Acessos + Leitura de Auditoria
  const sistema = perms['Sistema'] || [];
  if (Array.isArray(sistema)) {
    const temAdminAcesso = sistema.includes('editar');
    const temAuditoria = sistema.includes('ver');
    if (temAdminAcesso && temAuditoria && sistema.length >= 2) {
      conflitos.push({
        regra: 'SYS-RBAC-001',
        severidade: 'Crítica',
        descricao: 'Perfil administra acessos e visualiza trilhas sensíveis.'
      });
    }
  }

  // FIS-NFE-001: Emissão e Cancelamento de NFe
  const fiscal = perms['Fiscal'] || [];
  if (Array.isArray(fiscal)) {
    const temEmitir = fiscal.includes('criar') || fiscal.includes('emitir');
    const temCancelar = fiscal.includes('excluir') || fiscal.includes('cancelar');
    if (temEmitir && temCancelar) {
      conflitos.push({
        regra: 'FIS-NFE-001',
        severidade: 'Alta',
        descricao: 'Mesmo perfil pode emitir e cancelar documentos fiscais.'
      });
    }
  }

  // LOG-SEC-001: Deletar Logs de Auditoria
  const auditLog = perms['AuditLog'] || [];
  if (Array.isArray(auditLog) && auditLog.includes('excluir')) {
    conflitos.push({
      regra: 'LOG-SEC-001',
      severidade: 'Crítica',
      descricao: 'Perfil pode deletar registros de auditoria (não permitido).'
    });
  }

  // EST-MOV-001: Criar e Aprovar Movimentações de Estoque
  const estoque = perms['Estoque'] || [];
  if (Array.isArray(estoque)) {
    if (estoque.includes('criar') && estoque.includes('aprovar')) {
      conflitos.push({
        regra: 'EST-MOV-001',
        severidade: 'Alta',
        descricao: 'Mesmo perfil pode criar e aprovar movimentações de estoque.'
      });
    }
  }

  // CMP-OC-001: Criar Ordem de Compra e Aprovar Pagamento
  const compras = perms['Compras'] || [];
  const finAncer2 = perms['Financeiro'] || [];
  if (Array.isArray(compras) && Array.isArray(finAncer2)) {
    const temCriarOC = compras.includes('criar');
    const temPagarFin = finAncer2.includes('liquidar') || finAncer2.includes('pago');
    if (temCriarOC && temPagarFin) {
      conflitos.push({
        regra: 'CMP-OC-001',
        severidade: 'Alta',
        descricao: 'Mesmo perfil pode criar Ordem de Compra e liquidar pagamentos.'
      });
    }
  }

  // RH-SAL-001: Editar Salário e Aprovar Folha
  const rh = perms['RH'] || [];
  if (Array.isArray(rh)) {
    if (rh.includes('editar') && rh.includes('aprovar')) {
      conflitos.push({
        regra: 'RH-SAL-001',
        severidade: 'Média',
        descricao: 'Mesmo perfil pode editar dados salariais e aprovar folha de pagamento.'
      });
    }
  }

  // ADM-USR-001: Criar usuários E editar perfis de acesso
  const adm = perms['Administração'] || perms['Sistema'] || [];
  if (Array.isArray(adm)) {
    const temCriarUser = adm.includes('criar');
    const temEditarPerfil = adm.includes('editar');
    if (temCriarUser && temEditarPerfil) {
      conflitos.push({
        regra: 'ADM-USR-001',
        severidade: 'Crítica',
        descricao: 'Mesmo perfil pode criar usuários e editar perfis de acesso (escalada de privilégio).'
      });
    }
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