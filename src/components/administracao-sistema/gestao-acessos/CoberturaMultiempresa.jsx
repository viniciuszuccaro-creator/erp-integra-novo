// Visualização de cobertura RBAC por empresa (multiempresa, Regra-Mãe)
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Shield, AlertTriangle, CheckCircle2, Users } from "lucide-react";

export default function CoberturaMultiempresa({ usuarios = [], perfis = [], empresas = [] }) {
  if (empresas.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-slate-500 text-sm py-8">
          <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
          Nenhuma empresa disponível para análise.
        </CardContent>
      </Card>
    );
  }

  const getStatsEmpresa = (empresa) => {
    const usuariosEmpresa = usuarios.filter(
      (u) =>
        u.empresa_id === empresa.id ||
        (Array.isArray(u.empresas_vinculadas) && u.empresas_vinculadas.includes(empresa.id))
    );
    const semPerfil = usuariosEmpresa.filter(
      (u) => !u.perfil_acesso_id && u.role !== "admin"
    ).length;
    const cobertura =
      usuariosEmpresa.length > 0
        ? Math.round(((usuariosEmpresa.length - semPerfil) / usuariosEmpresa.length) * 100)
        : 100;
    return { total: usuariosEmpresa.length, semPerfil, cobertura };
  };

  return (
    <Card className="w-full">
      <CardHeader className="border-b pb-3">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Building2 className="w-4 h-4 text-blue-600" />
          Cobertura RBAC por Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {empresas.map((empresa) => {
            const stats = getStatsEmpresa(empresa);
            const nome = empresa.nome_fantasia || empresa.razao_social || empresa.id;
            const corCobertura =
              stats.cobertura >= 90
                ? "bg-green-500"
                : stats.cobertura >= 70
                ? "bg-amber-500"
                : "bg-red-500";

            return (
              <div key={empresa.id} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-slate-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium truncate">{nome}</p>
                    {stats.semPerfil > 0 ? (
                      <Badge className="bg-amber-100 text-amber-700 text-xs">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        {stats.semPerfil} sem perfil
                      </Badge>
                    ) : (
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        100% coberto
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${corCobertura}`}
                        style={{ width: `${stats.cobertura}%` }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 flex-shrink-0">
                      {stats.cobertura}%
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-0.5 flex-shrink-0">
                      <Users className="w-3 h-3" />
                      {stats.total}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Total geral */}
        <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {perfis.filter((p) => p.ativo !== false).length} perfis ativos
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {usuarios.length} usuários no escopo
          </span>
        </div>
      </CardContent>
    </Card>
  );
}