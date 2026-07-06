import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download } from "lucide-react";

export default function ImportadorErrosPanel({ checando, validationErrors, downloadErrosCSV }) {
  if (!checando && !validationErrors.length) return null;

  return (
    <Card className="border-red-200 mt-4">
      <CardHeader className="bg-red-50 border-b">
        <CardTitle className="text-sm flex items-center justify-between w-full">
          <span>{checando ? 'Validando produtos…' : `Erros de validação (${validationErrors.length})`}</span>
          {!checando && validationErrors.length > 0 && (
            <Button data-permission="Estoque.ImportadorErros.baixar" variant="outline" size="sm" onClick={downloadErrosCSV} className="gap-2">
              <Download className="w-4 h-4" /> Baixar CSV
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      {!checando && validationErrors.length > 0 && (
        <CardContent className="p-3">
          <div className="max-h-56 overflow-auto border rounded">
            <Table>
              <TableHeader>
                <TableRow className="bg-white">
                  <TableHead>Empresa</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Motivo</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {validationErrors.map((e, i) => (
                  <TableRow key={i}>
                    <TableCell>{e.empresa_id}</TableCell>
                    <TableCell>{e.codigo}</TableCell>
                    <TableCell>{e.motivo}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      )}
    </Card>
  );
}