/**
 * ToggleRow v3.0 - Persistence + Error Handling
 * Salva em ConfiguracaoSistema + persiste após refresh
 */

import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import useToggleConfig from './useToggleConfig';

export default function ToggleRowFixed({
  // Nova nomenclatura
  chave,
  categoria,
  label,
  descricao,
  onToggle,
  
  // Legado (compatibilidade)
  key: legacyKey,
  desc,
  onToggleLegacy,
}) {
  // Resolve nomenclatura
  const resolvedKey = chave || legacyKey;
  const resolvedLabel = label || desc;
  const resolvedOnToggle = onToggle || onToggleLegacy;
  const resolvedCategoria = categoria || 'Geral';

  const { toggleConfig, isFetching, error, upsertToggle } = useToggleConfig();
  const [isSaving, setIsSaving] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [lastSaved, setLastSaved] = useState(null);

  // Busca valor atual no banco
  const currentValue = toggleConfig[resolvedKey]?.ativa ?? false;

  const handleToggle = async () => {
    setIsSaving(true);
    setSyncError(null);

    try {
      // Salva no backend
      await upsertToggle(resolvedKey, !currentValue, {
        categoria: resolvedCategoria,
        descricao: resolvedLabel,
      });

      // Callback customizado
      if (resolvedOnToggle) {
        resolvedOnToggle(!currentValue);
      }

      setLastSaved(new Date());
    } catch (err) {
      setSyncError(err.message || 'Erro ao salvar');
      console.error('Toggle save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const isDisabled = isFetching || isSaving;
  const showSuccess = lastSaved && (Date.now() - lastSaved.getTime()) < 2000;

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
      <div className="flex-1">
        <Label className="text-sm font-medium text-slate-900">
          {resolvedLabel}
        </Label>
        {descricao && (
          <p className="text-xs text-slate-500 mt-1">{descricao}</p>
        )}
      </div>

      <div className="flex items-center gap-3">
        {syncError && (
          <div className="flex items-center gap-1 text-red-600 text-xs">
            <AlertCircle className="w-4 h-4" />
            {syncError}
          </div>
        )}

        {showSuccess && (
          <div className="flex items-center gap-1 text-green-600 text-xs">
            <Check className="w-4 h-4" />
            Salvo
          </div>
        )}

        <Switch
          checked={currentValue}
          onCheckedChange={handleToggle}
          disabled={isDisabled}
          aria-label={resolvedLabel}
        />
      </div>
    </div>
  );
}