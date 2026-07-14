import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import usePermissions from "@/components/lib/usePermissions";
import SegurancaDashboard from "@/components/administracao-sistema/seguranca-governanca/SegurancaDashboard";
import IAGovernancaComplianceSection from "@/components/administracao-sistema/seguranca-governanca/IAGovernancaComplianceSection";
import MonitoramentoManutencaoIndex from "@/components/administracao-sistema/MonitoramentoManutencaoIndex";
import ConfiguracaoSeguranca from "@/components/sistema/ConfiguracaoSeguranca";
import IAOtimizacaoIndex from "@/components/administracao-sistema/IAOtimizacaoIndex";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";

export default function SegurancaGovernancaIndex() {
  const { isAdmin } = usePermissions();
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const params = new URLSearchParams(window.location.search);
  const segTab = params.get('segTab') || 'politicas';
  const [activeTab, setActiveTab] = React.useState(segTab);

  const handleTabChange = (value) => {
    setActiveTab(value);
    const nextParams = new URLSearchParams(window.location.search);
    nextParams.set('tab', 'seguranca');
    nextParams.set('segTab', value);
    window.history.replaceState(null, '', `${window.location.pathname}?${nextParams.toString()}`);
  };

  if (!isAdmin()) return <div className="p-4 text-sm text-slate-500">Acesso restrito.</div>;

  return (
    <div className="w-full h-full min-h-0 flex flex-col overflow-auto">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-full min-h-0">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="politicas">Políticas</TabsTrigger>
          <TabsTrigger value="manutencao">Monitoramento & Manutenção</TabsTrigger>
          <TabsTrigger value="compliance">Compliance IA</TabsTrigger>
          <TabsTrigger value="ia" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">✦ IA & Otimização</TabsTrigger>
        </TabsList>

        <TabsContent value="politicas" className="mt-4 w-full h-full min-h-0">
          <Card className="w-full h-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <ConfiguracaoSeguranca empresaId={empresaAtual?.id || null} grupoId={grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null} />
              <SegurancaDashboard />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manutencao" className="mt-4 w-full h-full min-h-0">
          <Card className="w-full h-full">
            <CardContent className="p-4">
              <MonitoramentoManutencaoIndex />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="mt-4 w-full h-full min-h-0">
          <Card className="w-full h-full">
            <CardContent className="p-4">
              <IAGovernancaComplianceSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ia" className="mt-4 w-full h-full min-h-0">
          <IAOtimizacaoIndex />
        </TabsContent>
      </Tabs>
    </div>
  );
}