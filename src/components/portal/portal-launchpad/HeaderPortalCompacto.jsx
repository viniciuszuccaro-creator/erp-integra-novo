import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { UserCircle } from "lucide-react";
import IAContextualModulo from '@/components/ia/IAContextualModulo';

export default function HeaderPortalCompacto({ clienteNome = null }) {
  return (
    <Card className="border-0 shadow-sm bg-gradient-to-r from-teal-600 to-emerald-600">
      <CardContent className="p-2.5">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
              <UserCircle className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Portal do Cliente</h1>
              <p className="text-teal-100 text-xs">
                {clienteNome ? `Bem-vindo, ${clienteNome}` : 'Pedidos, boletos, entregas e documentos'}
              </p>
            </div>
          </div>
          <IAContextualModulo modulo="Portal" compact />
        </div>
      </CardContent>
    </Card>
  );
}