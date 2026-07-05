import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Map, MapPin, Package } from "lucide-react";
import useRoteirizacaoMapa from "./roteirizacao-mapa/useRoteirizacaoMapa";
import EntregasDisponiveisList from "./roteirizacao-mapa/EntregasDisponiveisList";
import RotaOtimizadaResult from "./roteirizacao-mapa/RotaOtimizadaResult";

export default function RoteirizacaoMapa({ entregas, motoristas, veiculos, windowMode = false }) {
  const h = useRoteirizacaoMapa(entregas, motoristas, veiculos);
  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6";

  return (
    <div className={containerClass}>
      <div className={windowMode ? "p-6 space-y-6 flex-1" : "space-y-6"}>
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Map className="w-6 h-6 text-blue-600" />
              Planejamento de Rotas
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Selecione entregas, otimize a sequência e gere um romaneio
            </p>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  <Package className="w-4 h-4 inline mr-1" />
                  <strong>{h.entregasPendentes.length}</strong> entrega(s) pendente(s)
                </p>
                {h.entregasPendentes.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1">
                    Peso total aproximado:{" "}
                    {h.entregasPendentes.reduce((sum, e) => sum + (e.peso_total_kg || 0), 0).toFixed(2)} kg
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <EntregasDisponiveisList
            entregasPendentes={h.entregasPendentes}
            entregasSelecionadas={h.entregasSelecionadas}
            rotaOtimizada={h.rotaOtimizada}
            onSelecionar={h.handleSelecionarEntrega}
          />

          {/* Configuração */}
          <Card className="border-0 shadow-md lg:col-span-2">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-base">Configuração da Rota</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Motorista *</Label>
                  <Select value={h.motoristaSelecionado} onValueChange={h.setMotoristaSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {motoristas?.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.nome_completo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Veículo *</Label>
                  <Select value={h.veiculoSelecionado} onValueChange={h.setVeiculoSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {veiculos?.map((v) => (
                        <SelectItem key={v.id} value={v.id}>
                          {v.modelo} - {v.placa}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Entregas selecionadas */}
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <p className="font-semibold text-blue-900 mb-2">
                    {h.entregasSelecionadas.length} entrega(s) selecionada(s)
                  </p>
                  {h.entregasSelecionadas.length > 0 && (
                    <div className="flex gap-2 flex-wrap max-h-40 overflow-y-auto">
                      {h.entregasSelecionadas.map((e) => (
                        <Badge key={e.id} variant="outline" className="text-xs px-2 py-1 flex items-center">
                          #{h.rotaOtimizada?.pontos.find((p) => p.id === e.id)?.sequencia || (h.entregasSelecionadas.findIndex((sel) => sel.id === e.id) + 1)} - {e.cliente_nome}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Otimizar */}
              <Button
                onClick={h.handleOtimizarRota}
                disabled={h.entregasSelecionadas.length === 0 || h.isOptimizing}
                className="w-full bg-purple-600 hover:bg-purple-700"
                size="lg"
                data-permission="Expedicao.Rota.otimizar"
              >
                {h.isOptimizing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Otimizando...
                  </>
                ) : (
                  <>
                    <MapPin className="w-5 h-5 mr-2" />
                    🚀 Otimizar Rota
                  </>
                )}
              </Button>

              <RotaOtimizadaResult
                rotaOtimizada={h.rotaOtimizada}
                motoristaSelecionado={h.motoristaSelecionado}
                veiculoSelecionado={h.veiculoSelecionado}
                onGerarRomaneio={h.handleGerarRomaneio}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}