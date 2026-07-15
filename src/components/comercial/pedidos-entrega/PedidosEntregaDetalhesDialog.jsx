import React from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, Package, Truck, Camera, AlertTriangle, MessageCircle, Image } from "lucide-react";
import { toast } from "sonner";
import TimelineEntregaVisual from "@/components/logistica/TimelineEntregaVisual";
import IAPrevisaoEntrega from "@/components/logistica/IAPrevisaoEntrega";
import ComprovanteEntregaDigital from "@/components/logistica/ComprovanteEntregaDigital";
import NotificadorAutomaticoEntrega from "@/components/logistica/NotificadorAutomaticoEntrega";
import RegistroOcorrenciaLogistica from "@/components/logistica/RegistroOcorrenciaLogistica";

/**
 * Dialog de detalhes da entrega extraído de PedidosEntregaTab
 * Substitui baixa de estoque inline por função backend applyOrderStockMovements
 */
export default function PedidosEntregaDetalhesDialog({
  open, onOpenChange, entregaSelecionada, permissoes, entregas
}) {
  const queryClient = useQueryClient();

  const atualizarStatusMutation = useMutation({
    mutationFn: ({ pedidoId, novoStatus }) =>
      base44.entities.Pedido.update(pedidoId, { status: novoStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] });
    }
  });

  const handleConfirmarEntrega = async () => {
    const pedido = entregaSelecionada?.pedido;
    if (!pedido) return;

    // Baixa de estoque via função backend (multiempresa-safe)
    if (pedido.itens_revenda?.length > 0) {
      try {
        await base44.functions.invoke('applyOrderStockMovements', { pedido });
      } catch (e) {
        toast.error("Erro ao baixar estoque: " + (e.message || ""));
        return;
      }
    }

    atualizarStatusMutation.mutate(
      { pedidoId: pedido.id, novoStatus: 'Entregue' },
      {
        onSuccess: () => {
          toast.success("✅ Entrega confirmada e estoque baixado automaticamente!");
          onOpenChange(false);
        }
      }
    );
  };

  if (!entregaSelecionada) return null;

  const { pedido, entrega } = entregaSelecionada;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>🚚 Detalhes da Entrega - {pedido.numero_pedido}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <TimelineEntregaVisual pedido={pedido} entrega={entrega} />

          <Card className="bg-slate-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Cliente</p>
                  <p className="font-semibold">{pedido.cliente_nome}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Valor Total</p>
                  <p className="font-bold text-green-600">
                    R$ {(pedido.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Endereço</p>
                  <p className="text-sm">
                    {pedido.endereco_entrega_principal?.logradouro}, {pedido.endereco_entrega_principal?.numero}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status Atual</p>
                  <Badge className="mt-1">{pedido.status}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ações Automáticas de Status */}
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">🤖 Ações Automáticas de Entrega</CardTitle>
              <p className="text-sm text-slate-600">Clique para atualizar o status automaticamente</p>
            </CardHeader>
            <CardContent className="space-y-3">
              {(pedido.status === 'Aprovado' || pedido.status === 'Pronto para Faturar') && (
                <Button
                  onClick={() => {
                    atualizarStatusMutation.mutate(
                      { pedidoId: pedido.id, novoStatus: 'Em Expedição' },
                      { onSuccess: () => { onOpenChange(false); toast.success("📦 Pedido enviado para expedição!"); } }
                    );
                  }}
                  className="bg-orange-600 hover:bg-orange-700 w-full"
                >
                  <Package className="w-4 h-4 mr-2" /> 📦 Iniciar Separação/Expedição
                </Button>
              )}

              {(pedido.status === 'Em Expedição' || pedido.status === 'Faturado') && (
                <Button
                  onClick={() => {
                    atualizarStatusMutation.mutate(
                      { pedidoId: pedido.id, novoStatus: 'Em Trânsito' },
                      { onSuccess: () => { onOpenChange(false); toast.success("🚚 Pedido saiu para entrega!"); } }
                    );
                  }}
                  className="bg-purple-600 hover:bg-purple-700 w-full"
                >
                  <Truck className="w-4 h-4 mr-2" /> 🚚 Confirmar Saída do Veículo
                </Button>
              )}

              {pedido.status === 'Em Trânsito' && permissoes.podeConfirmarEntrega && (
                <Button
                  onClick={handleConfirmarEntrega}
                  className="bg-green-600 hover:bg-green-700 w-full"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" /> ✅ Confirmar Entrega (Baixa Estoque Automática)
                </Button>
              )}

              {pedido.status === 'Entregue' && (
                <div className="bg-green-100 border border-green-300 rounded-lg p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="font-semibold text-green-800">Pedido já foi entregue!</p>
                  <p className="text-sm text-green-700">Estoque baixado automaticamente.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <IAPrevisaoEntrega pedido={pedido} historico={entregas.filter(e => e.status === 'Entregue').slice(0, 10)} />

          {/* Comprovante de Entrega */}
          {entrega?.comprovante_entrega && (
            <Card className="border-green-300 bg-green-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" /> Comprovante de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-600">Recebedor</p>
                    <p className="font-semibold">{entrega.comprovante_entrega.nome_recebedor}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Data/Hora</p>
                    <p className="font-semibold">
                      {new Date(entrega.comprovante_entrega.data_hora_recebimento).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
                {entrega.comprovante_entrega.foto_comprovante && (
                  <div className="mt-3">
                    <Button variant="outline" size="sm" asChild>
                      <a href={entrega.comprovante_entrega.foto_comprovante} target="_blank" rel="noopener noreferrer">
                        <Image className="w-4 h-4 mr-2" /> Ver Foto do Comprovante
                      </a>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}