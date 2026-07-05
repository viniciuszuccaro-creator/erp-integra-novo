import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

export default function EntregasDisponiveisList({
  entregasPendentes,
  entregasSelecionadas,
  rotaOtimizada,
  onSelecionar,
}) {
  return (
    <Card className="border-0 shadow-md lg:col-span-1">
      <CardHeader className="bg-slate-50 border-b">
        <CardTitle className="text-base">
          Entregas Disponíveis ({entregasPendentes.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-2 max-h-[600px] overflow-y-auto">
        {entregasPendentes.length === 0 ? (
          <p className="text-sm text-slate-500 text-center">
            Nenhuma entrega disponível para roteirização.
          </p>
        ) : (
          entregasPendentes.map((entrega) => {
            const selecionada = entregasSelecionadas.find((e) => e.id === entrega.id);
            return (
              <Card
                key={entrega.id}
                className={`cursor-pointer transition-all ${
                  selecionada
                    ? "border-2 border-blue-500 bg-blue-50"
                    : "border hover:border-blue-300"
                }`}
                onClick={() => onSelecionar(entrega)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{entrega.cliente_nome}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {entrega.endereco_entrega_completo?.logradouro}, {entrega.endereco_entrega_completo?.numero} - {entrega.endereco_entrega_completo?.cidade || "Endereço incompleto"}
                      </p>
                      {selecionada && (
                        <Badge className="mt-2 text-xs bg-blue-600">
                          #{rotaOtimizada?.pontos.find((p) => p.id === entrega.id)?.sequencia || (entregasSelecionadas.findIndex((e) => e.id === entrega.id) + 1)}
                        </Badge>
                      )}
                    </div>
                    {selecionada && (
                      <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}