import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, CheckCircle2, XCircle, Download, Upload, ExternalLink } from "lucide-react";
import { useConfirm } from "@/components/ui/confirm-dialog";
import useContextoVisual from "@/components/lib/useContextoVisual";

export default function ValidarPedidosExternos({ windowMode = true }) {
  const queryClient = useQueryClient();
  const { createInContext } = useContextoVisual();
  const { confirm, ConfirmDialog } = useConfirm();

  const { data: externos = [], isFetching, refetch } = useQuery({
    queryKey: ["pedidos-externos"],
    queryFn: async () => {
      // Buscar pendentes primeiro; se não houver, traz os mais recentes
      const pendentes = await base44.entities.PedidoExterno?.filter?.({ status_importacao: "A Validar" }, "-created_date", 50);
      if (pendentes && pendentes.length > 0) return pendentes;
      return (await base44.entities.PedidoExterno?.list?.("-created_date", 50)) || [];
    },
    initialData: [],
    refetchOnWindowFocus: false,
  });

  const marcarValidado = useMutation({
    mutationFn: async (ext) => {
      return base44.entities.PedidoExterno.update(ext.id, { status_importacao: "Validado" });
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos-externos"] }),
      ]);
    },
  });

  const excluirExterno = useMutation({
    mutationFn: async (ext) => base44.entities.PedidoExterno.delete(ext.id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["pedidos-externos"] });
    },
  });

  const importarComoPedido = useMutation({
    mutationFn: async (ext) => {
      // Map mínimo para Pedido
      const numero = ext.numero_pedido_externo || `EXT-${(ext.id || "").toString().slice(-6) || Date.now()}`;
      const cliente_nome = ext.cliente_nome || "Cliente Externo";
      const data_pedido = (ext.data_pedido || new Date().toISOString()).split("T")[0];

      const valor_total = (() => {
        if (typeof ext.valor_total === "number") return ext.valor_total;
        if (Array.isArray(ext.itens)) {
          return ext.itens.reduce((s, i) => {
            const v = typeof i?.valor_total === "number"
              ? i.valor_total
              : (Number(i?.preco_unitario) || 0) * (Number(i?.quantidade) || 0);
            return s + v;
          }, 0);
        }
        return 0;
      })();

      const payload = {
        numero_pedido: numero,
        tipo: "Pedido",
        origem_pedido: ext.origem || ext.canal || "API",
        cliente_nome,
        cliente_id: ext.cliente_id || undefined,
        data_pedido,
        valor_total,
        status: "Rascunho",
      };

      const created = await createInContext("Pedido", payload, "empresa_id");
      await base44.entities.PedidoExterno.update(ext.id, { status_importacao: "Importado", pedido_id: created.id });
      return created;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["pedidos-externos"] }),
        queryClient.invalidateQueries({ queryKey: ["pedidos"] }),
      ]);
    },
  });

  return (
    <div className={windowMode ? "w-full h-full flex flex-col" : "space-y-4"}>
      <Card className="border-2 border-indigo-300 bg-indigo-50/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Validar Pedidos Externos</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-2">
          <div className="text-sm text-slate-600">
            {externos.filter(e => e.status_importacao === "A Validar").length} pendente(s) para validar
          </div>
          <div className="flex items-center gap-2">
            <Button data-permission="Comercial.ValidarPedidosExternos.atualizar" variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className={windowMode ? "flex-1 overflow-hidden" : ""}>
        <CardContent className={`p-0 ${windowMode ? 'h-full overflow-auto' : ''}`}>
          {externos.length === 0 ? (
            <div className="p-8">
              <Alert>
                <AlertDescription>Nenhum pedido externo encontrado.</AlertDescription>
              </Alert>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Status</TableHead>
                    <TableHead>Nº Externo</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Canal</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead className="min-w-[320px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {externos.map((ext) => (
                    <TableRow key={ext.id} className="hover:bg-slate-50">
                      <TableCell>
                        <Badge className={
                          ext.status_importacao === 'A Validar' ? 'bg-orange-100 text-orange-700' :
                          ext.status_importacao === 'Importado' ? 'bg-green-100 text-green-700' :
                          'bg-slate-100 text-slate-700'
                        }>
                          {ext.status_importacao || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold">{ext.numero_pedido_externo || ext.id}</TableCell>
                      <TableCell>{ext.cliente_nome || '-'}</TableCell>
                      <TableCell>{ext.canal || ext.origem || '-'}</TableCell>
                      <TableCell>{ext.data_pedido ? new Date(ext.data_pedido).toLocaleDateString('pt-BR') : '-'}</TableCell>
                      <TableCell className="font-bold text-green-600">R$ {(ext.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button data-permission="Comercial.ValidarPedidosExternos.importar"
                            size="sm"
                            variant="ghost"
                            onClick={() => importarComoPedido.mutate(ext)}
                            disabled={importarComoPedido.isPending}
                            className="h-8 px-2 bg-green-50 text-green-700 border border-green-200"
                            title="Importar como Pedido"
                          >
                            <Upload className="w-4 h-4 mr-1" />
                            <span className="text-xs">Importar</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => marcarValidado.mutate(ext)}
                            disabled={marcarValidado.isPending}
                            className="h-8 px-2 text-blue-700"
                            title="Marcar como Validado"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            <span className="text-xs">Validar</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            data-permission="Comercial.PedidoExterno.excluir"
                            onClick={async () => {
                              const ok = await confirm({ title: "Excluir Pedido Externo", description: "Deseja realmente excluir este pedido externo?", variant: "danger", confirmText: "Excluir" });
                              if (ok) excluirExterno.mutate(ext);
                            }}
                            className="h-8 px-2 text-red-600"
                            title="Excluir Registro Externo"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            <span className="text-xs">Excluir</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        </Card>
        <ConfirmDialog />
        </div>
        );
        }