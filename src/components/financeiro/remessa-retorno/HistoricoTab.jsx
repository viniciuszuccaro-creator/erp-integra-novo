import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Download } from "lucide-react";

export default function HistoricoTab({ arquivos }) {
  return (
    <Card>
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle>Histórico de Arquivos CNAB</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Tipo</TableHead>
              <TableHead>Banco</TableHead>
              <TableHead>Nº Arquivo</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Qtd Títulos</TableHead>
              <TableHead>Valor Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {arquivos.map(arquivo => (
              <TableRow key={arquivo.id}>
                <TableCell>
                  <Badge className={arquivo.tipo_arquivo === 'Remessa' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}>
                    {arquivo.tipo_arquivo}
                  </Badge>
                </TableCell>
                <TableCell>{arquivo.banco_nome}</TableCell>
                <TableCell>{arquivo.numero_arquivo}</TableCell>
                <TableCell className="text-sm">{new Date(arquivo.data_geracao).toLocaleDateString('pt-BR')}</TableCell>
                <TableCell>{arquivo.quantidade_titulos}</TableCell>
                <TableCell className="font-bold">R$ {(arquivo.valor_total || 0).toFixed(2)}</TableCell>
                <TableCell><Badge variant="outline">{arquivo.status}</Badge></TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    data-permission="Financeiro.Remessa.baixar"
                    data-action="Financeiro.Remessa.baixar"
                    onClick={() => {
                      const blob = new Blob([arquivo.conteudo_arquivo], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = arquivo.arquivo_nome;
                      a.click();
                    }}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Baixar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {arquivos.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nenhum arquivo processado ainda</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}