/**
 * Checkbox com Auditoria + Persistência
 * v1.0 - Integrado com uiAudit
 */

import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { uiAuditWrap } from '@/components/lib/uiAudit';
import usePermissions from '@/components/lib/usePermissions';

export function CheckboxWithAudit({
  id,
  label,
  checked = false,
  onCheckedChange,
  disabled = false,
  description,
  required = false,
  'data-action': dataAction = 'checkbox.change',
  'data-permission': permission,
  ...props
}) {
  const { hasPermissionKey } = usePermissions();
  
  // Verificar permissão
  const allowed = permission ? hasPermissionKey(permission) : true;
  
  if (permission && !allowed) {
    return (
      <div className="opacity-50 cursor-not-allowed">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={id}
            checked={checked}
            disabled={true}
          />
          <Label htmlFor={id} className="text-sm font-medium text-slate-500">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
        {description && (
          <p className="text-xs text-slate-400 mt-1 ml-6">{description}</p>
        )}
        <span className="text-xs text-slate-400 ml-6">Acesso negado</span>
      </div>
    );
  }

  // Wrapper auditoria
  const handleChange = uiAuditWrap(
    dataAction,
    onCheckedChange,
    { kind: 'checkbox' }
  );

  return (
    <div className="flex items-start space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={handleChange}
        disabled={disabled}
        {...props}
      />
      <div className="flex-1">
        <Label 
          htmlFor={id} 
          className="text-sm font-medium text-slate-900 cursor-pointer"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
      </div>
    </div>
  );
}

export default CheckboxWithAudit;