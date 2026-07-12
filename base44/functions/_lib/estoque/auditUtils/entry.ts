import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Inlined from _lib/guard — auditoria padronizada para operações de Estoque
async function audit(base44, user, { acao = 'Ação', modulo = 'Sistema', entidade = '-', registro_id = null, descricao = '', dados_novos = null, empresa_id = null, empresa_nome = null, duracao_ms = null }, meta = null) {
  try {
    const payloadDados = (dados_novos && typeof dados_novos === 'object') ? { ...dados_novos } : {};
    if (meta) payloadDados._meta = meta;
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: user?.full_name || user?.email || 'Sistema',
      usuario_id: user?.id,
      acao, modulo, entidade, registro_id, descricao,
      empresa_id: empresa_id || null,
      empresa_nome: empresa_nome || null,
      duracao_ms: typeof duracao_ms === 'number' ? duracao_ms : null,
      dados_novos: Object.keys(payloadDados).length ? payloadDados : null,
      data_hora: new Date().toISOString(),
    });
  } catch {}
}

// Auditoria padronizada para operações de Estoque
async function stockAudit(base44, user, { acao, entidade, registro_id, descricao, empresa_id = null, empresa_nome = null, dados_novos = null, duracao_ms = null }, meta = null) {
  try {
    const merged = dados_novos && typeof dados_novos === 'object' ? { ...dados_novos } : {};
    if (meta) merged._meta = meta;
    await audit(base44, user || { full_name: 'Sistema' }, {
      acao,
      modulo: 'Estoque',
      entidade,
      registro_id,
      descricao,
      empresa_id,
      empresa_nome,
      dados_novos: Object.keys(merged).length ? merged : null,
      duracao_ms,
    }, meta);
  } catch (_) {}
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/estoque/auditUtils' });
});