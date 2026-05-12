import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Users, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import usePermissions from "@/components/lib/usePermissions";

const MODULOS = ["Dashboard", "CRM", "Comercial", "Estoque", "Compras", "Financeiro", "Fiscal", "RH", "Expedição", "Produção"];

export default function ControleAcessoResumo() {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) return null;

  const acessos = MODULOS.map(m => ({
    modulo: m,
    ver: hasPermission(m, null, 'ver'),
    criar: hasPermission(m, null, 'criar'),
    editar: hasPermission(m, null, 'editar'),
    excluir: hasPermission(m, null, 'excluir'),
  }));

  const totalAcesso = acessos.filter(a => a.ver).length;
  const totalBloqueado = acessos.filter(a => !a.ver).length;

  return (
    <Card className="border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Shield className="w-5 h-5 text-slate-600" />
          Controle de Acesso
          <Badge className="bg-slate-200 text-slate-700 text-xs ml-auto">{totalAcesso}/{MODULOS.length} módulos</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
            <Eye className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{totalAcesso}</p>
            <p className="text-xs text-slate-500">Com acesso</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-center">
            <Lock className="w-4 h-4 text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-500">{totalBloqueado}</p>
            <p className="text-xs text-slate-500">Bloqueados</p>
          </div>
        </div>
        <div className="space-y-1 max-h-32 overflow-auto">
          {acessos.filter(a => !a.ver).map(a => (
            <div key={a.modulo} className="flex items-center gap-2 text-xs bg-red-50 border border-red-100 rounded px-2 py-1">
              <Lock className="w-3 h-3 text-red-400 shrink-0" />
              <span className="text-red-700">{a.modulo} — sem acesso</span>
            </div>
          ))}
          {acessos.filter(a => a.ver && !a.criar).map(a => (
            <div key={a.modulo} className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-100 rounded px-2 py-1">
              <Eye className="w-3 h-3 text-amber-500 shrink-0" />
              <span className="text-amber-700">{a.modulo} — somente leitura</span>
            </div>
          ))}
        </div>
        <Link to={createPageUrl('AdministracaoSistema?tab=acesso')}>
          <Button size="sm" variant="outline" className="w-full text-xs border-slate-300">
            <Users className="w-3 h-3 mr-1" />
            Gerenciar permissões
            <ChevronRight className="w-3 h-3 ml-auto" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}