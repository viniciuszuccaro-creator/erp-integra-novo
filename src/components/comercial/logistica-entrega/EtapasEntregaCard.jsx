import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, Plus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle } from "lucide-react";

export default function EtapasEntregaCard({
  etapas,
  totalItens,
  totalItensAlocados,
  onCriarEtapa,
  onRemoverEtapa,
}) {
  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="bg-blue-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Etapas de Entrega / Faturamento Parcial
          </CardTitle>
          <Button
            onClick={onCriarEtapa}
            data-permission="Comercial.Pedido.editar"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar Nova Etapa
          </Button>
        </div>
        <p className="text-xs text-blue-700 mt-1">
          💡 Divida o pedido em etapas para: produção, faturamento e entrega separados
        </p>
      </CardHeader>
      <CardContent className="p-4">
        {etapas.length === 0 ? (
          <Alert className="border-slate-200 bg-slate-50">
            <AlertDescription className="text-sm text-slate-600">
              Nenhuma etapa criada. Clique em "Criar Nova Etapa" para dividir o pedido.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {etapas.map((etapa) => (
              <div
                key={etapa.id}
                className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="bg-blue-600">Etapa {etapa.sequencia}</Badge>
                      <h3 className="font-bold text-slate-900">{etapa.nome_etapa}</h3>
                    </div>
                    {etapa.descricao_etapa && (
                      <p className="text-xs text-slate-600">{etapa.descricao_etapa}</p>
                    )}
                  </div>
                  <Badge
                    className={
                      etapa.status_etapa === "Faturada"
                        ? "bg-green-600"
                        : etapa.status_etapa === "Em Produção"
                        ? "bg-orange-600"
                        : "bg-slate-600"
                    }
                  >
                    {etapa.status_etapa}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-3">
                  <div className="bg-white p-2 rounded border text-center">
                    <p className="text-xs text-slate-600">Itens</p>
                    <p className="text-lg font-bold text-blue-600">{etapa.quantidade_total_itens}</p>
                  </div>
                  <div className="bg-white p-2 rounded border text-center">
                    <p className="text-xs text-slate-600">Peso (KG)</p>
                    <p className="text-lg font-bold text-purple-600">
                      {etapa.peso_total_etapa_kg?.toFixed(2) || "0.00"}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded border text-center">
                    <p className="text-xs text-slate-600">Valor</p>
                    <p className="text-lg font-bold text-green-600">
                      R$ {(etapa.valor_total_etapa || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded border text-center">
                    <p className="text-xs text-slate-600">Previsão</p>
                    <p className="text-sm font-semibold text-slate-700">
                      {etapa.data_prevista_entrega
                        ? new Date(etapa.data_prevista_entrega).toLocaleDateString("pt-BR")
                        : "-"}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    onClick={() => onRemoverEtapa(etapa.id)}
                    data-permission="Comercial.Pedido.editar"
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300"
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}

            <div className="p-3 bg-green-50 rounded border border-green-200 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-green-800">
                  ✅ {totalItensAlocados} de {totalItens} itens alocados em etapas
                </span>
                {totalItensAlocados === totalItens && (
                  <Badge className="bg-green-600">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    100% Alocado
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}