import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ShieldCheck, DollarSign } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import useCentralAprovacoes from "@/components/comercial/central-aprovacoes/useCentralAprovacoes";
import AprovacoesKPIs from "@/components/comercial/central-aprovacoes/AprovacoesKPIs";
import AprovacoesTable from "@/components/comercial/central-aprovacoes/AprovacoesTable";

/**
 * 🔐 CENTRAL DE APROVAÇÕES V21.6
 * Gerenciamento unificado de aprovações (descontos, crédito, duplicatas)
 * Refatorado para usar hook + sub-componentes (Regra-Mãe)
 */
function CentralAprovacoesManager({ windowMode = false, initialTab = "descontos", empresaId = null }) {
  const {
    activeTab, setActiveTab: _setActiveTab, permitido,
    pedidosPendentes, pedidosAprovados, pedidosNegados,
    aprovarPedidoMutation, negarPedidoMutation,
  } = useCentralAprovacoes(empresaId);

  const [tab] = useState(initialTab);
  const currentTab = tab || activeTab;

  const containerClass = windowMode
    ? 'w-full h-full flex flex-col overflow-hidden'
    : 'space-y-6';
  const contentClass = windowMode ? 'flex-1 overflow-y-auto p-6' : '';

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {!permitido && (
          <Alert className="border-red-300 bg-red-50 mb-6">
            <Shield className="w-4 h-4 text-red-600" />
            <AlertDescription>
              <p className="font-semibold text-red-900">🔒 Acesso Negado</p>
              <p className="text-sm text-red-700 mt-1">
                Apenas <strong>Administradores</strong> e <strong>Gerentes</strong> podem acessar a Central de Aprovações.
              </p>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-orange-600" />
              Central de Aprovações V21.6
            </h2>
            <p className="text-slate-600 text-sm">Gerencie aprovações com fechamento automático integrado</p>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={() => {}} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="descontos">Descontos</TabsTrigger>
            <TabsTrigger value="limite">Limite de Crédito</TabsTrigger>
            <TabsTrigger value="duplicatas">Duplicatas Vencidas</TabsTrigger>
          </TabsList>

          <TabsContent value="descontos">
            <AprovacoesKPIs
              pendentes={pedidosPendentes.length}
              aprovados={pedidosAprovados.length}
              negados={pedidosNegados.length}
            />
            <AprovacoesTable
              pendentes={pedidosPendentes}
              historico={[...pedidosAprovados, ...pedidosNegados]}
              permitido={permitido}
              onAprovar={(params) => aprovarPedidoMutation.mutate(params)}
              onNegar={(params) => negarPedidoMutation.mutate(params)}
            />
          </TabsContent>

          <TabsContent value="limite">
            <Card className="border-0 shadow-md mt-4">
              <CardHeader className="bg-purple-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  Aprovações de Limite de Crédito
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-slate-600">
                <p>Funcionalidade em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="duplicatas">
            <Card className="border-0 shadow-md mt-4">
              <CardHeader className="bg-red-50 border-b">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  Aprovações de Duplicatas Vencidas
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 text-slate-600">
                <p>Funcionalidade em desenvolvimento.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default CentralAprovacoesManager;