import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Package } from "lucide-react";
import Top10ProdutosCliente from "./Top10ProdutosCliente";
import useAdicionarItemRevenda from "./adicionar-item-revenda/useAdicionarItemRevenda";
import ProdutoInfoCard from "./adicionar-item-revenda/ProdutoInfoCard";
import CalculoItemCard from "./adicionar-item-revenda/CalculoItemCard";

export default function AdicionarItemRevendaModal({
  isOpen,
  onClose,
  onAddItem,
  cliente,
  tabelaPreco,
  tabelaPrecoItens = [],
  margemMinimaSistema = 10,
  windowMode = false,
}) {
  const h = useAdicionarItemRevenda({
    cliente,
    tabelaPreco,
    tabelaPrecoItens,
    margemMinimaSistema,
  });

  const content = (
    <div className={`space-y-6 ${windowMode ? "p-6 h-full overflow-auto" : ""}`}>
      {cliente && h.mostrarSugestoes && !h.produtoSelecionado && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-blue-900">💡 Produtos Mais Comprados</h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => h.setMostrarSugestoes(false)}
                className="text-xs"
              >
                Ocultar
              </Button>
            </div>
            <Top10ProdutosCliente
              clienteId={cliente.id}
              onSelecionarProduto={h.handleSelecionarProduto}
            />
          </CardContent>
        </Card>
      )}

      <div>
        <Label>Buscar Produto *</Label>
        <Input
          placeholder="Digite código, descrição ou código de barras..."
          value={h.searchTerm}
          onChange={(e) => {
            h.setSearchTerm(e.target.value);
            h.setMostrarSugestoes(false);
          }}
          className="mb-3"
        />
        {h.searchTerm && (
          <div className="max-h-48 overflow-y-auto border rounded-lg">
            {h.produtosFiltrados.slice(0, 10).map((produto) => (
              <button
                key={produto.id}
                onClick={() => h.handleSelecionarProduto(produto)}
                className={`w-full p-3 text-left hover:bg-blue-50 transition-colors border-b ${
                  h.produtoSelecionado?.id === produto.id
                    ? "bg-blue-50 border-l-4 border-l-blue-600"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{produto.descricao}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <Badge variant="outline" className="text-xs">{produto.codigo}</Badge>
                      <span className="text-xs text-slate-600">{produto.unidade_medida}</span>
                      <span className="text-xs text-slate-600">
                        Estoque: {produto.estoque_disponivel || produto.estoque_atual || 0}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      R$ {(produto.preco_venda || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {h.produtoSelecionado && (
        <>
          <ProdutoInfoCard
            produto={h.produtoSelecionado}
            quantidade={h.quantidade}
            margemMinimaSistema={margemMinimaSistema}
          />

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Quantidade *</Label>
              <Input
                type="number"
                min="0.01"
                step="0.01"
                value={h.quantidade}
                onChange={(e) => h.setQuantidade(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label>Desconto (%) - Adicional</Label>
              <Input
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={h.descontoPercentual}
                onChange={(e) => {
                  h.setDescontoPercentual(parseFloat(e.target.value) || 0);
                  h.setDescontoValor(0);
                }}
              />
            </div>
            <div>
              <Label>Desconto (R$) - Adicional</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={h.descontoValor}
                onChange={(e) => {
                  h.setDescontoValor(parseFloat(e.target.value) || 0);
                  h.setDescontoPercentual(0);
                }}
              />
            </div>
          </div>

          <CalculoItemCard
            calculo={h.calculo}
            quantidade={h.quantidade}
            produtoSelecionado={h.produtoSelecionado}
            cliente={cliente}
            descontoPercentual={h.descontoPercentual}
            descontoValor={h.descontoValor}
            tabelaPreco={tabelaPreco}
          />

          {h.calculo?.margem_violada && (
            <div>
              <Label className="text-red-600">Justificativa do Desconto *</Label>
              <Textarea
                value={h.justificativaDesconto}
                onChange={(e) => h.setJustificativaDesconto(e.target.value)}
                placeholder="Explique o motivo do desconto acima do permitido..."
                className="border-red-300"
                rows={3}
              />
            </div>
          )}

          <div>
            <Label>Observações do Item</Label>
            <Textarea
              value={h.observacoes}
              onChange={(e) => h.setObservacoes(e.target.value)}
              placeholder="Observações adicionais..."
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t sticky bottom-0 bg-white">
            {!windowMode && (
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  h.resetForm();
                  onClose();
                }}
              >
                Cancelar
              </Button>
            )}
            <Button
              type="button"
              onClick={() => h.handleAdicionarItem(onAddItem, onClose)}
              disabled={
                !h.produtoSelecionado ||
                h.quantidade <= 0 ||
                (h.calculo?.margem_violada && !h.justificativaDesconto.trim())
              }
              className={
                h.calculo?.margem_violada
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }
              data-permission="Comercial.ItemRevenda.adicionar"
            >
              {h.calculo?.margem_violada
                ? "Adicionar (Aguardando Aprovação)"
                : "Adicionar Item"}
            </Button>
          </div>
        </>
      )}
    </div>
  );

  if (windowMode) {
    return <div className="w-full h-full bg-white">{content}</div>;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          h.resetForm();
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Adicionar Item de Revenda
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}