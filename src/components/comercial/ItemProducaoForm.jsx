import React from "react";
import useItemProducaoForm from "./producao/useItemProducaoForm";
import ItemProducaoIdentificacao from "./producao/ItemProducaoIdentificacao";
import ItemProducaoDimensoes from "./producao/ItemProducaoDimensoes";
import ItemProducaoFerroPrincipal from "./producao/ItemProducaoFerroPrincipal";
import ItemProducaoEstribos from "./producao/ItemProducaoEstribos";
import ItemProducaoMalha from "./producao/ItemProducaoMalha";
import ItemProducaoCustos from "./producao/ItemProducaoCustos";
import ItemProducaoObservacoes from "./producao/ItemProducaoObservacoes";

/**
 * V21.1.2 - REFACTORED (Regra-Mãe)
 * 837 linhas → ~35 linhas
 * Lógica em useItemProducaoForm, UI em 7 sub-componentes em /producao/
 */
export default function ItemProducaoForm({ item, onChange, index }) {
  const { formData, updateField, adicionarTag, removerTag, margem, margemBaixa, margemNegativa } =
    useItemProducaoForm(item, onChange);

  return (
    <div className="space-y-6">
      <ItemProducaoIdentificacao formData={formData} updateField={updateField} index={index} />
      <ItemProducaoDimensoes formData={formData} updateField={updateField} />
      <ItemProducaoFerroPrincipal formData={formData} updateField={updateField} />
      <ItemProducaoEstribos formData={formData} updateField={updateField} />
      <ItemProducaoMalha formData={formData} updateField={updateField} />
      <ItemProducaoCustos formData={formData} updateField={updateField} margem={margem} margemBaixa={margemBaixa} margemNegativa={margemNegativa} />
      <ItemProducaoObservacoes formData={formData} updateField={updateField} adicionarTag={adicionarTag} removerTag={removerTag} />
    </div>
  );
}