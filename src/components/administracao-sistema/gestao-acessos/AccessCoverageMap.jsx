import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Grid3X3, Shield } from "lucide-react";
import { DEFAULT_ROLE_PERMISSIONS } from "@/lib/rbacModuleMap";

const safeArray = (value) => Array.isArray(value) ? value : [];
const safeObject = (value) => value && typeof value === "object" && !Array.isArray(value) ? value : {};
const normalize = (str) => String(str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

// Converte DEFAULT_ROLE_PERMISSIONS em objetos PerfilAcesso para usar como baseline
const buildDefaultProfiles = () => {
  return Object.entries(DEFAULT_ROLE_PERMISSIONS).map(([roleKey, perms]) => ({
    nome_perfil: roleKey.charAt(0).toUpperCase() + roleKey.slice(1),
    permissoes: perms,
    ativo: true,
  }));
};

// Percorre recursivamente a árvore de permissões (módulo → seção → [ações])
// para coletar TODAS as ações concedidas, independente do nível de aninhamento.
const collectActions = (node, actionsSet) => {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((action) => {
      const normAction = normalize(action);
      if (normAction === "ver" || normAction === "view" || normAction === "read" || normAction === "listar" || normAction === "consultar") actionsSet.add("visualizar");
      else if (normAction === "delete" || normAction === "remove" || normAction === "apagar") actionsSet.add("excluir");
      else if (normAction === "create" || normAction === "add" || normAction === "emitir" || normAction === "enviar" || normAction === "importar") actionsSet.add("criar");
      else if (normAction === "update" || normAction === "edit" || normAction === "corrigir" || normAction === "gerenciar" || normAction === "executar") actionsSet.add("editar");
      else if (normAction === "approve" || normAction === "aprovar") actionsSet.add("aprovar");
      else if (normAction === "export" || normAction === "exportar" || normAction === "imprimir" || normAction === "print") actionsSet.add("exportar");
      else if (normAction === "*") {
        // Wildcard: concede todas as ações esperadas
        expectedActions.forEach(a => actionsSet.add(a));
      } else {
        actionsSet.add(action);
      }
    });
  } else if (typeof node === "object") {
    Object.values(node).forEach((val) => collectActions(val, actionsSet));
  }
};

const expectedModules = [
  "Dashboard", "CRM", "Comercial", "Estoque", "Compras", "Financeiro", "Fiscal",
  "RH", "Expedição", "Produção", "Sistema", "Cadastros", "Agenda", "Relatórios",
  "Contratos", "HubAtendimento"
];
const expectedActions = ["visualizar", "criar", "editar", "excluir", "aprovar", "exportar"];

export default function AccessCoverageMap({ perfis = [] }) {
  // Se não há perfis no DB, usa os perfis padrão do initializeRBACProfiles como baseline
  // (eles representam a cobertura esperada do sistema)
  const effectivePerfis = safeArray(perfis).length > 0 ? perfis : buildDefaultProfiles();

  const moduleCoverage = expectedModules.map((moduleName) => {
    const profilesWithModule = safeArray(effectivePerfis).filter((perfil) => {
      const perms = safeObject(perfil?.permissoes);
      // Wildcard "*" cobre todos os módulos (formato do initializeRBACProfiles: { "*": ["*"] })
      if (perms["*"]) return true;
      // Wildcard "_global" (formato do rbacModuleMap: { _global: ["*"] })
      if (perms["_global"]) return true;
      // Busca exata, case-insensitive e accent-insensitive
      const normModule = normalize(moduleName);
      return Object.keys(perms).some(key => normalize(key) === normModule);
    });
    
    const actions = new Set();
    safeArray(profilesWithModule).forEach((perfil) => {
      const perms = safeObject(perfil?.permissoes);
      // Wildcard: "*" com ["*"] concede todas as ações (formato initializeRBACProfiles)
      if (perms["*"] && Array.isArray(perms["*"]) && perms["*"].includes("*")) {
        expectedActions.forEach(a => actions.add(a));
        return;
      }
      // Wildcard: "_global" com ["*"] concede todas as ações (formato rbacModuleMap)
      if (perms["_global"] && Array.isArray(perms["_global"]) && perms["_global"].includes("*")) {
        expectedActions.forEach(a => actions.add(a));
        return;
      }
      const normModule = normalize(moduleName);
      const matchKey = Object.keys(perms).find(k => normalize(k) === normModule);
      const modulePerms = matchKey ? perms[matchKey] : null;

      // Coleta ações recursivamente — a estrutura é módulo → seção → [ações]
      collectActions(modulePerms, actions);
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