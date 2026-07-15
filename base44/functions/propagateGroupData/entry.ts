import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * propagateGroupData v1.0
 * Propagação bidirecional Grupo ↔ Empresas
 * 
 * CENÁRIO A: GRUPO → EMPRESAS (criar/atualizar no grupo replica para todas as empresas)
 * CENÁRIO B: EMPRESA → GRUPO (criar na empresa sobe para o grupo)
 */

const PROPAGABLE_ENTITIES = [
  'Cliente', 'Fornecedor', 'Transportadora', 'Produto', 'Servico',
  'ContaReceber', 'ContaPagar', 'NotaFiscal', 'Entrega', 'Pedido',
  'OrdemCompra', 'MovimentacaoEstoque', 'CentroCusto', 'FormaPagamento',
  'ConfiguracaoSistema'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, entityName, entityId, data, groupId, empresaId, mode = 'down' } = body;

    if (!entityName) {
      return Response.json({ error: 'entityName é obrigatório' }, { status: 400 });
    }

    // Verificar se entidade suporta propagação
    if (!PROPAGABLE_ENTITIES.includes(entityName) && !base44.asServiceRole.entities[entityName]) {
      return Response.json({
        error: `Entidade '${entityName}' não suporta propagação`,
        suportadas: PROPAGABLE_ENTITIES
      }, { status: 400 });
    }

    const results = [];
    const timestamp = new Date().toISOString();

    // ========== CENÁRIO A: GRUPO → EMPRESAS (DOWN) ==========
    if (mode === 'down' || (groupId && !empresaId)) {
      const gId = groupId || data?.group_id;
      if (!gId) {
        return Response.json({ error: 'groupId é obrigatório para propagação GRUPO→EMPRESAS' }, { status: 400 });
      }

      console.log(`[PROPAGAÇÃO DOWN] ${entityName} | grupo ${gId} | action=${action}`);

      const empresas = await base44.asServiceRole.entities.Empresa.filter(
        { group_id: gId }, '-updated_date', 100
      );

      for (const empresa of empresas) {
        try {
          const dataEmpresa = {
            ...data,
            empresa_id: empresa.id,
            group_id: gId,
            propagado_do_grupo: true,
            propagacao_origem_id: entityId || null,
            propagacao_timestamp: timestamp,
          };

          if (action === 'create') {
            // Evitar duplicata
            const existing = await base44.asServiceRole.entities[entityName]
              .filter({ group_id: gId, empresa_id: empresa.id, propagacao_origem_id: entityId }, '-created_date', 1)
              .catch(() => []);

            if (!existing.length) {
              delete dataEmpresa.id;
              delete dataEmpresa.created_date;
              delete dataEmpresa.updated_date;
              await base44.asServiceRole.entities[entityName].create(dataEmpresa);
              results.push({ empresa_id: empresa.id, acao: 'criado' });
            } else {
              results.push({ empresa_id: empresa.id, acao: 'já_existe' });
            }
          } else if (action === 'update' && entityId) {
            const existentes = await base44.asServiceRole.entities[entityName]
              .filter({ propagacao_origem_id: entityId, empresa_id: empresa.id }, '-updated_date', 1)
              .catch(() => []);

            if (existentes.length > 0) {
              await base44.asServiceRole.entities[entityName].update(existentes[0].id, dataEmpresa);
              results.push({ empresa_id: empresa.id, acao: 'atualizado' });
            } else {
              results.push({ empresa_id: empresa.id, acao: 'sem_replica_local' });
            }
          }
        } catch (err) {
          results.push({ empresa_id: empresa.id, acao: 'erro', erro: err.message });
        }
      }
    }

    // ========== CENÁRIO B: EMPRESA → GRUPO (UP) ==========
    else if (mode === 'up' || (empresaId && !groupId)) {
      const eId = empresaId || data?.empresa_id;
      if (!eId) {
        return Response.json({ error: 'empresaId é obrigatório para propagação EMPRESA→GRUPO' }, { status: 400 });
      }

      // Buscar grupo da empresa
      const empresa = await base44.asServiceRole.entities.Empresa.filter(
        { id: eId }, '-updated_date', 1
      ).then(r => r[0]).catch(() => null);

      const gId = groupId || empresa?.group_id;

      if (!gId) {
        return Response.json({ ok: true, message: 'Empresa sem grupo — propagação UP ignorada', results: [] });
      }

      console.log(`[PROPAGAÇÃO UP] ${entityName} | empresa ${eId} → grupo ${gId}`);

      const dataGrupo = {
        ...data,
        group_id: gId,
        empresa_origem_sync: eId,
        sincronizado_de_empresa: true,
        sincronizacao_timestamp: timestamp,
      };

      if (action === 'create') {
        delete dataGrupo.id;
        delete dataGrupo.created_date;
        delete dataGrupo.updated_date;
        const created = await base44.asServiceRole.entities[entityName].create(dataGrupo).catch(err => ({ erro: err.message }));
        results.push({ grupo_id: gId, acao: created.erro ? 'erro' : 'criado', ...created });
      } else if (action === 'update' && entityId) {
        const updated = await base44.asServiceRole.entities[entityName].update(entityId, dataGrupo).catch(err => ({ erro: err.message }));
        results.push({ grupo_id: gId, acao: updated.erro ? 'erro' : 'atualizado' });
      }
    }

    // Auditoria
    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user.full_name || user.email || 'Sistema',
        usuario_id: user.id,
        acao: 'Propagação',
        modulo: 'Sistema',
        tipo_auditoria: 'propagacao',
        entidade: entityName,
        descricao: `Propagação ${mode.toUpperCase()} | ${action} | ${entityName} | grupo:${groupId || 'N/A'} / empresa:${empresaId || 'N/A'}`,
        dados_novos: { results: results.slice(0, 20), mode, action },
        empresa_id: empresaId || null,
        group_id: groupId || null,
        data_hora: timestamp,
      });
    } catch (e) { console.error('[propagateGroupData] catch:', e); }

    return Response.json({
      success: true,
      mode,
      action,
      entityName,
      total_processados: results.length,
      criados: results.filter(r => r.acao === 'criado').length,
      atualizados: results.filter(r => r.acao === 'atualizado').length,
      erros: results.filter(r => r.acao === 'erro').length,
      resultados: results.slice(0, 30),
    });

  } catch (error) {
    console.error('[ERROR] propagateGroupData:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});