import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function BaixaTituloDialog({
  open, onOpenChange, contaAtual, contasSelecionadas, dadosBaixa, setDadosBaixa,
  formasPagamento, onSubmit, isPending
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{contaAtual ? 'Baixar Conta a Receber' : `Baixar Múltiplos Títulos (${contasSelecionadas.length})`}</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {!contaAtual && (
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription>
                <p className="font-semibold text-blue-900">Baixando {contasSelecionadas.length} título(s)</p>
              </AlertDescription>
            </Alert>
          )}
          <div className="grid grid-cols-2 gap-4">
            {contaAtual && (
              <div><Label>Cliente</Label><Input value={contaAtual?.cliente || ''} disabled /></div>
            )}
            <div className={contaAtual ? '' : 'col-span-2'}>
              <Label>Data Recebimento *</Label>
              <Input type="date" value={dadosBaixa.data_recebimento} onChange={(e) => setDadosBaixa({ ...dadosBaixa, data_recebimento: e.target.value })} required />
            </div>
          </div>
          <div>
            <Label>Forma de Recebimento *</Label>
            <Select value={dadosBaixa.forma_recebimento} onValueChange={(v) => setDadosBaixa({ ...dadosBaixa, forma_recebimento: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {formasPagamento.map(forma => (
                  <SelectItem key={forma.id} value={forma.descricao}>{forma.icone && `${forma.icone} `}{forma.descricao}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div><Label>Juros (R$)</Label><Input type="number" step="0.01" value={dadosBaixa.juros} onChange={(e) => setDadosBaixa({ ...dadosBaixa, juros: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>Multa (R$)</Label><Input type="number" step="0.01" value={dadosBaixa.multa} onChange={(e) => setDadosBaixa({ ...dadosBaixa, multa: parseFloat(e.target.value) || 0 })} /></div>
            <div><Label>Desconto (R$)</Label><Input type="number" step="0.01" value={dadosBaixa.desconto} onChange={(e) => setDadosBaixa({ ...dadosBaixa, desconto: parseFloat(e.target.value) || 0 })} /></div>
          </div>
          {contaAtual && (
            <div className="bg-slate-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Valor Total:</span>
                <span className="text-xl font-bold text-green-700">
                  R$ {((contaAtual?.valor || 0) + (dadosBaixa.juros || 0) + (dadosBaixa.multa || 0) - (dadosBaixa.desconto || 0)).toFixed(2)}
                </span>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={isPending} className="bg-green-600">
              {isPending ? 'Baixando...' : 'Confirmar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}