import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload } from "lucide-react";

export default function RetornoTab({
  handleFileUpload,
  processandoRetorno,
  contextoValido,
  podeProcessarRetorno,
}) {
  return (
    <Card>
      <CardHeader className="bg-green-50 border-b">
        <CardTitle className="flex items-center gap-2">
          <Upload className="w-5 h-5 text-green-600" />
          Importar Arquivo de Retorno CNAB
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <Alert className="border-blue-300 bg-blue-50">
            <AlertDescription>
              <p className="font-semibold text-blue-900 mb-2">ℹ️ Como funciona:</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc ml-5">
                <li>Faça upload do arquivo retorno (.RET) recebido do banco</li>
                <li>O sistema processará automaticamente as ocorrências</li>
                <li>Títulos pagos serão baixados automaticamente</li>
                <li>Confirmações de registro também serão processadas</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-green-500 transition-colors">
            <Upload className="w-16 h-16 mx-auto text-slate-400 mb-4" />
            <p className="text-slate-600 mb-4">Arraste o arquivo de retorno ou clique para selecionar</p>
            <Input
              type="file"
              accept=".ret,.RET,.txt,.TXT"
              onChange={handleFileUpload}
              className="max-w-xs mx-auto"
              disabled={processandoRetorno || !contextoValido || !podeProcessarRetorno}
            />
            {processandoRetorno && (
              <div className="mt-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-sm text-slate-600 mt-2">Processando arquivo...</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}