import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertCircle } from "lucide-react";

export default function RetiradaConfirmDialog({
  detalhesOpen,
  setDetalhesOpen,
  pedidoSelecionado,
  nomeRecebedor,
  setNomeRecebedor,
  docRecebedor,
  setDocRecebedor,
  observacoes,
  setObservacoes,
  handleConfirmarRetirada,
  confirmarRetiradaMutation,
}) {
  return (
    <Dialog open={detalhesOpen} onOpenChange={setDetalhesOpen}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>📦 Confirmar Retirada - {pedidoSelecionado?.numero_pedido}</DialogTitle>
        </DialogHeader>
        {pedidoSelecionado && (
          <div className="space-y-4">
            <Card className="bg-blue-50">
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600">Cliente</p>
                    <p className="font-semibold">{pedidoSelecionado.cliente_nome}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Valor Total</p>
                    <p className="font-bold text-green-600">
                      R$ {(pedidoSelecionado.valor_total || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="space-y-3">
              <div>
                <Label>Nome de Quem Retirou *</Label>
                <Input value={nomeRecebedor} onChange={(e) => setNomeRecebedor(e.target.value)} placeholder="Nome completo" />
              </div>
              <div>
                <Label>CPF/RG de Quem Retirou</Label>
                <Input value={docRecebedor} onChange={(e) => setDocRecebedor(e.target.value)} placeholder="Documento" />
              </div>
              <div>
                <Label>Observações da Retirada</Label>
                <Textarea value={observacoes} onChange={(e) => setObservacoes(e.target.value)} placeholder="Ex: Retirado pessoalmente pelo responsável..." rows={3} />
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-3">
              <div className="flex items-start gap-2 text-orange-800 text-sm">
                <AlertCircle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="font-semibold">Atenção:</p>
                  <p>Ao confirmar a retirada, o estoque será baixado automaticamente e não poderá ser desfeito.</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => { setDetalhesOpen(false); }}
              >
                Cancelar
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={handleConfirmarRetirada}
                disabled={confirmarRetiradaMutation.isPending}
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {confirmarRetiradaMutation.isPending ? "Confirmando..." : "Confirmar Retirada"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}