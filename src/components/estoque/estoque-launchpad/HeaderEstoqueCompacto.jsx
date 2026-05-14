import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Box } from 'lucide-react';
import SemEmpresaBanner from '@/components/common/SemEmpresaBanner';
import IAContextualModulo from '@/components/ia/IAContextualModulo';

export default function HeaderEstoqueCompacto() {
  return (
    <div className="space-y-2">
      <SemEmpresaBanner modulo="Estoque e Almoxarifado" />
      <Card className="border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader className="pb-2 pt-2 px-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center flex-shrink-0">
                <Box className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-base">Estoque e Almoxarifado V22.0</CardTitle>
                <p className="text-xs text-slate-600">Produtos e movimentações</p>
              </div>
            </div>
            <IAContextualModulo modulo="Estoque" compact />
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}