/**
 * PropagacaoStatusBadge v1.0
 * Badge compacto que mostra status de propagação de um registro
 * Usa: e_replicado, documento_grupo_id, grupo_origem
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { ArrowDown, ArrowUp, Building2, Users } from 'lucide-react';

export default function PropagacaoStatusBadge({ registro, className = '' }) {
  if (!registro) return null;

  const isReplicado = registro.e_replicado === true;
  const hasGrupoOrigem = !!registro.documento_grupo_id;
  const isGrupoLevel = !!registro.group_id && !registro.empresa_id;
  const isEmpresaLevel = !!registro.empresa_id;

  // Registro do grupo — será propagado DOWN
  if (isGrupoLevel && !isReplicado) {
    return (
      <Badge
        className={`text-[10px] bg-blue-100 text-blue-700 border border-blue-200 ${className}`}
        title="Registro de Grupo — será propagado para empresas"
      >
        <Users className="w-2.5 h-2.5 mr-1" />
        Grupo
      </Badge>
    );
  }

  // Réplica em empresa (veio do grupo via DOWN)
  if (isReplicado && hasGrupoOrigem) {
    return (
      <Badge
        className={`text-[10px] bg-purple-100 text-purple-700 border border-purple-200 ${className}`}
        title="Réplica — originado do grupo"
      >
        <ArrowDown className="w-2.5 h-2.5 mr-1" />
        Réplica
      </Badge>
    );
  }

  // Registro da empresa que subiu para o grupo (UP)
  if (isEmpresaLevel && registro.grupo_origem) {
    return (
      <Badge
        className={`text-[10px] bg-green-100 text-green-700 border border-green-200 ${className}`}
        title="Sincronizado — enviado para o grupo"
      >
        <ArrowUp className="w-2.5 h-2.5 mr-1" />
        Sincronizado
      </Badge>
    );
  }

  // Registro local da empresa (sem propagação)
  if (isEmpresaLevel) {
    return (
      <Badge
        className={`text-[10px] bg-slate-100 text-slate-600 border border-slate-200 ${className}`}
        title="Registro local da empresa"
      >
        <Building2 className="w-2.5 h-2.5 mr-1" />
        Local
      </Badge>
    );
  }

  return null;
}