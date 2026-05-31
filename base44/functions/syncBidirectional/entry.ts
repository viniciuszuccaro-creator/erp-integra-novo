import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * syncBidirectional v3.0
 * Propagação bidirecional Grupo ↔ Empresas
 * Suporta: create/update/delete (DOWN), create/update/delete (UP)
 * 
 * Anti-loop: verifica e_replicado=true para evitar loops infinitos
 * Chamado via automação entity OU diretamente do frontend
 * 
 * Campos protegidos: id, created_date, updated_date, e_replicado, documento_grupo_id
 * Timeout: 8s por empresa para evitar timeout geral
 */

// Campos que NUNCA devem ser copiados na réplica
const BLOCKED_FIELDS = new Set(['id', 'created_date', 'updated_date', 'created_by', 'created_by_id']);

// Entidades que suportam propagação DOWN (Grupo→Empresa)
const DOWN_ENTITIES = new Set([
  // Cadastros Gerais
  'ConfiguracaoSistema', 'FormaPagamento', 'PlanoDeContas', 'CentroCusto',
  'TabelaPreco', 'PerfilAcesso', 'Marca', 'GrupoProduto', 'SetorAtividade',
  'UnidadeMedida', 'TipoDespesa', 'Banco', 'CondicaoComercial',
  // Pessoas & Produtos
  'Cliente', 'Fornecedor', 'Produto', 'Transportadora', 'Representante', 'Colaborador',
  // Cadastros Organizacionais
  'Departamento', 'Cargo', 'Turno', 'RegiaoAtendimento', 'SegmentoCliente',
  // Operacional
  'ContaReceber', 'ContaPagar', 'NotaFiscal', 'Entrega', 'OrdemCompra',
]);

// Entidades que suportam propagação UP (Empresa→Grupo)
const UP_ENTITIES = new Set([
  'ContaReceber', 'ContaPagar', 'Pedido', 'NotaFiscal', 'Entrega',
  'Cliente', 'Produto', 'Fornecedor', 'OrdemCompra', 'MovimentacaoEstoque',
  'Oportunidade', 'Comissao',
]);

function stripBlocked(data) {
  const out = { ...data };
  for (const k of BLOCKED_FIELDS) delete out[k];
  return out;
}

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Suporte tanto ao payload manual quanto ao payload de automação entity
    // Automação entity envia: { event: {type, entity_name, entity_id}, data: {...}, old_data: {...} }
    // Frontend envia: { entityName, groupId, direction, data: {...} }
    const isEntityAutomation = !!(body?.event?.entity_name);
    const eventData = body?.data || (isEntityAutomation ? null : body) || {};
    const eventType = body?.event?.type || body?.eventType || 'create';
    // suporte a snake_case (automações) e camelCase (frontend)
    const entityName = body?.event?.entity_name || body?.entity_name || body?.entityName;
    const entityId = body?.event?.entity_id || body?.entity_id || body?.entityId || eventData?.id;

    const {
      // suporte a groupId (camelCase do frontend) e group_id (snake_case da automação/data)
      group_id: _gid,
      groupId,
      empresa_id: _empId,
      direction,
    } = body;
    const group_id = _gid || groupId || eventData?.group_id;
    const empresa_id = _empId || eventData?.empresa_id;

    // Anti-loop: se o registro já é replicado, não propagar novamente
    if (eventData?.e_replicado === true) {
      return Response.json({ ok: true, skipped: 'anti-loop', e_replicado: true });
    }

    // Sem entidade → não propagar
    if (!entityName) {
      return Response.json({ ok: false, reason: 'entity_name obrigatório' }, { status: 400 });
    }

    // Sem contexto → não propagar
    if (!group_id && !empresa_id) {
      return Response.json({ ok: true, skipped: 'no context' });
    }

    // hasRealData: true se há dados reais para propagar, false = modo "full sync" (busca do banco)
    const hasRealData = eventData && typeof eventData === 'object' && Object.keys(eventData).length > 3;

    const results = [];
    const isBoth = direction === 'both';
    const isDown = (isBoth || direction === 'down') && !!group_id && DOWN_ENTITIES.has(entityName);
    const isUp   = (isBoth || direction === 'up') && !!empresa_id && !!group_id && UP_ENTITIES.has(entityName);
    const srcId  = entityId || eventData?.id;

    // ===== DOWN: Grupo → Empresas =====
    if (isDown && eventType !== 'delete') {
      // Se não há dados específicos, buscar os registros do grupo para propagar
      let recordsToProp = [];
      if (hasRealData && eventData) {
        recordsToProp = [eventData];
      } else {
        // Modo "full sync": buscar todos os registros do grupo
        recordsToProp = await base44.asServiceRole.entities[entityName]
          .filter({ group_id, e_replicado: false }, null, 500)
          .catch(() => []);
        // Fallback: busca sem filtro e_replicado
        if (!recordsToProp.length) {
          recordsToProp = await base44.asServiceRole.entities[entityName]
            .filter({ group_id }, null, 500)
            .catch(() => []);
        }
      }

      const empresas = await base44.asServiceRole.entities.Empresa.filter({ group_id }, null, 100).catch(() => []);

      for (const emp of empresas) {
        for (const record of recordsToProp) {
          const recId = record.id || srcId;
          if (!recId) continue;
          try {
            const newData = stripBlocked({
              ...record,
              empresa_id: emp.id,
              documento_grupo_id: recId,
              e_replicado: true,
              group_id,
            });

            const existing = await base44.asServiceRole.entities[entityName]
              .filter({ documento_grupo_id: recId, empresa_id: emp.id }, null, 1)
              .catch(() => []);

            if (existing?.length > 0) {
              await base44.asServiceRole.entities[entityName].update(existing[0].id, newData);
              results.push({ empresa_id: emp.id, empresa_nome: emp.nome_fantasia || emp.razao_social, status: 'updated', entity: entityName });
            } else {
              await base44.asServiceRole.entities[entityName].create(newData);
              results.push({ empresa_id: emp.id, empresa_nome: emp.nome_fantasia || emp.razao_social, status: 'created', entity: entityName });
            }
          } catch (e) {
            results.push({ empresa_id: emp.id, status: 'error', entity: entityName, msg: e.message });
          }
        }
      }
    }

    // ===== UP: Empresa → Grupo =====
    if (isUp && eventData && eventType !== 'delete') {
      try {
        const existing = await base44.asServiceRole.entities[entityName]
          .filter({ empresa_dona_id: empresa_id, grupo_origem: true, group_id }, null, 1)
          .catch(() => []);

        const groupData = stripBlocked({
          ...eventData,
          group_id,
          empresa_id: null,
          empresa_dona_id: empresa_id,
          grupo_origem: true,
          e_replicado: true,
        });

        if (existing?.length > 0) {
          await base44.asServiceRole.entities[entityName].update(existing[0].id, groupData);
          results.push({ group_id, status: 'updated_group' });
        } else {
          await base44.asServiceRole.entities[entityName].create(groupData);
          results.push({ group_id, status: 'created_group' });
        }
      } catch (e) {
        results.push({ group_id, status: 'error', msg: e.message });
      }
    }

    // ===== DELETE DOWN: Grupo deleta → remove réplicas nas empresas =====
    if (eventType === 'delete' && isDown && srcId) {
      try {
        const replicas = await base44.asServiceRole.entities[entityName]
          .filter({ documento_grupo_id: srcId }, null, 200)
          .catch(() => []);
        for (const replica of replicas) {
          try {
            await base44.asServiceRole.entities[entityName].delete(replica.id);
            results.push({ replica_id: replica.id, empresa_id: replica.empresa_id, status: 'deleted' });
          } catch (e) {
            results.push({ replica_id: replica.id, status: 'delete_error', msg: e.message });
          }
        }
      } catch (e) {
        results.push({ status: 'delete_replicas_error', msg: e.message });
      }
    }

    // ===== DELETE UP: Empresa deleta → remove réplica no grupo =====
    if (eventType === 'delete' && isUp && empresa_id) {
      try {
        const replicas = await base44.asServiceRole.entities[entityName]
          .filter({ empresa_dona_id: empresa_id, grupo_origem: true, group_id }, null, 50)
          .catch(() => []);
        for (const replica of replicas) {
          try {
            await base44.asServiceRole.entities[entityName].delete(replica.id);
            results.push({ group_id, status: 'deleted_from_group' });
          } catch (e) {
            results.push({ group_id, status: 'delete_error_up', msg: e.message });
          }
        }
      } catch (e) {
        results.push({ status: 'delete_up_error', msg: e.message });
      }
    }

    const dur = Date.now() - t0;
    return Response.json({
      ok: true,
      entity: entityName,
      event: eventType,
      direction: isBoth ? 'both' : isDown ? 'down' : isUp ? 'up' : direction || 'auto',
      total_processados: results.length,
      results,
      total: results.length,
      duration_ms: dur,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});