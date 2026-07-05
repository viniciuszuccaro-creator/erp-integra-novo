import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wallet, ArrowDownCircle, ArrowUpCircle, Filter } from "lucide-react";

export default function CaixaHeader({ ordensLiquidacao, filtros, setFiltros, ordensSelecionadas, onLiquidar, contextoValido, podeLiquidar }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-green-600" />
            Caixa - Central de Liquidação
          </h2>
          <p className="text-sm text-slate-600 mt-1">Módulo central de liquidação financeira</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-green-100 text-green-800">
            <ArrowDownCircle className="w-3 h-3 mr-1" />
            {ordensLiquidacao.filter(o => o.tipo_operacao === "Recebimento" && o.status === "Pendente").length} recebimentos
          </Badge>
          <Badge className="bg-red-100 text-red-800">
            <ArrowUpCircle className="w-3 h-3 mr-1" />
            {ordensLiquidacao.filter(o => o.tipo_operacao === "Pagamento" && o.status === "Pendente").length} pagamentos
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-4 h-4" />Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Tipo</Label>
              <Select value={filtros.tipo} onValueChange={(v) => setFiltros({...filtros, tipo: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Recebimento">Recebimentos</SelectItem>
                  <SelectItem value="Pagamento">Pagamentos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Origem</Label>
              <Select value={filtros.origem} onValueChange={(v) => setFiltros({...filtros, origem: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  <SelectItem value="Contas a Receber">Contas a Receber</SelectItem>
                  <SelectItem value="Contas a Pagar">Contas a Pagar</SelectItem>
                  <SelectItem value="Venda Direta">Venda Direta</SelectItem>
                  <SelectItem value="Omnichannel">Omnichannel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Status</Label>
              <Select value={filtros.status} onValueChange={(v) => setFiltros({...filtros, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Pendente">Pendente</SelectItem>
                  <SelectItem value="Em Processamento">Em Processamento</SelectItem>
                  <SelectItem value="Liquidado">Liquidado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {ordensSelecionadas.length > 0 && (
        <Card className="bg-blue-50 border-2 border-blue-500">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-blue-900">{ordensSelecionadas.length} ordem(ns) selecionada(s)</p>
                <p className="text-sm text-blue-700">
                  Valor total: R$ {ordensLiquidacao.filter(o => ordensSelecionadas.includes(o.id)).reduce((sum, o) => sum + (o.valor_total || 0), 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                </p>
              </div>
              <Button data-permission="Financeiro.Caixa.liquidar" data-action="Financeiro.Caixa.liquidar" data-sensitive="true" onClick={onLiquidar} disabled={!contextoValido || !podeLiquidar} className="bg-blue-600 hover:bg-blue-700">
                Liquidar Selecionadas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}