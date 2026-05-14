import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Grid3X3, Shield } from "lucide-react";

const safeArray = (value) => Array.isArray(value) ? value : [];
const safeObject = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};

const expectedModules = ["Dashboard", "CRM", "Comercial", "Estoque", "Compras", "Financeiro", "Fiscal", "RH", "Expedição", "Produção", "Sistema"];
const expectedActions = ["visualizar", "criar", "editar", "excluir", "aprovar", "exportar"];

export default function AccessCoverageMap({ perfis = [] }) {
  const moduleCoverage = expectedModules.map((moduleName) => {
    const profilesWithModule = safeArray(perfis).filter((perfil) => {
      const perms = safeObject(perfil?.permissoes);
      // Busca exata ou case-insensitive no objeto de permissões
      return Object.keys(perms).some(
        key => key === moduleName || key.toLowerCase() === moduleName.toLowerCase()
      );
    });
    
    const actions = new Set();
    profilesWithModule.forEach((perfil) => {
      const perms = safeObject(perfil?.permissoes);
      const modulePerms = perms[moduleName] || perms[Object.keys(perms).find(k => k.toLowerCase() === moduleName.toLowerCase())];
      
      if (Array.isArray(modulePerms)) {
        modulePerms.forEach((action) => {
          const normalized = action === "ver" ? "visualizar" : action;
          actions.add(normalized);
        });
      }
    });

    const actionCount = expectedActions.filter((action) => actions.has(action)).length;
    const score = profilesWithModule.length > 0 ? Math.round((actionCount / expectedActions.length) * 100) : 0;

    return {
      moduleName,
      profiles: profilesWithModule.length,
      actions: actionCount,
      score,
    };
  });

  const overall = moduleCoverage.length
    ? Math.round(moduleCoverage.reduce((sum, item) => sum + item.score, 0) / moduleCoverage.length)
    : 0;

  return (
    <Card className="w-full">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-semibold text-slate-900">Mapa de Cobertura RBAC</h3>
          </div>
          <Badge className={overall >= 80 ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>{overall}% cobertura</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
          {moduleCoverage.map((item) => (
            <div key={item.moduleName} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Shield className="w-4 h-4 text-slate-500 flex-shrink-0" />
                  <p className="text-sm font-medium text-slate-900 truncate">{item.moduleName}</p>
                </div>
                {item.score >= 80 && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
              </div>
              <div className="mt-3 h-2 rounded-full bg-white overflow-hidden border border-slate-200">
                <div className="h-full bg-blue-600" style={{ width: `${item.score}%` }} />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>{item.profiles} perfil(is)</span>
                <span>{item.actions}/{expectedActions.length} ações</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}