import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);

    let payload; try { payload = await req.json(); } catch { payload = {}; }
    const user = await base44.auth.me().catch(() => null);

    // Admin-only when invoked by a user; allow scheduler (no user)
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const limitPerEmpresa = Math.min(Math.max(Number(payload?.limit_per_empresa) || 1000, 1), 5000);
    const filtroBase = payload?.filter || { status: 'Ativo' };

    const empresas = await base44.asServiceRole.entities.Empresa.list();
    let aggregate = { empresas: empresas.length, total: 0, updated: 0, skipped: 0, failed: 0 };

    // Contexto multiempresa obrigatorio (Regra-Mae 5a): grupo explicito no payload ou grupo real do cadastro
    let groupId = payload?.group_id || null;
    if (!groupId) {
      try { const grupos = await base44.asServiceRole.entities.GrupoEmpresarial.list(); groupId = grupos?.[0]?.id || null; } catch (_) {}
    }

    for (const emp of empresas) {
      try {
        const resp = await base44.functions.invoke('productPriceOptimizer', {
          limit: limitPerEmpresa,
          filter: { ...filtroBase, empresa_id: emp.id }
        });
        const res = (resp && resp.data) ? resp.data : (resp || {});
        aggregate.total += res?.total || 0;
        aggregate.updated += res?.updated || 0;
        aggregate.skipped += res?.skipped || 0;
        aggregate.failed += res?.failed || 0;
      } catch (_) {
        aggregate.failed += 1; // falha ao orquestrar chamada desta empresa
      }
    }

    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || 'Automação',
        usuario_id: user?.id,
        acao: 'Edição',
        modulo: 'Comercial',
        tipo_auditoria: 'sistema',
        entidade: 'Produto',
        descricao: 'Otimização de preços - Orquestração (todas empresas)',
        group_id: groupId,
        dados_novos: { ...aggregate, group_id: groupId },
        data_hora: new Date().toISOString(),
        duracao_ms: Date.now() - t0,
      });
    } catch (e) { console.error('[optimizerOrchestrator] catch:', e); }

    return Response.json({ ok: true, ...aggregate, duracao_ms: Date.now() - t0 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});