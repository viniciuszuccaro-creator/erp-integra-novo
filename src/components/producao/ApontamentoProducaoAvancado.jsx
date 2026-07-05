import React from "react";
import useApontamentoProducao from "@/components/producao/apontamento-avancado/useApontamentoProducao";
import ApontamentoHeader from "@/components/producao/apontamento-avancado/ApontamentoHeader";
import ApontamentoForm from "@/components/producao/apontamento-avancado/ApontamentoForm";

export default function ApontamentoProducaoAvancado({ opId, opNumero, onClose }) {
  const h = useApontamentoProducao(opId, opNumero, onClose);

  return (
    <div className="w-full h-full overflow-auto p-6 space-y-6">
      <ApontamentoHeader
        cronometro={h.cronometro}
        produtividade={h.produtividade}
        formatarTempo={h.formatarTempo}
        toggleCronometro={h.toggleCronometro}
        opNumero={opNumero}
        op={h.op}
      />
      <ApontamentoForm
        apontamento={h.apontamento}
        setApontamento={h.setApontamento}
        colaboradores={h.colaboradores}
        capturarLocalizacao={h.capturarLocalizacao}
        capturarFoto={h.capturarFoto}
        finalizarApontamento={h.finalizarApontamento}
        onClose={onClose}
        isPending={h.isPending}
        cronometro={h.cronometro}
      />
    </div>
  );
}