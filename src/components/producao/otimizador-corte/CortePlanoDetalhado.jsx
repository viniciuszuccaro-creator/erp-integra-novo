import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

/**
 * Plano de corte detalhado por barra com visualização gráfica
 * Extraído de OtimizadorCorte.jsx
 */
export default function CortePlanoDetalhado({ barras }) {
  return (
    <Card className="border-2 border-slate-200">
      <CardHeader className="bg-slate-50 pb-3">
        <CardTitle className="text-base">Plano de Corte Detalhado</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {barras.map((barra, index) => {
            const usado = barra.cortes.reduce((s, c) => s + c.comprimento, 0);
            const sobra = barra.tamanho_padrao - usado;
            const aproveitamento = ((usado / barra.tamanho_padrao) * 100).toFixed(1);

            return (
              <Card key={index} className="border">
                <CardContent className="p-3">
                  <div className="flex justify-between items-center mb-2">
                    <h5 className="font-semibold">Barra #{barra.numero}</h5>
                    <div className="flex gap-2">
                      <Badge className="bg-blue-600">{barra.cortes.length} cortes</Badge>
                      <Badge className={aproveitamento > 80 ? 'bg-green-600' : 'bg-amber-600'}>{aproveitamento}%</Badge>
                    </div>
                  </div>

                  <div className="relative h-8 bg-slate-200 rounded overflow-hidden mb-2">
                    {barra.cortes.map((corte, idx) => {
                      const percentual = (corte.comprimento / barra.tamanho_padrao) * 100;
                      return (
                        <div key={idx}
                          className="absolute h-full bg-emerald-500 border-r-2 border-white"
                          style={{
                            left: `${barra.cortes.slice(0, idx).reduce((sum, c) => sum + ((c.comprimento / barra.tamanho_padrao) * 100), 0)}%`,
                            width: `${percentual}%`
                          }}
                          title={`${corte.posicao}: ${corte.comprimento}cm`}
                        />
                      );
                    })}
                    {sobra > 0 && (
                      <div className="absolute h-full bg-red-300"
                        style={{ right: 0, width: `${(sobra / barra.tamanho_padrao) * 100}%` }}
                        title={`Sobra: ${sobra}cm`}
                      />
                    )}
                  </div>

                  <div className="text-xs space-y-1">
                    {barra.cortes.map((corte, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{corte.posicao} - {corte.elemento}</span>
                        <span className="font-mono">{corte.comprimento} cm</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1 border-t font-bold">
                      <span>Sobra:</span>
                      <span className={sobra > 100 ? 'text-green-600' : 'text-red-600'}>
                        {sobra} cm {sobra > 100 && '✓ Reutilizável'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}