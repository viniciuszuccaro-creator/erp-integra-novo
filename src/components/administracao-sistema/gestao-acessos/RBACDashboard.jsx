import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, CheckCircle2, AlertCircle, Lock } from "lucide-react";
import { RBAC_PERMISSIONS, ROLE_PERMISSIONS } from "@/lib/rbacHelpers";

/**
 * RBACDashboard v2.0
 * Visualização simplificada do mapa de permissões RBAC
 * Gestores visualizam quem tem acesso ao quê
 */

const ROLE_LABELS = {
  admin: { label: "Administrador", color: "bg-red-100 text-red-700 border-red-200" },
  gerente: { label: "Gerente", color: "bg-purple-100 text-purple-700 border-purple-200" },
  operacional: { label: "Operacional", color: "bg-blue-100 text-blue-700 border-blue-200" },
  analista: { label: "Analista", color: "bg-green-100 text-green-700 border-green-200" },
  user: { label: "Usuário", color: "bg-slate-100 text-slate-700 border-slate-200" },
};

const MODULES = Object.keys(RBAC_PERMISSIONS);

export default function RBACDashboard() {
  const [selectedRole, setSelectedRole] = useState("gerente");
  const [selectedModule, setSelectedModule] = useState(null);

  const rolePerms = selectedRole === "admin" ? { all: true } : ROLE_PERMISSIONS[selectedRole];
  const canAccessModule = (mod) =>
    selectedRole === "admin" || (rolePerms?.modules || []).includes(mod);

  const getActions = (mod) => {
    if (selectedRole === "admin") return ["criar", "editar", "deletar", "visualizar", "aprovar", "exportar", "emitir"];
    if (!canAccessModule(mod)) return [];
    return rolePerms?.actions || [];
  };

  const actionColor = (a) => {
    const map = {
      criar: "bg-green-100 text-green-700",
      editar: "bg-blue-100 text-blue-700",
      deletar: "bg-red-100 text-red-700",
      visualizar: "bg-slate-100 text-slate-700",
      aprovar: "bg-purple-100 text-purple-700",
      exportar: "bg-yellow-100 text-yellow-700",
      emitir: "bg-orange-100 text-orange-700",
      liquidar: "bg-teal-100 text-teal-700",
    };
    return map[a] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="w-full h-full space-y-4">
      {/* ─ Título ─ */}
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Mapa de Permissões RBAC</h2>
      </div>

      {/* ─ Seletor de Role ─ */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(ROLE_LABELS).map(([role, { label, color }]) => (
          <button
            key={role}
            onClick={() => setSelectedRole(role)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              selectedRole === role
                ? color + " ring-2 ring-offset-1 ring-blue-400"
                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ─ Sumário do Role ─ */}
      <Card className="bg-slate-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">
                {ROLE_LABELS[selectedRole]?.label}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {selectedRole === "admin" ? (
                <Badge className="bg-red-100 text-red-700 text-xs">Acesso Total</Badge>
              ) : (
                <>
                  <span className="text-xs text-slate-500">
                    {(rolePerms?.modules || []).length} módulo(s)
                  </span>
                  <span className="text-xs text-slate-400">·</span>
                  <span className="text-xs text-slate-500">
                    {(rolePerms?.actions || []).join(", ")}
                  </span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ─ Mapa de Módulos ─ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {MODULES.map((mod) => {
          const allowed = canAccessModule(mod);
          const actions = getActions(mod);
          return (
            <button
              key={mod}
              onClick={() => setSelectedModule(selectedModule === mod ? null : mod)}
              className={`text-left p-3 rounded-lg border-2 transition-all ${
                allowed
                  ? "border-green-200 bg-green-50 hover:border-green-400"
                  : "border-slate-200 bg-slate-50 opacity-60"
              } ${selectedModule === mod ? "ring-2 ring-blue-400" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm text-slate-900">{mod}</span>
                {allowed ? (
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </div>
              {allowed && actions.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {actions.slice(0, 4).map((action) => (
                    <span
                      key={action}
                      className={`text-xs px-1.5 py-0.5 rounded ${actionColor(action)}`}
                    >
                      {action}
                    </span>
                  ))}
                  {actions.length > 4 && (
                    <span className="text-xs text-slate-500">+{actions.length - 4}</span>
                  )}
                </div>
              )}
              {!allowed && (
                <p className="text-xs text-slate-500">Sem acesso</p>
              )}
            </button>
          );
        })}
      </div>

      {/* ─ Detalhe do Módulo Selecionado ─ */}
      {selectedModule && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              Seções em {selectedModule}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(RBAC_PERMISSIONS[selectedModule] || {}).map(([section, actions]) => (
                <div key={section} className="flex items-start justify-between p-2 bg-white rounded border border-blue-100">
                  <span className="text-xs font-semibold text-slate-700">{section}</span>
                  <div className="flex flex-wrap gap-1 ml-2">
                    {actions.map((a) => (
                      <span key={a} className={`text-xs px-1 py-0.5 rounded ${actionColor(a)}`}>{a}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}