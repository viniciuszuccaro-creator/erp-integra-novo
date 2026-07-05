import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Scan, MapPin, CheckCircle } from "lucide-react";
import useSeparacaoConferenciaIA from "./separacao-ia/useSeparacaoConferenciaIA";
import SeparacaoKPIs from "./separacao-ia/SeparacaoKPIs";
import SeparacaoItensList from "./separacao-ia/SeparacaoItensList";

export default function SeparacaoConferenciaIA({ pedidoId, onClose, windowMode = false }) {
  const h = useSeparacaoConferenciaIA(pedidoId, onClose);
  const containerClass = windowMode ? "w-full h-full flex flex-col overflow-auto" : "space-y-6";

  return (
    <div className={containerClass}>
      <div className={windowMode ? "p-6 space-y-6 flex-1" : "space-y-6"}>
        {/* Header */}
        <Card className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Separação e Conferência IA</CardTitle>
                <CardDescription className="text-purple-100">
                  Pedido: {h.pedido?.numero_pedido} • Cliente: {h.pedido?.cliente_nome}
                </CardDescription>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold font-mono">{h.formatarTempo(h.cronometro.segundos)}</div>
                <Badge variant="secondary" className="mt-2">
                  {h.separacao.itens_separados.length}/{h.pedido?.itens_revenda?.length || 0} itens
                </Badge>
              </div>
            </div>
          </CardHeader>
        </Card>

        <SeparacaoKPIs desempenho={h.desempenho} divergenciasCount={h.separacao.divergencias.length} />

        {/* Scanner */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scan className="w-5 h-5" />
              Scanner de Código de Barras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Escaneie ou digite o código..."
                value={h.codigoBarras}
                onChange={(e) => h.setCodigoBarras(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && h.handleScanCodigoBarras()}
                className="text-lg"
                autoFocus
              />
              <Button
                data-permission="Expedicao.Separacao.executar"
                onClick={h.handleScanCodigoBarras}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <Scan className="w-4 h-4 mr-2" />
                Escanear
              </Button>
              <Button
                data-permission="Expedicao.Separacao.executar"
                onClick={h.handleOtimizarRota}
                variant="outline"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Otimizar Rota IA
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Rota otimizada */}
        {h.separacao.rota_otimizada_ia.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Rota Otimizada por IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {h.separacao.rota_otimizada_ia.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded">
                    <Badge>{item.ordem}</Badge>
                    <div className="flex-1">
                      <div className="font-medium">{item.produto}</div>
                      <div className="text-sm text-slate-600">{item.localizacao}</div>
                    </div>
                    <div className="text-sm text-slate-500">{item.distancia_estimada_m}m</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <SeparacaoItensList
          itensSeparados={h.separacao.itens_separados}
          divergencias={h.separacao.divergencias}
        />

        {/* Ações */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            onClick={h.finalizarSeparacao}
            disabled={h.separacao.itens_separados.length === 0}
            className="bg-green-600 hover:bg-green-700"
            data-permission="Expedicao.Separacao.finalizar"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Finalizar Separação
          </Button>
        </div>
      </div>
    </div>
  );
}