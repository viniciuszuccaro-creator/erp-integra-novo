import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Package } from "lucide-react";

export default function TabHistoricoCompras({ ordensCompra, notasFiscais, totalCompras }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-600">Ordens de Compras</p>
            <p className="text-2xl font-bold text-cyan-600">{ordensCompra.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-600">Total Comprado</p>
            <p className="text-2xl font-bold text-green-600">R$ {totalCompras.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-600">NF-e Entrada</p>
            <p className="text-2xl font-bold text-indigo-600">{notasFiscais.length}</p>
          </CardContent>
        </Card>
      </div>

      {ordensCompra.length > 0 ? (
        <div>
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Package className="w-5 h-5 text-cyan-600" />
            Ordens de Compra Recentes
          </h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº OC</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Produto Principal</TableHead>
                <TableHead>Centro de Custo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordensCompra.slice(0, 10).map(ordem => (
                <TableRow key={ordem.id}>
                  <TableCell className="font-medium">{ordem.numero_oc}</TableCell>
                  <TableCell>{new Date(ordem.data_solicitacao).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>R$ {ordem.valor_total?.toLocaleString('pt-BR')}</TableCell>
                  <TableCell><Badge>{ordem.status}</Badge></TableCell>
                  <TableCell>{ordem.itens?.[0]?.descricao || '-'}</TableCell>
                  <TableCell>{ordem.centro_custo || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 text-slate-500">
          <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <p>Nenhuma ordem de compra realizada</p>
        </div>
      )}
    </div>
  );
}