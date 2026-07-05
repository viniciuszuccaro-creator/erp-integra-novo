import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { 
  Factory, CheckCircle2, AlertTriangle, 
  ArrowRight, Sparkles, Loader2, Package 
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";

/**
 * V21.6 - CONVERSÃO EM MASSA PARA PRODUÇÃO
 * Converte múltiplos produtos de Revenda/Acabado para Matéria-Prima Produção
 * ✅ Seleção múltipla com checkboxes
 * ✅ Preview de alterações
 * ✅ IA sugere quais produtos devem ir para produção
 * ✅ Barra de progresso para conversão
 */
export default function ConversaoProducaoMassa({ produtos, onConcluido }) {
  const [produtosSelecionados, setProdutosSelecionados] = useState([]);
  const [processando, setProcessando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [analisandoIA, setAnalisandoIA] = useState(false);

  // Filtrar apenas produtos que NÃO são de produção
  const produtosConversiveis = produtos.filter(p => 
    p.tipo_item !== 'Matéria-Prima Produção'
  );

  const toggleProduto = (produtoId) => {
    setProdutosSelecionados(prev => 
      prev.includes(produtoId) 
        ? prev.filter(id => id !== produtoId)
        : [...prev, produtoId]
    );
  };

  const selecionarTodos = () => {
    if (produtosSelecionados.length === produtosConversiveis.length) {
      setProdutosSelecionados([]);
    } else {
      setProdutosSelecionados(produtosConversiveis.map(p => p.id));
    }
  };

  // IA sugere produtos que devem ir para produção
  const analisarComIA = async () => {
    setAnalisandoIA(true);
    
    try {
      const descricoes = produtosConversiveis
        .slice(0, 20) // Limitar para não sobrecarregar
        .map(p => p.descricao)
        .join('; ');

      const resultado = await base44.integrations.Core.InvokeLLM({
        prompt: `Analise esta lista de produtos e identifique quais devem ser usados na PRODUÇÃO (matéria-prima):

Produtos: ${descricoes}

Produtos que devem ir para PRODUÇÃO geralmente são:
- Matérias-primas (aço, ferro, vergalhões, telas)
- Componentes para manufatura
- Insumos de fabricação
- Bitolas

Produtos que devem permanecer em REVENDA:
- Produtos acabados para venda direta
- Itens de consumo final
- Produtos de terceiros

Retorne apenas os índices (0, 1, 2...) dos produtos que DEVEM ir para produção.`,
        response_json_schema: {
          type: "object",
          properties: {
            indices_producao: {
              type: "array",
              items: { type: "number" }
            },
            justificativa: { type: "string" }
          }
        }
      });

      const indicados = resultado.indices_producao || [];
      const produtosIndicados = produtosConversiveis
        .filter((_, index) => indicados.includes(index))
        .map(p => p.id);

      setProdutosSelecionados(produtosIndicados);
      
      toast.success('✨ IA analisou os produtos!', {
        description: resultado.justificativa
      });
    } catch (error) {
      toast.error('Erro na análise de IA');
    } finally {
      setAnalisandoIA(false);
    }
  };

  // Converter produtos selecionados
  const converterProdutos = async () => {
    if (produtosSelecionados.length === 0) {
      toast.error('Selecione ao menos um produto');
      return;
    }

    setProcessando(true);
    setProgresso(0);

    try {
      const total = produtosSelecionados.length;
      let concluidos = 0;

      for (const produtoId of produtosSelecionados) {
        const produto = produtos.find(p => p.id === produtoId);
        
        await base44.entities.Produto.update(produtoId, {
          tipo_item: 'Matéria-Prima Produção',
          setor_atividade_id: 'setor-fabrica-001',
          setor_atividade_nome: 'Fábrica'
        });

        concluidos++;
        setProgresso(Math.round((concluidos / total) * 100));
      }

      toast.success(`✅ ${total} produto(s) convertido(s) para Produção!`);
      setProdutosSelecionados([]);
      
      if (onConcluido) {
        onConcluido();
      }
    } catch (error) {
      toast.error('Erro na conversão', {
        description: error.message
      });
    } finally {
      setProcessando(false);
      setProgresso(0);
    }
  };

  return (
    <div className="w-full h-full space-y-6">
      <Alert className="border-orange-300 bg-gradient-to-r from-orange-50 to-amber-50">
        <Factory className="w-5 h-5 text-orange-600" />
        <AlertDescription>
          <p className="font-semibold text-orange-900 mb-1">🏭 Conversão em Massa para Produção</p>
          <p className="text-sm text-orange-700">
            Selecione produtos que serão usados como matéria-prima na fábrica. 
            A IA pode sugerir automaticamente.
          </p>
        </AlertDescription>
      </Alert>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-1">Total de Produtos</p>
            <p className="text-2xl font-bold text-blue-700">{produtosConversiveis.length}</p>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-1">Selecionados</p>
            <p className="text-2xl font-bold text-purple-700">{produtosSelecionados.length}</p>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="p-4">
            <p className="text-sm text-slate-600 mb-1">Já em Produção</p>
            <p className="text-2xl font-bold text-green-700">
              {produtos.filter(p => p.tipo_item === 'Matéria-Prima Produção').length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ações */}
      <div className="flex gap-3">
        <Button
          onClick={analisarComIA}
          disabled={analisandoIA || produtosConversiveis.length === 0}
          variant="outline"
          className="border-purple-300 text-purple-700 hover:bg-purple-50"
        >
          {analisandoIA ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4 mr-2" />
          )}
          IA Sugerir Produtos
        </Button>

        <Button
          onClick={selecionarTodos}
          variant="outline"
          disabled={produtosConversiveis.length === 0}
        >
          {produtosSelecionados.length === produtosConversiveis.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
        </Button>

        <Button
          onClick={converterProdutos}
          disabled={processando || produtosSelecionados.length === 0}
          className="bg-orange-600 hover:bg-orange-700 ml-auto"
          data-permission="Cadastros.Produto.converter"
        >
          {processando ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Factory className="w-4 h-4 mr-2" />
          )}
          Converter {produtosSelecionados.length > 0 && `(${produtosSelecionados.length})`}
        </Button>
      </div>

      {/* Barra de Progresso */}
      {processando && (
        <Card className="border-blue-300 bg-blue-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-blue-900">Convertendo produtos...</p>
              <span className="text-sm text-blue-700">{progresso}%</span>
            </div>
            <Progress value={progresso} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Lista de Produtos */}
      <Card className="border-slate-200">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">
            Produtos Disponíveis para Conversão
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[500px] overflow-y-auto">
            {produtosConversiveis.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle2 className="w-16 h-16 text-green-300 mx-auto mb-4" />
                <p className="text-slate-500 font-semibold">Todos os produtos já estão em Produção! ✅</p>
              </div>
            ) : (
              <div className="divide-y">
                {produtosConversiveis.map((produto) => {
                  const selecionado = produtosSelecionados.includes(produto.id);
                  
                  return (
                    <div
                      key={produto.id}
                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer ${
                        selecionado ? 'bg-orange-50 border-l-4 border-orange-500' : ''
                      }`}
                      onClick={() => toggleProduto(produto.id)}
                    >
                      <div className="flex items-center gap-4">
                        <Checkbox
                          checked={selecionado}
                          onCheckedChange={() => toggleProduto(produto.id)}
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <p className="font-semibold text-slate-900">{produto.descricao}</p>
                            <Badge variant="outline" className="text-xs">
                              {produto.tipo_item || 'Revenda'}
                            </Badge>
                            {produto.eh_bitola && (
                              <Badge className="bg-blue-600 text-white text-xs">
                                Bitola
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-4 text-xs text-slate-600">
                            <span>Código: {produto.codigo}</span>
                            <span>Estoque: {produto.estoque_atual || 0} {produto.unidade_principal}</span>
                            <span>NCM: {produto.ncm || 'N/A'}</span>
                          </div>
                        </div>

                        {selecionado && (
                          <div className="flex items-center gap-2 text-orange-600">
                            <ArrowRight className="w-5 h-5" />
                            <Factory className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview de Alterações */}
      {produtosSelecionados.length > 0 && (
        <Alert className="border-green-300 bg-green-50">
          <CheckCircle2 className="w-5 h-5 text-green-700" />
          <AlertDescription>
            <p className="font-semibold text-green-900 mb-2">
              ✅ Alterações que serão aplicadas em {produtosSelecionados.length} produto(s):
            </p>
            <div className="space-y-1 text-sm text-green-800">
              <p>• <strong>Tipo de Item:</strong> Revenda → Matéria-Prima Produção</p>
              <p>• <strong>Setor:</strong> Fábrica</p>
              <p>• <strong>Disponibilidade:</strong> Ordens de Produção ✅</p>
              <p>• <strong>Status:</strong> Mantido (sem alterações)</p>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}