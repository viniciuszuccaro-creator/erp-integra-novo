import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, X, CheckCircle2 } from "lucide-react";

export default function ConciliacaoManualModal({ movimento, onConfirm, onClose, isPending }) {
  const [dataCredito, setDataCredito] = useState("");
  const [valorExtrato, setValorExtrato] = useState(movimento?.valor || "");
  const [descricaoExtrato, setDescricaoExtrato] = useState("");

  if (!movimento) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="bg-blue-50">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-600" />Conciliação Manual
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="p-4 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600 mb-2">Movimento ERP:</p>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">{movimento.cliente_nome || 'N/A'}</p>
                <p className="text-xs text-slate-500">
                  {movimento.origem_pagamento || 'N/A'} • {movimento.forma_pagamento || 'N/A'}
                </p>
              </div>
              <p className="text-xl font-bold text-green-600">
                R$ {(movimento.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Informar Dados do Extrato Bancário:</p>
            <div className="grid grid-cols-2 gap-4">
              <Input type="date" placeholder="Data do Crédito" value={dataCredito} onChange={e => setDataCredito(e.target.value)} />
              <Input type="number" step="0.01" placeholder="Valor no Extrato" value={valorExtrato} onChange={e => setValorExtrato(e.target.value)} />
            </div>
            <Input placeholder="Descrição no Extrato (opcional)" value={descricaoExtrato} onChange={e => setDescricaoExtrato(e.target.value)} />
          </div>

          <div className="flex gap-3">
            <Button onClick={onClose} variant="outline" className="flex-1">Cancelar</Button>
            <Button
              data-permission="Financeiro.ConciliacaoBancaria.conciliar"
              onClick={() => onConfirm({ valor: parseFloat(valorExtrato) || movimento.valor, data: dataCredito || new Date().toISOString() })}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isPending}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />Confirmar Conciliação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}