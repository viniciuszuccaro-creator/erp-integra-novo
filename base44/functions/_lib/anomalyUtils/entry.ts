async function loadAnomalyConfig(base44) {
  try {
    const cfgs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Financeiro', chave: 'anomalias_financeiras' }, '-updated_date', 1);
    const rec = Array.isArray(cfgs) && cfgs.length ? cfgs[0] : null;
    const fin = rec?.configuracoes_financeiras || {};
    const anomaly = fin.anomaly || {};
    const alerts = fin.alerts || {};

    return {
      finance: {
        anomaly: {
          zscore_threshold: Number(anomaly.zscore_threshold ?? 3),
          iqr_multiplier: Number(anomaly.iqr_multiplier ?? 1.5),
          mad_multiplier: Number(anomaly.mad_multiplier ?? 3),
        },
        alerts: {
          whatsapp: {
            enabled: alerts?.whatsapp?.enabled === true,
            to: alerts?.whatsapp?.to || null,
          },
        },
      },
      limiar_atraso_dias: Number(anomaly.limiar_atraso_dias ?? 1),
      bloquear_valor_negativo: (anomaly.bloquear_valor_negativo !== false),
    };
  } catch (_) {
    return {
      finance: {
        anomaly: { zscore_threshold: 3, iqr_multiplier: 1.5, mad_multiplier: 3 },
        alerts: { whatsapp: { enabled: false, to: null } },
      },
      limiar_atraso_dias: 1,
      bloquear_valor_negativo: true,
    };
  }
}

function computeIssues(receber, pagar, cfg) {
  const issues = [];
  const hoje = new Date();
  const limiar = Number(cfg?.limiar_atraso_dias ?? 1);
  const bloquearNeg = cfg?.bloquear_valor_negativo !== false;

  const diasAtraso = (venc) => {
    if (!venc) return 0;
    const diff = (hoje.getTime() - new Date(venc).getTime()) / (1000*60*60*24);
    return Math.floor(diff);
  };

  // IQR helpers
  const computeIQR = (arr) => {
    const xs = arr.filter(v => Number.isFinite(v)).sort((a,b)=>a-b);
    if (xs.length < 4) return { q1: null, q3: null, iqr: null };
    const q = (p) => {
      const pos = (xs.length - 1) * p;
      const base = Math.floor(pos);
      const rest = pos - base;
      return xs[base] + (xs[base + 1] - xs[base]) * rest;
    };
    const q1 = q(0.25), q3 = q(0.75);
    return { q1, q3, iqr: q3 - q1 };
  };

  const valoresR = (Array.isArray(receber) ? receber : []).map(x => Number(x?.valor || 0)).filter(v => v > 0);
  const valoresP = (Array.isArray(pagar) ? pagar : []).map(x => Number(x?.valor || 0)).filter(v => v > 0);
  const { q1: q1R, q3: q3R, iqr: iqrR } = computeIQR(valoresR);
  const { q1: q1P, q3: q3P, iqr: iqrP } = computeIQR(valoresP);
  const highR = (q3R != null && iqrR != null) ? q3R + 1.5 * iqrR : Infinity;
  const highP = (q3P != null && iqrP != null) ? q3P + 1.5 * iqrP : Infinity;

  // Mean/Std helpers
  const computeMeanStd = (arr) => {
    const xs = arr.filter(v => Number.isFinite(v));
    if (xs.length < 2) return { mean: null, std: null };
    const mean = xs.reduce((s, v) => s + v, 0) / xs.length;
    const variance = xs.reduce((s, v) => s + Math.pow(v - mean, 2), 0) / (xs.length - 1);
    const std = Math.sqrt(Math.max(variance, 0));
    return { mean, std };
  };
  const { mean: meanR, std: stdR } = computeMeanStd(valoresR);
  const { mean: meanP, std: stdP } = computeMeanStd(valoresP);
  const zK = 3; // 3-sigma

  // Receber base rules
  for (const r of Array.isArray(receber) ? receber : []) {
    const valor = Number(r?.valor);
    if (bloquearNeg && valor < 0) issues.push({ tipo: 'valor_negativo', entidade: 'ContaReceber', id: r.id, empresa_id: r?.empresa_id });
    const atraso = diasAtraso(r?.data_vencimento);
    if (r?.status === 'Pendente' && atraso >= limiar) {
      issues.push({ tipo: 'atraso_receber', entidade: 'ContaReceber', id: r.id, dias: atraso, empresa_id: r?.empresa_id });
    }
    if (valor > highR && Number.isFinite(highR)) {
      issues.push({ tipo: 'valor_outlier_iqr', entidade: 'ContaReceber', id: r.id, valor, empresa_id: r?.empresa_id });
    }
    if (Number.isFinite(stdR) && stdR > 0 && Number.isFinite(meanR)) {
      const z = (valor - meanR) / stdR;
      if (z >= zK) {
        issues.push({ tipo: 'valor_outlier_z', entidade: 'ContaReceber', id: r.id, valor, z, empresa_id: r?.empresa_id });
      }
    }
  }

  // Pagar base rules + marketplace fee divergence + duplicates
  const dupMapP = new Map();
  for (const c of Array.isArray(pagar) ? pagar : []) {
    const valor = Number(c?.valor);
    if (bloquearNeg && valor < 0) issues.push({ tipo: 'valor_negativo', entidade: 'ContaPagar', id: c.id, empresa_id: c?.empresa_id });

    const atraso = diasAtraso(c?.data_vencimento);
    if (c?.status === 'Pendente' && atraso >= limiar) {
      issues.push({ tipo: 'atraso_pagar', entidade: 'ContaPagar', id: c.id, dias: atraso, empresa_id: c?.empresa_id });
    }

    if (valor > highP && Number.isFinite(highP)) {
      issues.push({ tipo: 'valor_outlier_iqr', entidade: 'ContaPagar', id: c.id, valor, empresa_id: c?.empresa_id });
    }
    if (Number.isFinite(stdP) && stdP > 0 && Number.isFinite(meanP)) {
      const z = (valor - meanP) / stdP;
      if (z >= zK) {
        issues.push({ tipo: 'valor_outlier_z', entidade: 'ContaPagar', id: c.id, valor, z, empresa_id: c?.empresa_id });
      }
    }

    // Marketplace fee divergence (if present)
    const esperada = Number(c?.taxa_marketplace_esperada);
    const cobrada = Number(c?.taxa_marketplace_cobrada);
    if (Number.isFinite(esperada) && Number.isFinite(cobrada) && (esperada >= 0 || cobrada >= 0)) {
      const relBase = Math.max(Math.abs(esperada), 1e-6);
      const relDiff = Math.abs(cobrada - esperada) / relBase;
      if (relDiff >= 0.2) { // >= 20% desvio
        issues.push({ tipo: 'taxa_marketplace_divergente', entidade: 'ContaPagar', id: c.id, empresa_id: c?.empresa_id, esperado: esperada, cobrado: cobrada, relDiff });
      }
    }

    // Duplicate heuristic (same fornecedor/valor/date)
    const fornecedorKey = c?.fornecedor_id || c?.fornecedor || '';
    const dateKey = c?.data_emissao || c?.data_vencimento || '';
    const k = `${fornecedorKey}|${Number.isFinite(valor) ? valor : 0}|${dateKey}`;
    if (k) {
      if (dupMapP.has(k)) {
        const firstId = dupMapP.get(k);
        issues.push({ tipo: 'duplicidade_pagar', entidade: 'ContaPagar', id: c.id, empresa_id: c?.empresa_id, similar_de: firstId });
      } else {
        dupMapP.set(k, c.id);
      }
    }
  }

  return issues;
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/anomalyUtils' });
});