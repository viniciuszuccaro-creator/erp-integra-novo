import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import BIAssistantInsight from "./BIAssistantInsight";

export default function BIAssistantCard({ kpis }) {
  const { crescimentoVendas, clientesComRiscoChurn, contasAtrasadas, opsEmProducao, entregasPendentes } = kpis;
  const hasAlerts =
    crescimentoVendas < -10 ||
    crescimentoVendas > 20 ||
    clientesComRiscoChurn > 0 ||
    contasAtrasadas > 0 ||
    opsEmProducao > 10 ||
    entregasPendentes > 5;

  return (
    <Card className="border-2 border-purple-300 bg-gradient-to-r from-purple-50 to-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Sugestões da IA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <BIAssistantInsight
            show={crescimentoVendas < -10}
            color="red"
            icon="📉"
            title={`Queda de ${Math.abs(crescimentoVendas)}% nas vendas`}
            action="Ativar campanhas promocionais, contatar clientes inativos"
          />
          <BIAssistantInsight
            show={crescimentoVendas > 20}
            color="green"
            icon="📈"
            title={`Crescimento de ${crescimentoVendas}%!`}
            action="Aumentar estoque de produtos mais vendidos"
          />
          <BIAssistantInsight
            show={clientesComRiscoChurn > 0}
            color="orange"
            icon="⚠️"
            title={`${clientesComRiscoChurn} cliente(s) com risco de churn`}
            action="Contato proativo, ofertas personalizadas"
          />
          <BIAssistantInsight
            show={contasAtrasadas > 0}
            color="red"
            icon="💰"
            title={`${contasAtrasadas} conta(s) atrasada(s)`}
            action="Ativar régua de cobrança, negociar condições"
          />
          <BIAssistantInsight
            show={opsEmProducao > 10}
            color="blue"
            icon="🏭"
            title={`${opsEmProducao} OPs em produção simultâneas`}
            action="Redistribuir cargas, verificar gargalos"
          />
          <BIAssistantInsight
            show={entregasPendentes > 5}
            color="green"
            icon="🚚"
            title={`${entregasPendentes} entrega(s) em logística`}
            action="Roteirização inteligente, consolidar por região"
          />
          {!hasAlerts && (
            <div className="text-center py-6 text-slate-500">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <p className="font-semibold text-green-900">Tudo funcionando! 🎉</p>
              <p className="text-sm mt-1">Sem ações urgentes detectadas.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}