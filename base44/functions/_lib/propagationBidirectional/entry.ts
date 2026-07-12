/**
 * Propagação Bidirecional Automática
 * v3.0 - Recebe client base44 como parâmetro (compatível com libs Deno)
 *
 * Uso: import { propagateBidirectional } from './_lib/propagationBidirectional.js';
 *      await propagateBidirectional(base44, event);
 */

const __syncMap = new Map();
const SYNC_TTL = 2500; // ms anti-loop

const PROPAGABLE = {
  down: [
    'ConfiguracaoSistema', 'FormaPagamento', 'PlanoDeContas', 'CentroCusto',
    'TabelaPreco', 'PerfilAcesso', 'Cliente', 'Fornecedor', 'Produto',
    'Marca', 'GrupoProduto', 'ContaReceber', 'ContaPagar',
  ],
  up: ['ContaReceber', 'ContaPagar', 'Pedido', 'NotaFiscal', 'Entrega'],
};

/**
 * @param {object} base44 - cliente Base44 criado com createClientFromRequest(req)
 * @param {object} event  - { entity_name, type, entity_id, data, old_data }
 */
export async function propagateBidirectional(base44, event) {
  const { entity_name, entity_id, data } = event;
  if (!entity_name || !data) return { ok: false, reason: 'missing entity_name or data' };

  // Anti-loop: pula registros já replicados
  if (data?.e_replicado === true) return { ok: false, reason: 'anti-loop: e_replicado' };

  const isGroupEvent   = !!data?.group_id && !data?.empresa_id;
  const isCompanyEvent = !!data?.empresa_id && !!data?.group_id;
  const direction = isGroupEvent ? 'down' : isCompanyEvent ? 'up' : null;
  if (!direction) return { ok: false, reason: 'no scope detected' };

  if (!PROPAGABLE[direction]?.includes(entity_name)) {
    return { ok: true, reason: `${entity_name} não propagável em ${direction}` };
  }

  const key = `${entity_name}:${entity_id}:${direction}`;
  const now = Date.now();
  const state = __syncMap.get(key);
  if (state?.processing && (now - state.ts) < SYNC_TTL) {
    return { ok: false, reason: 'loop detected' };
  }

  __syncMap.set(key, { ts: now, processing: true });

  try {
    const result = direction === 'down'
      ? await propagateDown(base44, entity_name, data)
      : await propagateUp(base44, entity_name, data);
    return { ok: true, direction, ...result };
  } finally {
    __syncMap.delete(key);
  }
}

async function propagateDown(base44, entityName, data) {
  const group_id = data.group_id;
  const empresas = await base44.asServiceRole.entities.Empresa
    .filter({ group_id }, null, 100)
    .catch(() => []);

  const results = [];
  for (const emp of empresas) {
    try {
      const newData = {
        ...data,
        id: undefined,
        created_date: undefined,
        updated_date: undefined,
        empresa_id: emp.id,
        empresa_dona_id: emp.id,
        e_replicado: true,
        documento_grupo_id: data.id,
        group_id,
      };

      const filterKey = ['ContaReceber', 'ContaPagar'].includes(entityName)
        ? { documento_grupo_id: data.id, empresa_id: emp.id }
        : { documento_grupo_id: data.id, empresa_id: emp.id };

      const existing = await base44.asServiceRole.entities[entityName]
        .filter(filterKey, null, 1).catch(() => []);

      if (existing.length === 0) {
        await base44.asServiceRole.entities[entityName].create(newData);
        results.push({ empresa_id: emp.id, action: 'created' });
      } else {
        await base44.asServiceRole.entities[entityName].update(existing[0].id, { ...newData, id: undefined });
        results.push({ empresa_id: emp.id, action: 'updated' });
      }
    } catch (err) {
      results.push({ empresa_id: emp.id, action: 'error', error: err.message });
    }
  }
  return { total_processados: results.length, results };
}

async function propagateUp(base44, entityName, data) {
  const groupId = data.group_id;
  try {
    const existing = await base44.asServiceRole.entities[entityName]
      .filter({ group_id: groupId, empresa_dona_id: data.empresa_id, e_replicado: true }, null, 1)
      .catch(() => []);

    const groupData = {
      ...data,
      id: undefined,
      created_date: undefined,
      updated_date: undefined,
      empresa_id: null,
      empresa_dona_id: data.empresa_id,
      e_replicado: true,
      group_id: groupId,
    };

    if (existing.length === 0) {
      await base44.asServiceRole.entities[entityName].create(groupData);
      return { action: 'created_in_group', group_id: groupId };
    } else {
      await base44.asServiceRole.entities[entityName].update(existing[0].id, { ...groupData, id: undefined });
      return { action: 'updated_in_group', group_id: groupId };
    }
  } catch (err) {
    return { action: 'error', error: err.message };
  }
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/propagationBidirectional' });
});