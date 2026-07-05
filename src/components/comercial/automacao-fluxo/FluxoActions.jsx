import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertTriangle, ArrowRight, Loader2 } from "lucide-react";

export default function FluxoActions({ executando, progresso, permitido, onExecutar }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-slate-900">Pronto para executar?</p>
            <p className="text-sm text-slate-600">
              Este processo irá: baixar estoque, gerar financeiro, criar logística e atualizar status
            </p>
            {!permitido && (
              <p className="text-xs text-red-600 mt-1">⚠️ Você não tem permissão para executar esta ação</p>
            )}
          </div>
          <Button
            onClick={onExecutar}
            disabled={executando || progresso === 100 || !permitido}
            data-permission="Comercial.Pedido.fechamento"
            data-action="Comercial.Pedido.fechamento"
            data-sensitive="true"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 shadow-lg"
            size="lg"
          >
            {executando ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Executando...</>
            ) : progresso === 100 ? (
              <><CheckCircle2 className="w-5 h-5 mr-2" />Concluído</>
            ) : (
              <><ArrowRight className="w-5 h-5 mr-2" />🚀 Executar Fluxo Completo</>
            )}
          </Button>
        </div>

        {progresso === 100 && (
          <Alert className="mt-4 border-green-300 bg-green-50">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <AlertDescription>
              <p className="font-semibold text-green-900">✅ Fluxo concluído com sucesso!</p>
              <p className="text-sm text-green-700 mt-1">Pedido pronto para faturamento. Próximo passo: Gerar NF-e</p>
            </AlertDescription>
          </Alert>
        )}

        {!permitido && (
          <Alert className="mt-4 border-red-300 bg-red-50">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <AlertDescription>
              <p className="font-semibold text-red-900">🔒 Acesso Negado</p>
              <p className="text-sm text-red-700 mt-1">
                Apenas <strong>Administradores</strong> e <strong>Gerentes</strong> podem executar o fechamento automático.
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}