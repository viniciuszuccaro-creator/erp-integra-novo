import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Layers, Database, Rocket } from "lucide-react";
import DocsVisaoGeral from "@/components/sistema/documentacao/DocsVisaoGeral";
import DocsPadroesTecnicos from "@/components/sistema/documentacao/DocsPadroesTecnicos";
import DocsCadastrosBlocos from "@/components/sistema/documentacao/DocsCadastrosBlocos";
import DocsRoadmapBacklog from "@/components/sistema/documentacao/DocsRoadmapBacklog";

/**
 * Documentação do ERP Zuccaro
 * Refatorada nos componentes de ./components/sistema/documentacao (Regra-Mãe #3).
 */
export default function Documentacao() {
  const [activeTab, setActiveTab] = useState("visao-geral");

  return (
    <div className="w-full h-full min-h-screen p-4 md:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <BookOpen className="w-7 h-7 text-blue-600" />
            Documentação ERP Zuccaro V22.1
          </h1>
          <p className="text-slate-600 text-sm md:text-base">
            Guia completo: arquitetura, padrões técnicos, multiempresa, RBAC e roadmap de evolução
          </p>
        </div>
        <div className="flex gap-2 flex-wrap lg:justify-end">
          <Badge className="bg-green-600 text-white">ETAPA 2 100%</Badge>
          <Badge className="bg-blue-600 text-white">ETAPA 3 100%</Badge>
          <Badge className="bg-purple-600 text-white">SDK 0.8.23</Badge>
          <Badge className="bg-cyan-600 text-white">V22.1 FINAL</Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-white border shadow-sm flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="visao-geral">
            <BookOpen className="w-4 h-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="padroes">
            <Layers className="w-4 h-4 mr-2" />
            Padrões Técnicos
          </TabsTrigger>
          <TabsTrigger value="cadastros">
            <Database className="w-4 h-4 mr-2" />
            Cadastros
          </TabsTrigger>
          <TabsTrigger value="roadmap">
            <Rocket className="w-4 h-4 mr-2" />
            Roadmap v4.0
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="mt-4">
          <DocsVisaoGeral />
        </TabsContent>
        <TabsContent value="padroes" className="mt-4">
          <DocsPadroesTecnicos />
        </TabsContent>
        <TabsContent value="cadastros" className="mt-4">
          <DocsCadastrosBlocos />
        </TabsContent>
        <TabsContent value="roadmap" className="mt-4">
          <DocsRoadmapBacklog />
        </TabsContent>
      </Tabs>
    </div>
  );
}