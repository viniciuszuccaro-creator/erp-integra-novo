import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calculator, Sparkles, Loader2 } from "lucide-react";

/**
 * Aba de Cálculo e IA da Tabela de Preço
 * Extraída de TabelaPrecoFormCompleto para reduzir tamanho (Regra-Mãe #3)
 *
 * Props:
 *  - regraCalculo / setRegraCalculo: estado do motor de cálculo
 *  - calculando: boolean de loading
 *  - itensTabela: lista de itens da tabela
 *  - handleRecalcularPrecos: handler do botão recalcular
 *  - handleSugerirPrecosIA: handler do botão IA
 */
export default function TabelaPrecoCalculoTab({
  regraCalculo,
  setRegraCalculo,
  calculando,
  itensTabela,
  handleRecalcularPrecos,
  handleSugerirPrecosIA,
}) {
  return (
    <>
      <Alert className="border-purple-200 bg-purple-50">
        <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
        <AlertDescription className="text-sm text-purple-900">
          🧠 <strong>PriceBrain 3.0:</strong> IA analisa Setor + Grupo + Marca e sugere markup diferenciado
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader className="bg-slate-50 border-b pb-3">
          <CardTitle className="text-base">🧮 Motor de Cálculo Manual</CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label>Base de Cálculo</Label>
            <Select value={regraCalculo.base} onValueChange={(v) => setRegraCalculo({ ...regraCalculo, base: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custo_medio">Custo Médio (Estoque)</SelectItem>
                <SelectItem value="custo_aquisicao">Último Custo de Aquisição</SelectItem>
                <SelectItem value="custo_base">Custo Base Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Tipo de Cálculo</Label>
            <Select value={regraCalculo.tipo} onValueChange={(v) => setRegraCalculo({ ...regraCalculo, tipo: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="markup">Markup (%)</SelectItem>
                <SelectItem value="margem">Margem Desejada (%)</SelectItem>
                <SelectItem value="valor_fixo">Valor Fixo (R$)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>
              {regraCalculo.tipo === 'markup' && 'Percentual de Markup (%)'}
              {regraCalculo.tipo === 'margem' && 'Margem Desejada (%)'}
              {regraCalculo.tipo === 'valor_fixo' && 'Valor a Adicionar (R$)'}
            </Label>
            <Input
              type="number"
              step="0.01"
              value={regraCalculo.valor}
              onChange={(e) => setRegraCalculo({ ...regraCalculo, valor: parseFloat(e.target.value) || 0 })}
              placeholder="30"
            />
            <p className="text-xs text-slate-500 mt-1">
              {regraCalculo.tipo === 'markup' && 'Preço = Custo × (1 + Markup%)'}
              {regraCalculo.tipo === 'margem' && 'Preço = Custo ÷ (1 - Margem%)'}
              {regraCalculo.tipo === 'valor_fixo' && 'Preço = Custo + Valor'}
            </p>
          </div>

          <Button
            type="button"
            onClick={handleRecalcularPrecos}
            disabled={calculando || itensTabela.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {calculando ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Calculator className="w-4 h-4 mr-2" />
            )}
            Recalcular Todos os Preços
          </Button>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50">
        <CardHeader className="bg-purple-100 border-b pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-700" />
            IA PriceBrain 3.0 - Precificação Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 space-y-3">
          <Alert className="border-purple-300 bg-white">
            <AlertDescription className="text-xs text-purple-900">
              🧠 A IA analisa Setor + Grupo + Marca e sugere markup diferenciado por categoria
            </AlertDescription>
          </Alert>

          <Button
            type="button"
            onClick={handleSugerirPrecosIA}
            disabled={calculando || itensTabela.length === 0}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {calculando ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4 mr-2" />
            )}
            Sugerir Preços com IA
          </Button>

          {regraCalculo.aplicar_por_setor && Object.keys(regraCalculo.markup_por_setor).length > 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-3">
                <p className="text-xs font-semibold text-green-900 mb-2">✅ Markup por Setor (IA):</p>
                <div className="space-y-1">
                  {Object.entries(regraCalculo.markup_por_setor).map(([setor, markup]) => (
                    <div key={setor} className="flex justify-between text-xs">
                      <span className="text-green-800">{setor}</span>
                      <span className="font-bold text-green-900">{markup.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {itensTabela.length > 0 && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">📊 Preview - Primeiros 5 Produtos</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-2">
              {itensTabela.slice(0, 5).map((item, idx) => (
                <div key={idx} className="p-2 bg-white rounded border text-sm">
                  <p className="font-semibold">{item.produto_descricao}</p>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {item.setor_atividade_nome && (
                      <Badge className="bg-indigo-100 text-indigo-700 text-xs">{item.setor_atividade_nome}</Badge>
                    )}
                    {item.grupo_produto_nome && (
                      <Badge className="bg-cyan-100 text-cyan-700 text-xs">{item.grupo_produto_nome}</Badge>
                    )}
                  </div>
                  <div className="flex gap-4 mt-1 text-xs">
                    <span>Custo: R$ {(item.custo_base || 0).toFixed(2)}</span>
                    <span className="text-green-700 font-semibold">Preço: R$ {(item.preco || 0).toFixed(2)}</span>
                    <span>Margem: {(item.margem_percentual || 0).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}