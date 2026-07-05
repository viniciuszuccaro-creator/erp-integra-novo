import React from "react";
import { useToast } from "@/components/ui/use-toast";
import useLeituraProjeto from "./leitura-projeto/useLeituraProjeto";
import LeituraProjetoUpload from "./leitura-projeto/LeituraProjetoUpload";
import LeituraProjetoResultados from "./leitura-projeto/LeituraProjetoResultados";

/**
 * IA de Leitura de Projeto
 * V21.1.2 - WINDOW MODE READY - Preparado para integração REAL com Azure OpenAI
 * Refatorado em hook + 2 sub-componentes (Regra-Mãe)
 */
export default function IALeituraProjeto({ configuracao, windowMode = false }) {
  const { toast } = useToast();
  const {
    arquivo, processando, resultado, modoLeitura, setModoLeitura,
    handleUpload, processarArquivo, limparResultados,
  } = useLeituraProjeto(configuracao, toast);

  return (
    <div className={`space-y-6 ${windowMode ? 'w-full h-full overflow-auto p-6 bg-white' : ''}`}>
      <LeituraProjetoUpload
        configuracao={configuracao}
        modoLeitura={modoLeitura}
        setModoLeitura={setModoLeitura}
        arquivo={arquivo}
        handleUpload={handleUpload}
        processarArquivo={processarArquivo}
        processando={processando}
      />
      <LeituraProjetoResultados resultado={resultado} limparResultados={limparResultados} />
    </div>
  );
}