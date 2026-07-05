import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

/**
 * Tabela de itens para conferência (extraído de SeparacaoConferencia)
 */
export default function SeparacaoItensTable({ itens, onAtualizarItem }) {
  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base">Itens para Separação</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Item</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-center">Qtd Pedida</TableHead>
              <TableHead className="text-center">Qtd Separada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Obs</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {itens.map((item, idx) => (
              <TableRow key={item.id || idx} className={item.divergencia ? 'bg-red-50' : ''}>
                <TableCell>
                  <p className="font-medium">{item.descricao}</p>
                  <p className="text-xs text-slate-500">
                    {item.codigo_sku && `SKU: ${item.codigo_sku}`}
                    {item.elemento && `Elemento: ${item.elemento}`}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={item.tipo_item === "revenda" ? "border-blue-500 text-blue-700" : "border-purple-500 text-purple-700"}>
                    {item.tipo_item === "revenda" ? "Revenda" : (item.tipo_item === "producao" ? "Produção" : "N/A")}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-semibold">{item.quantidade_pedida} {item.unidade}</TableCell>
                <TableCell>
                  <Input type="number" value={item.quantidade_separada}
                    onChange={(e) => onAtualizarItem(idx, "quantidade_separada", parseFloat(e.target.value) || 0)}
                    className="text-center font-semibold h-10" data-permission="Expedicao.Separacao.conferir" />
                </TableCell>
                <TableCell>
                  {item.divergencia ? (
                    <Badge className="bg-red-100 text-red-700">Divergente</Badge>
                  ) : item.quantidade_separada > 0 && item.quantidade_separada === item.quantidade_pedida ? (
                    <Badge className="bg-green-100 text-green-700">OK</Badge>
                  ) : (
                    <Badge variant="outline">Aguardando</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Input type="text" value={item.observacao_item || ""}
                    onChange={(e) => onAtualizarItem(idx, "observacao_item", e.target.value)}
                    placeholder="Obs..." className="text-sm h-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}