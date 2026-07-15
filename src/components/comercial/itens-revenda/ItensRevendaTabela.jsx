import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, Package, ChevronRight } from "lucide-react";

/**
 * Tabela de itens de revenda adicionados ao pedido + navegação
 * Extraído de ItensRevendaTab.jsx
 */
export default function ItensRevendaTabela({ itensRevenda, removerItem, onNext }) {
  return (
    <>
      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle className="text-base">Itens Adicionados ({itensRevenda?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {itensRevenda && itensRevenda.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>SKU</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Qtd Vendida</TableHead>
                  <TableHead>Unidade</TableHead>
                  <TableHead>Equiv. (KG)</TableHead>
                  <TableHead>Preço Unit</TableHead>
                  <TableHead>Desc %</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Margem</TableHead>
                  <TableHead className="text-center">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itensRevenda.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs">{item.codigo_sku}</TableCell>
                    <TableCell>{item.descricao}</TableCell>
                    <TableCell>{item.quantidade}</TableCell>
                    <TableCell><Badge variant="outline">{item.unidade_medida}</Badge></TableCell>
                    <TableCell className="font-semibold text-purple-600">{item.quantidade_kg?.toFixed(2) || '0.00'} KG</TableCell>
                    <TableCell>R$ {item.preco_unitario?.toFixed(2)}</TableCell>
                    <TableCell>
                      {item.desconto_item_percentual > 0 && (
                        <Badge className="bg-orange-100 text-orange-700">{item.desconto_item_percentual.toFixed(1)}%</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">R$ {item.valor_item?.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge className={
                        item.margem_percentual >= 20 ? 'bg-green-100 text-green-700' :
                        item.margem_percentual >= 10 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }>{item.margem_percentual?.toFixed(1)}%</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" onClick={() => removerItem(index)} className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum item de revenda adicionado</p>
              <p className="text-sm mt-1">Use a busca acima para adicionar produtos</p>
            </div>
          )}
        </CardContent>
      </Card>

      {itensRevenda && itensRevenda.length > 0 && (
        <div className="flex justify-end">
          <Button onClick={onNext} className="bg-blue-600">
            Próximo: Armado Padrão<ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      )}
    </>
  );
}