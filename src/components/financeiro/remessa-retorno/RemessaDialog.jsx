import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Send, Download } from "lucide-react";
import { toast } from "sonner";

export default function RemessaDialog({
  open, onOpenChange,
  bancos, bancoSelecionado, setBancoSelecionado,
  titulosSelecionados, valorTotalSelecionado,
  onConfirmar, isPending,
  contextoValido, podeGerarRemessa,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Gerar Arquivo de Remessa
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card className="bg-blue-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-slate-600">Títulos Selecionados:</p>
                  <p className="font-bold text-lg">{titulosSelecionados.length}</p>
                </div>
                <div>
                  <p className="text-slate-600">Valor Total:</p>
                  <p className="font-bold text-lg text-blue-600">R$ {valorTotalSelecionado.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label>Banco *</Label>
            <Select
              value={bancoSelecionado}
              onValueChange={setBancoSelecionado}
              disabled={!contextoValido || !podeGerarRemessa || isPending}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o banco..." />
              </SelectTrigger>
              <SelectContent>
                {bancos.map(banco => (
                  <SelectItem key={banco.id} value={banco.id}>
                    {banco.codigo} - {banco.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button
              data-permission="Financeiro.Remessa.gerar"
              data-action="Financeiro.Remessa.gerar"
              data-sensitive="true"
              onClick={() => {
                if (!bancoSelecionado) { toast.error("Selecione um banco"); return; }
                onConfirmar();
              }}
              disabled={!contextoValido || !podeGerarRemessa || isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {isPending ? 'Gerando...' : 'Gerar e Baixar'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}