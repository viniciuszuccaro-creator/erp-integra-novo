import React from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Factory } from "lucide-react";
import { useGerarOPLogic } from "./hooks/useGerarOPLogic";
import GerarOPStepSelecao from "./gerar-op/GerarOPStepSelecao";
import GerarOPStepConfig from "./gerar-op/GerarOPStepConfig";
import GerarOPStepProcessando from "./gerar-op/GerarOPStepProcessando";
import GerarOPStepConcluido from "./gerar-op/GerarOPStepConcluido";

/**
 * V21.1.2 - WINDOW MODE READY
 * Refatorado: lógica extraída para useGerarOPLogic, UI em sub-componentes gerar-op/
 */
export default function GerarOPModal({ isOpen, onClose, pedido, windowMode = false }) {
  const {
    step, setStep, gerando, opsGeradas, itensSelecionados,
    configGlobal, setConfigGlobal, configProducao,
    toggleItem, toggleAll, avancarParaConfig, gerarOPs, fechar,
    gerarOPAutomaticaMutation
  } = useGerarOPLogic({ isOpen, onClose, pedido });

  if (!pedido) return null;

  const headerTitle = (
    <DialogHeader>
      <DialogTitle className="flex items-center gap-2">
        <Factory className="w-5 h-5 text-amber-600" />
        Gerar Ordem de Produção Automática
        {step > 1 && (
          <Badge className="ml-2">
            {step === 2 ? "Configuração" : step === 3 ? "Processando" : "Concluído"}
          </Badge>
        )}
      </DialogTitle>
    </DialogHeader>
  );

  const content = (
    <div className={`space-y-6 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      {headerTitle}

      {step === 1 && (
        <GerarOPStepSelecao
          pedido={pedido}
          itensSelecionados={itensSelecionados}
          toggleItem={toggleItem}
          toggleAll={toggleAll}
          avancarParaConfig={avancarParaConfig}
          onClose={fechar}
        />
      )}

      {step === 2 && (
        <GerarOPStepConfig
          configGlobal={configGlobal}
          setConfigGlobal={setConfigGlobal}
          configProducao={configProducao}
          onVoltar={() => setStep(1)}
          onGerar={gerarOPs}
          isPending={gerarOPAutomaticaMutation.isPending}
        />
      )}

      {step === 3 && <GerarOPStepProcessando />}

      {step === 4 && (
        <GerarOPStepConcluido
          opsGeradas={opsGeradas}
          onFechar={fechar}
        />
      )}
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return (
    <Dialog open={isOpen} onOpenChange={fechar}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        {content}
      </DialogContent>
    </Dialog>
  );
}