import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * P2.3: Handler bidirecional para Colaborador (RH)
 * Grupo → Empresas: replica dados básicos do colaborador
 * Empresa → Grupo: sincroniza status, cargos e ativos
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity_id, event_type, data } = body;

    if (!entity_id) {
      return Response.json({ error: 'entity_id obrigatório' }, { status: 400 });
    }

    const colaborador = data || await base44.asServiceRole.entities.Colaborador.get(entity_id);
    if (!colaborador) {
      return Response.json({ error: `Colaborador ${entity_id} não encontrado` }, { status: 404 });
    }

    // Anti-loop
    if (colaborador.e_replicado === true) {
      return Response.json({ success: false, reason: 'anti-loop: e_replicado' });
    }

    const isGroupLevel = !!colaborador.group_id && !colaborador.empresa_id;

    // === DOWN: Grupo → Empresas ===
    if (isGroupLevel && (event_type === 'create' || event_type === 'update')) {
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: colaborador.group_id });
      const empresasArr = Array.isArray(empresas) ? empresas : [];

      const resultados = await Promise.allSettled(empresasArr.map(async (emp) => {
        const existing = await base44.asServiceRole.entities.Colaborador.filter({
          group_id: colaborador.group_id,
          empresa_id: emp.id,
          cpf: colaborador.cpf,
          e_replicado: true
        }, undefined, 1);

        const payload = {
          ...colaborador,
          id: undefined,
          created_date: undefined,
          updated_date: undefined,
          empresa_id: emp.id,
          group_id: colaborador.group_id,
          e_replicado: true,
          documento_grupo_id: entity_id,
        };

        if (Array.isArray(existing) && existing.length > 0) {
          const patch = { nome: payload.nome, cargo: payload.cargo, departamento: payload.departamento, status: payload.status, email: payload.email, telefone: payload.telefone };
          return base44.asServiceRole.entities.Colaborador.update(existing[0].id, patch);
        }
        return base44.asServiceRole.entities.Colaborador.create(payload);
      }));

      const ok = resultados.filter(r => r.status === 'fulfilled').length;
      const fail = resultados.filter(r => r.status === 'rejected').length;

      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email, usuario_id: user.id,
          modulo: 'RH', entidade: 'Colaborador', acao: 'Propagação Grupo→Empresas',
          tipo_auditoria: 'sistema', registro_id: entity_id, group_id: colaborador.group_id,
          descricao: `Colaborador ${colaborador.nome} propagado para ${ok} empresas`,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}

      return Response.json({ success: true, direction: 'down', ok, fail });
    }

    // === UP: Empresa → Grupo ===
    if (colaborador.empresa_id && colaborador.documento_grupo_id) {
      const patch = {};
      const syncFields = ['status', 'cargo', 'departamento', 'salario_base', 'data_demissao', 'motivo_demissao'];
      syncFields.forEach(f => { if (colaborador[f] !== undefined) patch[f] = colaborador[f]; });

      if (Object.keys(patch).length > 0) {
        await base44.asServiceRole.entities.Colaborador.update(colaborador.documento_grupo_id, patch);
      }

      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email, usuario_id: user.id,
          modulo: 'RH', entidade: 'Colaborador', acao: 'Propagação Empresa→Grupo',
          tipo_auditoria: 'sistema', registro_id: entity_id, empresa_id: colaborador.empresa_id,
          group_id: colaborador.group_id, descricao: `Colaborador ${colaborador.nome} sincronizado empresa→grupo`,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}

      return Response.json({ success: true, direction: 'up', synced_fields: Object.keys(patch) });
    }

    return Response.json({ success: false, reason: 'Sem direção de propagação identificada' });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});