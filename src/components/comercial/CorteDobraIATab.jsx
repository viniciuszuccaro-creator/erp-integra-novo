import React from "react";
import { Eye } from "lucide-react";
import VisualizadorPeca from "./VisualizadorPeca";
import useCorteDobraIA from "./corte-dobra-ia/useCorteDobraIA";
import UploadIACard from "./corte-dobra-ia/UploadIACard";
import PosicaoForm from "./corte-dobra-ia/PosicaoForm";
import PosicoesTable from "./corte-dobra-ia/PosicoesTable";

/**
 * V21.1 - Aba 4: Corte e Dobra (IA)
 * Refatorado V21.9: hook + 3 sub-componentes (Regra-Mãe)
 */
export default function CorteDobraIATab({ formData, setFormData, empresaId, onNext }) {
  const {
    bitolas, posicaoSelecionada, setPosicaoSelecionada,
    editando, setEditando, processandoIA, previewPosicoes,
    handleUploadIA, adicionarManual, salvarPosicao, removerPosicao, consolidarPorEtapa,
    confirmarImportacaoIA, cancelarImportacaoIA,
  } = useCorteDobraIA(formData, setFormData, empresaId);

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 w-full">
      <div className="space-y-4 w-full min-h-[300px]">
        <UploadIACard
          onUpload={handleUploadIA}
          processandoIA={processandoIA}
          previewPosicoes={previewPosicoes}
          onConfirmar={confirmarImportacaoIA}
          onCancelar={cancelarImportacaoIA}
        />
        <PosicaoForm
          editando={editando}
          setEditando={setEditando}
          bitolas={bitolas}
          onSave={salvarPosicao}
          onAdd={adicionarManual}
        />
        <PosicoesTable
          itens={formData?.itens_corte_dobra}
          onRemover={removerPosicao}
          onConsolidar={consolidarPorEtapa}
          onSelecionar={setPosicaoSelecionada}
          posicaoSelecionada={posicaoSelecionada}
          onNext={onNext}
        />
      </div>

      <div className="border-2 border-slate-200 rounded-lg bg-white overflow-hidden lg:sticky lg:top-4 self-start flex-1 w-full min-h-[250px]">
        <div className="p-3 bg-slate-50 border-b">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            Visualizador de Peça
          </h3>
        </div>
        <VisualizadorPeca
          posicao={posicaoSelecionada !== null ? formData?.itens_corte_dobra?.[posicaoSelecionada] : null}
        />
      </div>
    </div>
  );
}