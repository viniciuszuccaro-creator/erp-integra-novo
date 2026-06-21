// Hook de cálculo de pesos e custos para ItemProducaoForm
export const PESOS_FERRO = {
  "6.3mm": 0.245, "8.0mm": 0.395, "10.0mm": 0.617, "12.5mm": 0.963,
  "16.0mm": 1.578, "20.0mm": 2.466, "25.0mm": 3.853, "4.2mm": 0.109, "5.0mm": 0.154,
};

export const PRECO_FERRO_KG = 6.50;
export const MARGEM_MINIMA = 15;
export const COBRIMENTO_PADRAO = 2.5;

export function calcularTudo(formData) {
  let pesoFerroPrincipal = 0, pesoReforco = 0, pesoEstribos = 0, pesoMalha = 0, quantidadeEstribos = 0;

  if (formData.tipo_peca === "Coluna" || formData.tipo_peca === "Viga") {
    const comprimentoMetros = (formData.comprimento || 0) / 100;
    const dobrasTotal = ((formData.dobra_le ? formData.tamanho_dobra_le : 0) + (formData.dobra_ld ? formData.tamanho_dobra_ld : 0)) / 100;
    const comprimentoTotalPrincipal = comprimentoMetros + dobrasTotal;
    const pesoEspecificoPrincipal = PESOS_FERRO[formData.ferro_principal_bitola] || 0;
    pesoFerroPrincipal = comprimentoTotalPrincipal * (formData.ferro_principal_quantidade || 0) * pesoEspecificoPrincipal;

    if (formData.tem_reforco && (formData.reforco_quantidade || 0) > 0) {
      pesoReforco = comprimentoTotalPrincipal * (formData.reforco_quantidade || 0) * (PESOS_FERRO[formData.reforco_bitola] || 0);
    }

    const larguraEstribo = Math.max(0, (formData.largura - (2 * COBRIMENTO_PADRAO)) / 100);
    const alturaEstribo = Math.max(0, (formData.altura - (2 * COBRIMENTO_PADRAO)) / 100);
    let comprimentoComEstribo = formData.comprimento;
    if (formData.lado_sem_estribo_le || formData.lado_sem_estribo_ld) {
      comprimentoComEstribo = (formData.comprimento || 0) - (formData.comprimento_sem_estribo || 0);
    }
    if (formData.estribo_distancia > 0 && comprimentoComEstribo > 0 && larguraEstribo > 0 && alturaEstribo > 0) {
      quantidadeEstribos = Math.ceil((comprimentoComEstribo / (formData.estribo_distancia || 1))) + 2;
      const perimetroEstribo = 2 * (larguraEstribo + alturaEstribo) + 0.10;
      pesoEstribos = quantidadeEstribos * perimetroEstribo * (PESOS_FERRO[formData.estribo_bitola] || 0);
    }
  } else if (formData.tipo_peca === "Estaca" || formData.tipo_peca === "Broca") {
    const comprimentoMetros = (formData.comprimento || 0) / 100;
    pesoFerroPrincipal = comprimentoMetros * (formData.ferro_principal_quantidade || 0) * (PESOS_FERRO[formData.ferro_principal_bitola] || 0);
    const diametroEstribo = Math.max(0, (formData.diametro - (2 * COBRIMENTO_PADRAO)) / 100);
    if (formData.estribo_distancia > 0 && diametroEstribo > 0) {
      const numeroVoltas = (formData.comprimento || 0) / (formData.estribo_distancia || 1);
      pesoEstribos = numeroVoltas * Math.PI * diametroEstribo * (PESOS_FERRO[formData.estribo_bitola] || 0);
      quantidadeEstribos = Math.ceil(numeroVoltas);
    }
  } else if (formData.tipo_peca === "Bloco") {
    const comprimentoM = (formData.comprimento || 0) / 100;
    const larguraM = (formData.largura || 0) / 100;
    const qtdFerroCmpr = Math.ceil(((formData.comprimento || 0) / (formData.espacamento_malha || 15))) + 1;
    const qtdFerroLarg = Math.ceil(((formData.largura || 0) / (formData.espacamento_malha || 15))) + 1;
    const comprimentoMalhaTotal = (qtdFerroCmpr * larguraM + qtdFerroLarg * comprimentoM) * 2;
    pesoMalha = comprimentoMalhaTotal * (PESOS_FERRO[formData.bitola_malha] || 0);
    if ((formData.quantidade_costela || 0) > 0) {
      pesoMalha += ((formData.altura || 0) / 100) * (formData.quantidade_costela || 0) * (PESOS_FERRO[formData.bitola_malha] || 0);
    }
  }

  const pesoUnitario = pesoFerroPrincipal + pesoReforco + pesoEstribos + pesoMalha;
  const pesoTotal = pesoUnitario * (formData.quantidade || 1);
  const custoMaterial = pesoTotal * PRECO_FERRO_KG;
  const custoTotal = custoMaterial + (formData.custo_mao_obra || 0) + (formData.custo_lacamento || 0) + (formData.custo_overhead || 0);
  const precoSugeridoUnitario = (custoTotal / (formData.quantidade || 1)) * 1.20;
  const precoVendaUnitario = (formData.preco_venda_unitario || 0) <= 0 ? parseFloat(precoSugeridoUnitario.toFixed(2)) : formData.preco_venda_unitario;
  const precoVendaTotal = precoVendaUnitario * (formData.quantidade || 1);

  const tempoBase = formData.tipo_peca === "Coluna" || formData.tipo_peca === "Viga" ? 0.5 : formData.tipo_peca === "Bloco" ? 0.8 : 0.4;
  const tempoProducao = tempoBase + pesoTotal * 0.02 + quantidadeEstribos * 0.01;

  return {
    ferro_principal_peso_kg: parseFloat(pesoFerroPrincipal.toFixed(2)),
    reforco_peso_kg: parseFloat(pesoReforco.toFixed(2)),
    estribo_quantidade: quantidadeEstribos,
    estribo_peso_kg: parseFloat(pesoEstribos.toFixed(2)),
    estribo_largura: formData.largura ? Math.max(0, formData.largura - (2 * COBRIMENTO_PADRAO)) : 0,
    estribo_altura: formData.altura ? Math.max(0, formData.altura - (2 * COBRIMENTO_PADRAO)) : 0,
    estribo_diametro: formData.diametro ? Math.max(0, formData.diametro - (2 * COBRIMENTO_PADRAO)) : 0,
    quantidade_ferro_malha: formData.tipo_peca === "Bloco" ? (Math.ceil(((formData.comprimento || 0) / (formData.espacamento_malha || 15))) + 1 + Math.ceil(((formData.largura || 0) / (formData.espacamento_malha || 15))) + 1) : 0,
    peso_unitario_kg: parseFloat(pesoUnitario.toFixed(2)),
    peso_total_kg: parseFloat(pesoTotal.toFixed(2)),
    custo_material: parseFloat(custoMaterial.toFixed(2)),
    custo_total: parseFloat(custoTotal.toFixed(2)),
    preco_venda_unitario: parseFloat(precoVendaUnitario.toFixed(2)),
    preco_venda_total: parseFloat(precoVendaTotal.toFixed(2)),
    tempo_producao_horas: parseFloat(tempoProducao.toFixed(1)),
  };
}