import React from "react";
import { Button } from "@/components/ui/button";
import RBACButton from "@/components/lib/RBACButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, MessageCircle, Mail, Settings } from "lucide-react";
import { useConfigExpedicao } from "./configuracao-expedicao/useConfigExpedicao";
import TabTransportadora from "./configuracao-expedicao/TabTransportadora";
import TabWhatsApp from "./configuracao-expedicao/TabWhatsApp";
import TabEmailEGeral from "./configuracao-expedicao/TabEmailEGeral";

/**
 * Configuração de Integrações de Expedição
 * P2: Multi-tenant — usa filterInContext
 * Refatorado em hook + 3 sub-componentes (Regra-Mãe)
 */
export default function ConfiguracaoExpedicao({ empresaId }) {
  const {
    configTransportadora, setConfigTransportadora,
    configWhatsApp, setConfigWhatsApp,
    configEmail, setConfigEmail,
    salvarMutation
  } = useConfigExpedicao({ empresaId });

  return (
    <div className="space-y-6 w-full h-full">
      <Tabs defaultValue="transportadora">
        <TabsList className="bg-white border shadow-sm">
          <TabsTrigger value="transportadora"><Truck className="w-4 h-4 mr-2" />Transportadoras</TabsTrigger>
          <TabsTrigger value="whatsapp"><MessageCircle className="w-4 h-4 mr-2" />WhatsApp</TabsTrigger>
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" />E-mail</TabsTrigger>
          <TabsTrigger value="geral"><Settings className="w-4 h-4 mr-2" />Geral</TabsTrigger>
        </TabsList>

        <TabsContent value="transportadora" className="space-y-4">
          <TabTransportadora config={configTransportadora} setConfig={setConfigTransportadora} />
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-4">
          <TabWhatsApp config={configWhatsApp} setConfig={setConfigWhatsApp} />
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <TabEmailEGeral configEmail={configEmail} setConfigEmail={setConfigEmail} />
        </TabsContent>

        <TabsContent value="geral" className="space-y-4">
          <TabEmailEGeral configEmail={configEmail} setConfigEmail={setConfigEmail} />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <RBACButton module="Expedicao" action="salvar" onClick={() => salvarMutation.mutate()} disabled={salvarMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700">
          {salvarMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </RBACButton>
      </div>
    </div>
  );
}