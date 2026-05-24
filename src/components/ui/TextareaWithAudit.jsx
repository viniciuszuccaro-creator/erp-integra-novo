/**
 * Textarea com Auditoria + RBAC
 * v1.0 - Integrado com uiAudit
 */

import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { uiAuditWrap } from '@/components/lib/uiAudit';
import usePermissions from '@/components/lib/usePermissions';

export function TextareaWithAudit({
  label,
  value,
  onChange,
  disabled = false,
  description,
  required = false,
  placeholder,
  rows = 4,
  'data-action': dataAction = 'textarea.change',
  'data-permission': permission,
  ...props
}) {
  const { hasPermissionKey } = usePermissions();
  
  // Verificar permissão
  const allowed = permission ? hasPermissionKey(permission) : true;
  const isReadOnly = permission && !allowed;

  // Wrapper auditoria
  const handleChange = uiAuditWrap(
    dataAction,
    onChange,
    { kind: 'textarea' }
  );

  return (
    <div className="space-y-2">
      {label && (
        <Label className={isReadOnly ? 'text-slate-500' : 'text-slate-900'}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {description && (
        <p className={`text-xs ${isReadOnly ? 'text-slate-400' : 'text-slate-500'}`}>
          {description}
        </p>
      )}
      <Textarea
        value={value || ''}
        onChange={handleChange}
        disabled={disabled || isReadOnly}
        placeholder={placeholder}
        rows={rows}
        className={isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}
        {...props}
      />
      {isReadOnly && (
        <span className="text-xs text-slate-400">Acesso negado</span>
      )}
    </div>
  );
}

export default TextareaWithAudit;