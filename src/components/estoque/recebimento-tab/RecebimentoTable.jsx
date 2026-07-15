import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Eye, PackageCheck } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function RecebimentoTable({ recebimentos, searchTerm, setSearchTerm, filteredRecebimentos, statusColors, setViewingRecebimento }) {
  return (
    <>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <Input
          placeholder="Buscar por nº recebimento, fornecedor, NF, responsável, produto, status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Card className="border-0 shadow-md w-full">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Nº Recebimento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Fornecedor</TableHead>
                <TableHead>NF</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecebimentos.map((rec) => (
                <TableRow key={rec.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium font-mono text-sm">{rec.numero_recebimento}</TableCell>
                  <TableCell>{new Date(rec.data_recebimento).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>{rec.fornecedor}</TableCell>
                  <TableCell className="font-mono text-sm">{rec.numero_nf || "-"}</TableCell>
                  <TableCell>{rec.itens?.length || 0}</TableCell>
                  <TableCell>{rec.responsavel_recebimento || "-"}</TableCell>
                  <TableCell><Badge className={statusColors[rec.status] || "bg-slate-100"}>{rec.status}</Badge></TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => setViewingRecebimento(rec)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {filteredRecebimentos.length === 0 && (
          <div className="text-center py-12">
            <PackageCheck className="w-16 h-16 mx-auto mb-4 opacity-30 text-slate-400" />
            <p className="text-slate-500">Nenhum recebimento registrado</p>
          </div>
        )}
      </Card>
    </>
  );
}