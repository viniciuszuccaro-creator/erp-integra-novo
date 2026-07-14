import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

function mapPrioridade(p) {
  if (!p) return 100;
  const s = String(p).toLowerCase();
  if (s === 'urgente') return 120;
  if (s === 'alta') return 110;
  if (s === 'normal') return 100;
  if (s === 'baixa') return 90;
  const n = Number(p);
  return Number.isFinite(n) ? n : 100;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const intentsAntigos = await base44.entities.ChatbotIntents.list();
    let criados = 0, atualizados = 0;

    for (const old of intentsAntigos) {
      const d = old; // record as returned by SDK
      const nome = d.nome_intent || d.data?.nome_intent;
      const ativo = (d.ativo ?? d.data?.ativo) ?? true;
      const palavras = d.palavras_chave || d.data?.palavras_chave || [];
      const descricao = d.descricao || d.data?.descricao || 'Migrado de ChatbotIntents';
      const tipo_intent = d.tipo_intent || d.data?.tipo_intent || 'outro';
      const requer_auth = (d.requer_autenticacao ?? d.data?.requer_autenticacao) ?? false;
      const acao = d.acao_automatica || d.data?.acao_automatica || 'nenhuma';
      const entidade_vinculada = d.entidade_vinculada || d.data?.entidade_vinculada || null;
      const resposta = d.resposta_padrao || d.data?.resposta_padrao || null;
      const escalar_vendedor = (d.escalar_vendedor ?? d.data?.escalar_vendedor) ?? false;
      const prioridade = mapPrioridade(d.prioridade || d.data?.prioridade);

      if (!nome) continue;

      const existentes = await base44.entities.ChatbotIntent.filter({ nome_intent: nome }, undefined, 1);
      const payload = {
        nome_intent: nome,
        descricao,
        frases_treinamento: palavras,
        palavras_chave: palavras,
        tipo_intent,
        acao_automatica: acao,
        entidade_vinculada,
        escalar_vendedor,
        exige_autenticacao: requer_auth,
        resposta_template: resposta,
        prioridade,
        ativo,
        // multiempresa (se existir nos dados antigos)
        group_id: d.group_id || d.data?.group_id || undefined,
        empresa_id: d.empresa_id || d.data?.empresa_id || undefined,
      };

      if (existentes && existentes.length > 0) {
        await base44.entities.ChatbotIntent.update(existentes[0].id, payload);
        atualizados += 1;
      } else {
        await base44.entities.ChatbotIntent.create(payload);
        criados += 1;
      }
    }

    // Garantir intents essenciais de atendimento
    const upsertIntent = async (nome, payload) => {
      const ex = await base44.entities.ChatbotIntent.filter({ nome_intent: nome }, undefined, 1);
      if (ex?.length) { await base44.entities.ChatbotIntent.update(ex[0].id, payload); atualizados += 1; }
      else { await base44.entities.ChatbotIntent.create({ ...payload, nome_intent: nome }); criados += 1; }
    };

    await upsertIntent('cotar_aco', {
      descricao: 'Cotação de aço',
      frases_treinamento: ['cotar aço','preço do ferro','quanto custa a bitola'],
      palavras_chave: ['cotação','aço','preço','bitola'],
      tipo_intent: 'cotacao',
      acao_automatica: 'consultar_preco',
      exige_autenticacao: false,
      ativo: true,
    });
    await upsertIntent('status_pedido', {
      descricao: 'Consultar status do pedido',
      frases_treinamento: ['status do pedido','meu pedido','acompanhar pedido'],
      palavras_chave: ['status','pedido','acompanhar'],
      tipo_intent: 'consulta',
      acao_automatica: 'ver_status_pedido',
      exige_autenticacao: true,
      ativo: true,
    });

    await base44.entities.AuditLog.create({
      usuario: user.full_name || user.email || 'Usuário',
      usuario_id: user.id,
      acao: 'Edição',
      modulo: 'Sistema',
      tipo_auditoria: 'sistema',
      entidade: 'ChatbotIntent',
      descricao: `Migração/garantia intents concluída (criadas: ${criados}, atualizadas: ${atualizados})`,
      data_hora: new Date().toISOString(),
      sucesso: true,
    });

    return Response.json({ status: 'ok', criados, atualizados });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});