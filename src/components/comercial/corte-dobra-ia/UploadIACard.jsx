import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Bot } from "lucide-react";

export default function UploadIACard({ onUpload, processandoIA }) {
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
      </CardContent>
    </Card>
  );
}