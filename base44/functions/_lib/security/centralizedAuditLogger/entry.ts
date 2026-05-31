// Função utilitária centralizada para auditoria
// Consolida: auditError + auditEntityEvents + orderFlowAuditor
// Reuso em ambientes: automação, frontend, backend

export async function logAudit(base44, {
  usuario, usuario_id, acao, modulo, tipo_auditoria,
  entidade, registro_id, descricao,
  dados_anteriores, dados_novos,
  empresa_id, group_id,
  ip_address, user_agent,
  duracao_ms
}) {
  try {
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: usuario || 'Sistema',
      usuario_id: usuario_id || null,
      acao: acao || 'Visualização',
      modulo: modulo || 'Sistema',
      tipo_auditoria: tipo_auditoria || 'entidade',
      entidade: entidade || 'Geral',
      registro_id: registro_id || null,
      descricao: descricao || '',
      dados_anteriores: dados_anteriores || null,
      dados_novos: dados_novos || null,
      empresa_id: empresa_id || null,
      group_id: group_id || null,
      ip_address: ip_address || null,
      user_agent: user_agent || null,
      duracao_ms: duracao_ms || null,
      data_hora: new Date().toISOString(),
    });
    return { ok: true };
  } catch (err) {
    const status = err?.response?.status || err?.status;
    if (status === 429) {
      return { ok: true, skipped: true, reason: 'rate-limit' };
    }
    throw err;
  }
}

// Mapper de entidade → módulo (para RBAC/auditoria)
export function getModuleForEntity(entity) {
  const map = {
    Cliente: 'CRM', Oportunidade: 'CRM', Interacao: 'CRM',
    Pedido: 'Comercial', Comissao: 'Comercial',
    NotaFiscal: 'Fiscal',
    Entrega: 'Expedição', Romaneio: 'Expedição',
    Fornecedor: 'Compras', SolicitacaoCompra: 'Compras', OrdemCompra: 'Compras',
    Produto: 'Estoque', MovimentacaoEstoque: 'Estoque', Inventario: 'Estoque',
    ContaPagar: 'Financeiro', ContaReceber: 'Financeiro', CentroCusto: 'Financeiro',
    Evento: 'Agenda', User: 'Controle de Acesso', PerfilAcesso: 'Controle de Acesso'
  };
  return map[entity] || 'Sistema';
}

// Safe trim para payloads grandes
export function safeTrimPayload(input, depth = 0) {
  if (input == null) return null;
  if (typeof input === 'string') return input.slice(0, 4000);
  if (typeof input === 'number' || typeof input === 'boolean') return input;
  if (Array.isArray(input)) {
    return input.slice(0, 50).map((v) => safeTrimPayload(v, depth + 1));
  }
  if (typeof input === 'object') {
    const out = {};
    const entries = Object.entries(input);
    for (let i = 0; i < Math.min(entries.length, 100); i++) {
      const [k, v] = entries[i];
      if (typeof v === 'string' && v.length > 200000) continue;
      out[k] = safeTrimPayload(v, depth + 1);
    }
    return out;
  }
  return null;
}

// Calcula risco de mudança
export function computeRiskLevel({ entity, type, diffSensitive, gaps }) {
  const highEntities = new Set(['NotaFiscal', 'MovimentacaoEstoque', 'ContaPagar', 'ContaReceber']);
  const hasGaps = gaps && gaps.length > 0;
  const sensitiveChange = diffSensitive && diffSensitive.length > 0;
  
  if (type === 'delete' && (entity === 'NotaFiscal' || entity === 'Pedido')) return 'Crítico';
  if (highEntities.has(entity) && (sensitiveChange || hasGaps)) return 'Alto';
  if (hasGaps) return 'Médio';
  return 'Baixo';
}

// Detecta ação de negócio (Aprovação, Pagamento, etc)
export function detectBusinessAction(entity, type, before, after) {
  if (type !== 'update') return null;
  const b = before || {}; const a = after || {};
  
  if (entity === 'ContaPagar' && b.status_pagamento !== a.status_pagamento) {
    if (/aprov/i.test(String(a.status_pagamento))) return 'Aprovação';
    if (/pago/i.test(String(a.status_pagamento))) return 'Pagamento';
  }
  if (entity === 'ContaReceber' && b.status !== a.status) {
    if (/recebid/i.test(String(a.status))) return 'Recebimento';
  }
  if (entity === 'Pedido' && b.status_aprovacao !== a.status_aprovacao) {
    if (/aprov/i.test(String(a.status_aprovacao))) return 'Aprovação';
    if (/negad/i.test(String(a.status_aprovacao))) return 'Rejeição';
  }
  if (entity === 'NotaFiscal' && b.status !== a.status) {
    if (/autorizad/i.test(String(a.status))) return 'Emissão NF-e';
    if (/cancelad/i.test(String(a.status))) return 'Cancelamento NF-e';
  }
  return null;
}