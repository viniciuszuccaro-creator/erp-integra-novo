import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, FileText } from "lucide-react";

export default function RotaOtimizadaResult({
  rotaOtimizada,
  motoristaSelecionado,
  veiculoSelecionado,
  onGerarRomaneio,
}) {
  if (!rotaOtimizada) return null;

  return (
    <Card className="border-green-300 bg-green-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-600 rounded-lg">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold text-green-900">Rota Otimizada!</p>
            <p className="text-sm text-green-700">Algoritmo: {rotaOtimizada.algoritmo}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-green-700">Entregas:</p>
            <p className="text-xl font-bold text-green-900">{rotaOtimizada.pontos.length}</p>
          </div>
          <div>
            <p className="text-xs text-green-700">Distância:</p>
            <p className="text-xl font-bold text-green-900">{rotaOtimizada.distancia_total_km.toFixed(1)} km</p>
          </div>
          <div>
            <p className="text-xs text-green-700">Tempo:</p>
            <p className="text-xl font-bold text-green-900">
              {Math.floor(rotaOtimizada.tempo_estimado_minutos / 60)}h {rotaOtimizada.tempo_estimado_minutos % 60}min
            </p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-green-300">
          <p className="font-semibold text-green-900 mb-3">Sequência Otimizada:</p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {rotaOtimizada.pontos.map((ponto) => (
              <div key={ponto.id} className="flex items-center gap-3 p-2 bg-white rounded">
                <Badge className="bg-green-600">#{ponto.sequencia}</Badge>
                <div className="flex-1">
                  <p className="font-medium text-sm">{ponto.cliente_nome}</p>
                  <p className="text-xs text-slate-600">
                    {ponto.endereco_entrega_completo?.cidade || "Cidade não informada"}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-600">
                  {ponto.distancia_anterior_km > 0 && (
                    <span>+{ponto.distancia_anterior_km.toFixed(1)} km</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <Button
          data-permission="Expedicao.Romaneio.gerar"
          onClick={onGerarRomaneio}
          disabled={!motoristaSelecionado || !veiculoSelecionado}
          className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
          data-permission="Expedicao.Romaneio.criar"
        >
          <FileText className="w-4 h-4 mr-2" />
          Gerar Romaneio e Criar Rota
        </Button>
      </CardContent>
    </Card>
  );
}