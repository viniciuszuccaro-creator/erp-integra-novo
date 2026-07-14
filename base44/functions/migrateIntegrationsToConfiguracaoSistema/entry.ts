import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

function keyEmpresa(empresaId) {
  return `integracoes_${empresaId}`;
}
function keyGrupo(groupId) {
  return `integracoes_group_${groupId}`;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const nfe = await base44.entities.ConfiguracaoNFe.list();
    const boletos = await base44.entities.ConfiguracaoBoletos.list();
    const whatsapp = await base44.entities.ConfiguracaoWhatsApp.list();

    const porEmpresa = new Map();
    const porGrupo = new Map();

    for (const cfg of nfe) {
      const emp = cfg.empresa_id || cfg.data?.empresa_id;
      const grp = cfg.group_id || cfg.data?.group_id;
      const obj = cfg.data || cfg;
      if (emp) {
        const k = emp;
        const entry = porEmpresa.get(k) || {};
        entry.integracao_nfe = obj;
        porEmpresa.set(k, entry);
      } else if (grp) {
        const k = grp;
        const entry = porGrupo.get(k) || {};
        entry.integracao_nfe = obj;
        porGrupo.set(k, entry);
      }
    }

    for (const cfg of boletos) {
      const emp = cfg.empresa_id || cfg.data?.empresa_id;
      const grp = cfg.group_id || cfg.data?.group_id;
      const obj = cfg.data || cfg;
      if (emp) {
        const entry = porEmpresa.get(emp) || {};
        entry.integracao_boletos = obj;
        porEmpresa.set(emp, entry);
      } else if (grp) {
        const entry = porGrupo.get(grp) || {};
        entry.integracao_boletos = obj;
        porGrupo.set(grp, entry);
      }
    }

    for (const cfg of whatsapp) {
      const emp = cfg.empresa_id || cfg.data?.empresa_id;
      const grp = cfg.group_id || cfg.data?.group_id;
      const obj = cfg.data || cfg;
      if (emp) {
        const entry = porEmpresa.get(emp) || {};
        entry.integracao_whatsapp = obj;
        porEmpresa.set(emp, entry);
      } else if (grp) {
        const entry = porGrupo.get(grp) || {};
        entry.integracao_whatsapp = obj;
        porGrupo.set(grp, entry);
      }
    }

    let upserts = 0;

    for (const [empresaId, data] of porEmpresa.entries()) {
      const chave = keyEmpresa(empresaId);
      const existentes = await base44.entities.ConfiguracaoSistema.filter({ chave }, undefined, 1);
      const payload = {
        chave,
        categoria: 'Integracoes',
        integracao_nfe: data.integracao_nfe || undefined,
        integracao_boletos: data.integracao_boletos || undefined,
        integracao_whatsapp: data.integracao_whatsapp || undefined,
      };
      if (existentes && existentes.length > 0) {
        await base44.entities.ConfiguracaoSistema.update(existentes[0].id, payload);
      } else {
        await base44.entities.ConfiguracaoSistema.create(payload);
      }
      upserts += 1;
    }

    for (const [groupId, data] of porGrupo.entries()) {
      const chave = keyGrupo(groupId);
      const existentes = await base44.entities.ConfiguracaoSistema.filter({ chave }, undefined, 1);
      const payload = {
        chave,
        categoria: 'Integracoes',
        integracao_nfe: data.integracao_nfe || undefined,
        integracao_boletos: data.integracao_boletos || undefined,
        integracao_whatsapp: data.integracao_whatsapp || undefined,
      };
      if (existentes && existentes.length > 0) {
        await base44.entities.ConfiguracaoSistema.update(existentes[0].id, payload);
      } else {
        await base44.entities.ConfiguracaoSistema.create(payload);
      }
      upserts += 1;
    }

    await base44.entities.AuditLog.create({
      usuario: user.full_name || user.email || 'Usuário',
      usuario_id: user.id,
      acao: 'Edição',
      modulo: 'Sistema',
      tipo_auditoria: 'integracao',
      entidade: 'ConfiguracaoSistema',
      descricao: `Consolidação de integrações concluída. Registros atualizados/criados: ${upserts}`,
      data_hora: new Date().toISOString(),
      sucesso: true,
    });

    return Response.json({ status: 'ok', upserts });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});