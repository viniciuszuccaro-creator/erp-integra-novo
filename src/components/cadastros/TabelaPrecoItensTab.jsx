import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus, Package, Search, X, Factory, Award, Boxes, Sparkles
} from "lucide-react";

/**
 * Aba de Itens da Tabela de Preço (modos Individual + Lote + lista)
 * Extraída de TabelaPrecoFormCompleto para reduzir tamanho (Regra-Mãe #3)
 */
export default function TabelaPrecoItensTab({
  modoInclusao,
  setModoInclusao,
  searchProduto,
  setSearchProduto,
  produtosFiltrados,
  handleAdicionarProdutoIndividual,
  filtroLote,
  setFiltroLote,
  setoresAtividade,
  gruposProduto,
  marcas,
  handleAdicionarProdutosLote,
  produtosDisponiveis,
  produtos,
  itensTabela,
  handleRemoverItem,
}) {
  return (
    <>
      <div className="flex gap-2">
        <Button
          type="button"
          size="sm"
          variant={modoInclusao === 'individual' ? 'default' : 'outline'}
          onClick={() => setModoInclusao('individual')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Individual
        </Button>
        <Button
          type="button"
          size="sm"
          variant={modoInclusao === 'lote' ? 'default' : 'outline'}
          onClick={() => setModoInclusao('lote')}
        >
          <Package className="w-4 h-4 mr-2" />
          Em Lote (V21.0)
        </Button>
      </div>

      {/* Modo Individual */}
      {modoInclusao === 'individual' && (
        <Card>
          <CardHeader className="bg-slate-50 border-b pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="w-4 h-4" />
              Buscar Produto
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <Input
              placeholder="Digite para buscar..."
              value={searchProduto}
              onChange={(e) => setSearchProduto(e.target.value)}
            />
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {produtosFiltrados.slice(0, 20).map(produto => (
                <div key={produto.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50 transition-colors">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{produto.descricao}</p>
                    <div className="flex gap-3 text-xs text-slate-600 mt-1">
                      <span>Código: {produto.codigo || '-'}</span>
                      <span>Custo: R$ {(produto.custo_medio || 0).toFixed(2)}</span>
                      {produto.setor_atividade_nome && (
                        <Badge variant="outline" className="text-xs">{produto.setor_atividade_nome}</Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    data-permission="Cadastros.TabelaPreco.editar"
                    onClick={() => handleAdicionarProdutoIndividual(produto)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            {produtosFiltrados.length === 0 && (
              <p className="text-center text-slate-500 py-4 text-sm">
                {searchProduto ? 'Nenhum produto encontrado' : 'Todos os produtos já foram adicionados'}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modo Lote */}
      {modoInclusao === 'lote' && (
        <Card>
          <CardHeader className="bg-purple-50 border-b pb-!3">
            <CardTitle className="text-base">🎯 V21.0: Filtros por Dupla Classificação</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <Alert className="border-indigo-200 bg-indigo-50">
              <AlertDescription className="text-xs text-indigo-900">
                💡 Combine Setor + Grupo + Marca para inclusão cirúrgica de produtos
              </AlertDescription>
            </Alert>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-xs">Setor de Atividade</Label>
                <Select value={filtroLote.setor_id} onValueChange={(v) => setFiltroLote({ ...filtroLote, setor_id: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos</SelectItem>
                    {setoresAtividade.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.icone} {s.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Grupo/Linha</Label>
                <Select value={filtroLote.grupo_id} onValueChange={(v) => setFiltroLote({ ...filtroLote, grupo_id: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos</SelectItem>
                    {gruposProduto.map(g => (
                      <SelectItem key={g.id} value={g.id}>{g.nome_grupo}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Marca</Label>
                <Select value={filtroLote.marca_id} onValueChange={(v) => setFiltroLote({ ...filtroLote, marca_id: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Todas" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todas</SelectItem>
                    {marcas.map(m => (
                      <SelectItem key={m.id} value={m.id}>{m.nome_marca}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">NCM (Início)</Label>
                <Input className="h-9" value={filtroLote.ncm}
                  onChange={(e) => setFiltroLote({ ...filtroLote, ncm: e.target.value })} placeholder="Ex: 7214" />
              </div>
              <div>
                <Label className="text-xs">Curva ABC</Label>
                <Select value={filtroLote.curva_abc} onValueChange={(v) => setFiltroLote({ ...filtroLote, curva_abc: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Tipo</Label>
                <Select value={filtroLote.eh_bitola} onValueChange={(v) => setFiltroLote({ ...filtroLote, eh_bitola: v })}>
                  <SelectTrigger className="h-9"><SelectValue placeholder="Todos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>Todos</SelectItem>
                    <SelectItem value="true">Bitolas</SelectItem>
                    <SelectItem value="false">Não-Bitolas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button type="button" data-permission="Cadastros.TabelaPreco.editar"
              onClick={handleAdicionarProdutosLote}
              className="w-full bg-purple-600 hover:bg-purple-700"
              disabled={produtosDisponiveis.length === 0}>
              <Package className="w-4 h-4 mr-2" />
              Adicionar {produtosDisponiveis.length} Produtos Filtrados
            </Button>
            <div className="grid grid-cols-3 gap-2 text-xs text-center">
              <div className="p-2 bg-indigo-50 rounded">
                <p className="font-semibold text-indigo-900">{produtosDisponiveis.length}</p>
                <p className="text-indigo-600">Disponíveis</p>
              </div>
              <div className="p-2 bg-green-50 rounded">
                <p className="font-semibold text-green-900">{itensTabela.length}</p>
                <p className="text-green-600">Na Tabela</p>
              </div>
              <div className="p-2 bg-slate-50 rounded">
                <p className="font-semibold text-slate-900">{produtos.length}</p>
                <p className="text-slate-600">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de itens da tabela */}
      {itensTabela.length > 0 && (
        <Card>
          <CardHeader className="bg-green-50 border-b pb-3">
            <CardTitle className="text-base">📦 Itens da Tabela ({itensTabela.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {itensTabela.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{item.produto_descricao}</p>
                    <div className="flex gap-3 mt-1 text-xs">
                      {item.setor_atividade_nome && (
                        <Badge className="bg-indigo-100 text-indigo-700 text-xs">
                          <Factory className="w-3 h-3 mr-1" />{item.setor_atividade_nome}
                        </Badge>
                      )}
                      {item.grupo_produto_nome && (
                        <Badge className="bg-cyan-100 text-cyan-700 text-xs">
                          <Boxes className="w-3 h-3 mr-1" />{item.grupo_produto_nome}
                        </Badge>
                      )}
                      {item.marca_nome && (
                        <Badge className="bg-orange-100 text-orange-700 text-xs">
                          <Award className="w-3 h-3 mr-1" />{item.marca_nome}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-4 mt-2 text-xs text-slate-600">
                      <span>Custo: <strong>R$ {(item.custo_base || 0).toFixed(2)}</strong></span>
                      <span>Preço: <strong className="text-green-700">R$ {(item.preco || 0).toFixed(2)}</strong></span>
                      <span>Margem: <strong>{(item.margem_percentual || 0).toFixed(1)}%</strong></span>
                      {item.markup_aplicado_ia && (
                        <Badge className="bg-purple-100 text-purple-700 text-xs">
                          <Sparkles className="w-3 h-3 mr-1" />Markup IA: {item.markup_aplicado_ia.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                    {item.sugestao_ia && (
                      <Badge className="mt-2 bg-orange-100 text-orange-700 text-xs">{item.sugestao_ia}</Badge>
                    )}
                  </div>
                  <Button type="button" size="sm" variant="ghost"
                    data-permission="Cadastros.TabelaPreco.editar"
                    onClick={() => handleRemoverItem(idx)}>
                    <X className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}