import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, FileText, AlertCircle, Loader2 } from "lucide-react";

/**
 * Componente de upload e configuração para IA de Leitura de Projeto
 * Extraído de IALeituraProjeto.jsx
 */
export default function LeituraProjetoUpload({
  configuracao, modoLeitura, setModoLeitura, arquivo,
  handleUpload, processarArquivo, processando
}) {
  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          IA de Leitura de Projeto <Badge className="ml-2 bg-purple-200 text-purple-800">V12.0</Badge>
        </CardTitle>
        <p className="text-sm text-slate-600">
          Envie o arquivo do projeto e a IA identificará elementos estruturais automaticamente
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {(!configuracao?.integracao_ia_producao?.ativada || configuracao?.integracao_ia_producao?.modo_simulacao) && (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-orange-900 text-sm">IA em modo de simulação</p>
                <p className="text-orange-700 text-xs mt-1">
                  {configuracao?.integracao_ia_producao?.ativada ?
                    "A integração real está ativada, mas o modo de simulação está ativo. Desative-o nas Configurações para usar a IA real." :
                    "A IA não está ativada ou configurada. Configure a integração em Configurações do Sistema → Integrações para ativar a leitura real."
                  }
                  Por enquanto, o sistema funcionará em modo de demonstração.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="modoLeitura">Modo de Leitura</Label>
            <Select value={modoLeitura} onValueChange={setModoLeitura} id="modoLeitura">
              <SelectTrigger>
                <SelectValue placeholder="Selecione o modo de leitura" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leitura_estrutural">Leitura Estrutural (Vigas/Colunas)</SelectItem>
                <SelectItem value="corte_dobra">Corte e Dobra (Simples)</SelectItem>
                <SelectItem value="leitura_mista">Leitura Mista (Estrutural + C&D)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="arquivoProjeto">Arquivo do Projeto</Label>
            <Input id="arquivoProjeto" type="file" accept=".pdf,.dwg,.dxf,.png,.jpg,.jpeg" onChange={handleUpload} />
          </div>
        </div>

        {arquivo && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">{arquivo.name}</p>
                <p className="text-xs text-slate-600">{(arquivo.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button onClick={processarArquivo} disabled={processando} className="bg-purple-600 hover:bg-purple-700">
              {processando ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processando...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-2" />Processar com IA</>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}