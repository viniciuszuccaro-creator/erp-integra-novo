import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Clock, TrendingDown, ShieldCheck, Zap, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useWindow } from "@/components/lib/useWindow";
import AnalisePedidoAprovacao from "../AnalisePedidoAprovacao";

export default function AprovacoesTable({ pendentes, historico, permitido, onAprovar, onNegar }) {
  const { toast } = useToast();
  const { openWindow } = useWindow();

  const abrirAnalise = (pedido, comFechamento) => {
    openWindow(
      AnalisePedidoAprovacao,
      {
        pedido,
        onAprovar: (dados) => onAprovar({ pedidoId: pedido.id, dados, executarFechamento: comFechamento }),
        onNegar: (comentarios) => {
          if (!comentarios.trim()) {
            toast({ title: "⚠️ Informe o motivo da negação", variant: "destructive" });
            return;
          }
          onNegar({ pedidoId: pedido.id, comentarios });
        },
        windowMode: true
      },
      { title: `🔐 Análise: ${pedido.numero_pedido}`, width: 1400, height: 800 }
    );
  };

  return (
    <>
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-orange-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            Pedidos Pendentes de Aprovação de Desconto
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor Total</TableHead>
                <TableHead>Desconto Solicitado</TableHead>
                <TableHead>Margem Após Desconto</TableHead>
                <TableHead>Vendedor</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendentes.map(pedido => {
                const margem = pedido.margem_aplicada_vendedor || 0;
                const corMargem = margem < 5 ? "text-red-600" : margem < 10 ? "text-yellow-600" : "text-green-600";
                return (
                  <TableRow key={pedido.id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold">{pedido.numero_pedido}</TableCell>
                    <TableCell>{pedido.cliente_nome}</TableCell>
                    <TableCell className="font-bold">
                      R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-orange-100 text-orange-700">
                        <TrendingDown className="w-3 h-3 mr-1" />
                        {pedido.desconto_solicitado_percentual || 0}%
                      </Badge>
                    </TableCell>
                    <TableCell><span className={`font-bold ${corMargem}`}>{margem.toFixed(2)}%</span></TableCell>
                    <TableCell className="text-sm text-slate-600">{pedido.vendedor || '-'}</TableCell>
                    <TableCell className="text-sm">{new Date(pedido.created_date).toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => abrirAnalise(pedido, false)}
                          className="bg-orange-600 hover:bg-orange-700"
                          disabled={!permitido}
                        >
                          <ShieldCheck className="w-4 h-4 mr-1" /> Analisar
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => abrirAnalise(pedido, true)}
                          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                          disabled={!permitido}
                          title="Aprovar e Fechar Pedido Automaticamente"
                        >
                          <Zap className="w-4 h-4 mr-1" /> Aprovar + Fechar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {pendentes.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum pedido pendente de aprovação de desconto</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md mt-6">
        <CardHeader className="bg-slate-50 border-b">
          <CardTitle>Histórico de Aprovações de Desconto</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Aprovador</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historico.slice(0, 20).map(pedido => (
                <TableRow key={pedido.id} className="hover:bg-slate-50">
                  <TableCell className="font-semibold">{pedido.numero_pedido}</TableCell>
                  <TableCell>{pedido.cliente_nome}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {pedido.desconto_aprovado_percentual || pedido.desconto_solicitado_percentual || 0}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {pedido.status_aprovacao === "aprovado" ? (
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Aprovado
                      </Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-700">
                        <XCircle className="w-3 h-3 mr-1" /> Negado
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">{pedido.usuario_aprovador_id || '-'}</TableCell>
                  <TableCell className="text-sm">
                    {pedido.data_aprovacao ? new Date(pedido.data_aprovacao).toLocaleString('pt-BR') : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {historico.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <ShieldCheck className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhuma aprovação registrada</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}