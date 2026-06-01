import React from "react";
import DashboardSeguranca from "@/components/sistema/DashboardSeguranca";
import SecurityMetricsPanel from "./SecurityMetricsPanel";
import Fase1StatusCard from "./Fase1StatusCard";
import Fase2StatusCard from "./Fase2StatusCard";
import Fase3StatusCard from "./Fase3StatusCard";
import Fase4StatusCard from "./Fase4StatusCard";
import Fase5StatusCard from "./Fase5StatusCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Activity, CheckSquare, Building2, GitMerge, MessageCircle, Globe } from "lucide-react";

export default function SegurancaDashboard() {
  return (
    <div className="w-full h-full flex flex-col gap-0">
      <Tabs defaultValue="metricas" className="w-full h-full flex flex-col">
        <div className="px-4 pt-3 border-b">
          <TabsList className="h-8">
            <TabsTrigger value="metricas" className="text-xs gap-1.5">
              <Activity className="w-3.5 h-3.5" /> Métricas em Tempo Real
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="text-xs gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Governança & Perfis
            </TabsTrigger>
            <TabsTrigger value="fase1" className="text-xs gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" /> Fase 1 — Segurança
            </TabsTrigger>
            <TabsTrigger value="fase2" className="text-xs gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Fase 2 — Multi-empresa
            </TabsTrigger>
            <TabsTrigger value="fase3" className="text-xs gap-1.5">
              <GitMerge className="w-3.5 h-3.5" /> Fase 3 — Orquestração
            </TabsTrigger>
            <TabsTrigger value="fase4" className="text-xs gap-1.5">
              <MessageCircle className="w-3.5 h-3.5" /> Fase 4 — Omnicanal
            </TabsTrigger>
            <TabsTrigger value="fase5" className="text-xs gap-1.5">
              <Globe className="w-3.5 h-3.5" /> Fase 5 — Marketplace
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="metricas" className="flex-1 overflow-auto p-4 mt-0">
          <SecurityMetricsPanel />
        </TabsContent>
        <TabsContent value="dashboard" className="flex-1 overflow-auto mt-0">
          <DashboardSeguranca
            estatisticas={{ cobertura: 0, totalUsuarios: 0, conflitosTotal: 0 }}
            usuarios={[]}
            auditoriaAcessos={[]}
          />
        </TabsContent>
        <TabsContent value="fase1" className="flex-1 overflow-auto p-4 mt-0">
          <Fase1StatusCard />
        </TabsContent>
        <TabsContent value="fase2" className="flex-1 overflow-auto p-4 mt-0">
          <Fase2StatusCard />
        </TabsContent>
        <TabsContent value="fase3" className="flex-1 overflow-auto p-4 mt-0">
          <Fase3StatusCard />
        </TabsContent>
        <TabsContent value="fase4" className="flex-1 overflow-auto p-4 mt-0">
          <Fase4StatusCard />
        </TabsContent>
        <TabsContent value="fase5" className="flex-1 overflow-auto p-4 mt-0">
          <Fase5StatusCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}