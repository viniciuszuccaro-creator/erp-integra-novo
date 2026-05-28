import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import usePermissions from "@/components/lib/usePermissions";
import ProtectedSection from "@/components/security/ProtectedSection";

export default function ModuleTabs({ listagem, cadastro = null, relatorio = null, defaultValue = "listagem", className = "", moduleName = null, cadastroSection = "Cadastro", relatorioSection = "Relatório" }) {
  const { hasPermission } = usePermissions();
  const canViewCadastro = cadastro && (moduleName ? hasPermission(moduleName, cadastroSection, 'visualizar') : true);
  const canViewRelatorio = relatorio && (moduleName ? hasPermission(moduleName, relatorioSection, 'visualizar') : true);

  // Compute safe defaultValue: if no cadastro/relatorio exist, fall back to listagem
  const safeDefault = (defaultValue === "cadastro" && !canViewCadastro) || (defaultValue === "relatorio" && !canViewRelatorio)
    ? "listagem"
    : defaultValue;

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden ${className}`}>
      <Tabs defaultValue={safeDefault} className="w-full h-full flex flex-col overflow-hidden">
        {(canViewCadastro || canViewRelatorio) && (
          <TabsList className="shrink-0 w-full justify-start sticky top-0 z-10 bg-white/70 backdrop-blur-sm">
            <TabsTrigger value="listagem">Listagem</TabsTrigger>
            {canViewCadastro && <TabsTrigger value="cadastro">{cadastroSection}</TabsTrigger>}
            {canViewRelatorio && <TabsTrigger value="relatorio">{relatorioSection}</TabsTrigger>}
          </TabsList>
        )}
        <div className="flex-1 min-h-0 overflow-auto px-2 sm:px-3 py-2">
          <TabsContent value="listagem" className="m-0 h-full">
            {listagem}
          </TabsContent>
          {canViewCadastro && (
            <TabsContent value="cadastro" className="m-0 h-full">
              {cadastro}
            </TabsContent>
          )}
          {canViewRelatorio && (
            <TabsContent value="relatorio" className="m-0 h-full">
              {relatorio}
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}