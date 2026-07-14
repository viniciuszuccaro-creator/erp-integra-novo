import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json().catch(() => ({}));
    const evt = payload?.event || {};
    const data = payload?.data || null;

    if (!evt?.entity_name) {
      return Response.json({ ok: true, skipped: true });
    }

    // Only mirror ChatbotIntents -> ChatbotIntent
    if (evt.entity_name !== 'ChatbotIntents') {
      return Response.json({ ok: true, skipped: true });
    }

    if (evt.type === 'delete') {
      // On delete, we don't remove consolidated record (preserve history)
      return Response.json({ ok: true, action: 'ignored_delete' });
    }

    if (!data) {
      return Response.json({ ok: false, error: 'No data provided' }, { status: 400 });
    }

    const nome = data.nome_intent;
    if (!nome) {
      return Response.json({ ok: false, error: 'nome_intent ausente' }, { status: 400 });
    }

    const existentes = await base44.asServiceRole.entities.ChatbotIntent.filter({ nome_intent: nome }, undefined, 1);

    const payloadUpsert = {
      nome_intent: nome,
      descricao: data.descricao || 'Migrado de ChatbotIntents',
      frases_treinamento: data.palavras_chave || [],
      palavras_chave: data.palavras_chave || [],
      tipo_intent: data.tipo_intent || 'outro',
      acao_automatica: data.acao_automatica || 'nenhuma',
      entidade_vinculada: data.entidade_vinculada || null,
      escalar_vendedor: data.escalar_vendedor ?? false,
      exige_autenticacao: data.requer_autenticacao ?? false,
      resposta_template: data.resposta_padrao || null,
      prioridade: (() => {
        const p = data.prioridade; if (!p) return 100; const s = String(p).toLowerCase(); if (s==='urgente') return 120; if (s==='alta') return 110; if (s==='normal') return 100; if (s==='baixa') return 90; const n=Number(p); return Number.isFinite(n)?n:100; 
      })(),
      ativo: data.ativo ?? true,
      group_id: data.group_id || undefined,
      empresa_id: data.empresa_id || undefined,
    };

    if (existentes && existentes.length > 0) {
      await base44.asServiceRole.entities.ChatbotIntent.update(existentes[0].id, payloadUpsert);
      return Response.json({ ok: true, action: 'update' });
    } else {
      await base44.asServiceRole.entities.ChatbotIntent.create(payloadUpsert);
      return Response.json({ ok: true, action: 'create' });
    }
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});