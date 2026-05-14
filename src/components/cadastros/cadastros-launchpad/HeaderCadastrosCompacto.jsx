import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users } from "lucide-react";
import SemEmpresaBanner from '@/components/common/SemEmpresaBanner';
import IAContextualModulo from '@/components/ia/IAContextualModulo';

export default function HeaderCadastrosCompacto() {
  return (
    <div className="space-y-2">
      <SemEmpresaBanner modulo="Cadastros Gerais" />
      <Card className="border-0 shadow-sm bg-gradient-to-r from-slate-700 to-slate-600">
        <CardContent className="p-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Cadastros Gerais</h1>
                <p className="text-slate-200 text-xs">Clientes, produtos, fornecedores e tabelas auxiliares</p>
              </div>
            </div>
            <IAContextualModulo modulo="Cadastros" compact />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}