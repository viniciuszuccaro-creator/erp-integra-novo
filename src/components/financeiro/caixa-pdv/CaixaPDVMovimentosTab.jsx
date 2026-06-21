import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CaixaPDVMovimentosTab({ movimentosHoje, somatoriaFormasPagamento, pedidos }) {
  return (
    <>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">📊 Somatória por Forma de Pagamento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(somatoriaFormasPagamento).map(([forma, valores]) => (
              <Card key={forma} className="border-2">
                <CardContent className="p-3">
                  <p className="font-semibold text-sm mb-2">{forma}</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">+R$ {valores.entradas.toFixed(2)}</span>
                    <span className="text-red-600">-R$ {valores.saidas.toFixed(2)}</span>
                  </div>
                  <p className={`font-bold mt-1 ${valores.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    Total: R$ {valores.total.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hora</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {movimentosHoje.map(m => {
                const pedidoVinculado = pedidos.find(p => p.id === m.pedido_id);
                return (
                  <TableRow key={m.id}>
                    <TableCell>{new Date(m.data_movimento).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                    <TableCell>
                      <Badge className={m.tipo_movimento === 'Entrada' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>{m.tipo_movimento}</Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{m.descricao || ''}</p>
                        {pedidoVinculado && (
                          <div className="text-xs text-slate-600 mt-1 space-y-0.5">
                            <p>📋 Pedido: <strong>{pedidoVinculado.numero_pedido}</strong></p>
                            <p>👤 Cliente: <strong>{pedidoVinculado.cliente_nome}</strong></p>
                            <p>💳 Pagto: <strong>{m.forma_pagamento}</strong></p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={`text-right font-bold ${m.tipo_movimento === 'Entrada' ? 'text-green-600' : 'text-red-600'}`}>
                      {m.tipo_movimento === 'Entrada' ? '+' : '-'}R$ {(m.valor || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}