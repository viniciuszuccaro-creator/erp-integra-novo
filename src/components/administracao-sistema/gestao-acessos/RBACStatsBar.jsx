// Barra de estatísticas RBAC (pequeno arquivo, reutilizável)
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function RBACStatsBar({ perfis = [], usuarios = [] }) {
  const perfisAtivos = perfis.filter((p) => p.ativo !== false).length;
  const usuariosSemPerfil = usuarios.filter(
    (u) => !u.perfil_acesso_id && u.role !== "admin"
  ).length;
  const cobertura =
    usuarios.length > 0
      ? Math.round(
          ((usuarios.length - usuariosSemPerfil) / usuarios.length) * 100
        )
      : 100;

  return (
    <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Perfis RBAC */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-3 flex items-center gap-3">
          <Shield className="w-8 h-8 text-blue-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-blue-600 font-medium">Perfis RBAC</p>
            <p className="text-lg font-bold text-blue-900">{perfisAtivos}</p>
          </div>
        </CardContent>
      </Card>

      {/* Status cobertura */}
      <Card
        className={
          usuariosSemPerfil > 0
            ? "border-amber-200 bg-amber-50"
            : "border-green-200 bg-green-50"
        }
      >
        <CardContent className="p-3 flex items-center gap-3">
          {usuariosSemPerfil > 0 ? (
            <AlertTriangle className="w-8 h-8 text-amber-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
          )}
          <div>
            <p
              className={`text-xs font-medium ${
                usuariosSemPerfil > 0 ? "text-amber-600" : "text-green-600"
              }`}
            >
              {usuariosSemPerfil > 0 ? "Sem perfil" : "Cobertura total"}
            </p>
            <p
              className={`text-lg font-bold ${
                usuariosSemPerfil > 0 ? "text-amber-900" : "text-green-900"
              }`}
            >
              {usuariosSemPerfil > 0
                ? `${usuariosSemPerfil} pendente(s)`
                : `${usuarios.length} ok`}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Total usuários */}
      <Card className="border-slate-200 bg-slate-50">
        <CardContent className="p-3 flex items-center gap-3">
          <Users className="w-8 h-8 text-slate-600 flex-shrink-0" />
          <div>
            <p className="text-xs text-slate-600 font-medium">Total Usuários</p>
            <p className="text-lg font-bold text-slate-900">{usuarios.length}</p>
          </div>
        </CardContent>
      </Card>

      {/* Cobertura */}
      <Card
        className={
          cobertura >= 80
            ? "border-emerald-200 bg-emerald-50"
            : "border-orange-200 bg-orange-50"
        }
      >
        <CardContent className="p-3 flex items-center gap-3">
          <TrendingUp
            className={`w-8 h-8 flex-shrink-0 ${
              cobertura >= 80 ? "text-emerald-600" : "text-orange-600"
            }`}
          />
          <div>
            <p
              className={`text-xs font-medium ${
                cobertura >= 80 ? "text-emerald-600" : "text-orange-600"
              }`}
            >
              Cobertura RBAC
            </p>
            <p
              className={`text-lg font-bold ${
                cobertura >= 80 ? "text-emerald-900" : "text-orange-900"
              }`}
            >
              {cobertura}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}