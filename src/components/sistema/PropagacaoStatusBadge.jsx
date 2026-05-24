/**
 * PropagacaoStatusBadge v1.0
 * Badge que indica status de propagação de um registro
 * Usado em listagens para mostrar se foi replicado/está no grupo
 */

import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeftRight, Clock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

export default function PropagacaoStatusBadge({ record, compact = false }) {
  if (!record) return null;

  // Determinar status
  const isReplicated = record.e_replicado === true;
  const isGroupOrigin = record.grupo_origem === true;
  const hasGroupId = !!record.group_id;
  const hasEmpresaId = !!record.empresa_id;
  const hasGrupoDocId = !!record.documento_grupo_id;

  if (!hasGroupId && !hasEmpresaId) return null;

  // Lógica de status
  let status = null;
  let icon = null;
  let color = '';
  let label = '';
  let description = '';

  if (hasGroupId && !hasEmpresaId) {
    // Registro no grupo
    status = 'grupo';
    icon = <ArrowDown className="w-3 h-3" />;
    color = 'bg-purple-100 text-purple-700 border-purple-200';
    label = 'Grupo';
    description = 'Registro no Grupo → será propagado para empresas';
  } else if (isReplicated && hasGrupoDocId) {
    // Réplica criada pelo grupo
    status = 'replicado';
    icon = <ArrowDown className="w-3 h-3" />;
    color = 'bg-indigo-100 text-indigo-700 border-indigo-200';
    label = 'Réplica';
    description = 'Criado automaticamente a partir do Grupo';
  } else if (isGroupOrigin) {
    // Subiu da empresa para o grupo
    status = 'subiu';
    icon = <ArrowUp className="w-3 h-3" />;
    color = 'bg-green-100 text-green-700 border-green-200';
    label = 'Propagado';
    description = 'Registrado na Empresa → propagado para o Grupo';
  } else if (hasEmpresaId && hasGroupId) {
    // Registro na empresa (pode ser propagado)
    status = 'empresa';
    icon = <ArrowLeftRight className="w-3 h-3" />;
    color = 'bg-blue-100 text-blue-700 border-blue-200';
    label = 'Empresa';
    description = 'Registro da Empresa com vínculo ao Grupo';
  }

  if (!status) return null;

  if (compact) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-medium border cursor-help ${color}`}>
            {icon}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="outline"
          className={`text-[10px] px-1.5 py-0.5 flex items-center gap-1 cursor-help ${color}`}
        >
          {icon}
          {label}
        </Badge>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
}