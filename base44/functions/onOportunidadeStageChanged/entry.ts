import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { event, data, old_data } = body || {};
    if (!event || !data) return Response.json({ ok: true, skipped: true });

    // Disparar quando etapa mudar para Proposta (ou Qualificação->Proposta)
    const mudouEtapa = data?.etapa && data?.etapa !== old_data?.etapa;
    const etapaAlvo = ['Proposta', 'Qualificação', 'Contato Inicial'];
    if (!mudouEtapa || !etapaAlvo.includes(data.etapa)) {
      return Response.json({ ok: true, skipped: true });
    }

    const perm = await assertPermission(base44, ctx, 'Comercial', 'OrcamentoCliente', 'criar');
    if (perm) return perm;

    const orcPayload = {
      cliente_id: data?.cliente_id || null,
      cliente_nome: data?.cliente_nome || data?.cliente || '',
      descricao: data?.titulo || 'Orçamento gerado a partir da Oportunidade',
      origem: 'CRM',
      valor_total_estimado: data?.valor_estimado || 0,
      data_abertura: new Date().toISOString().slice(0, 10),
      status: 'Aberto',
      responsavel: data?.responsavel || user?.full_name || user?.email,
      responsavel_id: data?.responsavel_id || user?.id,
      group_id: data?.group_id || null,
      empresa_id: data?.empresa_id || null,
      oportunidade_id: data?.id
    };

    const created = await base44.asServiceRole.entities.OrcamentoCliente.create(orcPayload);

    await audit(base44, user, {
      acao: 'Criação', modulo: 'Comercial', entidade: 'OrcamentoCliente', registro_id: created?.id,
      descricao: 'Orçamento criado automaticamente ao avançar a Oportunidade', dados_novos: orcPayload
    });

    return Response.json({ ok: true, orcamento_id: created?.id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});