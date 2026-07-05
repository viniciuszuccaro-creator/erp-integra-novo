import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import ExportButton from "@/components/ExportButton";
import { Download } from "lucide-react";

export default function CanaisPerformanceTable({ metricas, totalGeralPedidos, CORES }) {
  const sorted = Object.values(metricas).sort((a, b) => b.totalPedidos - a.totalPedidos);

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Performance por Canal
          </CardTitle>
          <ExportButton
            data={Object.values(metricas).map((m) => ({
              Canal: m.nome,
              Tipo: m.tipo,
              Ativo: m.ativo ? "Sim" : "Não",
              "Total Pedidos": m.totalPedidos,
              "Valor Total": m.valorTotal,
              "Pedidos Aprovados": m.pedidosAprovados,
              "Taxa Conversão (%)": m.taxaConversao.toFixed(2),
              "Ticket Médio": m.ticketMedio.toFixed(2),
            }))}
            filename="performance-canais-origem"
            className="bg-green-600 hover:bg-green-700"
            data-permission="Cadastros.ParametroOrigemPedido.exportar"
            data-action="Cadastros.ParametroOrigemPedido.exportar"
            data-sensitive="true"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </ExportButton>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sorted.map((metrica, idx) => {
            const participacao = totalGeralPedidos > 0 ? (metrica.totalPedidos / totalGeralPedidos) * 100 : 0;
            return (
              <div key={idx} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CORES[metrica.cor] || "#3b82f6" }} />
                    <div>
                      <p className="font-semibold text-slate-900">{metrica.nome}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{metrica.tipo}</Badge>
                        {metrica.ativo ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" /> Ativo
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-100 text-gray-700 text-xs">
                            <AlertCircle className="w-3 h-3 mr-1" /> Inativo
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-6 text-right">
                    <div>
                      <p className="text-xs text-slate-600">Pedidos</p>
                      <p className="text-lg font-bold text-blue-600">{metrica.totalPedidos}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Valor Total</p>
                      <p className="text-lg font-bold text-green-600">R$ {(metrica.valorTotal / 1000).toFixed(1)}k</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Conversão</p>
                      <p className="text-lg font-bold text-purple-600">{metrica.taxaConversao.toFixed(0)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Ticket Médio</p>
                      <p className="text-lg font-bold text-orange-600">R$ {metrica.ticketMedio.toFixed(0)}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-slate-600 mb-1">
                    <span>Participação</span>
                    <span>{participacao.toFixed(1)}%</span>
                  </div>
                  <Progress value={participacao} className="h-2" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}