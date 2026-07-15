// Utilities for price optimization with external quotations (multiempresa-ready)
async function getTabelaPrecosIAConfig(base44, empresaId = null) {
  try {
    const cfgs = await base44.asServiceRole.entities.ConfiguracaoSistema.filter({ categoria: 'Comercial' }, '-updated_date', 50);
    if (!Array.isArray(cfgs)) return null;

    let candidatoGlobal = null;

    const mergeOverride = (baseCfg, override) => {
      if (!override) return baseCfg;
      return {
        ...baseCfg,
        ...(override.markup_minimo_percentual != null ? { markup_minimo_percentual: override.markup_minimo_percentual } : {}),
        ...(override.politicas_precificacao ? { politicas_precificacao: override.politicas_precificacao } : {}),
        ...(override.fonte_cotacoes ? { fonte_cotacoes: override.fonte_cotacoes } : {}),
        ...(override.url_api ? { url_api: override.url_api } : {}),
        ...(override.api_key ? { api_key: override.api_key } : {}),
        _escopo: 'empresa-override',
        _empresaId: empresaId || baseCfg?._empresaId || null,
      };
    };

    for (const c of cfgs) {
      const tpiRaw = c?.configuracoes_comerciais?.tabela_precos_ia ?? c?.tabela_precos_ia;
      if (!tpiRaw) continue;

      const tpi = { ...tpiRaw };
      const habilitadas = Array.isArray(tpi.empresas_habilitadas) ? tpi.empresas_habilitadas : null;
      const bloqueadas = Array.isArray(tpi.empresas_bloqueadas) ? tpi.empresas_bloqueadas : null;
      const overrides = tpi.empresas_overrides || tpi.overrides_por_empresa || null;

      if (empresaId && overrides && overrides[empresaId]) {
        return mergeOverride(tpi, overrides[empresaId]);
      }
      if (empresaId && habilitadas && habilitadas.includes(empresaId)) {
        return { ...tpi, _escopo: 'empresa', _empresaId: empresaId };
      }
      if (empresaId && bloqueadas && bloqueadas.includes(empresaId)) {
        continue;
      }
      if (!candidatoGlobal) {
        candidatoGlobal = { ...tpi, _escopo: 'global' };
      }
    }

    if (candidatoGlobal && empresaId) {
      const overrides = candidatoGlobal.empresas_overrides || candidatoGlobal.overrides_por_empresa || null;
      if (overrides && overrides[empresaId]) {
        return mergeOverride(candidatoGlobal, overrides[empresaId]);
      }
      return candidatoGlobal;
    }

    if (candidatoGlobal) return candidatoGlobal;

    return {
      habilitado: true,
      fonte_cotacoes: 'internas',
      markup_minimo_percentual: 12,
      politicas_precificacao: [],
      empresas_habilitadas: null,
      empresas_bloqueadas: null,
      _escopo: 'default'
    };
  } catch (_) {
    return null;
  }
}

async function fetchExternalQuotes(cfg, context, produto) {
  try {
    if (!cfg) return null;
    const isMock = cfg?.mock === true || !cfg?.url_api || String(cfg?.url_api).toLowerCase() === 'mock';
    if (cfg.fonte_cotacoes === 'mock') {
      return generateMockQuotes(context, produto, cfg);
    }
    if (cfg.fonte_cotacoes === 'externa' && isMock) {
      return generateMockQuotes(context, produto, cfg);
    }
    if (cfg.fonte_cotacoes !== 'externa' || !cfg.url_api) return null;

    const headers = { 'Content-Type': 'application/json' };
    if (cfg.api_key) {
      headers['Authorization'] = `Bearer ${cfg.api_key}`;
      headers['x-api-key'] = cfg.api_key;
      headers['X-Token'] = cfg.api_key;
    }
    const body = {
      empresa_id: context?.empresa_id || null,
      group_id: context?.group_id || null,
      produto: {
        id: produto?.id,
        descricao: produto?.descricao,
        grupo: produto?.grupo,
        unidade: produto?.unidade_principal,
      }
    };
    const resp = await fetch(cfg.url_api, { method: 'POST', headers, body: JSON.stringify(body), redirect: 'follow' });
    if (!resp.ok) return null;
    const data = await resp.json();
    return data;
  } catch (_) {
    return null;
  }
}

function extractSteelIndex(quotes) {
  if (!quotes) return null;
  if (typeof quotes === 'number') return quotes;
  if (Array.isArray(quotes)) {
    const cand = quotes.find((q) => q?.material?.toLowerCase?.() === 'aço' || q?.material?.toLowerCase?.() === 'aco');
    return Number(cand?.preco || cand?.price || cand?.value) || null;
  }
  return Number(quotes?.preco || quotes?.price || quotes?.steel_price || quotes?.aco || quotes?.indice) || null;
}

function generateMockQuotes(context, produto, cfg) {
  const base = Number(produto?.custo_medio ?? produto?.custo_aquisicao ?? 1000);
  const seg = String(produto?.grupo || produto?.classificacao_abc || '');
  const factor = 1 + ((seg.length % 7) / 100);
  const steel_price = Math.max(50, Math.round(base * factor * 100) / 100);
  return { steel_price, fonte: 'mock' };
}

function computeOptimizedPrice(produto, quotes, cfg) {
  const custoBase = Number(produto?.custo_medio ?? produto?.custo_aquisicao ?? 0) || 0;
  const markupMin = Number(cfg?.markup_minimo_percentual ?? 10);
  const regra = cfg?.regra_prioridade || 'custo';

  const steelIdx = extractSteelIndex(quotes);

  let precoSugerido = 0;
  if (steelIdx && steelIdx > 0 && (regra === 'mercado' || regra === 'historico')) {
    precoSugerido = steelIdx * (1 + markupMin / 100);
  } else if (custoBase > 0) {
    precoSugerido = custoBase * (1 + markupMin / 100);
  } else {
    precoSugerido = Number(produto?.preco_venda || 0);
  }

  try {
    const politicas = Array.isArray(cfg?.politicas_precificacao) ? cfg.politicas_precificacao : [];
    const seg = produto?.grupo || produto?.classificacao_abc || '';
    const pol = politicas.find(p => (p.segmento || '').toLowerCase() === String(seg).toLowerCase());
    if (pol) {
      const adj = Number(pol.ajuste || 0);
      if (!Number.isNaN(adj) && adj !== 0) {
        precoSugerido = precoSugerido * (1 + adj / 100);
      }
      const margemMinSeg = Number(pol.margem_minima || NaN);
      if (!Number.isNaN(margemMinSeg) && custoBase > 0) {
        const precoMinSeg = custoBase * (1 + margemMinSeg / 100);
        if (precoSugerido < precoMinSeg) precoSugerido = precoMinSeg;
      }
    }
  } catch (_) { console.error('[priceUtils] catch:', _); }

  precoSugerido = Math.max(0, Number(precoSugerido?.toFixed(2) || 0));

  const margemPercent = custoBase > 0 ? Math.max(0, Math.round(((precoSugerido - custoBase) / custoBase) * 100)) : Math.max(0, Math.round(markupMin));

  return {
    preco_venda: precoSugerido,
    margem_minima_percentual: margemPercent
  };
}

// Health-check — _lib functions need Deno.serve to deploy
Deno.serve(async (req) => {
  return Response.json({ ok: true, status: 'healthy', module: '_lib/priceUtils' });
});