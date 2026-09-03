// Regra-Mãe 3: Extraído de src/pages/Comercial.jsx — faixa de KPIs do Comercial (Vol 3.3/5.1)
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import KPIsComercial from "@/components/comercial/comercial-launchpad/KPIsComercial";

export default function ComercialKPIsStrip({ derived, totalPedidosServer, totalClientesServer, onDrillDown }) {
  return (
    <>
      <KPIsComercial
        totalClientes={totalClientesServer}
        clientesAtivos={derived.clientesAtivos}
        totalPedidos={totalPedidosServer}
        totalVendas={derived.totalVendas}
        ticketMedio={derived.ticketMedio}
        valorFaturado={derived.valorFaturado}
        valorPendenteFaturamento={derived.valorPendenteFaturamento}
        pesoTotalVendido={derived.pesoTotalVendido}
        pesoFaturado={derived.pesoFaturado}
        pesoPendenteFaturamento={derived.pesoPendenteFaturamento}
        pedidosFaturados={derived.pedidosFaturados}
        pedidosFaturamentoParcial={derived.pedidosFaturamentoParcial}
        pedidosCancelados={derived.pedidosCancelados}
        margemBruta={derived.margemBruta}
        margemPercentual={derived.margemPercentual}
        margemFaturada={derived.margemFaturada}
        totalEtapasEntrega={derived.totalEtapasEntrega}
        etapasFaturadas={derived.etapasFaturadas}
        etapasPendentes={derived.etapasPendentes}
        pedidosComProducao={derived.pedidosComProducao}
        pedidosSomenteRevenda={derived.pedidosSomenteRevenda}
        percentualFaturado={derived.percentualFaturado}
        ticketFaturado={derived.ticketFaturado}
        pedidosEmProducao={derived.pedidosEmProducao}
        pedidosProntoFaturar={derived.pedidosProntoFaturar}
        pedidosEmExpedicao={derived.pedidosEmExpedicao}
        pedidosEmTransito={derived.pedidosEmTransito}
        pedidosEntregues={derived.pedidosEntregues}
        quantidadesPorTipo={derived.quantidadesPorTipo}
        quantidadeTotalItens={derived.quantidadeTotalItens}
        margemPorTipo={derived.margemPorTipo}
        taxaEntregaSucesso={derived.taxaEntregaSucesso}
        taxaCancelamento={derived.taxaCancelamento}
        funilStatus={derived.funilStatus}
        onDrillDown={onDrillDown}
      />
      {derived.pedidosExternosPendentes > 0 && (
        <Badge className="bg-orange-100 text-orange-700 px-3 py-2 text-sm font-medium">
          <AlertCircle className="w-3 h-3 mr-2" />
          {derived.pedidosExternosPendentes} pedido(s) externo(s) a validar
        </Badge>
      )}
    </>
  );
}