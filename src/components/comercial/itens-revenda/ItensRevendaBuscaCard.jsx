import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Search, Copy, Calculator, Sparkles } from "lucide-react";
import { PreviewConversao } from "@/components/lib/CalculadoraUnidades";

/**
 * Card de busca e seleção de produto de revenda
 * Extraído de ItensRevendaTab.jsx
 */
export default function ItensRevendaBuscaCard({
  search, setSearch, produtosFiltrados, selecionarProduto,
  copiarUltimoPedido, formData, produtoSelecionado,
  quantidade, setQuantidade, unidadeVenda, setUnidadeVenda,
  descontoItem, setDescontoItem, opcoesUnidade,
  adicionarItem, sugerirQuantidadeIA
}) {
  return (
    <Card className="border-2 border-blue-300 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Plus className="w-5 h-5" />Adicionar Produto de Revenda
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Buscar produto por código ou nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Button onClick={copiarUltimoPedido} data-permission="Comercial.Pedido.criar" variant="outline" disabled={!formData?.cliente_id}>
            <Copy className="w-4 h-4 mr-2" />Copiar Último Pedido
          </Button>
        </div>

        {search && produtosFiltrados.length > 0 && (
          <div className="max-h-48 overflow-y-auto border rounded-lg bg-white">
            {produtosFiltrados.slice(0, 10).map((produto) => (
              <div key={produto.id} onClick={() => selecionarProduto(produto)} className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-sm">{produto.descricao}</p>
                    <p className="text-xs text-slate-600">SKU: {produto.codigo} • Estoque: {produto.estoque_disponivel || 0} KG</p>
                    {produto.eh_bitola && <Badge className="mt-1 text-xs bg-purple-100 text-purple-700">Bitola {produto.bitola_diametro_mm}mm</Badge>}
                  </div>
                  <p className="text-sm font-bold text-green-600">R$ {produto.preco_venda?.toFixed(2) || '0.00'}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {produtoSelecionado && (
          <div className="bg-white border-2 border-blue-600 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold">{produtoSelecionado.descricao}</p>
              <Button onClick={sugerirQuantidadeIA} data-permission="Comercial.Pedido.editar" size="sm" variant="outline" className="border-purple-300 text-purple-600" disabled={!formData?.cliente_id}>
                <Sparkles className="w-3 h-3 mr-1" />IA Sugestão
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              <div>
                <Label className="text-xs">Quantidade</Label>
                <Input type="number" min="0.01" step="0.01" value={quantidade} onChange={(e) => setQuantidade(parseFloat(e.target.value) || 0.01)} />
              </div>
              <div>
                <Label className="text-xs flex items-center gap-1"><Calculator className="w-3 h-3" />Vender Por</Label>
                <Select value={unidadeVenda} onValueChange={setUnidadeVenda}>
                  <SelectTrigger><SelectValue placeholder="Selecione a unidade" /></SelectTrigger>
                  <SelectContent className="z-[99999]">
                    {opcoesUnidade.map(un => (
                      <SelectItem key={un} value={un}>
                        {un === 'PÇ' ? 'Peça' : un === 'MT' ? 'Metro' : un === 'KG' ? 'Quilograma' : un === 'TON' ? 'Tonelada' : un}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Desconto (%)</Label>
                <Input type="number" min="0" max="100" step="0.1" value={descontoItem} onChange={(e) => setDescontoItem(parseFloat(e.target.value) || 0)} />
              </div>
              <div>
                <Label className="text-xs">Valor Total</Label>
                <Input value={`R$ ${((produtoSelecionado.preco_venda * quantidade) * (1 - descontoItem / 100)).toFixed(2)}`} disabled className="font-bold text-green-600" />
              </div>
            </div>
            <PreviewConversao quantidade={quantidade} unidadeOrigem={unidadeVenda} produto={produtoSelecionado} />
            <Button onClick={adicionarItem} data-permission="Comercial.Pedido.editar" className="w-full mt-3 bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />Adicionar ao Pedido
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}