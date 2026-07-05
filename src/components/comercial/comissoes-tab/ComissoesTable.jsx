import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, FileText, CheckCircle2, XCircle, DollarSign, Printer } from "lucide-react";
import { ImprimirComissao } from "@/components/lib/ImprimirComissao";
import { useWindow } from "@/components/lib/useWindow";
import DetalhesComissao from "../DetalhesComissao";

const statusColors = {
  'Pendente': 'bg-yellow-100 text-yellow-700',
  'Aprovada': 'bg-green-100 text-green-700',
  'Paga': 'bg-blue-100 text-blue-700',
  'Cancelada': 'bg-red-100 text-red-700'
};

/**
 * Tabela de comissões + ações (extraído de ComissoesTab)
 */
export default function ComissoesTable({ comissoes, onAprovar, onRecusar, onPagar, empresas, pedidos }) {
  const { openWindow } = useWindow();

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Vendedor</TableHead>
                <TableHead>Período/Pedido</TableHead>
                <TableHead>Data Venda</TableHead>
                <TableHead>Valor Venda</TableHead>
                <TableHead>%</TableHead>
                <TableHead>Comissão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comissoes.map((comissao) => (
                <TableRow key={comissao.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2"><User className="w-4 h-4 text-slate-400" />{comissao.vendedor}</div>
                  </TableCell>
                  <TableCell className="text-sm">{comissao.numero_pedido}</TableCell>
                  <TableCell>{new Date(comissao.data_venda).toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell className="font-semibold">R$ {comissao.valor_venda?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell><Badge variant="outline">{comissao.percentual_comissao}%</Badge></TableCell>
                  <TableCell className="font-bold text-green-600">R$ {comissao.valor_comissao?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell><Badge className={statusColors[comissao.status]}>{comissao.status}</Badge></TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" data-permission="Comercial.Comissao.imprimir"
                        onClick={() => { const empresa = empresas?.find(e => e.id === comissao.empresa_id); ImprimirComissao({ comissao, empresa, pedidos }); }}
                        title="Imprimir Comissão" className="text-slate-600">
                        <Printer className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-permission="Comercial.Comissao.visualizar"
                        onClick={() => openWindow(DetalhesComissao, { comissao, windowMode: true }, { title: `💰 ${comissao.vendedor} - ${comissao.numero_pedido}`, width: 800, height: 600 })}
                        title="Ver detalhes">
                        <FileText className="w-4 h-4" />
                      </Button>
                      {comissao.status === 'Pendente' && (
                        <>
                          <Button variant="ghost" size="icon" data-permission="Comercial.Comissao.aprovar"
                            onClick={() => onAprovar(comissao)} title="Aprovar" className="text-green-600 hover:text-green-700">
                            <CheckCircle2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" data-permission="Comercial.Comissao.aprovar"
                            onClick={() => onRecusar(comissao)} title="Recusar" className="text-red-600 hover:text-red-700">
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {comissao.status === 'Aprovada' && (
                        <Button variant="ghost" size="icon" data-permission="Comercial.Comissao.pagar"
                          onClick={() => onPagar(comissao)} title="Gerar Pagamento" className="text-blue-600 hover:text-blue-700">
                          <DollarSign className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {comissoes.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <DollarSign className="w-16 h-16 mx-auto mb-4 opacity-30" />
            <p>Nenhuma comissão encontrada</p>
            <p className="text-sm mt-2">Use "Calcular Comissões" para gerar automaticamente</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}