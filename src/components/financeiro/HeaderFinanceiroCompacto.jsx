import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2, BarChart3 } from 'lucide-react';
import SemEmpresaBanner from '@/components/common/SemEmpresaBanner';
import IAContextualModulo from '@/components/ia/IAContextualModulo';

/**
 * HEADER FINANCEIRO COMPACTO V22.0 ETAPA 2
 * Cabeçalho minimalista e responsivo
 */
export default function HeaderFinanceiroCompacto({ 
  estaNoGrupo,
  empresaAtual 
}) {
  return (
    <div className="space-y-2">
    <SemEmpresaBanner modulo="Financeiro" />
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600 flex-shrink-0" />
          Financeiro Multi-Empresa
        </h1>
        <p className="text-xs text-slate-600 mt-0.5">
          {estaNoGrupo
            ? 'Visão consolidada • Caixa Central • Conciliação • Omnichannel'
            : `Gestão financeira completa - ${empresaAtual?.nome_fantasia || empresaAtual?.razao_social || ''}`
          }
        </p>
      </div>
      {estaNoGrupo && (
        <Badge className="bg-blue-100 text-blue-700 px-2 py-1 text-xs w-fit">
          <Building2 className="w-3 h-3 mr-1" />
          Visão Consolidada
        </Badge>
      )}
      <IAContextualModulo modulo="Financeiro" compact />
    </div>
    </div>
  );
}