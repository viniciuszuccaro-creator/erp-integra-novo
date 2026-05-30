import React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePersistentToggle } from "@/hooks/usePersistentToggle";
import { base44 } from "@/api/base44Client";

/**
 * Toggle persistente com suporte a:
 * - Persistência via localStorage (instantânea)
 * - Sincronização com backend (opcional)
 * - Propagação multiempresa (opcional)
 */
export function TogglePersistente({
  storageKey,
  label,
  description,
  defaultValue = false,
  onSaveToBackend,
  disabled = false,
  className = "",
}) {
  const { isOpen, set } = usePersistentToggle(storageKey, defaultValue);

  const handleChange = async (value) => {
    set(value);

    if (onSaveToBackend) {
      try {
        await onSaveToBackend(value);
      } catch (err) {
        console.error(`Erro ao salvar toggle ${storageKey}:`, err);
        set(!value); // Reverter em caso de erro
      }
    }
  };

  return (
    <div className={`flex items-center justify-between gap-4 py-2 ${className}`}>
      <div className="flex-1">
        {label && (
          <Label className="text-sm font-medium text-slate-700 cursor-pointer">
            {label}
          </Label>
        )}
        {description && (
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        checked={isOpen}
        onCheckedChange={handleChange}
        disabled={disabled}
      />
    </div>
  );
}

/**
 * Toggle que salva automaticamente em ConfiguracaoSistema
 */
export function ToggleConfigSistema({
  configKey,
  label,
  description,
  defaultValue = false,
  empresaId,
  grupoId,
  disabled = false,
}) {
  const storageKey = `config_${configKey}_${empresaId || grupoId || "global"}`;
  
  const saveToBackend = async (value) => {
    await base44.functions.invoke("upsertConfig", {
      key: configKey,
      value: String(value),
      empresa_id: empresaId || null,
      group_id: grupoId || null,
      tipo: "boolean",
    });
  };

  return (
    <TogglePersistente
      storageKey={storageKey}
      label={label}
      description={description}
      defaultValue={defaultValue}
      onSaveToBackend={saveToBackend}
      disabled={disabled}
    />
  );
}

export default TogglePersistente;