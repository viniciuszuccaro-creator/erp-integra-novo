import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

let LAST_SOD_RUN_AT = 0;
const SOD_COOLDOWN_MS = 60 * 60 * 1000;

function flattenActions(permissoes, prefix = []) {
  const rows = [];
  if (!permissoes || typeof permissoes !== 'object') return rows;
  for (const [key, value] of Object.entries(permissoes)) {
    const path = [...prefix, key];
    if (Array.isArray(value)) {
      rows.push({ path: path.join('.'), actions: value.map((a) => String(a).toLowerCase()) });
    } else if (value && typeof value === 'object') {
      rows.push(...flattenActions(value, path));
    }
  }
  return rows;
}

function detectSodConflicts(permissoes = {}) {
  const perms = permissoes || {};
  const conflitos = [];

  // Extrai ações de um nó de permissões (array ou objeto aninhado)
  const extractActions = (node) => {
    if (!node) return [];
    if (Array.isArray(node)) return node.map(a => String(a).toLowerCase());
    if (typeof node === 'object') return Object.values(node).flatMap(v => extractActions(v));
    return [];
  };

  const hasAny = (node, ...actions) => { const acts = extractActions(node); return actions.some(a => acts.includes(a)); };

  // FIN-PAG-001: Aprovação e Liquidação de Pagamentos
  const fin = perms['Financeiro'] || {};
  if (hasAny(fin, 'aprovar') && hasAny(fin, 'liquidar', 'pago')) {
    conflitos.push({ regra: 'FIN-PAG-001', severidade: 'Alta', descricao: 'Mesmo perfil pode aprovar e liquidar pagamentos.' });
  }

  // COM-DESC-001: Edição e Aprovação de Descontos
  const com = perms['Comercial'] || {};
  if (hasAny(com, 'desconto', 'editar') && hasAny(com, 'aprovar')) {
    conflitos.push({ regra: 'COM-DESC-001', severidade: 'Média', descricao: 'Mesmo perfil pode editar e aprovar descontos.' });
  }

  // SYS-RBAC-001: Admin de Acessos + Leitura de Auditoria
  const sys = perms['Sistema'] || perms['Administração'] || {};
  if (hasAny(sys, 'editar', 'criar') && hasAny(sys, 'ver', 'visualizar')) {
    const acts = extractActions(sys);
    if (acts.length >= 2) {
      conflitos.push({ regra: 'SYS-RBAC-001', severidade: 'Crítica', descricao: 'Perfil administra acessos e visualiza trilhas sensíveis.' });
    }
  }

  // FIS-NFE-001: Emissão e Cancelamento de NF-e
  const fis = perms['Fiscal'] || {};
  if (hasAny(fis, 'criar', 'emitir') && hasAny(fis, 'excluir', 'cancelar')) {
    conflitos.push({ regra: 'FIS-NFE-001', severidade: 'Alta', descricao: 'Mesmo perfil pode emitir e cancelar documentos fiscais.' });
  }

  // LOG-SEC-001: Deletar Logs de Auditoria
  const aud = perms['AuditLog'] || {};
  if (hasAny(aud, 'excluir', 'deletar')) {
    conflitos.push({ regra: 'LOG-SEC-001', severidade: 'Crítica', descricao: 'Perfil pode deletar registros de auditoria (não permitido).' });
  }

  // EST-MOV-001: Criar e Aprovar Movimentações de Estoque
  const est = perms['Estoque'] || {};
  if (hasAny(est, 'criar') && hasAny(est, 'aprovar')) {
    conflitos.push({ regra: 'EST-MOV-001', severidade: 'Alta', descricao: 'Mesmo perfil pode criar e aprovar movimentações de estoque.' });
  }

  // CMP-OC-001: Criar Ordem de Compra e Liquidar Pagamento
  const cmp = perms['Compras'] || {};
  if (hasAny(cmp, 'criar') && hasAny(fin, 'liquidar', 'pago')) {
    conflitos.push({ regra: 'CMP-OC-001', severidade: 'Alta', descricao: 'Mesmo perfil pode criar Ordem de Compra e liquidar pagamentos.' });
  }

  // RH-SAL-001: Editar Salário e Aprovar Folha
  const rh = perms['RH'] || {};
  if (hasAny(rh, 'editar') && hasAny(rh, 'aprovar')) {
    conflitos.push({ regra: 'RH-SAL-001', severidade: 'Média', descricao: 'Mesmo perfil pode editar dados salariais e aprovar folha de pagamento.' });
  }

  // ADM-USR-001: Criar Usuários + Editar Perfis (escalada de privilégio)
  const adm = perms['Administração'] || perms['Sistema'] || {};
  if (hasAny(adm, 'criar') && hasAny(adm, 'editar')) {
    conflitos.push({ regra: 'ADM-USR-001', severidade: 'Crítica', descricao: 'Mesmo perfil pode criar usuários e editar perfis de acesso (escalada de privilégio).' });
  }

  // PRD-OC-001: Aprovar Produção + Requisitar Compra
  const prod = perms['Produção'] || perms['Producao'] || {};
  if (hasAny(prod, 'aprovar') && hasAny(cmp, 'criar')) {
    conflitos.push({ regra: 'PRD-OC-001', severidade: 'Média', descricao: 'Mesmo perfil pode aprovar ordens de produção e criar requisições de compra.' });
  }

  const order = { Baixa: 1, Média: 2, Alta: 3, Crítica: 4 };
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
  return { perfil_id: perfil.id, nome: perfil.nome_perfil || perfil.nome || perfil.id, conflitos: conflitos.length, severidadeMax };
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
      // Valida todos os perfis no escopo (grupo/empresa)
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