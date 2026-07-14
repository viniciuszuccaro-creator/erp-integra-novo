import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Bot, Check, X, AlertCircle } from "lucide-react";

export default function UploadIACard({ onUpload, processandoIA, previewPosicoes, onConfirmar, onCancelar }) {
  return (
    <Card className="border-2 border-purple-300 bg-purple-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-600" />
          Upload com IA (DWG/PDF)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <input
          type="file"
          accept=".pdf,.dwg,.dxf"
          onChange={onUpload}
          className="hidden"
          id="upload-ia"
          disabled={processandoIA}
        />
        <label htmlFor="upload-ia">
          <Button asChild className="w-full bg-purple-600 hover:bg-purple-700" disabled={processandoIA}>
            <span>
              {processandoIA ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Processando IA...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo (IA Automática)
                </>
              )}
            </span>
          </Button>
        </label>
        <p className="text-xs text-purple-700 mt-2 text-center">
          A IA extrairá automaticamente posições + etapas da obra
        </p>

        {/* Vol 5.4: Prévia da importação IA — exige confirmação antes de gravar */}
        {previewPosicoes && (
          <div className="mt-4 border-2 border-amber-400 rounded-lg bg-amber-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span className="font-semibold text-sm text-amber-900">Prévia da Importação IA</span>
            </div>
            <div className="text-xs text-amber-800 space-y-1 mb-3">
              <p><strong>Arquivo:</strong> {previewPosicoes.arquivo_nome}</p>
              <p><strong>Posições detectadas:</strong> {previewPosicoes.posicoes.length}</p>
              <p><strong>Confiança IA:</strong> {previewPosicoes.confianca}%</p>
            </div>
            <div className="max-h-40 overflow-auto rounded border border-amber-200 bg-white mb-3">
              <table className="w-full text-xs">
                <thead className="bg-amber-100 sticky top-0">
                  <tr>
                    <th className="p-1.5 text-left">Código</th>
                    <th className="p-1.5 text-left">Bitola</th>
                    <th className="p-1.5 text-left">Formato</th>
                    <th className="p-1.5 text-right">Qtd</th>
                    <th className="p-1.5 text-left">Etapa</th>
                  </tr>
                </thead>
                <tbody>
                  {previewPosicoes.posicoes.map((pos, idx) => (
                    <tr key={idx} className="border-t border-amber-100">
                      <td className="p-1.5">{pos.codigo || '-'}</td>
                      <td className="p-1.5">{pos.bitola || '-'}mm</td>
                      <td className="p-1.5">{pos.formato || '-'}</td>
                      <td className="p-1.5 text-right">{pos.quantidade || 0}</td>
                      <td className="p-1.5">{pos.etapa_obra_nome || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
                onClick={onConfirmar}
              >
                <Check className="w-4 h-4 mr-1" />
                Confirmar e Gravar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 border-red-400 text-red-600 hover:bg-red-50"
                onClick={onCancelar}
              >
                <X className="w-4 h-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}