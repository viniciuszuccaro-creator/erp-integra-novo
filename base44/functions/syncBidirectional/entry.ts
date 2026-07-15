import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

/**
 * syncBidirectional v4.1
 * Propagação bidirecional Grupo ↔ Empresas
 * - DOWN: Grupo → todas as empresas do grupo
 * - UP: Empresa → Grupo (consolida)
 * - DELETE: remove réplicas em cascata
 * Anti-loop via e_replicado=true
 */

const BLOCKED_FIELDS = new Set([
  'id', 'created_date', 'updated_date', 'created_by', 'created_by_id', 'e_replicado', 'documento_grupo_id'
]);

// Entidades suportadas DOWN (Grupo → Empresas)
const DOWN_ENTITIES = new Set([
  // Configurações & Sistema
  'ConfiguracaoSistema', 'PerfilAcesso', 'FormaPagamento', 'PlanoDeContas', 'CentroCusto',
  'TabelaPreco', 'TabelaPrecoItem', 'CondicaoComercial', 'TipoDespesa', 'Banco',
  // Produtos & Estoque
  'Produto', 'GrupoProduto', 'Marca', 'SetorAtividade', 'UnidadeMedida',
  'LocalEstoque', 'KitProduto',
  // Pessoas
  'Cliente', 'Fornecedor', 'Transportadora', 'Representante', 'Colaborador',
  'ContatoB2B', 'SegmentoCliente', 'RegiaoAtendimento',
  // Organizacional (RH)
  'Departamento', 'Cargo', 'Turno',
  // Logística
  'Veiculo', 'Motorista', 'TipoFrete', 'RotaPadrao',
  // Financeiro
  'ContaReceber', 'ContaPagar', 'CaixaMovimento', 'LancamentoContabil',
  // Comercial & Fiscal
  'NotaFiscal', 'OrdemCompra', 'Pedido', 'Oportunidade', 'Comissao',
  // Entrega
  'Entrega', 'Romaneio',
  // Produção
  'OrdemProducao', 'ApontamentoProducao', 'InspecaoQualidade',
  // CRM
  'Interacao', 'Campanha',
]);

// Entidades suportadas UP (Empresa → Grupo)
const UP_ENTITIES = new Set([
  'ContaReceber', 'ContaPagar', 'Pedido', 'NotaFiscal', 'Entrega', 'Romaneio',
  'Cliente', 'Produto', 'Fornecedor', 'OrdemCompra', 'MovimentacaoEstoque',
  'Oportunidade', 'Comissao', 'CaixaMovimento', 'LancamentoContabil',
  'InspecaoQualidade', 'OrdemProducao', 'ApontamentoProducao',
  // V21.8: entidades operacionais adicionais para propagação UP completa
  'Contrato', 'Evento', 'SolicitacaoCompra', 'TransferenciaFilial',
  'Inventario', 'SeparacaoConferencia', 'ConciliacaoBancaria', 'MovimentoCartao',
  'DRE', 'RateioFinanceiro', 'ExtratoBancario', 'CaixaOrdemLiquidacao',
]);

function stripBlocked(data) {
  const out = { ...data };
  for (const k of BLOCKED_FIELDS) delete out[k];
  return out;
}

async function fetchWithFallback(api, entityName, filter, limit = 500) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const result = await api.entities[entityName].filter(filter, null, limit);
      // Throttle: pequeno delay entre chamadas para evitar 429
      await new Promise(r => setTimeout(r, 100));
      return result;
    } catch (err) {
      const status = err?.status || err?.response?.status;
      if (status === 429 && attempt < 2) {
        // Backoff exponencial: 1s, 2s
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      return [];
    }
  }
  return [];
}

// Wrapper com retry para create/update — protege contra 429 em loops de propagação
async function safeWrite(api, entityName, operation, data, attempt = 0) {
  try {
    if (operation === 'create') {
      return await api.entities[entityName].create(data);
    } else {
      return await api.entities[entityName].update(data.id, data);
    }
  } catch (err) {
    const status = err?.status || err?.response?.status;
    if (status === 429 && attempt < 2) {
      await new Promise(r => setTimeout(r, 1500 * (attempt + 1)));
      return safeWrite(api, entityName, operation, data, attempt + 1);
    }
    throw err;
  }
}

// In-memory idempotency map to prevent race conditions (TTL 30s)
const _inflight = new Map();
const RACE_TTL = 30_000;

function makeKey(entityName, entityId, direction) {
  return `${entityName}:${entityId || 'bulk'}:${direction}`;
}

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Suporte automação entity (snake_case) e chamada frontend (camelCase)
    const isEntityAutomation = !!(body?.event?.entity_name);
    const eventData = body?.data || {};
    const eventType = body?.event?.type || body?.eventType || 'create';
    const entityName = body?.event?.entity_name || body?.entity_name || body?.entityName;
    const entityId = body?.event?.entity_id || body?.entity_id || body?.entityId || eventData?.id;

    const group_id = body?.group_id || body?.groupId || eventData?.group_id;
    const empresa_id = body?.empresa_id || body?.empresaId || eventData?.empresa_id;
    const direction = body?.direction || 'auto';
    const targetEmpresaId = body?.targetEmpresaId || null; // para sync específico

    // Anti-loop (campo e_replicado)
    if (eventData?.e_replicado === true) {
      return Response.json({ ok: true, skipped: 'anti-loop' });
    }

    // Anti-race-condition: bloqueia execuções simultâneas do mesmo registro
    const raceKey = makeKey(entityName, entityId, direction);
    const now = Date.now();
    // Limpa entradas expiradas
    for (const [k, ts] of _inflight.entries()) {
      if (now - ts > RACE_TTL) _inflight.delete(k);
    }
    if (_inflight.has(raceKey)) {
      return Response.json({ ok: true, skipped: 'race-condition-lock', key: raceKey });
    }
    _inflight.set(raceKey, now);

    if (!entityName) {
      return Response.json({ ok: false, reason: 'entityName obrigatório' }, { status: 400 });
    }

    if (!group_id && !empresa_id) {
      return Response.json({ ok: true, skipped: 'no_context' });
    }

    const api = base44.asServiceRole;
    const results = [];

    const isBoth = direction === 'both';
    const isDown = (isBoth || direction === 'down' || direction === 'auto') && !!group_id && DOWN_ENTITIES.has(entityName);
    const isUp   = (isBoth || direction === 'up') && !!empresa_id && !!group_id && UP_ENTITIES.has(entityName);

    // ===== DOWN: Grupo → Empresas =====
    if (isDown && eventType !== 'delete') {
      const hasPayload = eventData && Object.keys(eventData).length > 3;
      let records = [];

      if (hasPayload && entityId) {
        records = [eventData];
      } else {
        // Full sync: busca todos registros do grupo
        records = await fetchWithFallback(api, entityName, { group_id, e_replicado: false });
        if (!records.length) {
          records = await fetchWithFallback(api, entityName, { group_id });
        }
      }

      // Empresas destino (filtrar por empresa específica se solicitado)
      let empresas = await fetchWithFallback(api, 'Empresa', { group_id }, 100);
      if (targetEmpresaId) {
        empresas = empresas.filter(e => e.id === targetEmpresaId);
      }

      for (const emp of empresas) {
        for (const record of records) {
          const recId = record.id || entityId;
          if (!recId) continue;
          try {
            const newData = stripBlocked({
              ...record,
              empresa_id: emp.id,
              documento_grupo_id: recId,
              e_replicado: true,
              group_id,
            });

            const existing = await fetchWithFallback(api, entityName, {
              documento_grupo_id: recId, empresa_id: emp.id
            }, 1);

            if (existing.length > 0) {
              await safeWrite(api, entityName, 'update', { ...newData, id: existing[0].id });
              results.push({ empresa_id: emp.id, empresa: emp.nome_fantasia || emp.razao_social, status: 'updated', entity: entityName });
            } else {
              await safeWrite(api, entityName, 'create', newData);
              results.push({ empresa_id: emp.id, empresa: emp.nome_fantasia || emp.razao_social, status: 'created', entity: entityName });
            }
            // Throttle entre registros para evitar 429
            await new Promise(r => setTimeout(r, 50));
          } catch (e) {
            results.push({ empresa_id: emp.id, status: 'error', entity: entityName, error: e.message });
          }
        }
      }
    }

    // ===== UP: Empresa → Grupo =====
    // Entidades que usam empresa_id direto (não empresa_dona_id)
    const UP_DIRECT_EMPRESA_ID = new Set(['Pedido','ContaReceber','ContaPagar','Entrega','Romaneio','NotaFiscal','OrdemCompra','MovimentacaoEstoque','CaixaMovimento','LancamentoContabil','OrdemProducao','ApontamentoProducao','InspecaoQualidade','Contrato','Evento','SolicitacaoCompra','TransferenciaFilial','Inventario','SeparacaoConferencia','ConciliacaoBancaria','MovimentoCartao','DRE','RateioFinanceiro','ExtratoBancario','CaixaOrdemLiquidacao']);
    if (isUp && eventData && eventType !== 'delete') {
      const isDirectId = UP_DIRECT_EMPRESA_ID.has(entityName);
      try {
        const existing = await fetchWithFallback(api, entityName, {
          empresa_dona_id: empresa_id, grupo_origem: true, group_id
        }, 1);

        const groupData = stripBlocked({
          ...eventData,
          group_id,
          ...(isDirectId ? {} : { empresa_id: null }),
          empresa_dona_id: empresa_id,
          grupo_origem: true,
          e_replicado: true,
        });

        if (existing.length > 0) {
          await safeWrite(api, entityName, 'update', { ...groupData, id: existing[0].id });
          results.push({ group_id, status: 'updated_group', entity: entityName });
        } else {
          await safeWrite(api, entityName, 'create', groupData);
          results.push({ group_id, status: 'created_group', entity: entityName });
        }
      } catch (e) {
        results.push({ group_id, status: 'error_up', entity: entityName, error: e.message });
      }
    }

    // ===== DELETE DOWN =====
    if (eventType === 'delete' && isDown && entityId) {
      const replicas = await fetchWithFallback(api, entityName, { documento_grupo_id: entityId }, 200);
      for (const replica of replicas) {
        try {
          await api.entities[entityName].delete(replica.id);
          results.push({ replica_id: replica.id, empresa_id: replica.empresa_id, status: 'deleted' });
        } catch (e) {
          results.push({ replica_id: replica.id, status: 'delete_error', error: e.message });
        }
      }
    }

    // ===== DELETE UP =====
    if (eventType === 'delete' && isUp && empresa_id) {
      const replicas = await fetchWithFallback(api, entityName, {
        empresa_dona_id: empresa_id, grupo_origem: true, group_id
      }, 50);
      for (const replica of replicas) {
        try {
          await api.entities[entityName].delete(replica.id);
          results.push({ group_id, status: 'deleted_from_group' });
        } catch (e) {
          results.push({ group_id, status: 'delete_error_up', error: e.message });
        }
      }
    }

    // Libera lock anti-race
    _inflight.delete(raceKey);

    const dur = Date.now() - t0;
    const okCount = results.filter(r => ['created','updated','created_group','updated_group','deleted','deleted_from_group'].includes(r.status)).length;
    const errCount = results.filter(r => r.status?.includes('error')).length;

    return Response.json({
      ok: true,
      entity: entityName,
      event: eventType,
      direction: isBoth ? 'both' : isDown && isUp ? 'both' : isDown ? 'down' : isUp ? 'up' : direction,
      total_processados: results.length,
      ok_count: okCount,
      error_count: errCount,
      results,
      duration_ms: dur,
    });
  } catch (error) {
    // Garante liberação do lock mesmo em caso de erro
    try {
      const entityName = (await req.clone().json().catch(() => ({}))).entity_name || 'unknown';
      _inflight.delete(makeKey(entityName, undefined, 'auto'));
    } catch (_) { console.error('[syncBidirectional] catch:', _); }
    return Response.json({ error: error.message }, { status: 500 });
  }
});