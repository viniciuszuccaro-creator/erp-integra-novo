import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * P2.3: Handler bidirecional para Contrato
 * Grupo → Empresas: replica contrato do grupo para todas as empresas
 * Empresa → Grupo: sincroniza status/dados de contrato para o registro do grupo
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { entity_id, event_type, data, old_data } = body;

    if (!entity_id) {
      return Response.json({ error: 'entity_id obrigatório' }, { status: 400 });
    }

    // Buscar dados do contrato
    const contrato = data || await base44.asServiceRole.entities.Contrato.get(entity_id);
    if (!contrato) {
      return Response.json({ error: `Contrato ${entity_id} não encontrado` }, { status: 404 });
    }

    // Anti-loop: não propagar registros já replicados
    if (contrato.e_replicado === true) {
      return Response.json({ success: false, reason: 'anti-loop: e_replicado' });
    }

    const isGroupLevel = !!contrato.group_id && !contrato.empresa_id;
    const isEmpresaLevel = !!contrato.empresa_id;

    // === DIREÇÃO DOWN: Grupo → Empresas ===
    if (isGroupLevel && (event_type === 'create' || event_type === 'update')) {
      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id: contrato.group_id });
      const empresasArr = Array.isArray(empresas) ? empresas : [];

      const resultados = await Promise.allSettled(empresasArr.map(async (emp) => {
        // Verificar se já existe cópia na empresa
        const existing = await base44.asServiceRole.entities.Contrato.filter({
          group_id: contrato.group_id,
          empresa_id: emp.id,
          numero_contrato: contrato.numero_contrato,
          e_replicado: true
        }, undefined, 1);

        const payload = {
          ...contrato,
          id: undefined,
          created_date: undefined,
          updated_date: undefined,
          empresa_id: emp.id,
          group_id: contrato.group_id,
          e_replicado: true,
          documento_grupo_id: entity_id,
        };

        if (Array.isArray(existing) && existing.length > 0) {
          return base44.asServiceRole.entities.Contrato.update(existing[0].id, payload);
        }
        return base44.asServiceRole.entities.Contrato.create(payload);
      }));

      const ok = resultados.filter(r => r.status === 'fulfilled').length;
      const fail = resultados.filter(r => r.status === 'rejected').length;

      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          modulo: 'Contratos',
          entidade: 'Contrato',
          acao: 'Propagação Grupo→Empresas',
          tipo_auditoria: 'sistema',
          registro_id: entity_id,
          group_id: contrato.group_id,
          descricao: `Contrato ${contrato.numero_contrato} propagado para ${ok} empresas (${fail} falhas)`,
          data_hora: new Date().toISOString(),
        });
      } catch (_) {}

      return Response.json({ success: true, direction: 'down', ok, fail });
    }

    // === DIREÇÃO UP: Empresa → Grupo ===
    if (isEmpresaLevel && contrato.documento_grupo_id) {
      const patch = {};
      const fieldsToSync = ['status', 'assinado', 'assinatura_digital', 'data_assinatura', 'alertas_enviados', 'historico_renovacoes', 'ultima_cobranca_gerada', 'proxima_cobranca', 'contas_geradas_ids'];
      fieldsToSync.forEach(f => { if (contrato[f] !== undefined) patch[f] = contrato[f]; });

      if (Object.keys(patch).length > 0) {
        await base44.asServiceRole.entities.Contrato.update(contrato.documento_grupo_id, patch);
      }

      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: user.full_name || user.email,
          usuario_id: user.id,
          modulo: 'Contratos',
          entidade: 'Contrato',
          acao: 'Propagação Empresa→Grupo',
          tipo_auditoria: 'sistema',
          registro_id: entity_id,
          empresa_id: contrato.empresa_id,
          group_id: contrato.group_id,
          descricao: `Contrato ${contrato.numero_contrato} sincronizado empresa→grupo`,
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