import React from "react";
import useAnalisePedidoCalculo from "@/components/comercial/analise-pedido-aprovacao/useAnalisePedidoCalculo";
import AnalisePedidoInfoCard from "@/components/comercial/analise-pedido-aprovacao/AnalisePedidoInfoCard";
import AnalisePedidoDescontoGeral from "@/components/comercial/analise-pedido-aprovacao/AnalisePedidoDescontoGeral";
import AnalisePedidoItensTable from "@/components/comercial/analise-pedido-aprovacao/AnalisePedidoItensTable";
import AnalisePedidoResumoFinanceiro from "@/components/comercial/analise-pedido-aprovacao/AnalisePedidoResumoFinanceiro";

/**
 * ANÁLISE DE PEDIDO PARA APROVAÇÃO V21.5
 * P2: Multi-tenant (filterInContext) | P3: RBAC (data-permission)
 * Refatorado em sub-componentes (Regra-Mãe)
 */
export default function AnalisePedidoAprovacao({ pedido: pedidoProp, onAprovar, onNegar, windowMode = false }) {
  const {
    comentarios, setComentarios,
    descontoGeralPercentual, setDescontoGeralPercentual,
    descontoGeralValor, setDescontoGeralValor,
    fecharAutomatico, setFecharAutomatico,
    descontosItens, todosItens,
    calcularValoresItem, totaisPedido,
    handleDescontoItemChange, temEstoqueInsuficiente,
  } = useAnalisePedidoCalculo(pedidoProp);

  const handleAprovar = () => {
    const itensAtualizados = todosItens.map(item => {
      const desconto = descontosItens[item.id_interno];
      return { ...item, desconto_percentual: desconto?.percentual || 0, desconto_valor: desconto?.valor || 0 };
    });
    onAprovar({
      descontoGeralPercentual, descontoGeralValor, itensAtualizados,
      comentarios, valorFinal: totaisPedido.valorFinal,
      margemMedia: totaisPedido.margemMedia, executarFechamento: fecharAutomatico
    });
  };

  const containerClass = windowMode ? "w-full h-full overflow-auto p-6" : "p-6";

  return (
    <div className={containerClass}>
      <div className="space-y-4">
        <AnalisePedidoInfoCard pedido={pedidoProp} totais={totaisPedido} />
        <AnalisePedidoDescontoGeral
          descontoGeralPercentual={descontoGeralPercentual} setDescontoGeralPercentual={setDescontoGeralPercentual}
          descontoGeralValor={descontoGeralValor} setDescontoGeralValor={setDescontoGeralValor}
          descontoGeralCalculado={totaisPedido.descontoGeral}
        />
        <AnalisePedidoItensTable todosItens={todosItens} descontosItens={descontosItens}
          calcularValoresItem={calcularValoresItem} handleDescontoItemChange={handleDescontoItemChange} />
        <AnalisePedidoResumoFinanceiro
          pedido={pedidoProp} totais={totaisPedido}
          comentarios={comentarios} setComentarios={setComentarios}
          fecharAutomatico={fecharAutomatico} setFecharAutomatico={setFecharAutomatico}
          onAprovar={handleAprovar} onNegar={onNegar}
          temEstoqueInsuficiente={temEstoqueInsuficiente}
        />
      </div>
    </div>
  );
}