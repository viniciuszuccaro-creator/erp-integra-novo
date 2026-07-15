import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Package, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

/**
 * Componente que permite enviar itens de produção para a aba Itens (comercial)
 * Converte descrição técnica em descrição comercial
 * Aplica preço por KG ou unitário
 */
export default function EnviarProducaoParaItensButton({ 
  itensProducao = [],
  itensJaEnviados = [],
  precoPorKg = 0,
  onEnviar,
  onHistoricoAdd
}) {
  const [dialogAberto, setDialogAberto] = useState(false);
  const [precoPorKgCustom, setPrecoPorKgCustom] = useState(precoPorKg);
  const [itensSelecionados, setItensSelecionados] = useState([]);

  // Filtrar apenas itens não enviados
  const itensNaoEnviados = itensProducao.filter(item => !item.enviado_para_itens);

  const handleSelecionarTodos = () => {
    if (itensSelecionados.length === itensNaoEnviados.length) {
      setItensSelecionados([]);
    } else {
      setItensSelecionados(itensNaoEnviados.map((_, idx) => idx));
    }
  };

  const handleToggleItem = (idx) => {
    if (itensSelecionados.includes(idx)) {
      setItensSelecionados(itensSelecionados.filter(i => i !== idx));
    } else {
      setItensSelecionados([...itensSelecionados, idx]);
    }
  };

  const gerarDescricaoComercial = (item) => {
    let descricao = "";
    
    if (item.tipo_peca) {
      descricao += `${item.tipo_peca}`;
    }
    
    if (item.identificador) {
      descricao += ` ${item.identificador}`;
    }

    if (item.ferro_principal_bitola) {
      descricao += ` - Ferro Principal ${item.ferro_principal_bitola}`;
      if (item.ferro_principal_quantidade) {
        descricao += ` (${item.ferro_principal_quantidade} barras)`;
      }
    }

    if (item.estribo_bitola) {
      descricao += ` - Estribo ${item.estribo_bitola}`;
      if (item.estribo_distancia) {
        descricao += ` c/${item.estribo_distancia}cm`;
      }
    }

    if (item.peso_total_kg) {
      descricao += ` - ${item.peso_total_kg.toFixed(2)} kg`;
    }

    if (item.quantidade > 1) {
      descricao += ` (${item.quantidade} peças)`;
    }

    return descricao.trim() || "Item de Produção";
  };

  const handleEnviarSelecionados = () => {
    const itensParaEnviar = itensSelecionados.map(idx => {
      const item = itensNaoEnviados[idx];
      const descricaoComercial = gerarDescricaoComercial(item);
      const pesoTotal = item.peso_total_kg || 0;
      const precoTotal = pesoTotal * precoPorKgCustom;
      const custoTotal = item.custo_total || 0;
      const margemValor = precoTotal - custoTotal;
      const margemPercentual = precoTotal > 0 ? (margemValor / precoTotal) * 100 : 0;

      return {
        item_producao_id: item.identificador || `prod-${idx}`,
        descricao_comercial: descricaoComercial,
        peso_kg: pesoTotal,
        preco_por_kg: precoPorKgCustom,
        quantidade: item.quantidade || 1,
        preco_total: precoTotal,
        custo_total: custoTotal,
        margem_percentual: margemPercentual,
        margem_valor: margemValor
      };
    });

    onEnviar(itensParaEnviar);
    
    // Registrar no histórico
    onHistoricoAdd?.({
      acao: "item_producao_enviado",
      campo: "itens_producao_enviados_comercial",
      valor_novo: JSON.stringify({
        quantidade_itens: itensParaEnviar.length,
        preco_kg: precoPorKgCustom,
        valor_total: itensParaEnviar.reduce((sum, i) => sum + i.preco_total, 0)
      }),
      observacao: `${itensParaEnviar.length} itens de produção enviados para aba Itens com preço de R$ ${precoPorKgCustom.toFixed(2)}/kg`
    });

    setDialogAberto(false);
    setItensSelecionados([]);
  };

  if (itensNaoEnviados.length === 0) {
    return (
      <Card className="border-0 shadow-sm bg-slate-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-slate-600">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm">Todos os itens de produção já foram enviados para a aba Itens</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-blue-300 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Package className="w-6 h-6 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">
                  {itensNaoEnviados.length} itens de produção prontos para enviar
                </p>
                <p className="text-sm text-blue-700">
                  Envie para a aba Itens para incluir no valor do pedido
                </p>
              </div>
            </div>
            <Button
              onClick={() => setDialogAberto(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Enviar para Itens
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogAberto} onOpenChange={setDialogAberto}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-600" />
              Enviar Itens de Produção para Aba Itens
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <Card className="border-blue-300 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <DollarSign className="w-6 h-6 text-blue-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900 mb-2">Preço por KG</p>
                    <p className="text-sm text-blue-700 mb-3">
                      Defina o preço por KG que será aplicado aos itens de produção
                    </p>
                    <div className="flex items-center gap-3">
                      <Label className="text-blue-900">R$ /kg</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={precoPorKgCustom}
                        onChange={(e) => setPrecoPorKgCustom(parseFloat(e.target.value) || 0)}
                        className="w-32"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between mb-2">
              <Label>Selecione os itens a enviar:</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSelecionarTodos}
              >
                {itensSelecionados.length === itensNaoEnviados.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </Button>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {itensNaoEnviados.map((item, idx) => {
                const selecionado = itensSelecionados.includes(idx);
                const descricaoComercial = gerarDescricaoComercial(item);
                const pesoTotal = item.peso_total_kg || 0;
                const precoTotal = pesoTotal * precoPorKgCustom;
                const custoTotal = item.custo_total || 0;
                const margemValor = precoTotal - custoTotal;
                const margemPercentual = precoTotal > 0 ? (margemValor / precoTotal) * 100 : 0;

                return (
                  <Card
                    key={idx}
                    className={`cursor-pointer transition-all ${
                      selecionado ? 'border-blue-500 bg-blue-50' : 'hover:border-blue-300'
                    }`}
                    onClick={() => handleToggleItem(idx)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={selecionado}
                          onChange={() => {}}
                          className="mt-1 w-5 h-5"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900">{descricaoComercial}</p>
                          <div className="grid grid-cols-4 gap-3 mt-2 text-sm">
                            <div>
                              <p className="text-slate-600">Peso Total</p>
                              <p className="font-semibold">{pesoTotal.toFixed(2)} kg</p>
                            </div>
                            <div>
                              <p className="text-slate-600">Preço Total</p>
                              <p className="font-semibold text-green-600">
                                R$ {precoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600">Custo</p>
                              <p className="font-semibold text-slate-700">
                                R$ {custoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                            <div>
                              <p className="text-slate-600">Margem</p>
                              <p className={`font-semibold ${margemPercentual >= 10 ? 'text-green-600' : 'text-red-600'}`}>
                                {margemPercentual.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Resumo */}
            {itensSelecionados.length > 0 && (
              <Card className="border-0 shadow-md bg-green-50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-green-900">Resumo do Envio</p>
                      <p className="text-sm text-green-700 mt-1">
                        {itensSelecionados.length} itens selecionados | 
                        Peso total: {itensSelecionados.reduce((sum, idx) => sum + (itensNaoEnviados[idx].peso_total_kg || 0), 0).toFixed(2)} kg
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-700">Valor Total</p>
                      <p className="text-2xl font-bold text-green-900">
                        R$ {(itensSelecionados.reduce((sum, idx) => {
                          const peso = itensNaoEnviados[idx].peso_total_kg || 0;
                          return sum + (peso * precoPorKgCustom);
                        }, 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogAberto(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={handleEnviarSelecionados}
                disabled={itensSelecionados.length === 0 || precoPorKgCustom <= 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Enviar {itensSelecionados.length} Itens
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}