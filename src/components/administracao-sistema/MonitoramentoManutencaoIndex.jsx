import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import ContextoConfigBanner from "@/components/administracao-sistema/common/ContextoConfigBanner";
import HerancaConfigNotice from "@/components/administracao-sistema/common/HerancaConfigNotice";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import ProtectedSection from "@/components/security/ProtectedSection";
import ConfiguracaoBackup from "@/components/sistema/ConfiguracaoBackup";
import ConfiguracaoMonitoramento from "@/components/sistema/ConfiguracaoMonitoramento";
import MonitorAcessoRealtimeSection from "@/components/administracao-sistema/seguranca-governanca/MonitorAcessoRealtimeSection";
import PainelGovernancaSection from "@/components/administracao-sistema/seguranca-governanca/PainelGovernancaSection";
import { base44 } from "@/api/base44Client";
import { useUser } from "@/components/lib/UserContext";

export default function MonitoramentoManutencaoIndex({ initialTab = "monitoramento" }) {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const { user } = useUser();
  const [tab, setTab] = React.useState(initialTab);
  const grupoAtivoId = grupoAtual?.id || empresaAtual?.group_id || empresaAtual?.grupo_id || null;

  const handleTabChange = (next) => {
    setTab(next);
    try {
      base44.entities.AuditLog.create({
        usuario: user?.full_name || user?.email || "Usuario local",
        usuario_id: user?.id || null,
        empresa_id: empresaAtual?.id || null,
        group_id: grupoAtivoId || null,
        acao: "Visualizacao",
        modulo: "Monitoramento",
        entidade: "AdministracaoSistema",
        descricao: `Aba de monitoramento visualizada: ${next}`,
        data_hora: new Date().toISOString(),
      });
    } catch (error) {
      console.warn("Falha ao auditar aba de monitoramento:", error);
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full h-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="monitoramento">Monitoramento</TabsTrigger>
          <TabsTrigger value="backup">Backup</TabsTrigger>
          <TabsTrigger value="acesso">Acesso em Tempo Real</TabsTrigger>
          <TabsTrigger value="governanca">Governança</TabsTrigger>
        </TabsList>

        <TabsContent value="monitoramento" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <ProtectedSection module="Sistema" section={["Segurança","Monitoramento"]} action="visualizar">
                <ConfiguracaoMonitoramento empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
              </ProtectedSection>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <ProtectedSection module="Sistema" section={["Segurança","Backup"]} action="visualizar">
                <ConfiguracaoBackup empresaId={empresaAtual?.id} grupoId={grupoAtual?.id} />
              </ProtectedSection>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acesso" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <ProtectedSection module="Sistema" section={["Segurança","Monitoramento","AcessoRealtime"]} action="visualizar">
                <MonitorAcessoRealtimeSection />
              </ProtectedSection>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="governanca" className="mt-4">
          <Card className="w-full">
            <CardContent className="p-4">
              <ContextoConfigBanner />
              <HerancaConfigNotice />
              <ProtectedSection module="Sistema" section={["Segurança","Governança"]} action="visualizar">
                <PainelGovernancaSection />
              </ProtectedSection>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
