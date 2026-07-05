import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import useApontamentoSimples from "@/components/producao/apontamento-simples/useApontamentoSimples";
import ApontamentoSimplesForm from "@/components/producao/apontamento-simples/ApontamentoSimplesForm";
import ApontamentoHistorico from "@/components/producao/apontamento-simples/ApontamentoHistorico";

export default function ApontamentoProducao({ opId, op, onApontamentoSalvo }) {
  const h = useApontamentoSimples(opId, op, onApontamentoSalvo);

  return (
    <Card className="border-0 shadow-md w-full h-full">
      <ApontamentoSimplesForm
        form={h.formApontamento}
        setForm={h.setFormApontamento}
        itensDisponiveis={h.itensDisponiveis}
        onSubmit={(e) => { e.preventDefault(); h.salvarApontamentoMutation.mutate(); }}
        isPending={h.salvarApontamentoMutation.isPending}
      />
      <CardContent className="p-6 pt-0">
        <ApontamentoHistorico apontamentos={op?.apontamentos} />
      </CardContent>
    </Card>
  );
}