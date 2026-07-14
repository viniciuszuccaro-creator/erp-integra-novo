import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';

function toISO(d) { return new Date(d).toISOString().slice(0,10); }

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);

    const { filtros = {} } = await req.json().catch(() => ({ filtros: {} }));
    const start = filtros.start_date ? toISO(filtros.start_date) : null;
    const end = filtros.end_date ? toISO(filtros.end_date) : null;
    const empresa_id = filtros.empresa_id || null;

    // Fetch CR/CP marcados como [LOG]
    const buildDateFilter = (field) => {
      const f = {};
      if (start && end) f[field] = { $gte: start, $lte: end };
      else if (start) f[field] = { $gte: start };
      else if (end) f[field] = { $lte: end };
      return f;
    };

    const commonScope = empresa_id ? { empresa_id } : {};

    const crList = await base44.asServiceRole.entities.ContaReceber.filter({
      ...(buildDateFilter('data_emissao')),
      descricao: { $regex: '\\[LOG\\]' },
      ...commonScope,
    }, '-data_emissao', 2000);

    const cpList = await base44.asServiceRole.entities.ContaPagar.filter({
      ...(buildDateFilter('data_emissao')),
      descricao: { $regex: '\\[LOG\\]' },
      ...commonScope,
    }, '-data_emissao', 2000);

    // Index entrega_id from descricao pattern entrega_id:XXXX
    const getEntregaId = (desc) => {
      const m = String(desc||'').match(/entrega_id:([^\s]+)/);
      return m ? m[1] : null;
    };

    const crByEntrega = new Map();
    for (const c of crList) {
      const id = getEntregaId(c.descricao) || `CR-${c.id}`;
      const arr = crByEntrega.get(id) || [];
      arr.push(c);
      crByEntrega.set(id, arr);
    }
    const cpByEntrega = new Map();
    for (const c of cpList) {
      const id = getEntregaId(c.descricao) || `CP-${c.id}`;
      const arr = cpByEntrega.get(id) || [];
      arr.push(c);
      cpByEntrega.set(id, arr);
    }

    // Aggregate totals
    let receita = 0, despesa = 0;
    crList.forEach(c => receita += Number(c.valor||0));
    cpList.forEach(c => despesa += Number(c.valor||0));
    const margem = receita - despesa;

    // Optional enrich with entregas data (for motorista/rota)
    const entregaIds = Array.from(new Set([
      ...Array.from(crByEntrega.keys()).filter(k => !k.startsWith('CR-')),
      ...Array.from(cpByEntrega.keys()).filter(k => !k.startsWith('CP-')),
    ]));

    let entregas = [];
    if (entregaIds.length) {
      // fetch in batches of 50
      for (let i=0;i<entregaIds.length;i+=50) {
        const slice = entregaIds.slice(i, i+50);
        const part = await base44.asServiceRole.entities.Entrega.filter({ id: { $in: slice } }, undefined, 1000);
        entregas = entregas.concat(part);
      }
    }
    const entIndex = new Map(entregas.map(e => [e.id, e]));

    const linhas = [];
    const groupers = {};
    const pushGroup = (key, deltaReceita, deltaDespesa) => {
      const g = groupers[key] || { receita:0, despesa:0 };
      g.receita += deltaReceita;
      g.despesa += deltaDespesa;
      groupers[key] = g;
    };

    for (const id of new Set([...crByEntrega.keys(), ...cpByEntrega.keys()])) {
      const ent = entIndex.get(id) || {};
      const crs = crByEntrega.get(id) || [];
      const cps = cpByEntrega.get(id) || [];
      const r = crs.reduce((s,x)=>s+Number(x.valor||0),0);
      const d = cps.reduce((s,x)=>s+Number(x.valor||0),0);
      const km = Number(ent.km_rodado||0);
      const custoPorKm = km>0 ? (d/km) : null;
      linhas.push({ entrega_id: id, rota_id: ent.rota_id||null, motorista: ent.motorista||null, data: ent.data_saida||ent.data_previsao||null, receita:r, despesa:d, margem:r-d, km, custo_por_km: custoPorKm });
      if (ent.motorista) pushGroup(`motorista:${ent.motorista}`, r, d);
      if (ent.rota_id) pushGroup(`rota:${ent.rota_id}`, r, d);
      if (ent.data_previsao) pushGroup(`dia:${String(ent.data_previsao)}`, r, d);
    }

    const grupos = Object.entries(groupers).map(([k,v]) => ({ chave:k, receita:v.receita, despesa:v.despesa, margem:v.receita - v.despesa }));

    return Response.json({
      total: { receita, despesa, margem },
      linhas,
      grupos,
      filtros_aplicados: { start, end, empresa_id }
    });
  } catch (error) {
    return Response.json({ error: error?.message || 'error' }, { status: 500 });
  }
});