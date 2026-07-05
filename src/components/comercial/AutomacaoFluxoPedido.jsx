import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ShoppingCart } from "lucide-react";
import useAutomacaoFluxo from "@/components/comercial/automacao-fluxo/useAutomacaoFluxo";
import FluxoEtapas from "@/components/comercial/automacao-fluxo/FluxoEtapas";
import FluxoLogs from "@/components/comercial/automacao-fluxo/FluxoLogs";
import FluxoActions from "@/components/comercial/automacao-fluxo/FluxoActions";

/**
 * V21.6 - AUTOMAÇÃO COMPLETA DO FLUXO DE PEDIDO
 * Fluxo: Aprovação → Baixa Estoque → Financeiro → Logística → Status → NF-e
 */
export default function AutomacaoFluxoPedido({ pedido, onComplete, autoExecute = false, windowMode = false, empresaId = null }) {
  const { executando, etapaConcluida, progresso, logs, permitido, executarFluxoCompleto } =
    useAutomacaoFluxo(pedido, empresaId, onComplete, autoExecute);

  const containerClass = windowMode ? 'w-full h-full flex flex-col overflow-hidden' : 'space-y-6';
  const contentClass = windowMode ? 'flex-1 overflow-y-auto p-6 space-y-6' : 'space-y-6';
  const Wrapper = ({ children }) => windowMode
    ? <div className={containerClass}><div className={contentClass}>{children}</div></div>
    : <div className={containerClass}>{children}</div>;

  return (
    <Wrapper>
      <Card className="border-2 border-blue-400 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
              Automação do Fluxo de Pedido
            </CardTitle>
            <Badge className="bg-blue-600 text-white px-3 py-1">Pedido {pedido.numero_pedido}</Badge>
          </div>
          <p className="text-sm text-slate-600 mt-2">Sistema inteligente de fechamento automático</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Progresso do Fluxo</span>
              <span className="font-bold text-blue-600">{progresso}%</span>
            </div>
            <Progress value={progresso} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <FluxoEtapas etapaConcluida={etapaConcluida} executando={executando} />
      <FluxoLogs logs={logs} />
      <FluxoActions
        executando={executando}
        progresso={progresso}
        permitido={permitido}
        onExecutar={executarFluxoCompleto}
      />
    </Wrapper>
  );
}