import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { useUploadProjeto } from "./upload-projeto/useUploadProjeto";
import UploadProjetoResultado from "./upload-projeto/UploadProjetoResultado";
import UploadProjetoProgresso from "./upload-projeto/UploadProjetoProgresso";

/**
 * Modal de upload de projeto com IA para extração de peças estruturais
 * Refatorado: lógica em useUploadProjeto, UI em sub-componentes (Regra-Mãe)
 */
export default function UploadProjetoModal({ isOpen, onClose, onPecasExtraidas }) {
  const { arquivo, processando, progresso, resultado, handleFileChange, processarComIA, confirmarPecas, resetar } = useUploadProjeto({ onClose, onPecasExtraidas });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Upload de Projeto com IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Upload do Arquivo */}
          {!resultado && (
            <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
              <CardContent className="p-6">
                <div className="text-center">
                  <Upload className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Selecione o arquivo do projeto</h3>
                  <p className="text-sm text-slate-600 mb-4">Formatatos aceitos: PDF, JPG, PNG, DWG</p>
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <FileText className="w-4 h-4" />
                      {arquivo ? 'Trocar Arquivo' : 'Escolher Arquivo'}
                    </div>
                    <input id="file-upload" type="file" accept=".pdf,.jpg,.jpeg,.png,.dwg" onChange={handleFileChange} className="hidden" />
                  </Label>
                  {arquivo && (
                    <div className="mt-4">
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="w-3 h-3 mr-1" />{arquivo.name}
                      </Badge>
                      <p className="text-xs text-slate-500 mt-1">{(arquivo.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {processando && <UploadProjetoProgresso progresso={progresso} />}
          {resultado && <UploadProjetoResultado resultado={resultado} />}

          {/* Como Funciona */}
          {!resultado && !processando && (
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Como funciona a análise com IA
                </h4>
                <ol className="text-sm text-slate-700 space-y-2 list-decimal list-inside">
                  <li>Selecione o arquivo do projeto (PDF, imagem ou DWG)</li>
                  <li>A IA analisa o documento e identifica as peças estruturais</li>
                  <li>Para cada peça, extrai: ID, tipo, dimensões, armaduras</li>
                  <li>Você revisa e confirma as informações extraídas</li>
                  <li>As peças são importadas automaticamente para o orçamento</li>
                </ol>
                <p className="text-xs text-slate-500 mt-3">💡 Dica: Quanto melhor a qualidade do arquivo, mais precisa será a extração.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          {resultado ? (
            <>
              <Button type="button" variant="outline" onClick={resetar}>Analisar Outro Projeto</Button>
              <Button type="button" onClick={confirmarPecas} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />Confirmar e Importar Peças
              </Button>
            </>
          ) : (
            <>
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="button" onClick={processarComIA} disabled={!arquivo || processando} className="bg-purple-600 hover:bg-purple-700">
                {processando ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando...</>
                ) : (
                  <><Sparkles className="w-4 h-4 mr-2" />Processar com IA</>
                )}
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}