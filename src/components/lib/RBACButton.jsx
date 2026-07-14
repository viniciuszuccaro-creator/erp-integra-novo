// Componente Button com RBAC integrado
import React from 'react';
import { Button } from '@/components/ui/button';
import usePermissions from '@/components/lib/usePermissions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function RBACButton({
  module,
  section = null,
  action = 'ver',
  children,
  className = '',
  disabled = false,
  showTooltip = true,
  ...props
}) {
  const { hasPermission } = usePermissions();
  const allowed = hasPermission(module, section, action);

  if (!allowed) {
    if (!showTooltip) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button
                disabled={true}
                className={`opacity-50 cursor-not-allowed ${className}`}
                {...props}
              >
                {children}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent className="bg-slate-900 text-white">
            Você não tem permissão para esta ação
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Button
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </Button>
  );
}