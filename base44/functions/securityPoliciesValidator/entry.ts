import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Consolidação de: securityAlerts + sodValidator + conflictPolicy
// Valida SoD + detecta alertas + detecta inconsistências de fluxo

const COOLDOWN_MS = 15 * 60 * 1000;
let LAST_RUN_AT = 0;

function detectSodConflicts(permissoes = {}) {
  const perms = permissoes || {};
  const conflitos = [];

  // Helper: verifica se módulo contém ação (suporta array direto ou subseções aninhadas)
  const hasAction = (modNode, action) => {
    if (!modNode) return false;
    if (Array.isArray(modNode)) return modNode.includes(action);
    if (typeof modNode === 'object') {
      return Object.values(modNode).some(v => {
        if (Array.isArray(v)) return v.includes(action);
        if (v && typeof v === 'object') return Object.values(v).some(vv => Array.isArray(vv) && vv.includes(action));
        return false;
      });
    }
    return false;
  };

  const finNode = perms['Financeiro'] || perms['financeiro'];
  if (hasAction(finNode, 'aprovar') && (hasAction(finNode, 'liquidar') || hasAction(finNode, 'pagar'))) {
    conflitos.push({
      regra: 'FIN-PAG-001',
      severidade: 'Alta',
      descricao: 'Mesmo perfil pode aprovar e liquidar pagamentos.'
    });
  }

  // Financeiro: criar + excluir no mesmo perfil
  if (hasAction(finNode, 'criar') && hasAction(finNode, 'excluir')) {
    conflitos.push({
      regra: 'FIN-CRU-001',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode criar e excluir lançamentos financeiros.'
    });
  }

  const comNode = perms['Comercial'] || perms['comercial'];
  if (hasAction(comNode, 'desconto') && hasAction(comNode, 'aprovar') && hasAction(comNode, 'editar')) {
    conflitos.push({
      regra: 'COM-DESC-001',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode editar e aprovar desconto.'
    });
  }

  // Comercial: criar pedido + aprovar pedido no mesmo perfil
  if (hasAction(comNode, 'criar') && hasAction(comNode, 'aprovar')) {
    conflitos.push({
      regra: 'COM-APR-001',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode criar e aprovar pedidos.'
    });
  }

  const sysNode = perms['Sistema'] || perms['sistema'];
  // Sistema: qualquer acesso de escrita para não-admin é conflito crítico
  if (hasAction(sysNode, 'editar') || hasAction(sysNode, 'configurar') || hasAction(sysNode, 'backup') || hasAction(sysNode, 'seguranca')) {
    conflitos.push({
      regra: 'SYS-RBAC-001',
      severidade: 'Crítica',
      descricao: 'Perfil não-admin com acesso de escrita ao módulo Sistema.'
    });
  }

  const fisNode = perms['Fiscal'] || perms['fiscal'];
  if ((hasAction(fisNode, 'criar') || hasAction(fisNode, 'emitir')) && (hasAction(fisNode, 'excluir') || hasAction(fisNode, 'cancelar'))) {
    conflitos.push({
      regra: 'FIS-NFE-001',
      severidade: 'Alta',
      descricao: 'Mesmo perfil pode emitir e cancelar documentos fiscais.'
    });
  }

  // Compras: criar OC + aprovar OC no mesmo perfil
  const compNode = perms['Compras'] || perms['compras'];
  if (hasAction(compNode, 'criar') && hasAction(compNode, 'aprovar')) {
    conflitos.push({
      regra: 'CMP-APR-001',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode criar e aprovar ordens de compra.'
    });
  }

  // Estoque: transferir + excluir no mesmo perfil
  const estNode = perms['Estoque'] || perms['estoque'];
  if (hasAction(estNode, 'transferir') && hasAction(estNode, 'excluir')) {
    conflitos.push({
      regra: 'EST-TRF-001',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode transferir e excluir movimentações de estoque.'
    });
  }

  // RH: aprovar férias + editar colaborador (pode aprovar próprio pedido)
  const rhNode = perms['RH'] || perms['rh'];
  if (hasAction(rhNode, 'aprovar') && hasAction(rhNode, 'editar')) {
    conflitos.push({
      regra: 'RH-APR-001',
      severidade: 'Baixa',
      descricao: 'Mesmo perfil pode editar e aprovar solicitações de RH.'
    });
  }

  const order = { Baixa: 1, Média: 2, Alta: 3, Crítica: 4 };
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
  return { perfil_id: perfil.id, nome: perfil.nome_perfil || perfil.id, conflitos: conflitos.length, severidadeMax };
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
    const perfis = await base44.asServiceRole.entities.PerfilAcesso.filter({}, '-updated_date', 100);
    const profileResults = [];
    for (const perfil of perfis || []) {
      profileResults.push(await validateProfile(base44, perfil));
    }

    // 2) Detectar alertas de segurança
    const logs = await base44.asServiceRole.entities.AuditLog.filter({}, '-created_date', 120);
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
    });

    return Response.json({ ok: true, perfis: profileResults.length, conflitos: totalConflitos, alerts: alerts.length });
  } catch (error) {
    const status = error?.response?.status || error?.status;
    if (status === 429 || status >= 500) {
      LAST_RUN_AT = Date.now();
      return Response.json({ ok: true, skipped: true, reason: 'rate-limit' });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});