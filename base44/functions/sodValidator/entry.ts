import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * sodValidator — Validação SoD em perfis de acesso.
 * Regras unificadas e sincronizadas com securityPoliciesValidator/entry.ts.
 *
 * 14 regras cobrindo:
 * - Intra-módulo: aprovar+liquidar, criar+excluir, emitir+cancelar, etc.
 * - Inter-módulo: criar compra+liquidar pagamento, aprovar produção+criar compra
 * - Sistema: escrita não-admin, excluir auditoria, escalada de privilégio
 */

let LAST_SOD_RUN_AT = 0;
const SOD_COOLDOWN_MS = 60 * 60 * 1000;

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
  return extractActions(modNode).includes(normalizeAction(action));
}

function hasAny(modNode, ...actions) {
  const acts = extractActions(modNode);
  return actions.some(a => acts.includes(normalizeAction(a)));
}

function detectSodConflicts(permissoes = {}) {
  const perms = permissoes || {};
  const conflitos = [];

  // === INTRA-MÓDULO ===

  // 1. FIN-PAG-001 (Alta): Aprovar + Liquidar
  const fin = perms['Financeiro'] || perms['financeiro'] || {};
  if (hasAction(fin, 'aprovar') && hasAny(fin, 'liquidar', 'pagar', 'pago')) {
    conflitos.push({ regra: 'FIN-PAG-001', tipo_conflito: 'Financeiro:aprovar+liquidar', severidade: 'Alta', descricao: 'Mesmo perfil pode aprovar e liquidar pagamentos.' });
  }

  // 2. FIN-CRU-001 (Média): Criar + Excluir
  if (hasAction(fin, 'criar') && hasAction(fin, 'excluir')) {
    conflitos.push({ regra: 'FIN-CRU-001', tipo_conflito: 'Financeiro:criar+excluir', severidade: 'Média', descricao: 'Mesmo perfil pode criar e excluir lançamentos financeiros.' });
  }

  // 3. FIN-APR-001 (Alta): Aprovar + Criar/Editar
  if (hasAction(fin, 'aprovar') && hasAny(fin, 'criar', 'editar')) {
    conflitos.push({ regra: 'FIN-APR-001', tipo_conflito: 'Financeiro:aprovar+criar/editar', severidade: 'Alta', descricao: 'Quem aprova no Financeiro não deve criar ou editar lançamentos.' });
  }

  // 4. COM-DESC-001 (Média): Editar + Aprovar descontos
  const com = perms['Comercial'] || perms['comercial'] || {};
  if (hasAny(com, 'desconto', 'editar') && hasAction(com, 'aprovar')) {
    conflitos.push({ regra: 'COM-DESC-001', tipo_conflito: 'Comercial:editar+aprovar', severidade: 'Média', descricao: 'Mesmo perfil pode editar e aprovar descontos.' });
  }

  // 5. COM-APR-001 (Média): Criar + Aprovar pedidos
  if (hasAction(com, 'criar') && hasAction(com, 'aprovar')) {
    conflitos.push({ regra: 'COM-APR-001', tipo_conflito: 'Comercial:criar+aprovar', severidade: 'Média', descricao: 'Mesmo perfil pode criar e aprovar pedidos.' });
  }

  // 6. FIS-NFE-001 (Alta): Emitir + Cancelar
  const fis = perms['Fiscal'] || perms['fiscal'] || {};
  if (hasAny(fis, 'criar', 'emitir') && hasAny(fis, 'excluir', 'cancelar')) {
    conflitos.push({ regra: 'FIS-NFE-001', tipo_conflito: 'Fiscal:emitir+cancelar', severidade: 'Alta', descricao: 'Mesmo perfil pode emitir e cancelar documentos fiscais.' });
  }

  // 7. CMP-APR-001 (Média): Criar + Aprovar OC
  const cmp = perms['Compras'] || perms['compras'] || {};
  if (hasAction(cmp, 'criar') && hasAction(cmp, 'aprovar')) {
    conflitos.push({ regra: 'CMP-APR-001', tipo_conflito: 'Compras:criar+aprovar', severidade: 'Média', descricao: 'Mesmo perfil pode criar e aprovar ordens de compra.' });
  }

  // 8. EST-TRF-001 (Média): Transferir + Excluir
  const est = perms['Estoque'] || perms['estoque'] || {};
  if (hasAction(est, 'transferir') && hasAction(est, 'excluir')) {
    conflitos.push({ regra: 'EST-TRF-001', tipo_conflito: 'Estoque:transferir+excluir', severidade: 'Média', descricao: 'Mesmo perfil pode transferir e excluir movimentações de estoque.' });
  }

  // 9. RH-APR-001 (Média): Editar + Aprovar RH
  const rh = perms['RH'] || perms['rh'] || {};
  if (hasAction(rh, 'editar') && hasAction(rh, 'aprovar')) {
    conflitos.push({ regra: 'RH-APR-001', tipo_conflito: 'RH:editar+aprovar', severidade: 'Média', descricao: 'Mesmo perfil pode editar dados e aprovar solicitações de RH.' });
  }

  // === INTER-MÓDULO ===

  // 10. CMP-OC-001 (Alta): Criar OC + Liquidar Financeiro
  if (hasAction(cmp, 'criar') && hasAny(fin, 'liquidar', 'pagar', 'pago')) {
    conflitos.push({ regra: 'CMP-OC-001', tipo_conflito: 'Compras:criar+Financeiro:liquidar', severidade: 'Alta', descricao: 'Mesmo perfil pode criar ordens de compra e liquidar pagamentos.' });
  }

  // 11. PRD-OC-001 (Média): Aprovar Produção + Criar Compras
  const prod = perms['Producao'] || perms['Produção'] || perms['producao'] || {};
  if (hasAction(prod, 'aprovar') && hasAction(cmp, 'criar')) {
    conflitos.push({ regra: 'PRD-OC-001', tipo_conflito: 'Producao:aprovar+Compras:criar', severidade: 'Média', descricao: 'Mesmo perfil pode aprovar produção e criar requisições de compra.' });
  }

  // === SISTEMA (não-admin) ===

  // 12. SYS-RBAC-001 (Crítica): Escrita em Sistema
  const sys = perms['Sistema'] || perms['sistema'] || perms['Administração'] || {};
  if (hasAny(sys, 'editar', 'criar', 'configurar', 'backup', 'seguranca', 'executar')) {
    conflitos.push({ regra: 'SYS-RBAC-001', tipo_conflito: 'Sistema:escrita-nao-admin', severidade: 'Crítica', descricao: 'Perfil não-admin com acesso de escrita ao módulo Sistema.' });
  }

  // 13. LOG-SEC-001 (Crítica): Excluir auditoria
  const aud = perms['AuditLog'] || {};
  if (hasAny(aud, 'excluir', 'deletar', 'remover')) {
    conflitos.push({ regra: 'LOG-SEC-001', tipo_conflito: 'AuditLog:excluir', severidade: 'Crítica', descricao: 'Perfil pode deletar registros de auditoria (não permitido).' });
  }

  // 14. ADM-USR-001 (Crítica): Criar + Editar usuários/perfis
  if (hasAny(sys, 'criar') && hasAny(sys, 'editar')) {
    conflitos.push({ regra: 'ADM-USR-001', tipo_conflito: 'Sistema:criar+editar', severidade: 'Crítica', descricao: 'Mesmo perfil pode criar usuários e editar perfis (escalada de privilégio).' });
  }

  const order = { Baixa: 1, 'Média': 2, Alta: 3, 'Crítica': 4 };
  const severidadeMax = conflitos.length > 0
    ? conflitos.reduce((max, item) => order[item.severidade] > order[max] ? item.severidade : max, 'Baixa')
    : 'Baixa';

  return { conflitos, severidadeMax };
}

async function validateProfile(base44, perfil) {
  const { conflitos, severidadeMax } = detectSodConflicts(perfil?.permissoes || {});
  const patch = {
    conflitos_sod_detectados: conflitos,
    requer_aprovacao_especial: ['Alta', 'Crítica'].includes(severidadeMax) || perfil?.requer_aprovacao_especial || false,
  };
  const sameConflicts = JSON.stringify(perfil?.conflitos_sod_detectados || []) === JSON.stringify(patch.conflitos_sod_detectados || []);
  const sameApproval = perfil?.requer_aprovacao_especial === patch.requer_aprovacao_especial;
  if (!sameConflicts || !sameApproval) {
    await base44.asServiceRole.entities.PerfilAcesso.update(perfil.id, patch);
  }
  return { perfil_id: perfil.id, nome: perfil.nome_perfil || perfil.nome || perfil.id, conflitos: conflitos.length, severidadeMax, detalhes: conflitos };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let payload = {};
    try { payload = await req.json(); } catch { payload = {}; }

    const changedFields = Array.isArray(payload?.changed_fields) ? payload.changed_fields : [];
    const onlyInternalSodPatch = changedFields.length > 0 && changedFields.every((field) => ['conflitos_sod_detectados', 'requer_aprovacao_especial'].includes(field));
    if (onlyInternalSodPatch) {
      return Response.json({ ok: true, skipped: true, reason: 'patch interno SoD ignorado para evitar loop' });
    }

    let user = null;
    try { user = await base44.auth.me(); } catch { user = null; }
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const event = payload?.event || null;
    const incoming = payload?.data || null;
    const isEntityAutomation = event?.entity_name === 'PerfilAcesso';
    if (!payload?.force && !isEntityAutomation && Date.now() - LAST_SOD_RUN_AT < SOD_COOLDOWN_MS) {
      return Response.json({ ok: true, skipped: true, reason: 'SoD em cooldown anti-rate-limit' });
    }
    if (!isEntityAutomation) LAST_SOD_RUN_AT = Date.now();
    const results = [];

    if (event?.entity_name === 'PerfilAcesso') {
      let perfil = incoming;
      if (!perfil) {
        const list = await base44.asServiceRole.entities.PerfilAcesso.filter({ id: event.entity_id }, undefined, 1);
        perfil = list?.[0] || null;
      }
      if (!perfil) return Response.json({ ok: false, error: 'Perfil não encontrado' }, { status: 400 });
      results.push(await validateProfile(base44, perfil));
    } else {
      const scope = {};
      if (payload?.group_id) scope.group_id = payload.group_id;
      if (payload?.empresa_id) scope.empresa_id = payload.empresa_id;
      
      const perfis = await base44.asServiceRole.entities.PerfilAcesso.filter(scope, '-updated_date', 100);
      for (const perfil of perfis || []) {
        results.push(await validateProfile(base44, perfil));
      }
    }

    const totalConflitos = results.reduce((sum, item) => sum + item.conflitos, 0);
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user?.full_name || 'Sistema',
      usuario_id: user?.id || null,
      acao: 'Visualização',
      modulo: 'Controle de Acesso',
      tipo_auditoria: 'seguranca',
      entidade: 'PerfilAcesso',
      descricao: `Validação SoD concluída: ${results.length} perfil(is), ${totalConflitos} conflito(s).`,
      dados_novos: { results },
      data_hora: new Date().toISOString(),
    });

    return Response.json({ ok: true, perfis_validados: results.length, conflitos: totalConflitos, results });
  } catch (error) {
    const status = error?.status || error?.response?.status;
    if (status === 429 || status === 502 || (typeof status === 'number' && status >= 500)) {
      LAST_SOD_RUN_AT = Date.now();
      return Response.json({ ok: true, skipped: true, reason: 'SoD pausado temporariamente por rate-limit' });
    }
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});