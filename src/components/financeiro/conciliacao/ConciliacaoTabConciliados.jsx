import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function ConciliacaoTabConciliados({ extratosConciliados }) {
  return (
    <Card className="border-0 shadow-sm h-full flex flex-col">
      <CardContent className="p-0 flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-slate-50 z-10">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {extratosConciliados.map(extrato => (
              <TableRow key={extrato.id}>
                <TableCell className="text-sm">
                  {new Date(extrato.data_movimento || Date.now()).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="font-medium">{extrato.descricao || 'Sem descrição'}</TableCell>
                <TableCell className="font-semibold">R$ {Math.abs(extrato.valor || 0).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="w-3 h-3 mr-1" />Conciliado
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {extratosConciliados.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                  Nenhum extrato conciliado ainda
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}