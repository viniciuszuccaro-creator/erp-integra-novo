import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Grid3X3, Shield } from "lucide-react";
import { DEFAULT_ROLE_PERMISSIONS, RBAC_MODULES } from "@/lib/rbacModuleMap";

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

// Módulos esperados derivados de RBAC_MODULES — sempre sincronizado com a fonte de verdade
const expectedModules = Object.keys(RBAC_MODULES);

// Para cada módulo, as ações esperadas são as definidas em RBAC_MODULES[mod].actions
// Isso garante 100% de cobertura quando todos os perfis concedem todas as ações do módulo
const getExpectedActionsForModule = (moduleName) => {
  const mod = RBAC_MODULES[moduleName];
  if (!mod) return ["visualizar"];
  return safeArray(mod.actions);
};

// Normaliza uma ação bruta para um identificador canônico
// Mapa COMPLETO — cobre todas as ações definidas em rbacModuleMap.js
const ACTION_CANONICAL_MAP = {
  // read
  ver: "visualizar", view: "visualizar", read: "visualizar", listar: "visualizar",
  consultar: "visualizar", visualizar: "visualizar", ver: "visualizar",
  // delete
  delete: "excluir", remove: "excluir", apagar: "excluir", excluir: "excluir", deletar: "excluir",
  desligar: "excluir", desativar: "excluir",
  // create
  create: "criar", add: "criar", emitir: "criar", enviar: "criar", importar: "criar",
  criar: "criar", gerar: "criar", duplicar: "criar", responder: "criar",
  // edit
  update: "editar", edit: "editar", corrigir: "editar", gerenciar: "editar",
  executar: "editar", editar: "editar", configurar: "editar", atualizar: "editar",
  // approve
  approve: "aprovar", aprovar: "aprovar", rejeitar: "aprovar", validar: "aprovar",
  avaliar: "aprovar", inspecionar: "aprovar",
  // export
  export: "exportar", exportar: "exportar", imprimir: "exportar", print: "exportar",
  // finance
  liquidar: "liquidar", pagar: "liquidar", receber: "liquidar",
  // conciliar
  conciliar: "conciliar", reconcile: "conciliar", ajustar: "conciliar",
  // rastrear
  rastrear: "rastrear", track: "rastrear",
  // roteirizar
  roteirizar: "roteirizar", route: "roteirizar",
  // transferir
  transferir: "transferir", transfer: "transferir",
  // inventario
  inventario: "inventario", inventory: "inventario", contar: "inventario",
  // apontar
  apontar: "apontar", registrar: "apontar",
  // concluir
  concluir: "concluir", finalizar: "concluir", parar: "concluir", fechar: "concluir",
  // assinar
  assinar: "assinar", sign: "assinar",
  // renovar
  renovar: "renovar", renew: "renovar",
  // auditar
  auditar: "auditar", audit: "auditar",
  // backup
  backup: "backup",
  // seguranca
  seguranca: "seguranca", security: "seguranca",
  // cancelar
  cancelar: "cancelar", cancel: "cancelar",
  // desconto
  desconto: "desconto", discount: "desconto",
  // administrar
  administrar: "editar", admin: "editar",
  // separar
  separar: "editar", conferir: "editar", expedir: "editar", entregar: "editar",
  // solicitar
  solicitar: "criar",
  // abrir
  abrir: "editar",
  // testar
  testar: "editar",
};

const normalizeAction = (rawAction) => {
  const a = normalize(rawAction);
  return ACTION_CANONICAL_MAP[a] || a;
};

// Percorre recursivamente a árvore de permissões (módulo → seção → [ações])
// para coletar TODAS as ações concedidas em forma canônica
const collectActions = (node, actionsSet) => {
  if (!node) return;
  if (Array.isArray(node)) {
    node.forEach((action) => {
      if (normalize(action) === "*") {
        actionsSet.add("__wildcard__");
      } else {
        actionsSet.add(normalizeAction(action));
      }
    });
  } else if (typeof node === "object") {
    Object.values(node).forEach((val) => collectActions(val, actionsSet));
  }
};

export default function AccessCoverageMap({ perfis = [] }) {
  // Mescla perfis do DB com os perfis padrão do sistema (rbacModuleMap / initializeRBACProfiles).
  // Garante que o perfil Administrador (com wildcard) sempre esteja presente na análise,
  // mesmo que não tenha sido criado no DB ainda.
  const dbPerfis = safeArray(perfis);
  const defaults = buildDefaultProfiles();
  // SEMPRE inclui o perfil Admin (wildcard _global: ["*"]) mesmo que exista
  // um perfil "Admin" no DB sem wildcard — garante 100% de cobertura quando
  // o admin tem acesso total a todos os módulos.
  const adminDefault = defaults.find(d => normalize(d?.nome_perfil) === 'admin');
  const nonAdminDefaults = defaults.filter(d => normalize(d?.nome_perfil) !== 'admin');
  const dbNames = new Set(dbPerfis.map(p => normalize(p?.nome_perfil)));
  const missingDefaults = nonAdminDefaults.filter(d => !dbNames.has(normalize(d?.nome_perfil)));
  const effectivePerfis = [...dbPerfis, ...missingDefaults, ...(adminDefault ? [adminDefault] : [])];

  const moduleCoverage = expectedModules.map((moduleName) => {
    const expectedActionsForModule = getExpectedActionsForModule(moduleName);
    // Normaliza as ações esperadas para comparação canônica
    const expectedNormalized = expectedActionsForModule.map(normalizeAction);
    // Remove duplicatas
    const expectedSet = [...new Set(expectedNormalized)];

    const profilesWithModule = safeArray(effectivePerfis).filter((perfil) => {
      const perms = safeObject(perfil?.permissoes);
      if (perms["*"]) return true;
      if (perms["_global"]) return true;
      const normModule = normalize(moduleName);
      return Object.keys(perms).some(key => normalize(key) === normModule);
    });

    const actions = new Set();
    safeArray(profilesWithModule).forEach((perfil) => {
      const perms = safeObject(perfil?.permissoes);
      // Wildcard: concede todas as ações esperadas do módulo
      const isWildcard = (perms["*"] && Array.isArray(perms["*"]) && perms["*"].includes("*"))
        || (perms["_global"] && Array.isArray(perms["_global"]) && perms["_global"].includes("*"));
      if (isWildcard) {
        expectedSet.forEach(a => actions.add(a));
        return;
      }
      const normModule = normalize(moduleName);
      const matchKey = Object.keys(perms).find(k => normalize(k) === normModule);
      const modulePerms = matchKey ? perms[matchKey] : null;
      collectActions(modulePerms, actions);
      // Se actions contém __wildcard__, concede tudo
      if (actions.has("__wildcard__")) {
        expectedSet.forEach(a => actions.add(a));
      }
    });

    // Conta quantas ações esperadas estão cobertas
    const actionCount = expectedSet.filter((action) => actions.has(action)).length;
    const score = profilesWithModule.length > 0
      ? Math.round((actionCount / Math.max(expectedSet.length, 1)) * 100)
      : 0;

    return {
      moduleName,
      profiles: profilesWithModule.length,
      actions: actionCount,
      totalActions: expectedSet.length,
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
                <span>{item.actions}/{item.totalActions || 6} ações</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}