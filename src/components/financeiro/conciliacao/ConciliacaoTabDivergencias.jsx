import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function ConciliacaoTabDivergencias({ divergencias, onResolver, podeEditar }) {
  return (
    <Card className="border-0 shadow-sm h-full flex flex-col">
      <CardContent className="p-0 flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-slate-50 z-10">
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Diferença</TableHead>
              <TableHead>Tipo Divergência</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {divergencias.map(conc => (
              <TableRow key={conc.id}>
                <TableCell className="text-sm">
                  {new Date(conc.data_conciliacao || Date.now()).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="font-medium">{conc.descricao || 'N/A'}</TableCell>
                <TableCell className="text-red-600 font-bold">
                  R$ {Math.abs(conc.valor_diferenca || 0).toFixed(2)}
                </TableCell>
                <TableCell>
                  <Badge className="bg-orange-100 text-orange-700">
                    <AlertCircle className="w-3 h-3 mr-1" />{conc.tipo_divergencia || 'Não identificado'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onResolver(conc.id)}
                    disabled={!podeEditar}
                  >
                    Resolver
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {divergencias.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-green-500" />
                  <p>Nenhuma divergência encontrada</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}