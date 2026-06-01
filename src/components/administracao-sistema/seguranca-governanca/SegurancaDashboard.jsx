import React, { useState } from "react";
import DashboardSeguranca from "@/components/sistema/DashboardSeguranca";
import SecurityMetricsPanel from "./SecurityMetricsPanel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Activity } from "lucide-react";

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
      </Tabs>
    </div>
  );
}