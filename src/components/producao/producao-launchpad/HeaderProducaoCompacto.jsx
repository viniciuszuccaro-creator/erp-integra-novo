import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Factory } from "lucide-react";
import SemEmpresaBanner from '@/components/common/SemEmpresaBanner';
import IAContextualModulo from '@/components/ia/IAContextualModulo';

export default function HeaderProducaoCompacto() {
  return (
    <div className="space-y-2">
      <SemEmpresaBanner modulo="Produção e Manufatura" />
      <Card className="border-0 shadow-sm bg-gradient-to-r from-orange-600 to-red-600">
        <CardContent className="p-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <Factory className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Produção e Manufatura</h1>
                <p className="text-orange-100 text-xs">Ordens, apontamentos e qualidade</p>
              </div>
            </div>
            <IAContextualModulo modulo="Produção" compact />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}