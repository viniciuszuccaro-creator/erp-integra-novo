import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

let LAST_AUDITOR_RUN_AT = 0;
const AUDITOR_COOLDOWN_MS = 30 * 60 * 1000;

// Auditor de ramificações entre módulos: verifica coerência Pedido ↔ Entrega ↔ NotaFiscal
// Examina pedidos recentes e registra inconsistências no AuditLog para ação corretiva
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

    if (Date.now() - LAST_AUDITOR_RUN_AT < AUDITOR_COOLDOWN_MS) {
      return Response.json({ ok: true, skipped: true, reason: 'auditor em cooldown anti-rate-limit' });
    }
    LAST_AUDITOR_RUN_AT = Date.now();

    // Buscar últimos pedidos atualizados
    const pedidos = await base44.asServiceRole.entities.Pedido.filter({}, '-updated_date', 30);

    const issues = [];

    for (const p of pedidos) {
      const pid = p?.id;
      if (!pid) continue;

      // Buscar vínculos
      const entregas = await base44.asServiceRole.entities.Entrega.filter({ pedido_id: pid }, undefined, 10);
      const nfs = await base44.asServiceRole.entities.NotaFiscal.filter({ pedido_id: pid }, undefined, 10);

      const hasEntrega = Array.isArray(entregas) && entregas.length > 0;
      const hasNF = Array.isArray(nfs) && nfs.length > 0;

      // Regras simples por status do pedido
      const status = p?.status || 'Rascunho';
      const incoerencias = [];

      if ((status === 'Faturado' || status === 'Pronto para Faturar') && !hasNF) {
        incoerencias.push('Pedido sem Nota Fiscal associada.');
      }
      if ((status === 'Em Expedição' || status === 'Em Trânsito' || status === 'Entregue') && !hasEntrega) {
        incoerencias.push('Pedido sem Entrega vinculada.');
      }
      if (status === 'Entregue' && hasEntrega) {
        // Verificar se alguma entrega tem data_entrega
        const ok = entregas.some((e) => !!e?.data_entrega);
        if (!ok) incoerencias.push('Entrega sem data de entrega registrada.');
      }

      if (incoerencias.length > 0) {
        issues.push({ pedido_id: pid, numero_pedido: p?.numero_pedido, incoerencias });
        // Registrar no AuditLog
        try {
          await base44.asServiceRole.entities.AuditLog.create({
            usuario: 'Sistema',
            acao: 'Visualização',
            modulo: 'Comercial',
            entidade: 'Pedido',
            registro_id: pid,
            descricao: `Auditoria de fluxo detectou ${incoerencias.length} inconsistência(s).`,
            dados_novos: { incoerencias },
            data_hora: new Date().toISOString(),
          });
        } catch {}
      }
    }

    return Response.json({ ok: true, audited: pedidos.length, issues: issues.length, details: issues.slice(0, 20) });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});