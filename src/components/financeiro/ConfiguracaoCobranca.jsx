import React from "react";
import { useConfigCobranca } from "./configuracao-cobranca/useConfigCobranca";
import CobrancaEmpresaSelector from "./configuracao-cobranca/CobrancaEmpresaSelector";
import CobrancaFormConfig from "./configuracao-cobranca/CobrancaFormConfig";

/**
 * Configuração de Cobrança (Boletos/PIX) por Empresa
 * Refatorado em hook + 2 sub-componentes (Regra-Mãe)
 */
export default function ConfiguracaoCobranca({ empresas, windowMode = false }) {
  const {
    configsExistentes, empresaSelecionada, config, setConfig,
    salvarMutation, carregarConfig
  } = useConfigCobranca();

  return (
    <div className={windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6"}>
      <div className={windowMode ? "p-6 space-y-6 flex-1" : "space-y-6"}>
        <CobrancaEmpresaSelector
          empresas={empresas}
          configsExistentes={configsExistentes}
          empresaSelecionada={empresaSelecionada}
          onSelecionar={carregarConfig}
        />
        <CobrancaFormConfig
          config={config}
          setConfig={setConfig}
          empresaSelecionada={empresaSelecionada}
          salvarMutation={salvarMutation}
          onSubmit={(e) => { e.preventDefault(); salvarMutation.mutate(); }}
        />
      </div>
    </div>
  );
}