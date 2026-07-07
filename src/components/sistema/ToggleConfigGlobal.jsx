import React from "react";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

/**
 * ToggleConfigGlobal — toggle persistido via useToggleConfig.
 * Componente focado recriado para restaurar imports ativos.
 */
export default function ToggleConfigGlobal({
  chave,
  label,
  desc,
  categoria = "Geral",
  saving = false,
  isFetching = false,
  onToggle,
  getToggleValue,
  configs = [],
  accentColor = "blue",
  disabled = false,
}) {
  const checked = getToggleValue ? getToggleValue(configs, chave) : false;
  // saving pode ser um objeto { [chave]: boolean } ou um boolean
  const isSaving = saving && typeof saving === 'object' ? !!saving[chave] : !!saving;
  const accentMap = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
    amber: "text-amber-600",
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex-1 pr-4">
        <p className={`text-sm font-medium ${accentMap[accentColor] || accentMap.blue}`}>{label}</p>
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <div className="flex items-center gap-2">
        {(isSaving || isFetching) && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
        <Switch
          checked={checked}
          onCheckedChange={() => onToggle && onToggle(chave, categoria, !checked)}
          disabled={disabled || isSaving}
          data-permission="Sistema.Configuracao.editar"
        />
      </div>
    </div>
  );
}