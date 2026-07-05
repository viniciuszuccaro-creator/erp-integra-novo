import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  AlertTriangle,
  AlertCircle,
  DollarSign,
} from "lucide-react";

export default function CalculoItemCard({
  calculo,
  quantidade,
  produtoSelecionado,
  cliente,
  descontoPercentual,
  descontoValor,
  tabelaPreco,
}) {
  if (!calculo) return null;

  const fmt = (v) =>
    (v || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 });

  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2 mb-3">
          <Calculator className="w-5 h-5 text-slate-600" />
          <h4 className="font-semibold text-slate-900">Cálculo do Item</h4>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Preço Bruto:</span>
              <span className="font-semibold">R$ {fmt(calculo.preco_unitario_bruto)}</span>
            </div>
            {cliente?.condicao_comercial?.percentual_desconto > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desc. Padrão ({cliente.condicao_comercial.percentual_desconto}%):</span>
                <span className="font-semibold">
                  - R$ {fmt(calculo.preco_unitario_bruto - calculo.preco_apos_desconto_padrao)}
                </span>
              </div>
            )}
            {(descontoPercentual > 0 || descontoValor > 0) && (
              <div className="flex justify-between text-blue-600">
                <span>Desc. Adicional:</span>
                <span className="font-semibold">
                  - R$ {fmt(calculo.detalhes_calculo?.desconto_item_valor)}
                </span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2">
              <span className="text-slate-600">Preço Final:</span>
              <span className="font-bold text-lg text-blue-600">
                R$ {fmt(calculo.preco_unitario)}
              </span>
            </div>
          </div>

          <div className="space-y-2 border-l pl-4">
            <div className="flex justify-between">
              <span className="text-slate-600">Custo Unit.:</span>
              <span className="font-semibold">R$ {fmt(calculo.custo_unitario)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Margem:</span>
              <span className={`font-bold ${calculo.margem_violada ? "text-red-600" : "text-green-600"}`}>
                {calculo.margem_percentual.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Lucro Unit.:</span>
              <span className={`font-semibold ${calculo.margem_violada ? "text-red-600" : "text-green-600"}`}>
                R$ {fmt(calculo.preco_unitario - calculo.custo_unitario)}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-slate-600">Total Item:</span>
              <span className="font-bold text-lg text-blue-600">
                R$ {fmt(calculo.valor_item)}
              </span>
            </div>
          </div>
        </div>

        {calculo.margem_violada && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-300 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900 text-sm">⚠️ Margem Mínima Violada!</p>
              <p className="text-xs text-red-700">
                Atual: {calculo.margem_percentual.toFixed(2)}% | Mínima: {calculo.margem_minima_aplicada}%
              </p>
            </div>
          </div>
        )}

        {quantidade > (produtoSelecionado.estoque_disponivel || 0) && (
          <div className="p-3 bg-orange-50 rounded-lg border border-orange-300 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-orange-900 text-sm">Estoque Insuficiente</p>
              <p className="text-xs text-orange-700">
                Disponível: {produtoSelecionado.estoque_disponivel || 0} | Solicitado: {quantidade}
              </p>
            </div>
          </div>
        )}

        {tabelaPreco && calculo.origem_preco === "tabela_preco" && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-300 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
            <p className="text-sm font-semibold text-green-900">
              ✅ Preço da Tabela: {tabelaPreco.nome}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}