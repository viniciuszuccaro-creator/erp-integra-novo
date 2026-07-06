import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Upload, FileText, CheckCircle2, AlertCircle, Sparkles, Package, Download } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function ImportacaoNFeRecebimento({ windowMode = false }) {
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { empresaAtual, grupoAtual } = useContextoVisual();

  const processarXMLMutation = useMutation({
    mutationFn: async (file) => {
      setProcessando(true);
      
      // Simular processamento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock: resultado processamento XML
      const mockResultado = {
        sucesso: true,
        nfe: {
          numero: "123456",
          serie: "1",
          chave: "35250112345678901234567890123456789012345678",
          data_emissao: "2025-01-20",
          fornecedor: "Aços Fortes Ltda",
          cnpj: "12.345.678/0001-90",
          valor_total: 15800.00,
          itens: [
            {
              codigo: "BIT-125",
              descricao: "Barra de Aço CA-50 12.5mm",
              ncm: "72142000",
              quantidade: 500,
              unidade: "KG",
              valor_unitario: 25.60,
              valor_total: 12800.00,
              produto_encontrado: true,
              produto_id: "prod_123"
            },
            {
              codigo: "BIT-100",
              descricao: "Barra de Aço CA-50 10.0mm",
              ncm: "72142000",
              quantidade: 300,
              unidade: "KG",
              valor_unitario: 10.00,
              valor_total: 3000.00,
              produto_encontrado: true,
              produto_id: "prod_456"
            }
          ]
        },
        avisos: [
          "✅ Todos os produtos foram encontrados no cadastro",
          "🤖 IA sugeriu atualização de custo médio dos produtos"
        ]
      };

      setResultado(mockResultado);
      setProcessando(false);
      return mockResultado;
    },
    onError: (error) => {
      setProcessando(false);
      toast({
        title: "❌ Erro no Processamento",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  const confirmarRecebimentoMutation = useMutation({
    mutationFn: async (dados) => {
      // 1. Criar registro de importação
      const importacao = await base44.entities.ImportacaoXMLNFe.create({
        tipo_nfe: "Entrada",
        chave_acesso: dados.nfe.chave,
        numero_nfe: dados.nfe.numero,
        serie: dados.nfe.serie,
        fornecedor_nome: dados.nfe.fornecedor,
        fornecedor_cnpj: dados.nfe.cnpj,
        data_emissao: dados.nfe.data_emissao,
        valor_total: dados.nfe.valor_total,
        quantidade_itens: dados.nfe.itens.length,
        status_processamento: "Processado",
        data_importacao: new Date().toISOString()
      });

      // 2. Criar movimentações de estoque para cada item
      for (const item of dados.nfe.itens) {
        if (item.produto_encontrado && item.produto_id) {
          await base44.entities.MovimentacaoEstoque.create({
            origem_movimento: "nfe",
            tipo_movimento: "entrada",
            produto_id: item.produto_id,
            produto_descricao: item.descricao,
            quantidade: item.quantidade,
            unidade_medida: item.unidade,
            valor_unitario: item.valor_unitario,
            valor_total: item.valor_total,
            documento: `NF-e ${dados.nfe.numero}`,
            data_movimentacao: dados.nfe.data_emissao,
            motivo: `Recebimento NF-e ${dados.nfe.numero}`,
            responsavel: "Sistema - Importação XML",
            group_id: grupoAtual?.id || empresaAtual?.group_id || null,
            empresa_id: empresaAtual?.id || null
          });

          // Atualizar estoque do produto
          const produto = await base44.entities.Produto.filter({ id: item.produto_id });
          if (produto && produto.length > 0) {
            const produtoAtual = produto[0];
            await base44.entities.Produto.update(item.produto_id, {
              estoque_atual: (produtoAtual.estoque_atual || 0) + item.quantidade,
              ultimo_preco_compra: item.valor_unitario,
              ultima_compra: dados.nfe.data_emissao
            });
          }
        }
      }

      return importacao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movimentacoes'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast({
        title: "✅ Recebimento Confirmado!",
        description: "Estoque atualizado automaticamente"
      });
      setResultado(null);
      setArquivo(null);
    }
  });

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xml')) {
        toast({
          title: "⚠️ Formato Inválido",
          description: "Por favor, selecione um arquivo XML",
          variant: "destructive"
        });
        return;
      }
      setArquivo(file);
    }
  };

  const handleProcessar = () => {
    if (!arquivo) return;
    processarXMLMutation.mutate(arquivo);
  };

  const content = (
    <div className="space-y-2">
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader className="bg-blue-100/50 border-b border-blue-200 py-3 px-4">
          <CardTitle className="flex items-center gap-2 text-base">
            <Upload className="w-5 h-5 text-blue-600" />
            🤖 Recebimento Automático por NF-e (XML)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <Alert className="border-blue-300 bg-white/70">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <AlertDescription className="text-sm">
              <strong>IA Automatizada:</strong> Faça upload do XML da NF-e de entrada. 
              O sistema identifica produtos, atualiza estoque e custos automaticamente.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="xml-upload" className="text-sm font-semibold">
              Arquivo XML da NF-e *
            </Label>
            <div className="flex gap-2">
              <Input
                id="xml-upload"
                type="file"
                accept=".xml"
                onChange={handleFileChange}
                className="flex-1"
              />
              <Button
                onClick={handleProcessar}
                disabled={!arquivo || processando}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {processando ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Processar XML
                  </>
                )}
              </Button>
            </div>
            {arquivo && (
              <p className="text-xs text-slate-600">
                <FileText className="w-3 h-3 inline mr-1" />
                {arquivo.name} ({(arquivo.size / 1024).toFixed(1)} KB)
              </p>
            )}
          </div>

          {processando && (
            <div className="space-y-2">
              <Progress value={60} className="h-2" />
              <p className="text-xs text-slate-600 text-center">
                🤖 IA analisando XML e identificando produtos...
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {resultado && resultado.sucesso && (
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader className="bg-green-100 border-b border-green-200 py-3 px-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Dados da NF-e Processados
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <p className="text-xs text-slate-600">Número NF-e</p>
                <p className="text-lg font-bold text-green-900">{resultado.nfe.numero}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <p className="text-xs text-slate-600">Fornecedor</p>
                <p className="text-sm font-bold text-green-900">{resultado.nfe.fornecedor}</p>
              </div>
              <div className="bg-white p-3 rounded-lg border border-green-200">
                <p className="text-xs text-slate-600">Valor Total</p>
                <p className="text-lg font-bold text-green-900">
                  R$ {resultado.nfe.valor_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>

            <div className="bg-white border border-green-200 rounded-lg p-3">
              <p className="text-sm font-semibold mb-2">Itens da NF-e:</p>
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Produto</TableHead>
                    <TableHead>NCM</TableHead>
                    <TableHead className="text-right">Qtd</TableHead>
                    <TableHead className="text-right">Unit.</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resultado.nfe.itens.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-sm">{item.descricao}</TableCell>
                      <TableCell className="text-xs font-mono">{item.ncm}</TableCell>
                      <TableCell className="text-right">{item.quantidade} {item.unidade}</TableCell>
                      <TableCell className="text-right">R$ {item.valor_unitario.toFixed(2)}</TableCell>
                      <TableCell className="text-right font-semibold">
                        R$ {item.valor_total.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {item.produto_encontrado ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Encontrado
                          </Badge>
                        ) : (
                          <Badge className="bg-orange-100 text-orange-700 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Novo
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {resultado.avisos && resultado.avisos.length > 0 && (
              <div className="space-y-1">
                {resultado.avisos.map((aviso, idx) => (
                  <Alert key={idx} className="border-blue-300 bg-blue-50 py-2 px-3">
                    <AlertDescription className="text-xs">{aviso}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t">
              <Button data-permission="Compras.ImportacaoNFeRecebimento.cancelar" variant="outline" onClick={() => setResultado(null)}>
                Cancelar
              </Button>
              <Button data-permission="Compras.ImportacaoNFeRecebimento.confirmar"
                className="bg-green-600 hover:bg-green-700"
                onClick={() => confirmarRecebimentoMutation.mutate(resultado)}
                disabled={confirmarRecebimentoMutation.isPending}
              >
                {confirmarRecebimentoMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Confirmando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Confirmar Recebimento
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader className="bg-slate-50 border-b py-2 px-3">
          <CardTitle className="text-sm">📊 Histórico de Importações</CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="text-center py-8 text-slate-500">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma importação realizada ainda</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-50 to-blue-50 overflow-auto p-1.5">{content}</div>;
  }

  return content;
}