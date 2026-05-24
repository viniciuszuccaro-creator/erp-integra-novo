/**
 * Select com Auditoria + onChange Obrigatória
 * v2.0 - Integrado com uiAudit
 */

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { uiAuditWrap } from '@/components/lib/uiAudit';

export function SelectWithAudit({
  value,
  onValueChange,
  placeholder = 'Selecione...',
  items = [],
  disabled = false,
  'data-action': dataAction = 'select.change',
  label,
  required = false,
  ...props
}) {
  // Wrapper auditoria
  const handleChange = uiAuditWrap(
    dataAction,
    onValueChange,
    { kind: 'select' }
  );

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-slate-900">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Select
        value={value || ''}
        onValueChange={handleChange}
        disabled={disabled}
        {...props}
      >
        <SelectTrigger className={disabled ? 'opacity-50' : ''}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}