/**
 * RadioGroup com Auditoria + RBAC
 * v1.0 - Integrado com uiAudit
 */

import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { uiAuditWrap } from '@/components/lib/uiAudit';
import usePermissions from '@/components/lib/usePermissions';

export function RadioGroupWithAudit({
  name,
  label,
  value,
  onValueChange,
  items = [],
  disabled = false,
  description,
  required = false,
  'data-action': dataAction = 'radiogroup.change',
  'data-permission': permission,
  ...props
}) {
  const { hasPermissionKey } = usePermissions();
  
  // Verificar permissão
  const allowed = permission ? hasPermissionKey(permission) : true;

  // Wrapper auditoria
  const handleChange = uiAuditWrap(
    dataAction,
    onValueChange,
    { kind: 'radio-group' }
  );

  if (permission && !allowed) {
    return (
      <div className="opacity-50 cursor-not-allowed">
        {label && (
          <div className="flex items-center gap-1 mb-3">
            <Label className="text-sm font-medium text-slate-500">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        )}
        <RadioGroup value={value} disabled={true}>
          {items.map((item) => (
            <div key={item.value} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={item.value} 
                id={`${name}-${item.value}`}
                disabled={true}
              />
              <Label 
                htmlFor={`${name}-${item.value}`}
                className="text-sm font-medium text-slate-500 cursor-not-allowed"
              >
                {item.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
        <span className="text-xs text-slate-400 mt-2 block">Acesso negado</span>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <div className="flex items-center gap-1 mb-3">
          <Label className="text-sm font-medium text-slate-900">
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </Label>
        </div>
      )}
      {description && (
        <p className="text-xs text-slate-500 mb-3">{description}</p>
      )}
      <RadioGroup 
        value={value} 
        onValueChange={handleChange}
        disabled={disabled}
        {...props}
      >
        {items.map((item) => (
          <div key={item.value} className="flex items-center space-x-2">
            <RadioGroupItem 
              value={item.value} 
              id={`${name}-${item.value}`}
              disabled={disabled}
            />
            <Label 
              htmlFor={`${name}-${item.value}`}
              className="text-sm font-medium text-slate-900 cursor-pointer"
            >
              {item.label}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

export default RadioGroupWithAudit;