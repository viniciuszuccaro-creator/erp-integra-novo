// Componente para campos/inputs protegidos por RBAC
import React from 'react';
import { Input } from '@/components/ui/input';
import usePermissions from '@/components/lib/usePermissions';
import { Lock } from 'lucide-react';

export default function RBACField({
  module,
  action = 'editar',
  children,
  fallback = null,
  label = '',
  readOnly = false,
  ...props
}) {
  const { hasPermission } = usePermissions();
  const allowed = hasPermission(module, null, action);

  // Se permite ação, renderiza filho normalmente
  if (allowed) {
    return <>{children}</>;
  }

  // Se não permite mas passou readOnly, renderiza como desabilitado
  if (readOnly || props.disabled) {
    return (
      <div className="relative">
        {children && React.cloneElement(children, { disabled: true })}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <Lock className="w-4 h-4 text-slate-400" />
        </div>
      </div>
    );
  }

  // Fallback padrão: campo oculto
  return fallback || null;
}