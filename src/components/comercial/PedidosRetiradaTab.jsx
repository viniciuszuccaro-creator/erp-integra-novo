import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, CheckCircle2, Search, Bell } from "lucide-react";
import usePedidosRetirada from "@/components/comercial/pedidos-retirada/usePedidosRetirada";
import RetiradaConfirmDialog from "@/components/comercial/pedidos-retirada/RetiradaConfirmDialog";

export default function PedidosRetiradaTab({ windowMode = false }) {
  const h = usePedidosRetirada();
  const containerClass = windowMode ? "w-full h-full overflow-auto p-6" : "space-y-6 w-full h-full";

  return (
    <div className={containerClass}>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-7 h-7 text-green-600" />
            Pedidos para Retirada
          </h2>
          <p className="text-slate-600 text-sm">Pedidos que o cliente irá buscar no local</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Total para Retirar</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-blue-600">{h.pedidosParaRetirada.length}</div></CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Prontos</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-green-600">{h.prontoParaRetirada}</div></CardContent>
        </Card>
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2"><CardTitle className="text-sm text-slate-600">Já Retirados</CardTitle></CardHeader>
          <CardContent><div className="text-3xl font-bold text-slate-600">{h.retirados}</div></CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input value={h.busca} onChange={(e) => h.setBusca(e.target.value)} placeholder="Buscar por pedido ou cliente..." className="pl-10" />
            </div>
            <Select value={h.statusFiltro} onValueChange={h.setStatusFiltro}>
              <SelectTrigger><SelectValue placeholder="Todos os status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="Aprovado">Aprovado</SelectItem>
                <SelectItem value="Pronto para Faturar">Pronto p/ Faturar</SelectItem>
                <SelectItem value="Faturado">Faturado</SelectItem>
                <SelectItem value="Pronto para Retirada">Pronto p/ Retirada</SelectItem>
                <SelectItem value="Entregue">Retirado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data Pedido</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {h.pedidosFiltrados.map((pedido) => (
                <TableRow key={pedido.id} className="hover:bg-slate-50">
                  <TableCell className="font-semibold">{pedido.numero_pedido}</TableCell>
                  <TableCell>{pedido.cliente_nome}</TableCell>
                  <TableCell className="font-bold">R$ {(pedido.valor_total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                  <TableCell className="text-sm">{new Date(pedido.data_pedido).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <Badge className={pedido.status === "Entregue" ? "bg-green-600" : pedido.status === "Pronto para Retirada" ? "bg-blue-600" : "bg-orange-600"}>
                      {pedido.status === "Entregue" ? "✅ Retirado" : pedido.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {pedido.status !== "Entregue" && (
                        <>
                          {pedido.status !== "Pronto para Retirada" && (
                            <Button
                              size="sm"
                              onClick={() => h.atualizarStatusMutation.mutate({ pedidoId: pedido.id, novoStatus: "Pronto para Retirada" })}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <Bell className="w-4 h-4 mr-1" /> Avisar Pronto
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => { h.setPedidoSelecionado(pedido); h.setDetalhesOpen(true); }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" /> Confirmar Retirada
                          </Button>
                        </>
                      )}
                      {pedido.status === "Entregue" && (
                        <Badge className="bg-green-100 text-green-700">✅ Retirado</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {h.pedidosFiltrados.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p>Nenhum pedido para retirada encontrado</p>
            </div>
          )}
        </CardContent>
      </Card>

      <RetiradaConfirmDialog
        detalhesOpen={h.detalhesOpen}
        setDetalhesOpen={h.setDetalhesOpen}
        pedidoSelecionado={h.pedidoSelecionado}
        nomeRecebedor={h.nomeRecebedor}
        setNomeRecebedor={h.setNomeRecebedor}
        docRecebedor={h.docRecebedor}
        setDocRecebedor={h.setDocRecebedor}
        observacoes={h.observacoes}
        setObservacoes={h.setObservacoes}
        handleConfirmarRetirada={h.handleConfirmarRetirada}
        confirmarRetiradaMutation={h.confirmarRetiradaMutation}
      />
    </div>
  );
}