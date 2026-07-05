import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, ArrowDownCircle, ArrowUpCircle, User, Calendar, CreditCard, Wallet } from "lucide-react";

export default function CaixaOrdensList({ ordensLiquidacao, ordensSelecionadas, toggleOrdemSelecionada, podeLiquidar, isLoading }) {
  if (ordensLiquidacao.length === 0 && !isLoading) {
    return (
      <Card className="p-8">
        <div className="text-center text-slate-500">
          <Wallet className="w-12 h-12 mx-auto mb-3 text-slate-400" />
          <p className="text-lg font-medium">Nenhuma ordem encontrada</p>
          <p className="text-sm">Altere os filtros ou aguarde novas movimentações</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {ordensLiquidacao.map(ordem => (
        <Card
          key={ordem.id}
          className={`cursor-pointer transition-all hover:shadow-lg ${
            ordensSelecionadas.includes(ordem.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          } ${ordem.status === "Liquidado" ? 'opacity-60' : ''}`}
          onClick={() => ordem.status === "Pendente" && podeLiquidar && toggleOrdemSelecionada(ordem.id)}
        >
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${ordem.tipo_operacao === "Recebimento" ? 'bg-green-100' : 'bg-red-100'}`}>
                  {ordem.tipo_operacao === "Recebimento" ? (
                    <ArrowDownCircle className="w-6 h-6 text-green-600" />
                  ) : (
                    <ArrowUpCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-slate-900">{ordem.tipo_operacao}</p>
                    <Badge variant="outline" className="text-xs">{ordem.origem}</Badge>
                    {ordem.status === "Pendente" && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs"><Clock className="w-3 h-3 mr-1" />Pendente</Badge>
                    )}
                    {ordem.status === "Liquidado" && (
                      <Badge className="bg-green-100 text-green-800 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Liquidado</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-slate-600">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" />{ordem.titulos_vinculados?.[0]?.cliente_fornecedor_nome || "N/A"}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(ordem.data_ordem).toLocaleDateString('pt-BR')}</span>
                    <span className="flex items-center gap-1"><CreditCard className="w-3 h-3" />{ordem.forma_pagamento_pretendida}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">R$ {(ordem.valor_total || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                <p className="text-xs text-slate-500">{ordem.titulos_vinculados?.length || 0} título(s)</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}