import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import DescricaoAutomaticaArmado from "./DescricaoAutomaticaArmado";

export const PESOS_BITOLA = {
  "4.2": 0.109,
  "5.0": 0.154,
  "6.3": 0.245,
  "8.0": 0.395,
  "10.0": 0.617,
  "12.5": 0.963,
  "16.0": 1.578,
  "20.0": 2.466,
  "25.0": 3.853
};

export const ARMADO_DEFAULTS = {
  identificador: "",
  tipo_peca: "",
  quantidade: 1,
  comprimento: 0,
  altura: 0,
  largura: 0,
  estribo_diametro: 0,
  espacamento_ferros: 15,
  ferro_principal_bitola: "10.0",
  ferro_principal_quantidade: 4,
  quantidade_ferros_lado1: 0,
  quantidade_ferros_lado2: 0,
  usar_costelas: false,
  quantidade_costelas: 0,
  bitola_costelas: "8.0",
  estribo_bitola: "4.2",
  estribo_largura: 0,
  estribo_altura: 0,
  estribo_distancia: 15,
  quantidade_estribos: 0,
  peso_ferro_principal: 0,
  peso_costelas: 0,
  peso_estribos: 0,
  peso_arame_recozido: 0,
  peso_total_kg: 0,
  custo_material: 0,
  custo_mao_obra: 0,
  custo_overhead: 0,
  custo_total: 0,
  preco_venda_unitario: 0,
  preco_venda_total: 0
};

export function useArmadoCalculo(itemInicial = null) {
  const [tipoSelecionado, setTipoSelecionado] = useState(itemInicial?.tipo_peca || null);
  const [elementoEstrutural, setElementoEstrutural] = useState(itemInicial?.identificador || "");
  const [elementoObrigatorio] = useState(itemInicial?.origem_ia || false);
  const [formData, setFormData] = useState(itemInicial || { ...ARMADO_DEFAULTS, identificador: `ARM-${Date.now()}` });
  const [resumo, setResumo] = useState(null);

  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;
  const { data: configuracoes } = useQuery({
    queryKey: ['configProducao', contextoKey],
    queryFn: async () => {
      const configs = await filterInContext('ConfiguracaoProducao', { tipo: "Perda Aço" });
      return configs[0] || { perda_aco_percentual: 5, perda_arame_percentual: 10 };
    },
  });

  useEffect(() => {
    if (tipoSelecionado === "Bloco" && formData.comprimento > 0 && formData.altura > 0 && formData.largura > 0) {
      calcularBloco();
    } else if (tipoSelecionado && tipoSelecionado !== "Bloco" && formData.comprimento > 0) {
      calcularElemento();
    }
  }, [
    tipoSelecionado, formData.comprimento, formData.altura, formData.largura,
    formData.estribo_diametro, formData.espacamento_ferros, formData.ferro_principal_bitola,
    formData.ferro_principal_quantidade, formData.estribo_distancia, formData.usar_costelas,
    formData.quantidade_costelas, formData.bitola_costelas, formData.estribo_bitola,
    formData.estribo_largura, formData.estribo_altura, formData.quantidade, configuracoes
  ]);

  const calcularBloco = () => {
    const { comprimento, altura, largura, espacamento_ferros, usar_costelas, quantidade_costelas, bitola_costelas } = formData;
    const qtdFerrosLado1 = Math.ceil(largura / espacamento_ferros) + 1;
    const qtdFerrosLado2 = Math.ceil(altura / espacamento_ferros) + 1;
    const qtdCostelas = usar_costelas ? quantidade_costelas : 0;
    const qtdEstribos = Math.ceil(comprimento / 20);
    const estriboLargura = largura;
    const estriboAltura = altura;

    const pesoFerroKgM = PESOS_BITOLA[formData.ferro_principal_bitola] || 0.617;
    const pesoCostelasKgM = PESOS_BITOLA[bitola_costelas] || 0.395;
    const pesoEstriboKgM = PESOS_BITOLA["4.2"] || 0.109;

    const comprimentoTotalFerros = (qtdFerrosLado1 * comprimento) + (qtdFerrosLado2 * comprimento);
    const pesoFerroPrincipal = (comprimentoTotalFerros / 100) * pesoFerroKgM;

    let pesoCostelas = 0;
    if (usar_costelas && qtdCostelas > 0) {
      const comprimentoCostela = (largura + altura) * 2;
      pesoCostelas = (comprimentoCostela * qtdCostelas / 100) * pesoCostelasKgM;
    }

    const perimetroEstribo = (estriboLargura + estriboAltura) * 2 + 10;
    const pesoEstribos = (perimetroEstribo * qtdEstribos / 100) * pesoEstriboKgM;

    const qtdAmarras = (qtdFerrosLado1 + qtdFerrosLado2) * qtdEstribos;
    const pesoArame = (qtdAmarras * 10) / 1000;

    const perdaAco = configuracoes?.perda_aco_percentual || 5;
    const perdaArame = configuracoes?.perda_arame_percentual || 10;
    const pesoTotalAco = (pesoFerroPrincipal + pesoCostelas + pesoEstribos) * (1 + perdaAco / 100);
    const pesoTotalArame = pesoArame * (1 + perdaArame / 100);
    const pesoTotal = pesoTotalAco + pesoTotalArame;

    const precoAcoKg = configuracoes?.preco_aco_kg || 8.5;
    const precoArameKg = configuracoes?.preco_arame_kg || 12.0;
    const custoMaterial = (pesoTotalAco * precoAcoKg) + (pesoTotalArame * precoArameKg);
    const custoMaoObra = custoMaterial * 0.3;
    const custoOverhead = custoMaterial * 0.15;
    const custoTotal = custoMaterial + custoMaoObra + custoOverhead;
    const precoVendaUnitario = custoTotal * 1.4;
    const precoVendaTotal = precoVendaUnitario * formData.quantidade;

    setFormData(prev => ({
      ...prev,
      quantidade_ferros_lado1: qtdFerrosLado1,
      quantidade_ferros_lado2: qtdFerrosLado2,
      quantidade_costelas: qtdCostelas,
      estribo_largura: estriboLargura,
      estribo_altura: estriboAltura,
      estribo_distancia: 20,
      estribo_bitola: "4.2",
      quantidade_estribos: qtdEstribos,
      peso_ferro_principal: pesoFerroPrincipal,
      peso_costelas: pesoCostelas,
      peso_estribos: pesoEstribos,
      peso_arame_recozido: pesoTotalArame,
      peso_total_kg: pesoTotal,
      custo_material: custoMaterial,
      custo_mao_obra: custoMaoObra,
      custo_overhead: custoOverhead,
      custo_total: custoTotal,
      preco_venda_unitario: precoVendaUnitario,
      preco_venda_total: precoVendaTotal
    }));

    setResumo({
      ferros_lado1: qtdFerrosLado1,
      ferros_lado2: qtdFerrosLado2,
      costelas: qtdCostelas,
      estribos: qtdEstribos,
      peso_aco: pesoTotalAco,
      peso_arame: pesoTotalArame,
      peso_total: pesoTotal
    });
  };

  const calcularElemento = () => {
    const { comprimento, ferro_principal_quantidade, estribo_largura, estribo_altura, estribo_diametro, estribo_distancia } = formData;
    const pesoFerroKgM = PESOS_BITOLA[formData.ferro_principal_bitola] || 0.617;
    const pesoEstriboKgM = PESOS_BITOLA[formData.estribo_bitola] || 0.109;

    const comprimentoTotal = comprimento / 100;
    const pesoFerroPrincipal = comprimentoTotal * ferro_principal_quantidade * pesoFerroKgM;
    const qtdEstribos = Math.ceil(comprimento / estribo_distancia);
    const perimetroEstribo = tipoSelecionado === "Estaca/Broca"
      ? (Math.PI * estribo_diametro + 10)
      : ((estribo_largura + estribo_altura) * 2 + 10);
    const pesoEstribos = (perimetroEstribo * qtdEstribos / 100) * pesoEstriboKgM;
    const qtdAmarras = ferro_principal_quantidade * qtdEstribos;
    const pesoArame = (qtdAmarras * 10) / 1000;

    const perdaAco = configuracoes?.perda_aco_percentual || 5;
    const perdaArame = configuracoes?.perda_arame_percentual || 10;
    const pesoTotalAco = (pesoFerroPrincipal + pesoEstribos) * (1 + perdaAco / 100);
    const pesoTotalArame = pesoArame * (1 + perdaArame / 100);
    const pesoTotal = pesoTotalAco + pesoTotalArame;

    const precoAcoKg = configuracoes?.preco_aco_kg || 8.5;
    const precoArameKg = configuracoes?.preco_arame_kg || 12.0;
    const custoMaterial = (pesoTotalAco * precoAcoKg) + (pesoTotalArame * precoArameKg);
    const custoMaoObra = custoMaterial * 0.3;
    const custoOverhead = custoMaterial * 0.15;
    const custoTotal = custoMaterial + custoMaoObra + custoOverhead;
    const precoVendaUnitario = custoTotal * 1.4;
    const precoVendaTotal = precoVendaUnitario * formData.quantidade;

    setFormData(prev => ({
      ...prev,
      quantidade_estribos: qtdEstribos,
      peso_ferro_principal: pesoFerroPrincipal,
      peso_estribos: pesoEstribos,
      peso_arame_recozido: pesoTotalArame,
      peso_total_kg: pesoTotal,
      custo_material: custoMaterial,
      custo_mao_obra: custoMaoObra,
      custo_overhead: custoOverhead,
      custo_total: custoTotal,
      preco_venda_unitario: precoVendaUnitario,
      preco_venda_total: precoVendaTotal
    }));

    setResumo({
      ferros: ferro_principal_quantidade,
      estribos: qtdEstribos,
      peso_aco: pesoTotalAco,
      peso_arame: pesoTotalArame,
      peso_total: pesoTotal
    });
  };

  const descricaoAutomatica = useMemo(() => {
    if (!tipoSelecionado || !formData.comprimento || (tipoSelecionado === "Bloco" && (!formData.altura || !formData.largura))) {
      return "";
    }
    return DescricaoAutomaticaArmado({
      quantidade: formData.quantidade,
      tipoPeca: tipoSelecionado,
      comprimento: formData.comprimento,
      largura: formData.largura,
      altura: formData.altura,
      estribo_diametro: formData.estribo_diametro,
      ferro_principal_quantidade: formData.ferro_principal_quantidade,
      ferro_principal_bitola: formData.ferro_principal_bitola,
      estribo_largura: formData.estribo_largura,
      estribo_altura: formData.estribo_altura,
      estribo_distancia: formData.estribo_distancia,
      usar_costelas: formData.usar_costelas,
      quantidade_costelas: formData.quantidade_costelas,
      bitola_costelas: formData.bitola_costelas,
      quantidade_ferros_lado1: formData.quantidade_ferros_lado1,
      quantidade_ferros_lado2: formData.quantidade_ferros_lado2,
      quantidade_estribos: formData.quantidade_estribos
    });
  }, [
    formData.quantidade, tipoSelecionado, formData.comprimento, formData.largura, formData.altura,
    formData.estribo_diametro, formData.ferro_principal_quantidade, formData.ferro_principal_bitola,
    formData.estribo_largura, formData.estribo_altura, formData.estribo_distancia,
    formData.usar_costelas, formData.quantidade_costelas, formData.bitola_costelas,
    formData.quantidade_ferros_lado1, formData.quantidade_ferros_lado2, formData.quantidade_estribos
  ]);

  const handleSelecionarTipo = (tipo) => {
    setTipoSelecionado(tipo);
    setFormData(prev => ({ ...prev, tipo_peca: tipo }));
  };

  return {
    tipoSelecionado, setTipoSelecionado: handleSelecionarTipo,
    elementoEstrutural, setElementoEstrutural, elementoObrigatorio,
    formData, setFormData, resumo, setResumo,
    configuracoes, descricaoAutomatica,
    calcularBloco, calcularElemento
  };
}