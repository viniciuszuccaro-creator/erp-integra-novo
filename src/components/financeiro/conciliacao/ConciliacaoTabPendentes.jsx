import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";

export default function ConciliacaoTabPendentes({ extratosPendentes, onConciliar, podeEditar }) {
  return (
    <Card className="border-0 shadow-sm h-full flex flex-col">
      <CardContent className="p-0 flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-slate-50 z-10">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {extratosPendentes.map(extrato => (
              <TableRow key={extrato.id}>
                <TableCell className="text-sm">
                  {new Date(extrato.data_movimento || Date.now()).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="font-medium">{extrato.descricao || 'Sem descrição'}</TableCell>
                <TableCell className={extrato.tipo === 'entrada' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {extrato.tipo === 'entrada' ? '+' : '-'} R$ {Math.abs(extrato.valor || 0).toFixed(2)}
                </TableCell>
                <TableCell><Badge variant="outline">{extrato.tipo || 'N/A'}</Badge></TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onConciliar(extrato)}
                    disabled={!podeEditar}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-1" />Conciliar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {extratosPendentes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>Nenhum extrato pendente</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}