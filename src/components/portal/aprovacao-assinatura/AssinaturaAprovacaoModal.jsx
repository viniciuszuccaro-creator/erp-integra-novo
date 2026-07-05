import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PenTool, Trash2, CheckCircle, Loader2 } from "lucide-react";

/** Modal de assinatura eletrônica + modal de revisão (inline, sem prompt) */
export default function AssinaturaAprovacaoModal({
  assinaturaModal, setAssinaturaModal,
  orcamentoSelecionado,
  nomeAssinante, setNomeAssinante,
  canvasRef,
  startDrawing, draw, stopDrawing, limparAssinatura,
  onAprovar, isAprovando
}) {
  return (
    <Dialog open={assinaturaModal} onOpenChange={setAssinaturaModal}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PenTool className="w-6 h-6 text-blue-600" />
            Assinatura Eletrônica
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-bold text-lg">{orcamentoSelecionado?.numero_orcamento}</p>
                  <p className="text-sm text-slate-600">{orcamentoSelecionado?.itens?.length || 0} item(ns)</p>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  R$ {orcamentoSelecionado?.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label>Nome Completo do Assinante *</Label>
            <Input value={nomeAssinante} onChange={(e) => setNomeAssinante(e.target.value)} placeholder="Digite seu nome completo" className="mt-2" />
          </div>

          <div>
            <Label>Assine abaixo *</Label>
            <div className="mt-2 border-2 border-dashed border-blue-300 rounded-lg p-4 bg-white">
              <canvas
                ref={canvasRef} width={600} height={200}
                className="w-full border border-slate-300 rounded cursor-crosshair bg-white touch-none"
                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                onTouchStart={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  canvasRef.current.dispatchEvent(new MouseEvent('mousedown', { clientX: touch.clientX, clientY: touch.clientY }));
                }}
                onTouchMove={(e) => {
                  e.preventDefault();
                  const touch = e.touches[0];
                  canvasRef.current.dispatchEvent(new MouseEvent('mousemove', { clientX: touch.clientX, clientY: touch.clientY }));
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  canvasRef.current.dispatchEvent(new MouseEvent('mouseup', {}));
                }}
              />
              <div className="flex justify-between items-center mt-3">
                <p className="text-xs text-slate-500">✍️ Assine com o mouse ou touch</p>
                <Button variant="outline" size="sm" onClick={limparAssinatura}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            </div>
          </div>

          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <p className="text-sm text-green-900">
                <CheckCircle className="w-4 h-4 inline mr-2" />
                Ao assinar, você concorda com os termos do orçamento e autoriza a criação do pedido.
              </p>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => { setAssinaturaModal(false); setNomeAssinante(''); }} className="flex-1" disabled={isAprovando}>
              Cancelar
            </Button>
            <Button data-permission="Portal.Orcamentos.aprovar" onClick={onAprovar} disabled={isAprovando} className="flex-1 bg-green-600 hover:bg-green-700">
              {isAprovando ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Processando...</>
              ) : (
                <><CheckCircle className="w-5 h-5 mr-2" />Confirmar Aprovação</>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function RevisaoModal({
  revisaoModal, setRevisaoModal,
  motivoRevisao, setMotivoRevisao,
  onConfirmar, isRejeitando
}) {
  return (
    <Dialog open={revisaoModal} onOpenChange={setRevisaoModal}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Solicitar Revisão</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Descreva os pontos a revisar (opcional):</Label>
            <Textarea
              value={motivoRevisao}
              onChange={(e) => setMotivoRevisao(e.target.value)}
              placeholder="Ex: Valor do frete parece alto, item X não confere..."
              rows={4}
              className="mt-2"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setRevisaoModal(false)} className="flex-1" disabled={isRejeitando}>
              Cancelar
            </Button>
            <Button
              data-permission="Portal.Orcamentos.revisar"
              onClick={onConfirmar}
              disabled={isRejeitando}
              className="flex-1 bg-amber-600 hover:bg-amber-700"
            >
              {isRejeitando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirmar Revisão
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}