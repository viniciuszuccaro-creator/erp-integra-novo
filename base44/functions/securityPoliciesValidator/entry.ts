import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Consolidação de: securityAlerts + sodValidator + conflictPolicy
// Valida SoD + detecta alertas + detecta inconsistências de fluxo

const COOLDOWN_MS = 15 * 60 * 1000;
let LAST_RUN_AT = 0;

function detectSodConflicts(permissoes = {}) {
  const perms = permissoes || {};
  const conflitos = [];

  const finAncer = perms['Financeiro'] || [];
  if (Array.isArray(finAncer) && finAncer.includes('aprovar') && (finAncer.includes('liquidar') || finAncer.includes('pago'))) {
    conflitos.push({
      regra: 'FIN-PAG-001',
      severidade: 'Alta',
      descricao: 'Mesmo perfil pode aprovar e liquidar pagamentos.'
    });
  }

  const comercial = perms['Comercial'] || [];
  if (Array.isArray(comercial) && comercial.includes('desconto') && comercial.includes('aprovar') && comercial.includes('editar')) {
    conflitos.push({
      regra: 'COM-DESC-001',
      severidade: 'Média',
      descricao: 'Mesmo perfil pode editar e aprovar desconto.'
    });
  }

  const sistema = perms['Sistema'] || [];
  if (Array.isArray(sistema) && sistema.includes('editar') && sistema.includes('ver') && sistema.length >= 2) {
    conflitos.push({
      regra: 'SYS-RBAC-001',
      severidade: 'Crítica',
      descricao: 'Perfil administra acessos e visualiza trilhas sensíveis.'
    });
  }

  const fiscal = perms['Fiscal'] || [];
  if (Array.isArray(fiscal) && (fiscal.includes('criar') || fiscal.includes('emitir')) && (fiscal.includes('excluir') || fiscal.includes('cancelar'))) {
    conflitos.push({
      regra: 'FIS-NFE-001',
      severidade: 'Alta',
      descricao: 'Mesmo perfil pode emitir e cancelar documentos fiscais.'
    });
  }

  const auditLog = perms['AuditLog'] || [];
  if (Array.isArray(auditLog) && auditLog.includes('excluir')) {
    conflitos.push({
      regra: 'LOG-SEC-001',
      severidade: 'Crítica',
      descricao: 'Perfil pode deletar registros de auditoria.'
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