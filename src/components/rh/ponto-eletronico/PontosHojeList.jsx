import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, AlertTriangle } from "lucide-react";

export default function PontosHojeList({ pontosHoje }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Registros de Hoje
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pontosHoje.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            Nenhum ponto registrado hoje
          </div>
        ) : (
          <div className="space-y-2">
            {pontosHoje.slice(0, 10).map((ponto, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      ponto.tipo === "entrada"
                        ? "default"
                        : ponto.tipo === "saida"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {ponto.tipo}
                  </Badge>
                  <div>
                    <div className="font-medium">{ponto.colaborador_nome}</div>
                    <div className="text-sm text-slate-600">
                      {new Date(ponto.data_hora).toLocaleTimeString("pt-BR")}
                    </div>
                  </div>
                </div>
                {ponto.requer_aprovacao && (
                  <Badge variant="destructive">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Requer aprovação
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}