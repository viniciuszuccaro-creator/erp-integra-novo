import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, Sparkles, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useToast } from "@/components/ui/use-toast";

/**
 * V21.1.2 - WINDOW MODE READY
 */
export default function UploadProjetoForm({ onPecasExtraidas, windowMode = false }) {
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [resultado, setResultado] = useState(null);
  const { toast } = useToast();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const extensoesPermitidas = ['.pdf', '.jpg', '.jpeg', '.png', '.dwg'];
      const extensao = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));
      
      if (!extensoesPermitidas.includes(extensao)) {
        toast({ title: "❌ Arquivo não suportado", description: "Use arquivos PDF, JPG, PNG ou DWG", variant: "destructive" });
        return;
      }
      
      setArquivo(file);
      setResultado(null);
    }
  };

  const processarComIA = async () => {
    if (!arquivo) {
      toast({ title: "❌ Nenhum arquivo selecionado", description: "Selecione um arquivo de projeto primeiro", variant: "destructive" });
      return;
    }

    try {
      setProcessando(true);
      setProgresso(10);

      toast({ title: "📤 Enviando arquivo...", description: "Fazendo upload do projeto" });
      const uploadResponse = await base44.integrations.Core.UploadFile({ file: arquivo });
      const fileUrl = uploadResponse.file_url;
      setProgresso(50);

      toast({ title: "🤖 Processando com IA...", description: "Analisando o projeto e extraindo informações" });

      const jsonSchema = {
        type: "object",
        properties: {
          pecas: {
            type: "array",
            items: {
              type: "object",
              properties: {
                identificador: { type: "string" },
                tipo_peca: { type: "string", enum: ["Coluna", "Viga", "Bloco", "Sapata", "Laje", "Estaca"] },
                quantidade: { type: "number" },
                comprimento: { type: "number" },
                largura: { type: "number" },
                altura: { type: "number" },
                ferro_principal_bitola: { type: "string" },
                ferro_principal_quantidade: { type: "number" },
                estribo_bitola: { type: "string" },
                estribo_distancia: { type: "number" },
                observacoes: { type: "string" }
              },
              required: ["identificador", "tipo_peca", "quantidade"]
            }
          },
          resumo_projeto: {
            type: "object",
            properties: {
              nome_projeto: { type: "string" },
              total_pecas: { type: "number" },
              tipos_encontrados: { type: "array", items: { type: "string" } },
              observacoes_gerais: { type: "string" }
            }
          }
        }
      };

      setProgresso(70);

      const iaResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise o projeto anexado e extraia TODAS as informações de peças estruturais (colunas, vigas, blocos, sapatas, lajes, estacas). Para cada peça: ID, tipo, quantidade, dimensões, armadura, estribos. Retorne JSON estruturado.`,
        file_urls: [fileUrl],
        response_json_schema: jsonSchema
      });

      setProgresso(90);

      if (!iaResponse?.pecas || iaResponse.pecas.length === 0) {
        throw new Error("Nenhuma peça foi identificada no projeto");
      }

      setResultado(iaResponse);
      setProgresso(100);
      toast({ title: "✅ Análise Concluída!", description: `${iaResponse.pecas.length} peças identificadas no projeto` });

    } catch (error) {
      console.error("Erro ao processar com IA:", error);
      toast({ title: "❌ Erro no Processamento", description: error.message || "Não foi possível processar o projeto", variant: "destructive" });
      setResultado(null);
    } finally {
      setProcessando(false);
    }
  };

  const confirmarPecas = () => {
    if (resultado?.pecas) {
      onPecasExtraidas(resultado.pecas, resultado.resumo_projeto);
      toast({ title: "✅ Peças Importadas!", description: `${resultado.pecas.length} peças adicionadas ao orçamento` });
    }
  };

  const resetar = () => {
    setArquivo(null);
    setResultado(null);
    setProgresso(0);
  };

  const content = (
    <div className={`space-y-4 ${windowMode ? 'p-6 h-full overflow-auto' : ''}`}>
      {!resultado && (
        <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
          <CardContent className="p-6">
            <div className="text-center">
              <Upload className="w-12 h-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Selecione o arquivo do projeto</h3>
              <p className="text-sm text-slate-600 mb-4">Formatos aceitos: PDF, JPG, PNG, DWG</p>
              
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <FileText className="w-4 h-4" />
                  {arquivo ? 'Trocar Arquivo' : 'Escolher Arquivo'}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.dwg"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Label>

              {arquivo && (
                <div className="mt-4">
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {arquivo.name}
                  </Badge>
                  <p className="text-xs text-slate-500 mt-1">{(arquivo.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {processando && (
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
              <div className="flex-1">
                <p className="font-semibold text-purple-900 mb-1">Processando projeto com IA...</p>
                <div className="w-full bg-purple-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progresso}%` }} />
                </div>
                <p className="text-xs text-purple-700 mt-1">{progresso}% concluído</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {resultado && (
        <>
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900 mb-2">Análise Concluída com Sucesso!</h4>
                  {resultado.resumo_projeto && (
                    <div className="text-sm text-green-800 space-y-1">
                      <p><strong>Projeto:</strong> {resultado.resumo_projeto.nome_projeto || 'Sem nome'}</p>
                      <p><strong>Total de peças:</strong> {resultado.resumo_projeto.total_pecas}</p>
                      {resultado.resumo_projeto.tipos_encontrados && (
                        <p><strong>Tipos:</strong> {resultado.resumo_projeto.tipos_encontrados.join(', ')}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Peças Identificadas ({resultado.pecas.length})</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {resultado.pecas.map((peca, index) => (
                  <Card key={index} className="bg-slate-50">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge className="bg-amber-600">{peca.identificador}</Badge>
                        <span className="font-semibold">{peca.tipo_peca}</span>
                        {peca.quantidade > 1 && <Badge variant="outline">{peca.quantidade}x</Badge>}
                      </div>
                      <div className="text-xs text-slate-600 space-y-0.5">
                        {peca.comprimento > 0 && <p>Comprimento: {peca.comprimento} cm</p>}
                        {peca.ferro_principal_bitola && (
                          <p>Ferro: {peca.ferro_principal_quantidade}Ø{peca.ferro_principal_bitola}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-amber-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">⚠️ Conferência Necessária</p>
                  <p>A IA identificou as peças automaticamente, mas revise as informações antes de prosseguir.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

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
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
        {resultado ? (
          <>
            <Button type="button" variant="outline" onClick={resetar}>
              Analisar Outro Projeto
            </Button>
            <Button type="button" onClick={confirmarPecas} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar e Importar Peças
            </Button>
          </>
        ) : (
          <Button 
            type="button" 
            onClick={processarComIA}
            disabled={!arquivo || processando}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {processando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Processar com IA
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return content;
}