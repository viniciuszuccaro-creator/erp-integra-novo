// Card individual de perfil RBAC (pequeno arquivo, reutilizável)
import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";

export default function PerfilCard({
  perfil,
  usuariosCount = 0,
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) {
  const permissionsCount = Object.values(perfil.permissoes || {}).reduce(
    (s, m) => s + Object.values(m || {}).reduce((ss, sec) => ss + (sec?.length || 0), 0),
    0
  );

  return (
    <Card className="hover:shadow-md transition-all">
      <CardHeader className="bg-slate-50 border-b pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-sm">{perfil.nome_perfil}</p>
              <div className="flex gap-1 flex-wrap mt-1">
                <Badge variant="outline" className="text-xs">
                  {perfil.nivel_perfil}
                </Badge>
                {permissionsCount > 0 && (
                  <Badge className="bg-blue-100 text-blue-700 text-xs">
                    {permissionsCount} permissões
                  </Badge>
                )}
              </div>
            </div>
          </div>
          {perfil.ativo !== false ? (
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-slate-400 flex-shrink-0" />
          )}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        {perfil.descricao && (
          <p className="text-xs text-slate-600 mb-2">{perfil.descricao}</p>
        )}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <Badge className="bg-purple-100 text-purple-700 text-xs">
            {usuariosCount} usuários
          </Badge>
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="outline"
              className="h-7 px-2 text-xs"
              disabled={!canEdit}
              onClick={onEdit}
            >
              <Edit className="w-3 h-3 mr-1" />
              Editar
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 px-2"
              disabled={!canDelete || usuariosCount > 0}
              onClick={onDelete}
              title={usuariosCount > 0 ? "Não pode deletar perfil em uso" : ""}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}