import React from "react";
import { useItensRevenda } from "./itens-revenda/useItensRevenda";
import ItensRevendaBuscaCard from "./itens-revenda/ItensRevendaBuscaCard";
import ItensRevendaTabela from "./itens-revenda/ItensRevendaTabela";

/**
 * V21.1 - Aba 2: Itens de Revenda
 * AGORA COM: Conversão PC/MT/KG + IA de Sugestão
 * Refatorado: lógica em useItensRevenda, UI em sub-componentes (Regra-Mãe)
 */
export default function ItensRevendaTab({ formData, setFormData, onNext }) {
  const {
    search, setSearch, produtoSelecionado, selecionarProduto,
    quantidade, setQuantidade, unidadeVenda, setUnidadeVenda,
    descontoItem, setDescontoItem, produtosFiltrados,
    adicionarItem, removerItem, copiarUltimoPedido, sugerirQuantidadeIA, opcoesUnidade
  } = useItensRevenda({ formData, setFormData });

  return (
    <div className="space-y-6">
      <ItensRevendaBuscaCard
        search={search} setSearch={setSearch} produtosFiltrados={produtosFiltrados} selecionarProduto={selecionarProduto}
        copiarUltimoPedido={copiarUltimoPedido} formData={formData} produtoSelecionado={produtoSelecionado}
        quantidade={quantidade} setQuantidade={setQuantidade} unidadeVenda={unidadeVenda} setUnidadeVenda={setUnidadeVenda}
        descontoItem={descontoItem} setDescontoItem={setDescontoItem} opcoesUnidade={opcoesUnidade}
        adicionarItem={adicionarItem} sugerirQuantidadeIA={sugerirQuantidadeIA}
      />
      <ItensRevendaTabela itensRevenda={formData?.itens_revenda} removerItem={removerItem} onNext={onNext} />
    </div>
  );
}