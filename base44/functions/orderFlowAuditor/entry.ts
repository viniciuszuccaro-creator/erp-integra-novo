import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

let LAST_AUDITOR_RUN_AT = 0;
const AUDITOR_COOLDOWN_MS = 30 * 60 * 1000;

/**
 * orderFlowAuditor v2.0 — Orquestrador de Fluxo de Módulos
 * Fase 3: verifica coerência Pedido ↔ Estoque ↔ Financeiro ↔ Expedição ↔ NF-e
 * Publica eventos no moduleEventBus para cada inconsistência detectada.
 * Multiempresa: filtra por group_id + empresa_id quando fornecidos.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (user?.role !== 'admin') { return Response.json({ error: 'Forbidden' }, { status: 403 }); }

    if (Date.now() - LAST_AUDITOR_RUN_AT < AUDITOR_COOLDOWN_MS) {
      return Response.json({ ok: true, skipped: true, reason: 'auditor em cooldown anti-rate-limit' });
    }
    LAST_AUDITOR_RUN_AT = Date.now();

    const body = await req.json().catch(() => ({}));
    const { group_id, empresa_id } = body;
    const scope = {};
    if (group_id) scope.group_id = group_id;
    if (empresa_id) scope.empresa_id = empresa_id;

    // Buscar pedidos + dados relacionados em paralelo
    const [pedidosRes, entregasAllRes, nfsAllRes, contasRes, movsRes] = await Promise.allSettled([
      base44.asServiceRole.entities.Pedido.filter(scope, '-updated_date', 50),
      base44.asServiceRole.entities.Entrega.filter(scope, '-updated_date', 100),
      base44.asServiceRole.entities.NotaFiscal.filter(scope, '-updated_date', 100),
      base44.asServiceRole.entities.ContaReceber.filter(scope, '-updated_date', 100),
      base44.asServiceRole.entities.MovimentacaoEstoque.filter(scope, '-updated_date', 100),
    ]);

    const pedidos     = pedidosRes.status === 'fulfilled'  ? (pedidosRes.value  || []) : [];
    const entregasAll = entregasAllRes.status === 'fulfilled' ? (entregasAllRes.value || []) : [];
    const nfsAll      = nfsAllRes.status === 'fulfilled'    ? (nfsAllRes.value    || []) : [];
    const contasAll   = contasRes.status === 'fulfilled'    ? (contasRes.value    || []) : [];
    const movsAll     = movsRes.status === 'fulfilled'      ? (movsRes.value      || []) : [];

    const issues = [];
    const flowStats = { pedidosFaturados: 0, comEntrega: 0, comNF: 0, comCR: 0, comMov: 0 };

    for (const p of pedidos) {
      const pid = p?.id;
      if (!pid) continue;

      const status = p?.status || 'Rascunho';
      const entregas = entregasAll.filter(e => e.pedido_id === pid);
      const nfs      = nfsAll.filter(n => n.pedido_id === pid);
      const contas   = contasAll.filter(c => c.pedido_id === pid || c.origem_id === pid);
      const movs     = movsAll.filter(m => m.pedido_id === pid || m.referencia_id === pid);

      const hasEntrega = entregas.length > 0;
      const hasNF      = nfs.length > 0;
      const hasCR      = contas.length > 0;
      const hasMov     = movs.length > 0;

      const isFaturado = ['Faturado','Pronto para Faturar','Em Expedição','Em Trânsito','Entregue'].includes(status);
      if (isFaturado) {
        flowStats.pedidosFaturados++;
        if (hasEntrega) flowStats.comEntrega++;
        if (hasNF)      flowStats.comNF++;
        if (hasCR)      flowStats.comCR++;
        if (hasMov)     flowStats.comMov++;
      }

      const incoerencias = [];
      if ((status === 'Faturado' || status === 'Pronto para Faturar') && !hasNF) {
        incoerencias.push('Pedido sem Nota Fiscal associada');
      }
      if (['Em Expedição','Em Trânsito','Entregue'].includes(status) && !hasEntrega) {
        incoerencias.push('Pedido sem Entrega vinculada');
      }
      if (status === 'Entregue' && hasEntrega && !entregas.some(e => !!e?.data_entrega)) {
        incoerencias.push('Entrega sem data_entrega registrada');
      }
      if (isFaturado && !hasCR) {
        incoerencias.push('Pedido faturado sem ContaReceber vinculada');
      }

      if (incoerencias.length > 0) {
        issues.push({ pedido_id: pid, numero_pedido: p?.numero_pedido, status, incoerencias });
        try {
          await base44.asServiceRole.entities.AuditLog.create({
            usuario: 'Sistema',
            usuario_id: 'sistema',
            acao: 'Execução',
            modulo: 'Comercial',
            tipo_auditoria: 'evento_modulo',
            entidade: 'Pedido',
            registro_id: pid,
            descricao: `[FLOW] Pedido ${p?.numero_pedido || pid}: ${incoerencias.length} inconsistência(s)`,
            dados_novos: { incoerencias, status, modulo_origem: 'orderFlowAuditor' },
            empresa_id: p?.empresa_id || empresa_id || null,
            group_id:   p?.group_id   || group_id   || null,
            data_hora:  new Date().toISOString(),
          });
        } catch (_) { console.error('[orderFlowAuditor] catch:', _); }
      }
    }

    return Response.json({
      ok: true,
      audited: pedidos.length,
      issues: issues.length,
      flowStats,
      details: issues.slice(0, 20),
      version: '2.0',
    });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});