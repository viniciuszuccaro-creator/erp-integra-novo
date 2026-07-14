import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * securityPoliciesValidator — Validação consolidada de SoD + alertas de segurança.
 *
 * Regras SoD unificadas (11 regras) cobrindo:
 * - Conflitos intra-módulo (mesma pessoa cria+exclui, aprova+liquida, emite+cancela)
 * - Conflitos inter-módulo (mesma pessoa cria compra+liquida pagamento, aprova produção+cria compra)
 * - Acesso indevido a Sistema/AuditLog por não-admin
 *
 * Princípio: o perfil Administrador é isento (role=admin no user, não no perfil).
 */

const COOLDOWN_MS = 15 * 60 * 1000;
let LAST_RUN_AT = 0;

function normalizeAction(a) {
  if (!a) return '';
  return String(a).toLowerCase().trim()
    .normalize('NFD').replace(/\p{Diacritic}/gu, '');
}

function extractActions(node) {
  if (!node) return [];
  if (Array.isArray(node)) return node.map(a => normalizeAction(a));
  if (typeof node === 'object') return Object.values(node).flatMap(v => extractActions(v));
  return [];
}

function hasAction(modNode, action) {
  const acts = extractActions(modNode);
  return acts.includes(normalizeAction(action));
}

function hasAny(modNode, ...actions) {
  const acts = extractActions(modNode);
  return actions.some(a => acts.includes(normalizeAction(a)));
}

/**
 * 11 regras SoD unificadas — fonte única de verdade.
 * Sincronizada com sodValidator/entry.ts e _lib/security/sodRules/entry.ts.
 */
function detectSodConflicts(permissoes = {}) {
  const perms = permissoes || {};
  const conflitos = [];

  // === INTRA-MÓDULO ===

  // 1. FIN-PAG-001 (Alta): Aprovar + Liquidar pagamentos
  const fin = perms['Financeiro'] || perms['financeiro'] || {};
  if (hasAction(fin, 'aprovar') && hasAny(fin, 'liquidar', 'pagar', 'pago')) {
    conflitos.push({
      regra: 'FIN-PAG-001',
      tipo_conflito: 'Financeiro:aprovar+liquidar',
      severidade: 'Alta',
      descricao: 'Mesmo perfil pode aprovar e liquidar pagamentos.'
    });
  }

  // 2. FIN-CRU-001 (Média): Criar + Excluir lançamentos financeiros
  if (hasAction(fin, 'criar') && hasAction(fin, 'excluir')) {
    conflitos.push({
      regra: 'FIN-CRU-001',
      tipo_conflito: 'Financeiro:criar+excluir',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode criar e excluir lançamentos financeiros.'
    });
  }

  // 3. FIN-APR-001 (Alta): Aprovar + Criar/Editar no Financeiro
  if (hasAction(fin, 'aprovar') && hasAny(fin, 'criar', 'editar')) {
    conflitos.push({
      regra: 'FIN-APR-001',
      tipo_conflito: 'Financeiro:aprovar+criar/editar',
      severidade: 'Alta',
      descricao: 'Quem aprova no Financeiro não deve criar ou editar lançamentos.'
    });
  }

  // 4. COM-DESC-001 (Média): Editar + Aprovar descontos no Comercial
  const com = perms['Comercial'] || perms['comercial'] || {};
  if (hasAny(com, 'desconto', 'editar') && hasAction(com, 'aprovar')) {
    conflitos.push({
      regra: 'COM-DESC-001',
      tipo_conflito: 'Comercial:editar+aprovar',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode editar e aprovar descontos.'
    });
  }

  // 5. COM-APR-001 (Média): Criar + Aprovar pedidos no Comercial
  if (hasAction(com, 'criar') && hasAction(com, 'aprovar')) {
    conflitos.push({
      regra: 'COM-APR-001',
      tipo_conflito: 'Comercial:criar+aprovar',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode criar e aprovar pedidos.'
    });
  }

  // 6. FIS-NFE-001 (Alta): Emitir + Cancelar documentos fiscais
  const fis = perms['Fiscal'] || perms['fiscal'] || {};
  if (hasAny(fis, 'criar', 'emitir') && hasAny(fis, 'excluir', 'cancelar')) {
    conflitos.push({
      regra: 'FIS-NFE-001',
      tipo_conflito: 'Fiscal:emitir+cancelar',
      severidade: 'Alta',
      descricao: 'Mesmo perfil pode emitir e cancelar documentos fiscais.'
    });
  }

  // 7. CMP-APR-001 (Média): Criar + Aprovar ordens de compra
  const cmp = perms['Compras'] || perms['compras'] || {};
  if (hasAction(cmp, 'criar') && hasAction(cmp, 'aprovar')) {
    conflitos.push({
      regra: 'CMP-APR-001',
      tipo_conflito: 'Compras:criar+aprovar',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode criar e aprovar ordens de compra.'
    });
  }

  // 8. EST-TRF-001 (Média): Transferir + Excluir movimentações de estoque
  const est = perms['Estoque'] || perms['estoque'] || {};
  if (hasAction(est, 'transferir') && hasAction(est, 'excluir')) {
    conflitos.push({
      regra: 'EST-TRF-001',
      tipo_conflito: 'Estoque:transferir+excluir',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode transferir e excluir movimentações de estoque.'
    });
  }

  // 9. RH-APR-001 (Média): Editar + Aprovar solicitações de RH
  const rh = perms['RH'] || perms['rh'] || {};
  if (hasAction(rh, 'editar') && hasAction(rh, 'aprovar')) {
    conflitos.push({
      regra: 'RH-APR-001',
      tipo_conflito: 'RH:editar+aprovar',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode editar dados e aprovar solicitações de RH.'
    });
  }

  // === INTER-MÓDULO ===

  // 10. CMP-OC-001 (Alta): Criar OC em Compras + Liquidar em Financeiro
  if (hasAction(cmp, 'criar') && hasAny(fin, 'liquidar', 'pagar', 'pago')) {
    conflitos.push({
      regra: 'CMP-OC-001',
      tipo_conflito: 'Compras:criar+Financeiro:liquidar',
      severidade: 'Alta',
      descricao: 'Mesmo perfil pode criar ordens de compra e liquidar pagamentos.'
    });
  }

  // 11. PRD-OC-001 (Média): Aprovar Produção + Criar Compras
  const prod = perms['Producao'] || perms['Produção'] || perms['producao'] || {};
  if (hasAction(prod, 'aprovar') && hasAction(cmp, 'criar')) {
    conflitos.push({
      regra: 'PRD-OC-001',
      tipo_conflito: 'Producao:aprovar+Compras:criar',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode aprovar produção e criar requisições de compra.'
    });
  }

  // === SISTEMA (não-admin) ===

  // 12. SYS-RBAC-001 (Crítica): Não-admin com escrita em Sistema
  const sys = perms['Sistema'] || perms['sistema'] || perms['Administração'] || {};
  if (hasAny(sys, 'editar', 'criar', 'configurar', 'backup', 'seguranca', 'executar')) {
    conflitos.push({
      regra: 'SYS-RBAC-001',
      tipo_conflito: 'Sistema:escrita-nao-admin',
      severidade: 'Crítica',
      descricao: 'Perfil não-admin com acesso de escrita ao módulo Sistema.'
    });
  }

  // 13. LOG-SEC-001 (Crítica): Excluir logs de auditoria
  const aud = perms['AuditLog'] || {};
  if (hasAny(aud, 'excluir', 'deletar', 'remover')) {
    conflitos.push({
      regra: 'LOG-SEC-001',
      tipo_conflito: 'AuditLog:excluir',
      severidade: 'Crítica',
      descricao: 'Perfil pode deletar registros de auditoria (não permitido).'
    });
  }

  // 14. ADM-USR-001 (Crítica): Criar + Editar usuários/perfis (escalada de privilégio)
  if (hasAny(sys, 'criar') && hasAny(sys, 'editar')) {
    conflitos.push({
      regra: 'ADM-USR-001',
      tipo_conflito: 'Sistema:criar+editar',
      severidade: 'Crítica',
      descricao: 'Mesmo perfil pode criar usuários e editar perfis de acesso (escalada de privilégio).'
    });
  }

  const order = { Baixa: 1, 'Média': 2, Alta: 3, 'Crítica': 4 };
  const severidadeMax = conflitos.length > 0
    ? conflitos.reduce((max, item) => order[item.severidade] > order[max] ? item.severidade : max, 'Baixa')
    : 'Baixa';

  return { conflitos, severidadeMax };
}

function detectSecurityAlerts(logs, windowMinutes = 15) {
  const countBy = (arr, fn) => arr.reduce((acc, v) => { const k = fn(v); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  const byAction = countBy(logs, (l) => l.acao || '');
  const suspicious = [];

  if ((byAction['Exclusão'] || 0) >= 5) {
    suspicious.push({ tipo: 'Exclusões em massa', severidade: 'Alta', detalhes: `${byAction['Exclusão']} exclusões` });
  }

  const perfilChanges = logs.filter((l) => l.entidade === 'PerfilAcesso' && ['Criação', 'Edição'].includes(l.acao));
  if (perfilChanges.length >= 3) {
    suspicious.push({ tipo: 'Mudanças frequentes de perfil', severidade: 'Média', detalhes: `${perfilChanges.length} mudanças` });
  }

  const blocks = logs.filter((l) => l.acao === 'Bloqueio');
  if (blocks.length >= 10) {
    suspicious.push({ tipo: 'Muitos bloqueios', severidade: 'Média', detalhes: `${blocks.length} bloqueios` });
  }

  const funcLatency = logs.filter((l) => l.entidade === 'FunctionLatency' && (Number(l?.duracao_ms) || 0) > 1500);
  if (funcLatency.length >= 5) {
    const max = Math.max(...funcLatency.map((l) => Number(l?.duracao_ms) || 0));
    suspicious.push({ tipo: 'Funções lentas', severidade: max > 3000 ? 'Alta' : 'Média', detalhes: `${funcLatency.length} chamadas` });
  }

  return suspicious;
}

async function validateProfile(base44, perfil) {
  const { conflitos, severidadeMax } = detectSodConflicts(perfil?.permissoes || {});
  const patch = {
    conflitos_sod_detectados: conflitos,
    requer_aprovacao_especial: ['Alta', 'Crítica'].includes(severidadeMax) || false,
  };
  const sameConflicts = JSON.stringify(perfil?.conflitos_sod_detectados || []) === JSON.stringify(patch.conflitos_sod_detectados || []);
  const sameApproval = perfil?.requer_aprovacao_especial === patch.requer_aprovacao_especial;
  if (!sameConflicts || !sameApproval) {
    await base44.asServiceRole.entities.PerfilAcesso.update(perfil.id, patch);
  }
  return { perfil_id: perfil.id, nome: perfil.nome_perfil || perfil.id, conflitos: conflitos.length, severidadeMax, detalhes: conflitos };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!body?.force && Date.now() - LAST_RUN_AT < COOLDOWN_MS) {
      return Response.json({ ok: true, skipped: true, reason: 'cooldown' });
    }
    LAST_RUN_AT = Date.now();

    // 1) Validar SoD em PerfilAcesso
    const scope = {};
    if (body?.group_id) scope.group_id = body.group_id;
    if (body?.empresa_id) scope.empresa_id = body.empresa_id;

    const perfis = await base44.asServiceRole.entities.PerfilAcesso.filter(scope, '-updated_date', 100);
    const profileResults = [];
    for (const perfil of perfis || []) {
      profileResults.push(await validateProfile(base44, perfil));
    }

    // 2) Detectar alertas de segurança
    const logs = await base44.asServiceRole.entities.AuditLog.filter(scope, '-created_date', 120);
    const alerts = detectSecurityAlerts(logs, 15);

    // 3) Auditoria consolidada
    const totalConflitos = profileResults.reduce((sum, item) => sum + item.conflitos, 0);
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user?.full_name || 'Sistema',
      usuario_id: user?.id || null,
      acao: 'Visualização',
      modulo: 'Sistema',
      tipo_auditoria: 'seguranca',
      entidade: 'SecurityPolicies',
      descricao: `Validação consolidada: ${profileResults.length} perfis, ${totalConflitos} conflitos SoD, ${alerts.length} alertas`,
      dados_novos: { profileResults, alerts },
      data_hora: new Date().toISOString(),
      ...scope,
    });

    return Response.json({ ok: true, perfis: profileResults.length, conflitos: totalConflitos, alerts: alerts.length, results: profileResults });
  } catch (error) {
    const status = error?.response?.status || error?.status;
    if (status === 429 || status >= 500) {
      LAST_RUN_AT = Date.now();
      return Response.json({ ok: true, skipped: true, reason: 'rate-limit' });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});