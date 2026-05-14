import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import SemEmpresaBanner from '@/components/common/SemEmpresaBanner';
import IAContextualModulo from '@/components/ia/IAContextualModulo';

export default function HeaderComprasCompacto() {
  return (
    <div className="space-y-2">
      <SemEmpresaBanner modulo="Compras e Suprimentos" />
      <Card className="border-2 border-cyan-500 bg-gradient-to-br from-cyan-50 to-blue-50">
        <CardHeader className="pb-2 pt-2 px-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-cyan-600 flex items-center justify-center flex-shrink-0">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">Compras e Suprimentos V22.0</CardTitle>
                <p className="text-xs text-slate-600">Gestão de fornecedores e ordens</p>
              </div>
            </div>
            <IAContextualModulo modulo="Compras" compact />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}