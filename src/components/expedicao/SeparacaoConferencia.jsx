import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, QrCode, List } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ScannerQRCode from "./ScannerQRCode";
import useSeparacaoConferencia from "./separacao-conferencia/useSeparacaoConferencia";
import SeparacaoItensTable from "./separacao-conferencia/SeparacaoItensTable";
import SeparacaoChecklist from "./separacao-conferencia/SeparacaoChecklist";

/**
 * Separação e Conferência de Itens (Picking) para Entregas
 * Refatorado: hook + 2 sub-componentes (Regra-Mãe)
 */
export default function SeparacaoConferencia({ entregaId, pedido, empresaId, onClose, windowMode = false }) {
  const [activeTab, setActiveTab] = useState("scanner");
  const {
    itens, checklist, setChecklist, dadosParaSeparacao,
    isLoading, isError, error,
    criarSeparacaoMutation, atualizarItem, handleItemEscaneado, handleSubmit,
    itensDivergentes,
  } = useSeparacaoConferencia({ entregaId, pedido, empresaId });

  if (isLoading) return <p className="p-6">Carregando dados da entrega...</p>;
  if (isError) return <p className="text-red-500 p-6">Erro ao carregar entrega: {error?.message}</p>;
  if (!dadosParaSeparacao) return <p className="text-gray-500 p-6">Nenhum dado encontrado.</p>;

  return (
    <div className={windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6"}>
      <div className={windowMode ? "p-6 space-y-6 flex-1" : "space-y-6"}>
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-5">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Referência</p>
                <p className="font-bold text-lg">{dadosParaSeparacao.numero_pedido || dadosParaSeparacao.numero_entrega}</p>
              </div>
              <div>
                <p className="text-slate-600">Cliente</p>
                <p className="font-bold text-lg">{dadosParaSeparacao.cliente_nome}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="scanner"><QrCode className="w-4 h-4 mr-2" />Scanner QR Code</TabsTrigger>
            <TabsTrigger value="manual"><List className="w-4 h-4 mr-2" />Conferência Manual</TabsTrigger>
          </TabsList>

          <TabsContent value="scanner">
            <ScannerQRCode entregaId={entregaId} itensEsperados={dadosParaSeparacao?.itens_revenda || []} modo="separacao" onItemEscaneado={handleItemEscaneado} />
          </TabsContent>

          <TabsContent value="manual">
            <form onSubmit={handleSubmit} className="space-y-6">
              {itensDivergentes.length > 0 && (
                <Card className="border-2 border-red-300 bg-red-50">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-red-900 mb-1">Divergências Detectadas</p>
                        <p className="text-sm text-red-700">{itensDivergentes.length} item(ns) com quantidade divergente. Verifique e tome ação antes de liberar.</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <SeparacaoItensTable itens={itens} onAtualizarItem={atualizarItem} />
              <SeparacaoChecklist checklist={checklist} setChecklist={setChecklist} />

              <Card className="border-0 shadow-md bg-slate-50">
                <CardContent className="p-5">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-slate-600">Total Itens</p>
                      <p className="text-2xl font-bold">{itens.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-700">Conferidos OK</p>
                      <p className="text-2xl font-bold text-green-900">{itens.filter(i => i.status_item === "ok").length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-red-700">Divergências</p>
                      <p className="text-2xl font-bold text-red-900">{itensDivergentes.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" disabled={criarSeparacaoMutation.isPending} className="flex-1 h-14 text-lg bg-green-600 hover:bg-green-700 w-full" data-permission="Expedicao.Separacao.concluir">
                {criarSeparacaoMutation.isPending ? 'Salvando...' : 'Concluir Conferência'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}