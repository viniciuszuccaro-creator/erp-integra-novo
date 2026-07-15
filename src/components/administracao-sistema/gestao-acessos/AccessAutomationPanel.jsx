import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { Bot, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";

export default function AccessAutomationPanel({ accessScope }) {
  const [running, setRunning] = useState(null);
  const [lastResult, setLastResult] = useState(null);

  const runAutomation = async (name, functionName) => {
    setRunning(name);
    const res = await base44.functions.invoke(functionName, {
      group_id: accessScope?.groupId || null,
      empresa_id: accessScope?.empresaId || null,
      scope: accessScope?.scope || "atual",
      __sensitive: true,
    });
    setLastResult({ name, data: res?.data || {} });
    toast.success(`${name} executado com sucesso.`);
    setRunning(null);
  };

  return (
    <Card className="w-full border-purple-200 bg-purple-50/40">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-purple-700" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Automação Inteligente de Acessos</h3>
              <p className="text-xs text-slate-500">Executa rotinas existentes de otimização, segurança e alertas no escopo atual.</p>
            </div>
          </div>
          <Badge className="bg-purple-100 text-purple-700">IA + Governança</Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            disabled={!!running || !accessScope?.contextoValido}
            onClick={() => runAutomation("Otimizador de permissões", "permissionOptimizer")}
            data-action="RBAC.automation.permissionOptimizer"
            data-sensitive="true"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {running === "Otimizador de permissões" ? "Otimizando..." : "Otimizar Permissões"}
          </Button>
          <Button
            variant="outline"
            disabled={!!running || !accessScope?.contextoValido}
            onClick={() => runAutomation("Alertas de segurança", "securityAlerts")}
            data-action="RBAC.automation.securityAlerts"
            data-sensitive="true"
          >
            <ShieldCheck className="w-4 h-4 mr-2" />
            {running === "Alertas de segurança" ? "Analisando..." : "Analisar Alertas"}
          </Button>
        </div>

        {lastResult && (
          <div className="rounded-lg border border-purple-200 bg-white p-3 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">Última execução: {lastResult.name}</p>
            <p className="mt-1 break-words">Resultado registrado para o escopo atual.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}