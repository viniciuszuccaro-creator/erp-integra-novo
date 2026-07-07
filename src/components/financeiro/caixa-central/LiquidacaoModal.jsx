import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, CheckCircle2 } from "lucide-react";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";

export default function LiquidacaoModal({
  open, onClose, onConfirm,
  dadosLiquidacao, setDadosLiquidacao,
  valorOriginal, valorLiquido,
  contextoValido, podeLiquidar, isPending,
}) {
  const { formasPagamento, isLoading: loadingFormas } = useFormasPagamento();

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Liquidar Ordens Selecionadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Forma de Pagamento *</Label>
              <Select
                value={dadosLiquidacao.forma_pagamento}
                onValueChange={(v) => setDadosLiquidacao({...dadosLiquidacao, forma_pagamento: v})}
                disabled={!contextoValido || !podeLiquidar || isPending}
              >
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {loadingFormas && <SelectItem value="_loading" disabled>Carregando...</SelectItem>}
                  {!loadingFormas && formasPagamento.length === 0 && <SelectItem value="_empty" disabled>Nenhuma forma cadastrada</SelectItem>}
                  {formasPagamento.map((f) => (
                    <SelectItem key={f.id} value={f.descricao || f.tipo}>{f.descricao || f.tipo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Valor Recebido/Pago *</Label>
              <Input
                type="number" step="0.01"
                value={dadosLiquidacao.valor_recebido}
                onChange={(e) => setDadosLiquidacao({...dadosLiquidacao, valor_recebido: parseFloat(e.target.value) || 0})}
                disabled={!contextoValido || !podeLiquidar || isPending}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Acréscimo (Juros/Multa)</Label>
              <Input
                type="number" step="0.01"
                value={dadosLiquidacao.acrescimo}
                onChange={(e) => setDadosLiquidacao({...dadosLiquidacao, acrescimo: parseFloat(e.target.value) || 0})}
                disabled={!contextoValido || !podeLiquidar || isPending}
              />
            </div>
            <div>
              <Label>Desconto</Label>
              <Input
                type="number" step="0.01"
                value={dadosLiquidacao.desconto}
                onChange={(e) => setDadosLiquidacao({...dadosLiquidacao, desconto: parseFloat(e.target.value) || 0})}
                disabled={!contextoValido || !podeLiquidar || isPending}
              />
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded">
            <div className="flex justify-between text-sm mb-2"><span>Valor Original:</span><span className="font-medium">R$ {valorOriginal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
            <div className="flex justify-between text-sm mb-2"><span>Acréscimo:</span><span className="font-medium text-green-600">+ R$ {dadosLiquidacao.acrescimo.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
            <div className="flex justify-between text-sm mb-2"><span>Desconto:</span><span className="font-medium text-red-600">- R$ {dadosLiquidacao.desconto.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
            <div className="border-t pt-2 mt-2 flex justify-between font-bold"><span>Valor Líquido:</span><span className="text-lg text-green-600">R$ {valorLiquido.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</span></div>
          </div>

          <div>
            <Label>Observações</Label>
            <Textarea
              placeholder="Informações adicionais..."
              value={dadosLiquidacao.observacoes}
              onChange={(e) => setDadosLiquidacao({...dadosLiquidacao, observacoes: e.target.value})}
              rows={3}
              disabled={!contextoValido || !podeLiquidar || isPending}
            />
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1" data-permission="Financeiro.Caixa.cancelar" data-action="Financeiro.Caixa.cancelar">Cancelar</Button>
            <Button
              data-permission="Financeiro.Caixa.liquidar"
              data-action="Financeiro.Caixa.liquidar"
              data-sensitive="true"
              onClick={onConfirm}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={!contextoValido || !podeLiquidar || isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isPending ? 'Processando...' : 'Confirmar Liquidação'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}