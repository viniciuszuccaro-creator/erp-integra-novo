/**
 * Hook de estado inicial do formulário de produto
 * Centraliza defaults e merge com produto existente
 */

export function buildInitialFormData(produto) {
  if (produto) {
    return {
      ...produto,
      unidade_principal: produto.unidade_principal || produto.unidade_medida || (produto.eh_bitola ? 'KG' : 'UN'),
      unidades_secundarias: (() => {
        const base = produto.unidades_secundarias || ['KG'];
        const up = produto.unidade_principal || produto.unidade_medida || (produto.eh_bitola ? 'KG' : undefined);
        return up && !base.includes(up) ? [...base, up] : base;
      })(),
      fatores_conversao: produto.fatores_conversao || {
        kg_por_peca: 0,
        kg_por_metro: 0,
        metros_por_peca: 0,
        peca_por_ton: 0,
        kg_por_ton: 1000
      },
      peso_liquido_kg: produto.peso_liquido_kg || 0,
      peso_bruto_kg: produto.peso_bruto_kg || 0,
      altura_cm: produto.altura_cm || 0,
      largura_cm: produto.largura_cm || 0,
      comprimento_cm: produto.comprimento_cm || 0,
      tributacao: produto.tributacao || {
        icms_cst: '', icms_aliquota: 0,
        pis_cst: '', pis_aliquota: 0,
        cofins_cst: '', cofins_aliquota: 0,
        ipi_cst: '', ipi_aliquota: 0
      },
      origem_mercadoria: produto.origem_mercadoria || '0 - Nacional',
      regime_tributario_produto: produto.regime_tributario_produto || 'Simples Nacional',
      cfop_padrao_compra: produto.cfop_padrao_compra || '',
      cfop_padrao_venda: produto.cfop_padrao_venda || '',
      conta_contabil_id: produto.conta_contabil_id || '',
      controla_lote: produto.controla_lote || false,
      controla_validade: produto.controla_validade || false,
      prazo_validade_dias: produto.prazo_validade_dias || 0,
      localizacao: produto.localizacao || '',
      almoxarifado_id: produto.almoxarifado_id || ''
    };
  }

  return {
    descricao: '',
    codigo: '',
    codigo_barras: '',
    tipo_item: 'Revenda',
    grupo: 'Outros',
    eh_bitola: false,
    peso_teorico_kg_m: 0,
    bitola_diametro_mm: 0,
    tipo_aco: 'CA-50',
    comprimento_barra_padrao_m: 12,
    unidade_principal: 'KG',
    unidades_secundarias: ['KG'],
    fatores_conversao: {
      kg_por_peca: 0,
      kg_por_metro: 0,
      metros_por_peca: 0,
      peca_por_ton: 0,
      kg_por_ton: 1000
    },
    foto_produto_url: '',
    custo_aquisicao: 0,
    preco_venda: 0,
    margem_minima_percentual: 10,
    estoque_minimo: 0,
    estoque_maximo: 0,
    ponto_reposicao: 0,
    ncm: '',
    cest: '',
    unidade_medida: '',
    status: 'Ativo',
    peso_liquido_kg: 0,
    peso_bruto_kg: 0,
    altura_cm: 0,
    largura_cm: 0,
    comprimento_cm: 0,
    exibir_no_site: false,
    exibir_no_marketplace: false,
    origem_mercadoria: '0 - Nacional',
    regime_tributario_produto: 'Simples Nacional',
    tributacao: {
      icms_cst: '', icms_aliquota: 0,
      pis_cst: '', pis_aliquota: 0,
      cofins_cst: '', cofins_aliquota: 0,
      ipi_cst: '', ipi_aliquota: 0
    },
    cfop_padrao_compra: '',
    cfop_padrao_venda: '',
    conta_contabil_id: '',
    controla_lote: false,
    controla_validade: false,
    prazo_validade_dias: 0,
    localizacao: '',
    almoxarifado_id: ''
  };
}