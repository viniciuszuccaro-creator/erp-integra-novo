import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Percent, DollarSign, Calculator } from "lucide-react";

export default function DescontosItemPedido({ item, onAtualizarItem }) {
  const [tipoDesconto, setTipoDesconto] = useState("percentual"); // percentual ou valor
  const [valorDesconto, setValorDesconto] = useState(item.desconto_percentual || 0);

  const calcularValorComDesconto = () => {
    const valorBase = item.preco_unitario * item.quantidade;
    let desconto = 0;

    if (tipoDesconto === "percentual") {
      desconto = (valorBase * valorDesconto) / 100;
    } else {
      desconto = valorDesconto;
    }

    return {
      valorBase,
      desconto,
      valorFinal: valorBase - desconto
    };
  };

  const handleAplicarDesconto = () => {
    const { valorBase, desconto, valorFinal } = calcularValorComDesconto();

    const itemAtualizado = {
      ...item,
      desconto_percentual: tipoDesconto === "percentual" ? valorDesconto : (desconto / valorBase) * 100,
      desconto_valor: desconto,
      valor_item: valorFinal
    };

    onAtualizarItem(itemAtualizado);
  };

  const { valorBase, desconto, valorFinal } = calcularValorComDesconto();

  return (
    <div className="space-y-3 p-4 bg-blue-50 rounded border border-blue-200">
      <div className="flex items-center gap-2 mb-2">
        <Calculator className="w-5 h-5 text-blue-600" />
        <h4 className="font-semibold text-blue-900">Aplicar Desconto</h4>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Tipo de Desconto</Label>
          <Select value={tipoDesconto} onValueChange={setTipoDesconto}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentual">
                <div className="flex items-center gap-2">
                  <Percent className="w-4 h-4" />
                  Percentual (%)
                </div>
              </SelectItem>
              <SelectItem value="valor">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Valor (R$)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Valor do Desconto</Label>
          <div className="relative">
            <Input
              type="number"
              step="0.01"
              min="0"
              value={valorDesconto}
              onChange={(e) => setValorDesconto(parseFloat(e.target.value) || 0)}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              {tipoDesconto === "percentual" ? "%" : "R$"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 text-sm">
        <div className="p-2 bg-white rounded">
          <p className="text-xs text-slate-600">Valor Base</p>
          <p className="font-semibold">R$ {valorBase.toFixed(2)}</p>
        </div>
        <div className="p-2 bg-white rounded">
          <p className="text-xs text-slate-600">Desconto</p>
          <p className="font-semibold text-red-600">- R$ {desconto.toFixed(2)}</p>
        </div>
        <div className="p-2 bg-green-100 rounded">
          <p className="text-xs text-slate-600">Valor Final</p>
          <p className="font-semibold text-green-700">R$ {valorFinal.toFixed(2)}</p>
        </div>
      </div>

      <Button
        onClick={handleAplicarDesconto}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        <Calculator className="w-4 h-4 mr-2" />
        Aplicar Desconto
      </Button>

      {item.desconto_valor > 0 && (
        <Badge className="bg-green-600 w-full justify-center py-2">
          ✅ Desconto de R$ {item.desconto_valor.toFixed(2)} aplicado ({item.desconto_percentual.toFixed(2)}%)
        </Badge>
      )}
    </div>
  );
}