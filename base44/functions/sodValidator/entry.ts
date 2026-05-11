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
  const rows = flattenActions(permissoes);
  const all = rows.flatMap((row) => row.actions.map((action) => `${row.path}.${action}`));
  const hasAny = (terms) => all.some((item) => terms.some((term) => item.includes(term)));
  const conflitos = [];

  if (hasAny(['financeiro', 'contapagar', 'pagar']) && hasAny(['aprovar']) && hasAny(['pago', 'liquidar', 'editar'])) {
    conflitos.push({ regra: 'FIN-PAG-001', severidade: 'Alta', descricao: 'Mesmo perfil pode aprovar e liquidar pagamentos.' });
  }
  if (hasAny(['pedido', 'comercial']) && hasAny(['desconto', 'margem']) && hasAny(['aprovar']) && hasAny(['editar'])) {
    conflitos.push({ regra: 'COM-DESC-001', severidade: 'Média', descricao: 'Mesmo perfil pode editar e aprovar desconto/margem.' });
  }
  if (hasAny(['perfil', 'acesso', 'usuario']) && hasAny(['criar', 'editar', 'excluir']) && hasAny(['auditoria', 'logs'])) {
    conflitos.push({ regra: 'SYS-RBAC-001', severidade: 'Crítica', descricao: 'Perfil administra acessos e visualiza/edita trilhas sensíveis.' });
  }
  if (hasAny(['notafiscal', 'fiscal']) && hasAny(['emitir', 'criar']) && hasAny(['cancelar', 'excluir'])) {
    conflitos.push({ regra: 'FIS-NFE-001', severidade: 'Alta', descricao: 'Mesmo perfil pode emitir e cancelar/excluir documentos fiscais.' });
  }

  const order = { Baixa: 1, Média: 2, Alta: 3, Crítica: 4 };
  const severidadeMax = conflitos.reduce((max, item) => order[item.severidade] > order[max] ? item.severidade : max, 'Baixa');
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
      const perfis = await base44.asServiceRole.entities.PerfilAcesso.list('-updated_date', 25);
      for (const perfil of perfis) {
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