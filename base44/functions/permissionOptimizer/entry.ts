import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

let LAST_OPTIMIZER_RUN_AT = 0;
const OPTIMIZER_COOLDOWN_MS = 60 * 60 * 1000;

Deno.serve(async (req) => {
  const t0 = Date.now();
  try {
    const base44 = createClientFromRequest(req);
    // Apenas admin pode invocar manualmente; automação usa service role
    let user = null;
    try { user = await base44.auth.me(); } catch {}
    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin required' }, { status: 403 });
    }

    if (Date.now() - LAST_OPTIMIZER_RUN_AT < OPTIMIZER_COOLDOWN_MS) {
      return Response.json({ success: true, skipped: true, reason: 'otimizador em cooldown anti-rate-limit' });
    }
    LAST_OPTIMIZER_RUN_AT = Date.now();

    // Heurística: analisar bloqueios por módulo nos últimos eventos
    const ultimos = await base44.asServiceRole.entities.AuditLog.filter({}, '-data_hora', 120);
    const bloqueios = ultimos.filter(l => l.acao === 'Bloqueio');

    // Contagem por módulo
    const countBy = (arr, fn) => arr.reduce((acc, v) => { const k = fn(v); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
    const blocksByModule = countBy(bloqueios, (l) => l.modulo || 'Sistema');

    const perfis = await base44.asServiceRole.entities.PerfilAcesso.list('-updated_date', 50);
    const sugestoes = {};

    const topModulesResumo = Object.entries(blocksByModule)
      .sort((a,b) => b[1]-a[1])
      .slice(0, 5)
      .map(([m,c]) => `${m}: ${c}`)
      .join(', ');
    const texto = `Sugestão IA: revisar permissões (bloqueios por módulo → ${topModulesResumo || 'sem incidência'}); aplicar SoD onde houver conflitos.`;

    for (const p of perfis) {
      const linhas = String(p.observacoes || '').split('\n').filter((linha) => !linha.startsWith('Sugestão IA: revisar permissões'));
      const novoObs = [...linhas.slice(-8), texto].filter(Boolean).join('\n');
      const conflitos = Array.isArray(p.conflitos_sod_detectados) ? p.conflitos_sod_detectados : [];
      const updated = { observacoes: novoObs };
      if (conflitos.length > 0 || Object.values(blocksByModule).some(v => v >= 10)) {
        updated.requer_aprovacao_especial = true;
      }
      const observacaoIgual = String(p.observacoes || '') === String(updated.observacoes || '');
      const aprovacaoIgual = updated.requer_aprovacao_especial === undefined || p.requer_aprovacao_especial === updated.requer_aprovacao_especial;
      if (!observacaoIgual || !aprovacaoIgual) {
        await base44.asServiceRole.entities.PerfilAcesso.update(p.id, updated);
      }
      sugestoes[p.id] = { nome: p.nome_perfil, observacao_adicionada: texto, requer_aprovacao_especial: !!updated.requer_aprovacao_especial };
    }

    try {
      await base44.asServiceRole.entities.AuditLog.create({
        usuario: 'automacao',
        acao: 'Edição',
        modulo: 'Sistema',
        entidade: 'PerfilAcesso',
        descricao: 'Otimização de permissões sugerida por IA (RBAC granular + SoD + multiempresa)',
        dados_novos: sugestoes,
        duracao_ms: Date.now() - t0,
      });
    } catch {}

    return Response.json({ success: true, perfis_atualizados: Object.keys(sugestoes).length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});