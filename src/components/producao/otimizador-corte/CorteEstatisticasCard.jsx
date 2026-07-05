import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, CheckCircle, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

/**
 * Card de estatísticas do plano de corte
 * Extraído de OtimizadorCorte.jsx
 */
export default function CorteEstatisticasCard({ estatisticas }) {
  return (
    <>
      <Card className="border-2 border-emerald-200 bg-emerald-50">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-600" />
            Resultado da Otimização
          </h4>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xs text-slate-600">Total de Cortes</p>
              <p className="text-2xl font-bold text-slate-900">{estatisticas.total_cortes}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-600">Barras Necessárias</p>
              <p className="text-2xl font-bold text-blue-600">{estatisticas.barras_usadas}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-600">Aproveitamento</p>
              <p className="text-2xl font-bold text-green-600">{estatisticas.aproveitamento_percentual}%</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <div>
              <p className="text-xs text-slate-600">Refugo Total</p>
              <p className="font-bold text-red-600">
                {estatisticas.total_refugo_cm} cm ({estatisticas.total_refugo_kg} kg)
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-600">Pontas Reutilizáveis</p>
              <p className="font-bold text-emerald-600">{estatisticas.pontas_reutilizaveis.length} unidades</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {parseFloat(estatisticas.economia_estimada) > 0 && (
        <Alert className="bg-green-100 border-green-300">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <AlertDescription>
            <strong>💰 Economia Potencial:</strong> R$ {estatisticas.economia_estimada} em material reaproveitável!
          </AlertDescription>
        </Alert>
      )}

      {estatisticas.aproveitamento_percentual < 75 && (
        <Alert className="bg-amber-100 border-amber-300">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <AlertDescription>
            <strong>⚠️ Atenção:</strong> Aproveitamento abaixo de 75%. Considere revisar as medidas ou agrupar com outros pedidos.
          </AlertDescription>
        </Alert>
      )}
    </>
  );
}