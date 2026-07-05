import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Send, Upload, FileCheck } from "lucide-react";
import useRemessaRetorno from "@/components/financeiro/remessa-retorno/useRemessaRetorno";
import RemessaTab from "@/components/financeiro/remessa-retorno/RemessaTab";
import RetornoTab from "@/components/financeiro/remessa-retorno/RetornoTab";
import HistoricoTab from "@/components/financeiro/remessa-retorno/HistoricoTab";
import RemessaDialog from "@/components/financeiro/remessa-retorno/RemessaDialog";

/**
 * 🏦 GESTÃO DE REMESSA E RETORNO CNAB V21.8
 * Geração de Remessa, Importação de Retorno e Baixa Automática de Títulos
 */
export default function GestaoRemessaRetorno({ windowMode = false }) {
  const [abaAtiva, setAbaAtiva] = useState("remessa");
  const {
    bancos, arquivos, titulosAptosRemessa,
    titulosSelecionados, setTitulosSelecionados,
    bancoSelecionado, setBancoSelecionado,
    dialogRemessa, setDialogRemessa,
    processandoRetorno, handleFileUpload,
    valorTotalSelecionado,
    gerarRemessaMutation,
    contextoValido, podeGerarRemessa, podeProcessarRetorno,
  } = useRemessaRetorno();

  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-hidden" : "space-y-6";
  const contentClass = windowMode ? "flex-1 overflow-auto p-6" : "";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        <Tabs value={abaAtiva} onValueChange={setAbaAtiva} className="space-y-6">
          <TabsList className="bg-white border shadow-sm">
            <TabsTrigger value="remessa" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Send className="w-4 h-4 mr-2" />Gerar Remessa
            </TabsTrigger>
            <TabsTrigger value="retorno" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Upload className="w-4 h-4 mr-2" />Processar Retorno
            </TabsTrigger>
            <TabsTrigger value="historico" className="data-[state=active]:bg-slate-600 data-[state=active]:text-white">
              <FileCheck className="w-4 h-4 mr-2" />Histórico ({arquivos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="remessa">
            <RemessaTab
              titulosAptosRemessa={titulosAptosRemessa}
              titulosSelecionados={titulosSelecionados}
              setTitulosSelecionados={setTitulosSelecionados}
              valorTotalSelecionado={valorTotalSelecionado}
              onGerarRemessa={() => setDialogRemessa(true)}
              contextoValido={contextoValido}
              podeGerarRemessa={podeGerarRemessa}
            />
          </TabsContent>

          <TabsContent value="retorno">
            <RetornoTab
              handleFileUpload={handleFileUpload}
              processandoRetorno={processandoRetorno}
              contextoValido={contextoValido}
              podeProcessarRetorno={podeProcessarRetorno}
            />
          </TabsContent>

          <TabsContent value="historico">
            <HistoricoTab arquivos={arquivos} />
          </TabsContent>
        </Tabs>

        <RemessaDialog
          open={dialogRemessa}
          onOpenChange={setDialogRemessa}
          bancos={bancos}
          bancoSelecionado={bancoSelecionado}
          setBancoSelecionado={setBancoSelecionado}
          titulosSelecionados={titulosSelecionados}
          valorTotalSelecionado={valorTotalSelecionado}
          onConfirmar={() => gerarRemessaMutation.mutate({ bancoId: bancoSelecionado, titulosIds: titulosSelecionados })}
          isPending={gerarRemessaMutation.isPending}
          contextoValido={contextoValido}
          podeGerarRemessa={podeGerarRemessa}
        />
      </div>
    </div>
  );
}