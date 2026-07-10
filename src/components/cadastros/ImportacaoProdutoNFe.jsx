import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Upload, CheckCircle2, AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";

/**
 * V21.1.2-R2 - Importação Automática de Produtos via NF-e
 * ✅ Upload de XML ou PDF
 * ✅ OCR + IA para extrair dados
 * ✅ Detecção de duplicidade
 * ✅ Criação automática de produtos
 */
export default function ImportacaoProdutoNFe({ onProdutosCriados }) {
  const { empresaAtual, filterInContext, createInContext } = useContextoVisual();
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState(null);

  const processarNFe = async () => {
    if (!arquivo) {
      toast.error("Selecione um arquivo XML ou PDF");
      return;
    }

    setProcessando(true);
    setResultado(null);

    try {
      // 1. Upload do arquivo
      const { file_url } = await base44.integrations.Core.UploadFile({ file: arquivo });

      // 2. IA extrai dados da NF-e
      const dadosExtraidos = await base44.integrations.Core.InvokeLLM({
        prompt: `Você é um especialista em NF-e brasileiras. Analise este arquivo e extraia TODOS os produtos, incluindo:
        
        Para cada produto:
        - descricao (descrição completa)
        - codigo (código do produto)
        - ncm (código NCM de 8 dígitos)
        - cest (se tiver)
        - unidade_medida (UN, KG, MT, etc)
        - quantidade
        - valor_unitario
        - cfop
        - origem_mercadoria (0 a 8)
        - eh_bitola (true se for vergalhão/bitola de aço)
        - peso_teorico_kg_m (se for bitola)
        - bitola_diametro_mm (se for bitola)
        
        IMPORTANTE: Se detectar bitolas de aço (ex: "VERGALHÃO 8MM", "CA-50 10MM"), preencha:
        - eh_bitola: true
        - peso_teorico_kg_m: peso da tabela oficial ABNT
        - bitola_diametro_mm: diâmetro
        
        Retorne um array de produtos.`,
        file_urls: [file_url],
        response_json_schema: {
          type: "object",
          properties: {
            produtos: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  descricao: { type: "string" },
                  codigo: { type: "string" },
                  ncm: { type: "string" },
                  cest: { type: "string" },
                  unidade_medida: { type: "string" },
                  quantidade: { type: "number" },
                  valor_unitario: { type: "number" },
                  cfop: { type: "string" },
                  origem_mercadoria: { type: "string" },
                  eh_bitola: { type: "boolean" },
                  peso_teorico_kg_m: { type: "number" },
                  bitola_diametro_mm: { type: "number" }
                }
              }
            },
            fornecedor: {
              type: "object",
              properties: {
                razao_social: { type: "string" },
                cnpj: { type: "string" }
              }
            },
            numero_nfe: { type: "string" },
            data_emissao: { type: "string" }
          }
        }
      });

      // 3. Verificar duplicidade
      const produtosExistentes = await filterInContext('Produto', { empresa_id: empresaAtual.id });
      const produtosComStatus = dadosExtraidos.produtos.map(prod => {
        const duplicado = produtosExistentes.find(p => 
          p.ncm === prod.ncm && 
          p.descricao?.toLowerCase().includes(prod.descricao.toLowerCase().split(' ')[0])
        );
        
        return {
          ...prod,
          duplicado: !!duplicado,
          produto_existente_id: duplicado?.id
        };
      });

      setResultado({
        produtos: produtosComStatus,
        fornecedor: dadosExtraidos.fornecedor,
        numero_nfe: dadosExtraidos.numero_nfe,
        data_emissao: dadosExtraidos.data_emissao,
        arquivo_url: file_url
      });

      toast.success(`✅ ${produtosComStatus.length} produto(s) extraído(s) da NF-e!`);
    } catch (error) {
      toast.error("Erro ao processar NF-e: " + error.message);
    } finally {
      setProcessando(false);
    }
  };

  const importarProdutos = async () => {
    if (!empresaAtual?.id) {
      toast.error("Selecione/defina a empresa de destino antes de importar.");
      return;
    }
    const produtosNovos = resultado.produtos.filter(p => !p.duplicado);
    
    if (produtosNovos.length === 0) {
      toast.error("Todos os produtos já existem!");
      return;
    }

    try {
      const produtosCriados = [];
      const gid = empresaAtual.group_id;

      const resolverCodigo = async (codigoFornecido) => {
        const getNext = async () => {
          const res = await base44.functions.invoke("entityListSorted", {
            entityName: "Produto", filter: { group_id: gid, _merged: { $ne: true } },
            sortField: "codigo", sortDirection: "desc", limit: 1, skip: 0,
          });
          const last = res?.data?.[0];
          const n = last ? parseInt(String(last.codigo).replace(/\D/g, ''), 10) : 0;
          return String(isNaN(n) ? 1 : n + 1).padStart(3, '0');
        };
        if (codigoFornecido && String(codigoFornecido).trim()) {
          const codeVal = String(codigoFornecido).trim();
          try {
            const existing = await base44.entities.Produto.filter({ group_id: gid, codigo: codeVal }, 'created_date', 1);
            if (existing && existing.length > 0) return getNext();
            return codeVal;
          } catch { return getNext(); }
        }
        return getNext();
      };

      for (const prod of produtosNovos) {
        const codigoFinal = await resolverCodigo(prod.codigo);
        const novoProduto = await base44.entities.Produto.create({
          empresa_id: empresaAtual.id,
          group_id: gid,
          descricao: prod.descricao,
          codigo: codigoFinal,
          ncm: prod.ncm,
          cest: prod.cest || '',
          unidade_medida: prod.unidade_medida,
          unidade_principal: prod.unidade_medida === 'KG' ? 'KG' : 'UN',
          unidades_secundarias: [prod.unidade_medida],
          custo_aquisicao: prod.valor_unitario,
          cfop: prod.cfop,
          origem_mercadoria: prod.origem_mercadoria,
          eh_bitola: prod.eh_bitola || false,
          peso_teorico_kg_m: prod.peso_teorico_kg_m || 0,
          bitola_diametro_mm: prod.bitola_diametro_mm || 0,
          status: 'Ativo',
          fornecedor_principal: resultado.fornecedor?.razao_social,
          observacoes: `Importado da NF-e ${resultado.numero_nfe} em ${new Date().toLocaleDateString()}`
        });

        produtosCriados.push(novoProduto);
      }

      toast.success(`✅ ${produtosCriados.length} produto(s) criado(s)!`);
      
      if (onProdutosCriados) {
        onProdutosCriados(produtosCriados);
      }

      setResultado(null);
      setArquivo(null);
    } catch (error) {
      toast.error("Erro ao importar: " + error.message);
    }
  };

  return (
    <Card className="border-2 border-purple-200">
      <CardHeader className="bg-purple-50">
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-600" />
          Importar Produtos da NF-e
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <Alert className="border-blue-200 bg-blue-50">
          <AlertDescription className="text-sm text-blue-900">
            📄 <strong>Como funciona:</strong> Faça upload do XML ou PDF da nota fiscal. 
            A IA extrairá automaticamente todos os produtos com NCM, peso, bitola e tributação.
          </AlertDescription>
        </Alert>

        <div>
          <input
            type="file"
            accept=".xml,.pdf"
            onChange={(e) => setArquivo(e.target.files[0])}
            className="hidden"
            id="nfe-upload"
          />
          <label htmlFor="nfe-upload">
            <Button data-permission="Cadastros.ImportacaoProdutoNFe.exportar" variant="outline" className="w-full" asChild disabled={processando}>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                {arquivo ? arquivo.name : 'Selecionar XML ou PDF da NF-e'}
              </span>
            </Button>
          </label>
        </div>

        {arquivo && (
          <Button
            onClick={processarNFe}
            disabled={processando}
            data-permission="Cadastros.Produto.importarNFe"
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {processando ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando com IA...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Processar NF-e
              </>
            )}
          </Button>
        )}

        {resultado && (
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-green-900">NF-e {resultado.numero_nfe}</p>
                  <p className="text-sm text-green-700">{resultado.fornecedor?.razao_social}</p>
                  <p className="text-xs text-green-600">
                    Emitida em {new Date(resultado.data_emissao).toLocaleDateString()}
                  </p>
                </div>
                <Badge className="bg-green-600 text-white">
                  {resultado.produtos.length} produtos
                </Badge>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {resultado.produtos.map((prod, idx) => (
                  <div key={idx} className={`p-3 rounded border ${
                    prod.duplicado ? 'bg-yellow-50 border-yellow-300' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{prod.descricao}</p>
                        <div className="flex gap-3 text-xs text-slate-600 mt-1">
                          <span>NCM: {prod.ncm}</span>
                          <span>UN: {prod.unidade_medida}</span>
                          {prod.eh_bitola && (
                            <Badge className="bg-blue-600 text-white text-xs">Bitola</Badge>
                          )}
                        </div>
                      </div>
                      {prod.duplicado ? (
                        <Badge className="bg-yellow-600 text-white">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Já existe
                        </Badge>
                      ) : (
                        <Badge className="bg-green-600 text-white">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Novo
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button data-permission="Cadastros.ImportacaoProdutoNFe.importar"
                onClick={importarProdutos}
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={resultado.produtos.every(p => p.duplicado)}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Importar {resultado.produtos.filter(p => !p.duplicado).length} Produto(s) Novo(s)
              </Button>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}