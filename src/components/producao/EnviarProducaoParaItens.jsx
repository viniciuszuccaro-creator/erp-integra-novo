import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Package, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function EnviarProducaoParaItens({ itensProducao, onEnviar }) {
  const [enviando, setEnviando] = useState(false);
  const { toast } = useToast();

  // Calcular totais por tipo
  const calcularTotais = () => {
    const totais = {
      corte_dobra: { kg: 0, itens: 0 },
      armado: { kg: 0, itens: 0 },
      bloco: { kg: 0, itens: 0 },
      total_kg: 0,
      total_aco_kg: 0,
      total_arame_kg: 0
    };

    itensProducao.forEach(item => {
      const tipo = item.tipo_servico;
      const pesoTotal = item.peso_total || 0;
      
      if (tipo === 'corte_dobra' && item.posicoes) {
        const kgCorte = item.posicoes.reduce((sum, pos) => sum + (pos.peso_total || 0), 0);
        totais.corte_dobra.kg += kgCorte;
        totais.corte_dobra.itens += item.posicoes.length;
        totais.total_aco_kg += kgCorte;
      } else if (tipo === 'armado') {
        totais.armado.kg += pesoTotal;
        totais.armado.itens += item.quantidade || 1;
        totais.total_aco_kg += (item.peso_ferro_principal || 0) + (item.peso_estribos || 0);
        totais.total_arame_kg += item.peso_arame_recozido || 0;
      } else if (tipo === 'bloco') {
        totais.bloco.kg += pesoTotal;
        totais.bloco.itens += item.quantidade || 1;
        totais.total_aco_kg += pesoTotal * 0.95; // Aproximação
        totais.total_arame_kg += pesoTotal * 0.05;
      }
    });

    totais.total_kg = totais.corte_dobra.kg + totais.armado.kg + totais.bloco.kg;
    
    return totais;
  };

  const totais = calcularTotais();

  const handleEnviar = async () => {
    setEnviando(true);

    try {
      // Criar itens para adicionar ao pedido
      const itensParaPedido = [];

      // Item 1: Aço (Corte/Dobra + Ferro de Armado)
      if (totais.total_aco_kg > 0) {
        itensParaPedido.push({
          produto_id: "PRODUCAO_ACO",
          codigo_sku: "PROD-ACO",
          descricao: "Produção - Aço (Corte/Dobra/Armado)",
          unidade: "KG",
          quantidade: parseFloat(totais.total_aco_kg.toFixed(2)),
          preco_unitario: 8.50, // Buscar de ConfiguracaoProducao
          desconto_percentual: 0,
          desconto_valor: 0,
          valor_item: totais.total_aco_kg * 8.50,
          tipo_item: "producao_aco",
          detalhes_producao: {
            corte_dobra_kg: totais.corte_dobra.kg,
            armado_kg: totais.armado.kg,
            bloco_kg: totais.bloco.kg
          }
        });
      }

      // Item 2: Arame Recozido (Armado)
      if (totais.total_arame_kg > 0) {
        itensParaPedido.push({
          produto_id: "PRODUCAO_ARAME",
          codigo_sku: "PROD-ARAME",
          descricao: "Produção - Arame Recozido",
          unidade: "KG",
          quantidade: parseFloat(totais.total_arame_kg.toFixed(2)),
          preco_unitario: 12.00, // Buscar de ConfiguracaoProducao
          desconto_percentual: 0,
          desconto_valor: 0,
          valor_item: totais.total_arame_kg * 12.00,
          tipo_item: "producao_arame"
        });
      }

      // Chamar callback
      await onEnviar(itensParaPedido);

      toast({
        title: "✅ Itens Adicionados!",
        description: `${totais.total_kg.toFixed(2)} KG adicionados aos itens do pedido`
      });
    } catch (error) {
      toast({
        title: "❌ Erro ao Enviar",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setEnviando(false);
    }
  };

  if (itensProducao.length === 0) {
    return (
      <Card className="border-orange-200 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="w-5 h-5" />
            <p className="text-sm">Adicione itens de produção para enviá-los aos itens do pedido</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Resumo da Produção
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                {totais.corte_dobra.kg > 0 && (
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-slate-600">Corte/Dobra</p>
                    <p className="text-xl font-bold text-blue-600">{totais.corte_dobra.kg.toFixed(2)} kg</p>
                    <p className="text-xs text-slate-500">{totais.corte_dobra.itens} posições</p>
                  </div>
                )}

                {totais.armado.kg > 0 && (
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-slate-600">Armado</p>
                    <p className="text-xl font-bold text-indigo-600">{totais.armado.kg.toFixed(2)} kg</p>
                    <p className="text-xs text-slate-500">{totais.armado.itens} peças</p>
                  </div>
                )}

                {totais.bloco.kg > 0 && (
                  <div className="p-3 bg-white rounded-lg border">
                    <p className="text-xs text-slate-600">Bloco</p>
                    <p className="text-xl font-bold text-purple-600">{totais.bloco.kg.toFixed(2)} kg</p>
                    <p className="text-xs text-slate-500">{totais.bloco.itens} peças</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border-2 border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Total em KG</p>
                  <p className="text-3xl font-bold text-green-600">{totais.total_kg.toFixed(2)} kg</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-600">Aço: {totais.total_aco_kg.toFixed(2)} kg</p>
                  <p className="text-xs text-slate-600">Arame: {totais.total_arame_kg.toFixed(2)} kg</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-600">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span>Serão criados {totais.total_arame_kg > 0 ? '2 itens' : '1 item'} na aba "Itens Revenda"</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              onClick={handleEnviar}
              disabled={enviando || totais.total_kg === 0}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 min-w-[200px]"
              size="lg"
            >
              {enviando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  Adicionar aos Itens
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-slate-500 max-w-[200px]">
              Os itens de produção serão convertidos em KG e adicionados aos itens comerciais do pedido
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}