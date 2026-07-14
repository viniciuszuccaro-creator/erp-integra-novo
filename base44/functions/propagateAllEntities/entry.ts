/**
 * propagateAllEntities
 * Etapa 1: Propagação histórica de TODAS as entidades DOWN (Grupo → Empresas)
 * Chama syncBidirectional para cada entidade em sequência com delay anti-429.
 * Admin-only.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

const DOWN_ENTITIES = [
  'ConfiguracaoSistema', 'PerfilAcesso', 'FormaPagamento', 'PlanoDeContas', 'CentroCusto',
  'TabelaPreco', 'CondicaoComercial', 'TipoDespesa', 'Banco',
  'Produto', 'GrupoProduto', 'Marca', 'SetorAtividade', 'UnidadeMedida',
  'LocalEstoque', 'KitProduto',
  'Cliente', 'Fornecedor', 'Transportadora', 'Representante', 'Colaborador',
  'ContatoB2B', 'SegmentoCliente', 'RegiaoAtendimento',
  'Departamento', 'Cargo', 'Turno',
  'Veiculo', 'Motorista', 'TipoFrete', 'RotaPadrao',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin only' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const group_id = body?.group_id || null;
    const targetEmpresaId = body?.targetEmpresaId || null;

    if (!group_id) {
      return Response.json({ error: 'group_id obrigatório' }, { status: 400 });
    }

    const api = base44.asServiceRole;
    const summary = [];

    for (const entityName of DOWN_ENTITIES) {
      try {
        // Busca todos registros do grupo para esta entidade
        let records = [];
        try {
          records = await api.entities[entityName].filter({ group_id, e_replicado: false }, null, 200);
        } catch (_) {
          try { records = await api.entities[entityName].filter({ group_id }, null, 200); } catch (_2) {}
        }

        if (!records || records.length === 0) {
          summary.push({ entity: entityName, skipped: true, reason: 'no_records' });
          continue;
        }

        // Busca empresas do grupo
        let empresas = [];
        try {
          empresas = await api.entities.Empresa.filter({ group_id }, null, 100);
          if (targetEmpresaId) empresas = empresas.filter(e => e.id === targetEmpresaId);
        } catch (_) {}

        if (!empresas.length) {
          summary.push({ entity: entityName, skipped: true, reason: 'no_empresas' });
          continue;
        }

        let created = 0, updated = 0, errors = 0;

        for (const emp of empresas) {
          for (const record of records) {
            const recId = record.id;
            if (!recId) continue;
            try {
              // Remove campos bloqueados
              const blocked = new Set(['id','created_date','updated_date','created_by','created_by_id','e_replicado','documento_grupo_id']);
              const newData = Object.fromEntries(
                Object.entries(record).filter(([k]) => !blocked.has(k))
              );
              newData.empresa_id = emp.id;
              newData.documento_grupo_id = recId;
              newData.e_replicado = true;
              newData.group_id = group_id;

              let existing = [];
              try {
                existing = await api.entities[entityName].filter({ documento_grupo_id: recId, empresa_id: emp.id }, null, 1);
              } catch (_) {}

              if (existing.length > 0) {
                await api.entities[entityName].update(existing[0].id, newData);
                updated++;
              } else {
                await api.entities[entityName].create(newData);
                created++;
              }
            } catch (e) {
              errors++;
            }
          }
        }

        summary.push({ entity: entityName, records: records.length, empresas: empresas.length, created, updated, errors });

        // Anti-429: pequeno delay entre entidades
        await new Promise(r => setTimeout(r, 80));

      } catch (e) {
        summary.push({ entity: entityName, error: e.message });
      }
    }

    const totalCreated = summary.reduce((s, r) => s + (r.created || 0), 0);
    const totalUpdated = summary.reduce((s, r) => s + (r.updated || 0), 0);
    const totalErrors  = summary.reduce((s, r) => s + (r.errors || 0), 0);
    const entidadesOk  = summary.filter(r => !r.error && !r.skipped).length;

    // Auditoria
    try {
      await api.entities.AuditLog.create({
        usuario: user.full_name || user.email,
        usuario_id: user.id,
        acao: 'Execução',
        modulo: 'Sistema',
        tipo_auditoria: 'sistema',
        entidade: 'PropagacaoHistorica',
        descricao: `propagateAllEntities: ${entidadesOk}/${DOWN_ENTITIES.length} entidades · ${totalCreated} criados · ${totalUpdated} atualizados`,
        group_id,
        data_hora: new Date().toISOString(),
      });
    } catch (_) {}

    return Response.json({
      ok: true,
      group_id,
      entidades_processadas: DOWN_ENTITIES.length,
      entidades_ok: entidadesOk,
      total_created: totalCreated,
      total_updated: totalUpdated,
      total_errors: totalErrors,
      summary,
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});