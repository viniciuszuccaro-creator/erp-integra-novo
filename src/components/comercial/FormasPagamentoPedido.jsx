import React, { useState, useEffect } from "react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useFormasPagamento } from "@/components/lib/useFormasPagamento";
import { useCondicaoComercial } from "@/components/lib/useCondicaoComercial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Percent, Calendar } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const FORMAS_FALLBACK = [
  { tipo: "À Vista", descricao: "Pagamento à vista", icone: "💵" },
  { tipo: "PIX", descricao: "Via PIX", icone: "🔷" },
  { tipo: "Boleto", descricao: "Boleto bancário", icone: "📄" },
  { tipo: "Cartão de Crédito", descricao: "Cartão de crédito", icone: "💳" },
  { tipo: "Cartão de Débito", descricao: "Cartão de débito", icone: "💳" },
  { tipo: "Transferência", descricao: "Transferência bancária", icone: "🏦" },
  { tipo: "Dinheiro", descricao: "Em espécie", icone: "💵" },
  { tipo: "Parcelado", descricao: "Pagamento parcelado", icone: "📊" },
];

export default function FormasPagamentoPedido({
  valorTotal, 
  formaPagamento, 
  condicaoPagamento,
  parcelas = [],
  acrescimo = 0,
  onFormaPagamentoChange,
  onCondicaoPagamentoChange,
  onParcelasChange,
  onAcrescimoChange
}) {
  const [numeroParcelas, setNumeroParcelas] = useState(1);
  const [percentualAcrescimo, setPercentualAcrescimo] = useState(acrescimo || 0);
  const { empresaAtual } = useContextoVisual();

  const { formasPagamento = [], isLoading: loadingFormas } = useFormasPagamento({ empresa_id: empresaAtual?.id });
  const { condicoesPagamento = [], isLoading: loadingCondicoes } = useCondicaoComercial({ tipo_condicao: 'Pagamento' });

  const formasAtivas = (formasPagamento.length > 0)
    ? formasPagamento.filter(f => f.ativa !== false)
    : FORMAS_FALLBACK;

  useEffect(() => {
    // Only generate parcels if the payment method is 'Parcelado'
    // and there's more than one parcel or if it's explicitly set to 1 and we need to refresh
    if (formaPagamento === 'Parcelado' && numeroParcelas > 0 && onParcelasChange) {
      gerarParcelas();
    } else if (formaPagamento !== 'Parcelado' && parcelas.length > 0) {
      // Clear parcels if payment method changes from 'Parcelado'
      onParcelasChange([]);
    }
  }, [numeroParcelas, valorTotal, percentualAcrescimo, formaPagamento]); // Added formaPagamento to dependencies

  // Effect to update local state if props change from parent
  useEffect(() => {
    if (acrescimo !== percentualAcrescimo) {
      setPercentualAcrescimo(acrescimo);
    }
  }, [acrescimo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Effect to handle initial parcel count from prop, if needed.
  // The current outline does not explicitly handle initial `numeroParcelas` from prop.
  // If `parcelas.length` is used to infer initial `numeroParcelas`, it would go here.
  // For now, it defaults to 1.

  const gerarParcelas = () => {
    const valorComAcrescimo = valorTotal * (1 + percentualAcrescimo / 100);
    const valorParcela = valorComAcrescimo / numeroParcelas;
    const novasParcelas = [];

    for (let i = 1; i <= numeroParcelas; i++) {
      const dataVencimento = new Date();
      // Set date for the i-th month from now.
      // E.g., for i=1, it's 30 days from now. For i=2, 60 days from now.
      // This is a common way to calculate monthly intervals.
      dataVencimento.setDate(dataVencimento.getDate() + (i * 30));

      novasParcelas.push({
        numero_parcela: i,
        data_vencimento: dataVencimento.toISOString().split('T')[0],
        valor: valorParcela,
        status: 'Pendente',
        forma_cobranca: formaPagamento // Use the selected formaPagamento for cobranca
      });
    }

    if (onParcelasChange) {
      onParcelasChange(novasParcelas);
    }
  };

  const handleAcrescimoChange = (valor) => {
    setPercentualAcrescimo(valor);
    if (onAcrescimoChange) {
      onAcrescimoChange(valor);
    }
  };

  return (
    <Card className="border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-purple-600" />
          Formas de Pagamento
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="forma-pagamento-select">Forma de Pagamento *</Label>
            <Select
              value={formaPagamento}
              onValueChange={onFormaPagamentoChange}
            >
              <SelectTrigger id="forma-pagamento-select">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {loadingFormas && <SelectItem value="_loading" disabled>Carregando...</SelectItem>}
                {formasAtivas.length === 0 && !loadingFormas && <SelectItem value="_empty" disabled>Nenhuma forma cadastrada</SelectItem>}
                {formasAtivas.map(forma => (
                  <SelectItem key={forma.id || forma.tipo} value={forma.tipo}>
                    {forma.icone || '💰'} {forma.descricao || forma.tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="condicao-pagamento-select">Condição de Pagamento</Label>
            <Select
              value={condicaoPagamento}
              onValueChange={onCondicaoPagamentoChange}
            >
              <SelectTrigger id="condicao-pagamento-select">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {loadingCondicoes && <SelectItem value="_loading_cond" disabled>Carregando...</SelectItem>}
                {condicoesPagamento.length === 0 && !loadingCondicoes && <SelectItem value="_empty_cond" disabled>Nenhuma condição cadastrada</SelectItem>}
                {condicoesPagamento.map(cond => (
                  <SelectItem key={cond.id || cond.nome_condicao} value={cond.nome_condicao}>
                    {cond.nome_condicao}{cond.prazo_pagamento_dias ? ` (${cond.prazo_pagamento_dias} dias)` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ACRÉSCIMO/JUROS PARA PARCELAMENTO */}
        {(formaPagamento === 'Parcelado' || formaPagamento === 'Cartão de Crédito') && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <Label className="text-orange-900" htmlFor="percentual-acrescimo-input">Acréscimo/Juros (%)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="percentual-acrescimo-input"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={percentualAcrescimo}
                    onChange={(e) => handleAcrescimoChange(parseFloat(e.target.value) || 0)}
                    className="w-24"
                  />
                  <Percent className="w-4 h-4 text-orange-600" />
                </div>
              </div>
              {percentualAcrescimo > 0 && (
                <div className="mt-2 p-2 bg-white rounded">
                  <p className="text-sm text-orange-700">
                    Valor Original: <span className="font-bold">R$ {valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </p>
                  <p className="text-sm text-orange-900 font-bold">
                    Valor com Acréscimo: R$ {(valorTotal * (1 + percentualAcrescimo / 100)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* PARCELAMENTO */}
        {formaPagamento === 'Parcelado' && (
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <Label htmlFor="numero-parcelas-select">Número de Parcelas:</Label>
              <Select
                value={numeroParcelas.toString()}
                onValueChange={(v) => setNumeroParcelas(parseInt(v))}
              >
                <SelectTrigger id="numero-parcelas-select" className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                    <SelectItem key={n} value={n.toString()}>
                      {n}x
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {numeroParcelas > 0 && (
                <span className="text-sm text-slate-600">
                  de R$ {((valorTotal * (1 + percentualAcrescimo / 100)) / numeroParcelas).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              )}
            </div>

            {parcelas.length > 0 && (
              <Card>
                <CardHeader className="py-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-600" />
                    Parcelas Geradas
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3">
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {parcelas.map((parcela, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span className="text-sm font-medium">Parcela {parcela.numero_parcela}/{numeroParcelas}</span>
                        <span className="text-sm text-slate-700">
                          Vencimento: {new Date(parcela.data_vencimento).toLocaleDateString('pt-BR')}
                        </span>
                        <span className="font-semibold text-sm">
                          R$ {parcela.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* RESUMO DE FORMAS DISPONÍVEIS */}
        {formaPagamento === undefined && formasAtivas.length > 0 && (
          <>
            <Separator />
            <h4 className="font-semibold text-base mb-2">Selecione uma Forma de Pagamento</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {formasAtivas.slice(0, 8).map(forma => (
                <Button
                  key={forma.id}
                  type="button"
                  variant="outline"
                  onClick={() => onFormaPagamentoChange(forma.tipo)}
                  className="h-auto py-3 flex flex-col items-center gap-1 text-center"
                >
                  <span className="text-lg">{forma.icone || '💰'}</span>
                  <span className="text-xs font-medium">{forma.descricao}</span>
                </Button>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}