import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scissors, Calculator } from "lucide-react";
import { useOtimizadorCorte } from "./otimizador-corte/useOtimizadorCorte";
import CorteEstatisticasCard from "./otimizador-corte/CorteEstatisticasCard";
import CortePlanoDetalhado from "./otimizador-corte/CortePlanoDetalhado";
import CortePontasReutilizaveis from "./otimizador-corte/CortePontasReutilizaveis";

/**
 * Otimizador de Corte (Nesting) — Refatorado em hook + 3 sub-componentes (Regra-Mãe)
 */
export default function OtimizadorCorte({ itens, onOtimizacaoCalculada }) {
  const {
    tamanhoBarraPadrao, setTamanhoBarraPadrao,
    otimizacao, calculando,
    calcularOtimizacao, salvarPontasNoEstoque
  } = useOtimizadorCorte({ itens, onOtimizacaoCalculada });

  return (
    <Card className="w-full h-full">
      <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50">
        <CardTitle className="flex items-center gap-2">
          <Scissors className="w-5 h-5 text-emerald-600" />
          Otimizador de Corte (Nest)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tamanho Barra Padrão (cm)</Label>
              <Input type="number" value={tamanhoBarraPadrao}
                onChange={(e) => setTamanhoBarraPadrao(parseInt(e.target.value))} placeholder="1200" />
              <p className="text-xs text-slate-500 mt-1">Padrão: 1200cm (12 metros)</p>
            </div>
            <div className="flex items-end">
              <Button onClick={calcularOtimizacao} disabled={calculando}
                className="w-full bg-emerald-600 hover:bg-emerald-700">
                {calculando ? (
                  <><Calculator className="w-4 h-4 mr-2 animate-spin" />Calculando...</>
                ) : (
                  <><Calculator className="w-4 h-4 mr-2" />Calcular Otimização</>
                )}
              </Button>
            </div>
          </div>

          {otimizacao && (
            <>
              <CorteEstatisticasCard estatisticas={otimizacao.estatisticas} />
              <CortePlanoDetalhado barras={otimizacao.barras} />
              <CortePontasReutilizaveis pontas={otimizacao.estatisticas.pontas_reutilizaveis} onSave={salvarPontasNoEstoque} />
            </>
          )}

          {!otimizacao && (
            <div className="text-center py-8 text-slate-500">
              <Calculator className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Clique em "Calcular Otimização" para ver o plano de corte ideal</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}