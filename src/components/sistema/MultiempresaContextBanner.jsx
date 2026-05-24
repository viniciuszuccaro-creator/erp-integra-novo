/**
 * MultiempresaContextBanner v2.0
 * Banner compacto que exibe o contexto atual (Grupo/Empresa) 
 * e permite troca rápida de empresa — aparece em todos os módulos
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, ArrowLeftRight, CheckCircle2 } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { cn } from '@/lib/utils';

export default function MultiempresaContextBanner({ className }) {
  const { contexto, grupoAtual, empresaAtual, empresasDoGrupo } = useContextoVisual();

  const isGrupo = contexto === 'grupo';

  const nome = isGrupo
    ? grupoAtual?.nome_do_grupo || 'Grupo'
    : empresaAtual?.nome_fantasia || empresaAtual?.razao_social || 'Empresa';

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs w-full',
      isGrupo
        ? 'bg-blue-50 border-blue-200 text-blue-800'
        : 'bg-purple-50 border-purple-200 text-purple-800',
      className
    )}>
      {isGrupo
        ? <Users className="w-3.5 h-3.5 flex-shrink-0" />
        : <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
      }

      <span className="font-semibold truncate flex-1">{nome}</span>

      <Badge className={cn(
        'text-[10px] flex-shrink-0',
        isGrupo ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
      )}>
        {isGrupo ? 'Grupo' : 'Empresa'}
      </Badge>

      {isGrupo && empresasDoGrupo.length > 0 && (
        <Badge variant="outline" className="text-[10px] flex-shrink-0 border-blue-300 text-blue-600">
          <ArrowLeftRight className="w-2.5 h-2.5 mr-1" />
          {empresasDoGrupo.length} emp.
        </Badge>
      )}

      {!isGrupo && empresaAtual?.id && (
        <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-purple-500" />
      )}
    </div>
  );
}