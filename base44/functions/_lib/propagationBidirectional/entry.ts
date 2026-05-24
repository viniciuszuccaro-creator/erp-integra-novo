/**
 * Propagação Bidirecional Automática
 * v2.0 - Suporte completo para ContaReceber/ContaPagar + Group↔Empresa
 * 
 * Fluxo:
 * 1. Evento em Grupo → replica para empresas (down)
 * 2. Evento em Empresa → sobe para Grupo (up)
 * 3. Anti-loop via SyncMap (janela 2.5s)
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const __syncMap = new Map(); // { key: { ts, processing: bool } }
const SYNC_TTL = 2500; // ms

export async function propagateBidirectional(event) {
  const { entity_name, type, entity_id, data, old_data } = event;
  
  // Determina direção baseada em grupo_id presença
  const isGroupEvent = !!data?.group_id && !data?.empresa_id;
  const isCompanyEvent = !!data?.empresa_id && !!data?.group_id;
  const direction = isGroupEvent ? 'down' : isCompanyEvent ? 'up' : null;

  if (!direction) return { ok: false, reason: 'No scope detected' };

  // Anti-loop
  const key = `${entity_name}:${entity_id}:${direction}`;
  const now = Date.now();
  const state = __syncMap.get(key);
  
  if (state && state.processing && (now - state.ts) < SYNC_TTL) {
    return { ok: false, reason: 'Loop detected', direction };
  }

  __syncMap.set(key, { ts: now, processing: true });
  
  try {
    const result = await executePropagation(event, direction);
    return { ok: true, ...result };
  } finally {
    __syncMap.delete(key);
  }
}

async function executePropagation(event, direction) {
  const { entity_name, data, group_id, empresa_id } = event;

  // Entidades que suportam propagação completa
  const PROPAGABLE = {
    'down': [
      'ConfiguracaoSistema', 'FormaPagamento', 'PlanoDeContas', 'CentroCusto',
      'TabelaPreco', 'PerfilAcesso', 'Cliente', 'Fornecedor', 'Produto',
      'Marca', 'GrupoProduto', 'ContaReceber', 'ContaPagar' // ← novo
    ],
    'up': [
      'ContaReceber', 'ContaPagar', 'Pedido', 'NotaFiscal', 'Entrega'
    ]
  };

  if (!PROPAGABLE[direction]?.includes(entity_name)) {
    return { ok: true, reason: `${entity_name} não propagável em ${direction}` };
  }

  // Down: Grupo → Empresas
  if (direction === 'down') {
    return await propagateDown(event);
  }

  // Up: Empresa → Grupo
  if (direction === 'up') {
    return await propagateUp(event);
  }
}

async function propagateDown(event) {
  const { entity_name, data } = event;
  const group_id = data.group_id;
  
  // Busca empresas vinculadas
  const base44 = createClientFromRequest(null);
  const empresas = await base44.asServiceRole.entities.Empresa.filter(
    { group_id },
    null,
    100
  );

  const results = [];
  for (const emp of empresas) {
    try {
      const dataToCreate = {
        ...data,
        empresa_id: emp.id,
        empresa_dona_id: emp.id,
        // Remove flags de grupo para empresa
        ...(entity_name === 'ContaReceber' || entity_name === 'ContaPagar' 
          ? { documento_grupo_id: data.id } 
          : {}),
      };

      const existing = await base44.asServiceRole.entities[entity_name].filter(
        { 
          ...(['ContaReceber', 'ContaPagar'].includes(entity_name) 
            ? { documento_grupo_id: data.id, empresa_id: emp.id }
            : { empresa_id: emp.id }),
        },
        null,
        1
      ).catch(() => []);

      if (existing.length === 0) {
        await base44.asServiceRole.entities[entity_name].create(dataToCreate);
        results.push({ empresa_id: emp.id, action: 'created' });
      } else {
        await base44.asServiceRole.entities[entity_name].update(existing[0].id, dataToCreate);
        results.push({ empresa_id: emp.id, action: 'updated' });
      }
    } catch (err) {
      results.push({ empresa_id: emp.id, action: 'error', error: err.message });
    }
  }

  return { created: results.filter(r => r.action === 'created').length, results };
}

async function propagateUp(event) {
  const { entity_name, data } = event;
  
  // Busca ou cria registro no grupo
  const base44 = createClientFromRequest(null);
  const groupId = data.group_id;

  try {
    const existing = await base44.asServiceRole.entities[entity_name].filter(
      { group_id: groupId, empresa_id: null },
      null,
      1
    ).catch(() => []);

    const dataToCreate = {
      ...data,
      empresa_id: null, // Levanta para nível de grupo
      empresa_dona_id: data.empresa_id, // Rastreabilidade
    };

    if (existing.length === 0) {
      await base44.asServiceRole.entities[entity_name].create(dataToCreate);
      return { action: 'created_in_group', group_id: groupId };
    } else {
      await base44.asServiceRole.entities[entity_name].update(existing[0].id, dataToCreate);
      return { action: 'updated_in_group', group_id: groupId };
    }
  } catch (err) {
    return { action: 'error', error: err.message };
  }
}