import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { TrendingUp, TrendingDown, DollarSign, Zap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const TABELAS_PRECO = [
  { id: "padrao", nome: "Padrão", fator: 1.0, descricao: "Preço normal" },
  { id: "a_vista", nome: "À Vista", fator: 0.95, descricao: "5% desconto" },
  { id: "a_prazo", nome: "A Prazo", fator: 1.10, descricao: "10% acréscimo" },
  { id: "atacado", nome: "Atacado", fator: 0.90, descricao: "10% desconto" },
  { id: "varejo", nome: "Varejo", fator: 1.15, descricao: "15% acréscimo" },
  { id: "especial", nome: "Especial", fator: 0.85, descricao: "15% desconto" }
];

export default function SimuladorTabelaPreco({ itens = [], onAplicarTabela, tabelaAtual = "padrao" }) {
  const [tabelaSelecionada, setTabelaSelecionada] = useState(tabelaAtual);
  const [comparacao, setComparacao] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    calcularComparacao();
  }, [tabelaSelecionada, itens]);

  const calcularComparacao = () => {
    const tabelaAtualObj = TABELAS_PRECO.find(t => t.id === tabelaAtual);
    const tabelaNovaObj = TABELAS_PRECO.find(t => t.id === tabelaSelecionada);

    if (!tabelaAtualObj || !tabelaNovaObj) return;

    const valorAtual = itens.reduce((sum, item) => {
      const precoItem = item.preco_unitario * item.quantidade;
      return sum + precoItem;
    }, 0);

    const valorNovo = itens.reduce((sum, item) => {
      const precoBase = item.preco_unitario / tabelaAtualObj.fator;
      const precoNovo = precoBase * tabelaNovaObj.fator;
      return sum + (precoNovo * item.quantidade);
    }, 0);

    const diferenca = valorNovo - valorAtual;
    const percentual = ((diferenca / valorAtual) * 100);

    setComparacao({
      valorAtual,
      valorNovo,
      diferenca,
      percentual,
      tabelaAtual: tabelaAtualObj,
      tabelaNova: tabelaNovaObj
    });
  };

  const handleAplicar = () => {
    if (tabelaSelecionada === tabelaAtual) {
      toast({ title: "ℹ️ Tabela já aplicada", description: "Esta tabela já está em uso." });
      return;
    }

    onAplicarTabela(tabelaSelecionada);
    
    toast({ 
      title: "✅ Tabela Aplicada!", 
      description: `Tabela "${TABELAS_PRECO.find(t => t.id === tabelaSelecionada)?.nome}" aplicada com sucesso.` 
    });
  };

  if (!itens || itens.length === 0) {
    return null;
  }

  return (
    <Card className="border-2 border-purple-300">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          Simulador de Tabela de Preço
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <Label>Selecione uma Tabela para Simular</Label>
          <Select value={tabelaSelecionada} onValueChange={setTabelaSelecionada}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TABELAS_PRECO.map(tabela => (
                <SelectItem key={tabela.id} value={tabela.id}>
                  <div className="flex items-center justify-between w-full">
                    <span className="font-medium">{tabela.nome}</span>
                    <Badge variant="outline" className="ml-2 text-xs">
                      {tabela.descricao}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {comparacao && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-2 border-slate-300">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-slate-600 mb-1">Valor Atual</p>
                  <p className="text-sm font-semibold text-slate-800 mb-2">
                    ({comparacao.tabelaAtual.nome})
                  </p>
                  <p className="text-2xl font-bold text-slate-900">
                    R$ {comparacao.valorAtual.toFixed(2)}
                  </p>
                </CardContent>
              </Card>

              <Card className={`border-2 ${comparacao.diferenca < 0 ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-slate-600 mb-1">Valor Simulado</p>
                  <p className="text-sm font-semibold text-slate-800 mb-2">
                    ({comparacao.tabelaNova.nome})
                  </p>
                  <p className={`text-2xl font-bold ${comparacao.diferenca < 0 ? 'text-green-700' : 'text-red-700'}`}>
                    R$ {comparacao.valorNovo.toFixed(2)}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className={`${comparacao.diferenca < 0 ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {comparacao.diferenca < 0 ? (
                      <TrendingDown className="w-6 h-6 text-green-600" />
                    ) : (
                      <TrendingUp className="w-6 h-6 text-red-600" />
                    )}
                    <div>
                      <p className="text-sm font-semibold">Diferença:</p>
                      <p className={`text-2xl font-bold ${comparacao.diferenca < 0 ? 'text-green-700' : 'text-red-700'}`}>
                        {comparacao.diferenca < 0 ? '-' : '+'} R$ {Math.abs(comparacao.diferenca).toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Badge className={`text-lg px-4 py-2 ${comparacao.diferenca < 0 ? 'bg-green-600' : 'bg-red-600'}`}>
                    {comparacao.diferenca < 0 ? '-' : '+'}{Math.abs(comparacao.percentual).toFixed(1)}%
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Button
              data-permission="Comercial.TabelaPreco.aplicar"
              onClick={handleAplicar}
              disabled={tabelaSelecionada === tabelaAtual}
              className={`w-full h-12 text-lg ${
                tabelaSelecionada === tabelaAtual 
                  ? 'bg-slate-400' 
                  : comparacao.diferenca < 0 
                    ? 'bg-green-600 hover:bg-green-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              <DollarSign className="w-5 h-5 mr-2" />
              {tabelaSelecionada === tabelaAtual ? 'Tabela Atual' : 'Aplicar Esta Tabela'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}