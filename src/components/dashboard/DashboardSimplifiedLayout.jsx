import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardEssentialKPIs from "./DashboardEssentialKPIs";
import DashboardOperacionalBI from "./DashboardOperacionalBI";
import DashboardFinanceiroResumo from "./DashboardFinanceiroResumo";
import ErrorBoundary from "@/components/lib/ErrorBoundary";

export default function DashboardSimplifiedLayout({
  kpis,
  operacional,
  financeiro,
  canSeeOperacional,
  canSeeFinanceiro,
}) {
  return (
    <div className="w-full h-full flex flex-col bg-slate-50 overflow-hidden">
      {/* KPI Strip — 6 essenciais sempre visíveis */}
      <div className="p-4 border-b bg-white shadow-sm overflow-x-auto">
        <ErrorBoundary>
          <DashboardEssentialKPIs {...kpis} />
        </ErrorBoundary>
      </div>

      {/* Tabs para detalhes por módulo */}
      <div className="flex-1 overflow-hidden p-4">
        <Tabs defaultValue="operacional" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            {canSeeOperacional && <TabsTrigger value="operacional">📊 Operacional</TabsTrigger>}
            {canSeeFinanceiro && <TabsTrigger value="financeiro">💰 Financeiro</TabsTrigger>}
          </TabsList>

          {canSeeOperacional && (
            <TabsContent value="operacional" className="flex-1 overflow-auto">
              <ErrorBoundary>
                <DashboardOperacionalBI {...operacional} />
              </ErrorBoundary>
            </TabsContent>
          )}

          {canSeeFinanceiro && (
            <TabsContent value="financeiro" className="flex-1 overflow-auto">
              <ErrorBoundary>
                <DashboardFinanceiroResumo {...financeiro} />
              </ErrorBoundary>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}