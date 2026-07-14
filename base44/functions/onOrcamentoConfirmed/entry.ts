import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import { getUserAndPerfil, assertPermission, audit } from './_lib/guard.js';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const user = ctx.user;
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    // Payload from entity automation
    const { event, data } = body || {};
    if (!event?.type || !data) return Response.json({ error: 'Invalid payload' }, { status: 400 });

    // Somente quando orçamento for confirmado
    const confirmado = data?.status === 'Confirmado' || data?.aprovado === true || data?.confirmado === true;
    if (!confirmado) return Response.json({ ok: true, skipped: true });

    // Permissão para criar Pedido no módulo Comercial
    const perm = await assertPermission(base44, ctx, 'Comercial', 'Pedido', 'criar');
    if (perm) return perm;

    // Monta pedido básico a partir do orçamento
    const pedidoPayload = {
      tipo: 'Pedido',
      origem_pedido: data?.origem || 'Manual',
      cliente_id: data?.cliente_id || null,
      cliente_nome: data?.cliente_nome || data?.cliente || null,
      valor_total: data?.valor_total || 0,
      data_pedido: new Date().toISOString().slice(0,10),
      status: 'Aguardando Aprovação',
      orcamento_id: data?.id,
      group_id: data?.group_id || null,
      empresa_id: data?.empresa_id || null,
      vendedor: user?.full_name || user?.email || 'Usuário',
      vendedor_id: user?.id,
    };

    // Copia itens quando existir
    ['itens','itens_revenda','itens_armado_padrao','itens_corte_dobra'].forEach(k => {
      if (Array.isArray(data?.[k]) && (data?.[k].length > 0)) {
        pedidoPayload[k] = data[k];
      }
    });

    const created = await base44.asServiceRole.entities.Pedido.create(pedidoPayload);

    await audit(base44, user, {
      acao: 'Criação',
      modulo: 'Comercial',
      entidade: 'Pedido',
      registro_id: created?.id,
      descricao: 'Pedido gerado automaticamente a partir do Orçamento confirmado',
      dados_novos: pedidoPayload
    });

    return Response.json({ ok: true, pedido_id: created?.id });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
});