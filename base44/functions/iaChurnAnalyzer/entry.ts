import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

// Inlined helpers (relative imports break in Deno deploy)
async function getUserAndPerfil(base44) {
  const user = await base44.auth.me();
  return { user, perfil: null };
}
async function assertPermission(base44, ctx, module, entity, action) {
  try {
    const res = await base44.functions.invoke('entityGuard', { module, section: entity, action });
    if (res?.data && res.data.allowed === false) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch (_) { console.error('[iaChurnAnalyzer] catch:', _); }
  return null;
}
// Inlined churnUtils
async function loadChurnConfig(base44) {
  try {
    const cfgs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'CRM', chave: 'churn_ia' }, '-updated_date', 1);
    const cfg = Array.isArray(cfgs) && cfgs.length ? cfgs[0] : null;
    return {
      minDiasSemContato: Number(cfg?.min_dias_sem_contato ?? 14),
      maxAtrasoPrevisao: Number(cfg?.max_atraso_previsao_dias ?? 7),
      minProbabilidade: Number(cfg?.min_probabilidade ?? 40),
    };
  } catch (_) {
    return { minDiasSemContato: 14, maxAtrasoPrevisao: 7, minProbabilidade: 40 };
  }
}
function evaluateChurnRisk(oportunidade, cfg) {
  const dias = Number(oportunidade?.dias_sem_contato || 0);
  const prob = Number(oportunidade?.probabilidade || 0);
  let atrasoPrev = 0;
  if (oportunidade?.data_previsao) {
    const now = Date.now();
    const d = new Date(oportunidade.data_previsao).getTime();
    atrasoPrev = d < now ? Math.ceil((now - d) / (1000 * 60 * 60 * 24)) : 0;
  }
  const flagged = (dias >= (cfg?.minDiasSemContato ?? 14)) || (prob <= (cfg?.minProbabilidade ?? 40)) || (atrasoPrev >= (cfg?.maxAtrasoPrevisao ?? 7));
  const detalhes = { dias_sem_contato: dias, probabilidade: prob, atraso_prev: atrasoPrev };
  const recomendacao = 'Agendar follow-up nas próximas 24h';
  return { flagged, detalhes, recomendacao };
}

// Sinalização de churn no CRM: analisa Oportunidades e gera alerts no AuditLog
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const ctx = await getUserAndPerfil(base44);
    const permErr = await assertPermission(base44, ctx, 'CRM', 'Oportunidade', 'visualizar');
    if (permErr) return permErr;
    let body = {}; try { body = await req.json(); } catch { body = {}; }
    const filtros = (body?.filtros && (body.filtros.empresa_id || body.filtros.group_id)) ? body.filtros : {};
    const oportunidades = await base44.asServiceRole.entities.Oportunidade.filter(filtros, '-updated_date', 500);

    const cfg = await loadChurnConfig(base44);
    const flagged = [];

    for (const o of oportunidades) {
      const evalRes = evaluateChurnRisk(o, cfg);
      if (!evalRes.flagged) continue;
      flagged.push(o.id);
      try {
        await base44.asServiceRole.entities.AuditLog.create({
          usuario: 'Sistema',
          acao: 'Visualização', modulo: 'CRM', entidade: 'Oportunidade', registro_id: o.id,
          descricao: `Sinal de churn: dias_sem_contato=${evalRes.detalhes.dias_sem_contato}, prob=${evalRes.detalhes.probabilidade}, atrasoPrev=${evalRes.detalhes.atraso_prev}`,
          dados_novos: { recomendacao: evalRes.recomendacao },
          empresa_id: o?.empresa_id ?? (filtros?.empresa_id ?? null),
          data_hora: new Date().toISOString(),
        });
        await base44.asServiceRole.entities.Notificacao?.create?.({
          titulo: 'Risco de Churn detectado',
          mensagem: `Oportunidade ${o?.titulo || o?.id} em risco (dias:${evalRes.detalhes.dias_sem_contato}, prob:${evalRes.detalhes.probabilidade}%).`,
          tipo: 'alerta',
          categoria: 'CRM',
          prioridade: 'Média',
          empresa_id: o?.empresa_id
        });
      } catch (e) { console.error('[iaChurnAnalyzer] catch:', e); }
    }

// Perfil Cliente (pagadores lentos, alto valor)
let sugeridas = 0;
try {
  const receber = await base44.asServiceRole.entities.ContaReceber.filter(filtros, '-updated_date', 500);
  const pend = (Array.isArray(receber) ? receber : []).filter(c => c.status === 'Pendente' && c.data_vencimento);
  const byCliente = pend.reduce((acc, c) => { const k = c?.cliente_id || c?.cliente || 'unknown'; (acc[k] = acc[k] || []).push(c); return acc; }, {});
  const tops = Object.entries(byCliente).map(([k, list]) => {
    const total = list.reduce((s, c) => s + (Number(c.valor)||0), 0);
    const dias = list.map(c => Math.max(0, Math.floor((Date.now() - new Date(c.data_vencimento).getTime())/86400000)));
    const media = dias.length ? dias.reduce((a,b)=>a+b,0)/dias.length : 0;
    return { cliente_id: k, total, media };
  }).filter(x => x.media >= 20 && x.total >= 50000).sort((a,b)=> b.total - a.total).slice(0, 10);
  sugeridas = tops.length;
  if (tops.length) {
    await base44.asServiceRole.entities.AuditLog.create({
      usuario: 'Sistema', acao: 'Visualização', modulo: 'CRM', entidade: 'PerfilCliente',
      descricao: `Pagadores lentos e alto valor: ${tops.length}`,
      dados_novos: { clientes: tops }, empresa_id: (filtros?.empresa_id ?? null), data_hora: new Date().toISOString()
    });
    await base44.asServiceRole.entities.Notificacao?.create?.({
      titulo: 'Clientes com Risco Financeiro (CRM)',
      mensagem: `${tops.length} cliente(s) com atraso médio >=20 dias e alto valor.`,
      tipo: 'alerta', categoria: 'CRM', prioridade: 'Alta',
      empresa_id: (filtros?.empresa_id ?? null)
    });
  }
} catch (e) { console.error('[iaChurnAnalyzer] catch:', e); }

return Response.json({ ok: true, sinalizadas: flagged.length, sugeridas });
  } catch (error) {
    return Response.json({ error: String(error?.message || error) }, { status: 500 });
  }
});