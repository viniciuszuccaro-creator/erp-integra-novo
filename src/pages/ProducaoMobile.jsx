import React from "react";
import { useToast } from "@/components/ui/use-toast";
import useProducaoMobile from "@/components/mobile/producao-mobile/useProducaoMobile";
import OpListView from "@/components/mobile/producao-mobile/OpListView";
import ItensOpView from "@/components/mobile/producao-mobile/ItensOpView";
import ApontamentoFormView from "@/components/mobile/producao-mobile/ApontamentoFormView";

/**
 * Tela Mobile/Tablet para Apontamento de Produção
 * Refatorado: lógica em useProducaoMobile, views em sub-componentes
 * P3: RBAC aplicado (podeApontar / podeExpedir)
 * P4: Layout w-full h-full
 */
export default function ProducaoMobile() {
  const { toast } = useToast();
  const h = useProducaoMobile();

  // Early return wrapper com w-full h-full para conformidade P4
  const wrap = (children) => <div className="w-full h-full overflow-auto">{children}</div>;

  const handleEscanearQR = () => {
    toast({
      title: "📷 Escaneamento QR",
      description: "Funcionalidade de escaneamento de QR Code será implementada aqui em produção.",
      duration: 3000,
    });
  };

  if (!h.opSelecionada) {
    return wrap(<OpListView user={h.user} ops={h.ops} isLoading={h.isLoading} onSelectOp={h.setOpSelecionada} onEscanearQR={handleEscanearQR} />);
  }

  if (h.opSelecionada && !h.itemSelecionado) {
    return wrap(
      <ItensOpView
        opSelecionada={h.opSelecionada}
        onSelectItem={h.setItemSelecionado}
        onVoltar={() => h.setOpSelecionada(null)}
        onFinalizar={() => h.finalizarEEnviarMutation.mutate(h.opSelecionada.id)}
        podeExpedir={h.podeExpedir}
        isEnviando={h.finalizarEEnviarMutation.isPending}
      />
    );
  }

  return wrap(
    <ApontamentoFormView
      opSelecionada={h.opSelecionada}
      itemSelecionado={h.itemSelecionado}
      apontamento={h.apontamento}
      setApontamento={h.setApontamento}
      onSubmit={h.handleSubmitApontamento}
      onVoltar={() => h.setItemSelecionado(null)}
      onCancel={() => h.resetApontamento()}
      isSaving={h.apontarMutation.isPending}
      podeApontar={h.podeApontar}
    />
  );
}