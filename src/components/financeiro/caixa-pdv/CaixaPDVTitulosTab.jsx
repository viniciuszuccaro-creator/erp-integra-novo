import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CaixaPDVTitulosTab({ tipo, titulos, liquidarTitulo, contextoValido, podeLiquidarTitulos }) {
  const isTipoReceber = tipo === 'receber';
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isTipoReceber ? 'Cliente' : 'Fornecedor'}</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {titulos.map(c => (
              <TableRow key={c.id}>
                <TableCell>{isTipoReceber ? c.cliente : c.fornecedor}</TableCell>
                <TableCell>{c.descricao}</TableCell>
                <TableCell className={`font-bold ${isTipoReceber ? 'text-green-600' : 'text-red-600'}`}>R$ {(c.valor || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button size="sm" className={isTipoReceber ? "bg-green-600" : "bg-red-600"} disabled={!contextoValido || !podeLiquidarTitulos || liquidarTitulo.isPending} onClick={() => liquidarTitulo.mutate({ titulo: c, tipo, forma: 'Dinheiro' })}>💵</Button>
                    <Button size="sm" className={isTipoReceber ? "bg-green-600" : "bg-red-600"} disabled={!contextoValido || !podeLiquidarTitulos || liquidarTitulo.isPending} onClick={() => liquidarTitulo.mutate({ titulo: c, tipo, forma: 'PIX' })}>PIX</Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}