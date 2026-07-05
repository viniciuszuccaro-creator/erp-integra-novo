import React from "react";
import useCaixaCentral from "@/components/financeiro/caixa-central/useCaixaCentral";
import CaixaHeader from "@/components/financeiro/caixa-central/CaixaHeader";
import CaixaOrdensList from "@/components/financeiro/caixa-central/CaixaOrdensList";
import LiquidacaoModal from "@/components/financeiro/caixa-central/LiquidacaoModal";

/**
 * ETAPA 4 - Caixa como Central de Liquidação
 * Módulo central para liquidação de todos os recebimentos e pagamentos
 */
export default function CaixaCentral({ windowMode = false }) {
  const {
    ordensLiquidacao, isLoading,
    filtros, setFiltros,
    ordensSelecionadas, toggleOrdemSelecionada,
    modalLiquidacao, setModalLiquidacao,
    dadosLiquidacao, setDadosLiquidacao,
    iniciarLiquidacao, confirmarLiquidacao,
    liquidarOrdens,
    contextoValido, podeLiquidar,
  } = useCaixaCentral();

  const ordensSel = ordensLiquidacao.filter(o => ordensSelecionadas.includes(o.id));
  const valorOriginal = ordensSel.reduce((sum, o) => sum + (o.valor_total || 0), 0);
  const valorLiquido = dadosLiquidacao.valor_recebido + dadosLiquidacao.acrescimo - dadosLiquidacao.desconto;

  const content = (
    <div className="space-y-6">
      <CaixaHeader
        ordensLiquidacao={ordensLiquidacao}
        filtros={filtros}
        setFiltros={setFiltros}
        ordensSelecionadas={ordensSelecionadas}
        onLiquidar={iniciarLiquidacao}
        contextoValido={contextoValido}
        podeLiquidar={podeLiquidar}
      />

      <CaixaOrdensList
        ordensLiquidacao={ordensLiquidacao}
        ordensSelecionadas={ordensSelecionadas}
        toggleOrdemSelecionada={toggleOrdemSelecionada}
        podeLiquidar={podeLiquidar}
        isLoading={isLoading}
      />

      <LiquidacaoModal
        open={modalLiquidacao}
        onClose={() => setModalLiquidacao(false)}
        onConfirm={confirmarLiquidacao}
        dadosLiquidacao={dadosLiquidacao}
        setDadosLiquidacao={setDadosLiquidacao}
        valorOriginal={valorOriginal}
        valorLiquido={valorLiquido}
        contextoValido={contextoValido}
        podeLiquidar={podeLiquidar}
        isPending={liquidarOrdens.isPending}
      />
    </div>
  );

  if (windowMode) {
    return (
      <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex-1 overflow-auto p-6">{content}</div>
      </div>
    );
  }

  return content;
}