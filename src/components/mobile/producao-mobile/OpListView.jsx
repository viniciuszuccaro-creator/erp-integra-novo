import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Factory, Package, AlertCircle, QrCode } from "lucide-react";

export default function OpListView({ user, ops, isLoading, onSelectOp, onEscanearQR }) {
  return (
    <div className="w-full h-full overflow-auto min-h-screen bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-blue-600 text-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Factory className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">Apontamento</h1>
                <p className="text-blue-100 text-sm">Chão de Fábrica</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-blue-100">Operador</p>
              <p className="font-semibold">{user?.full_name}</p>
            </div>
          </div>
          <div className="mt-4">
            <Button
              onClick={onEscanearQR}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              size="lg"
            >
              <QrCode className="w-5 h-5 mr-2" />
              Escanear QR para iniciar
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <Card className="bg-white/90">
              <CardContent className="p-8 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Carregando ordens...</p>
              </CardContent>
            </Card>
          ) : ops.length === 0 ? (
            <Card className="bg-white/90">
              <CardContent className="p-12 text-center text-slate-500">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">Nenhuma OP disponível</p>
                <p className="text-sm mt-2">Aguarde novas ordens de produção</p>
              </CardContent>
            </Card>
          ) : (
            ops.map(op => (
              <Card
                key={op.id}
                className="bg-white/95 hover:bg-white cursor-pointer transition-all"
                onClick={() => onSelectOp(op)}
              >
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">{op.numero_op}</p>
                      <p className="text-sm text-slate-600">Pedido: {op.numero_pedido}</p>
                    </div>
                    <Badge className={
                      op.prioridade === 'Urgente' ? 'bg-red-500' :
                      op.prioridade === 'Alta' ? 'bg-orange-500' :
                      'bg-slate-500'
                    }>
                      {op.prioridade}
                    </Badge>
                  </div>

                  <p className="font-semibold text-slate-900 mb-2">{op.cliente_nome}</p>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${op.percentual_conclusao || 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-blue-600">
                      {op.percentual_conclusao || 0}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <Badge variant="outline">{op.status}</Badge>
                    <span className="text-slate-600">
                      {op.itens_producao?.length || 0} itens
                    </span>
                  </div>

                  {op.alerta_falta_estoque && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <span className="text-xs text-red-700">Falta material</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}