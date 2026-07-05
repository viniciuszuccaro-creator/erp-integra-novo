import { useState, useEffect } from "react";
import { calcularTudo, MARGEM_MINIMA } from "./useItemProducaoCalculo";

/**
 * Hook extraído de ItemProducaoForm.jsx
 * Encapsula estado, cálculos automáticos, update de campos e gestão de tags.
 */
export default function useItemProducaoForm(item, onChange) {
  const [formData, setFormData] = useState(item || {
    identificador: "", tipo_peca: "Coluna", quantidade: 1,
    altura: 0, largura: 0, comprimento: 0, diametro: 0,
    ferro_principal_bitola: "12.5mm", ferro_principal_quantidade: 4, ferro_principal_peso_kg: 0,
    dobra_le: false, dobra_ld: false, tamanho_dobra_le: 0, tamanho_dobra_ld: 0,
    tem_reforco: false, reforco_quantidade: 0, reforco_bitola: "10.0mm", reforco_peso_kg: 0,
    estribo_bitola: "6.3mm", estribo_largura: 0, estribo_altura: 0, estribo_diametro: 0,
    estribo_distancia: 15, estribo_quantidade: 0, estribo_peso_kg: 0,
    lado_sem_estribo_le: false, lado_sem_estribo_ld: false, comprimento_sem_estribo: 0,
    espacamento_malha: 15, quantidade_costela: 0, bitola_malha: "8.0mm", quantidade_ferro_malha: 0,
    peso_unitario_kg: 0, peso_total_kg: 0,
    custo_material: 0, custo_mao_obra: 0, custo_lacamento: 0, custo_overhead: 0, custo_total: 0,
    preco_venda_unitario: 0, preco_venda_total: 0, tempo_producao_horas: 0, prazo_entrega_dias: 7,
    observacoes_tecnicas: "", tags_tecnicas: [], gerar_op_automaticamente: true
  });

  useEffect(() => {
    const calculos = calcularTudo(formData);
    const dadosAtualizados = { ...formData, ...calculos };
    setFormData(dadosAtualizados);
    if (onChange) onChange(dadosAtualizados);
  }, [
    formData.tipo_peca, formData.comprimento, formData.largura, formData.altura, formData.diametro,
    formData.ferro_principal_bitola, formData.ferro_principal_quantidade,
    formData.dobra_le, formData.dobra_ld, formData.tamanho_dobra_le, formData.tamanho_dobra_ld,
    formData.tem_reforco, formData.reforco_quantidade, formData.reforco_bitola,
    formData.estribo_bitola, formData.estribo_largura, formData.estribo_altura, formData.estribo_diametro,
    formData.estribo_distancia, formData.quantidade,
    formData.espacamento_malha, formData.quantidade_costela, formData.bitola_malha,
    formData.custo_mao_obra, formData.custo_lacamento, formData.custo_overhead,
    formData.preco_venda_unitario, formData.lado_sem_estribo_le, formData.lado_sem_estribo_ld, formData.comprimento_sem_estribo
  ]);

  const calcularMargem = () => {
    if ((formData.preco_venda_total || 0) === 0 || (formData.custo_total || 0) === 0) return 0;
    return (((formData.preco_venda_total || 0) - (formData.custo_total || 0)) / (formData.preco_venda_total || 1)) * 100;
  };

  const margem = calcularMargem();
  const margemBaixa = margem < MARGEM_MINIMA;
  const margemNegativa = margem < 0;

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const adicionarTag = (tag) => {
    const tags = formData.tags_tecnicas || [];
    if (!tags.includes(tag)) updateField('tags_tecnicas', [...tags, tag]);
  };

  const removerTag = (tag) => {
    const tags = formData.tags_tecnicas || [];
    updateField('tags_tecnicas', tags.filter(t => t !== tag));
  };

  return { formData, updateField, adicionarTag, removerTag, margem, margemBaixa, margemNegativa };
}