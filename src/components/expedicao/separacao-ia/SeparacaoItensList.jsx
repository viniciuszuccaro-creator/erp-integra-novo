import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Package, AlertTriangle } from "lucide-react";

export default function SeparacaoItensList({ itensSeparados, divergencias }) {
  return (
    <>
      {/* Itens separados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Itens Separados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {itensSeparados.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              Nenhum item separado ainda. Use o scanner acima.
            </div>
          ) : (
            <div className="space-y-2">
              {itensSeparados.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium">{item.descricao}</div>
                      <div className="text-sm text-slate-600">
                        Qtd: {item.quantidade_separada}/{item.quantidade_pedida} • Peso: {item.peso_conferido}kg
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline">✓ Conferido</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Divergências */}
      {divergencias.length > 0 && (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              Divergências Detectadas pela IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {divergencias.map((div, idx) => (
                <div key={idx} className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-red-800">{div.item}</div>
                  <div className="text-sm text-red-600 mt-1">
                    Risco: <Badge variant="destructive">{div.validacao?.risco}</Badge>
                  </div>
                  {div.validacao?.acoes_sugeridas && (
                    <div className="mt-2 text-sm">
                      <strong>Ações sugeridas:</strong>
                      <ul className="list-disc ml-5 mt-1">
                        {div.validacao.acoes_sugeridas.map((acao, i) => (
                          <li key={i}>{acao}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}