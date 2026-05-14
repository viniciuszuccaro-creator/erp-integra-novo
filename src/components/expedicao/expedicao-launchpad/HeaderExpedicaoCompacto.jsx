import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck } from 'lucide-react';
import SemEmpresaBanner from '@/components/common/SemEmpresaBanner';
import IAContextualModulo from '@/components/ia/IAContextualModulo';

export default function HeaderExpedicaoCompacto() {
  return (
    <div className="space-y-2">
      <SemEmpresaBanner modulo="Expedição e Logística" />
      <Card className="border-2 border-blue-500 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader className="pb-2 pt-2 px-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">Expedição e Logística V22.0</CardTitle>
                <p className="text-xs text-slate-600">Entregas, rotas e rastreamento</p>
              </div>
            </div>
            <IAContextualModulo modulo="Expedição" compact />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}