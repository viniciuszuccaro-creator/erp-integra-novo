import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import SemEmpresaBanner from '@/components/common/SemEmpresaBanner';
import IAContextualModulo from '@/components/ia/IAContextualModulo';
import ValidacaoCertificadoNFe from '@/components/fiscal/ValidacaoCertificadoNFe';

export default function HeaderFiscalCompacto() {
  return (
    <div className="space-y-2">
      <SemEmpresaBanner modulo="Fiscal e Tributário" />
      <Card className="border-0 shadow-sm bg-gradient-to-r from-blue-600 to-indigo-700">
        <CardContent className="p-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-white">Fiscal e Tributário</h1>
                <p className="text-blue-100 text-xs">NF-e, SPED e conformidade</p>
              </div>
            </div>
            <IAContextualModulo modulo="Fiscal" compact />
          </div>
        </CardContent>
      </Card>
      <ValidacaoCertificadoNFe compact />
    </div>
  );
}