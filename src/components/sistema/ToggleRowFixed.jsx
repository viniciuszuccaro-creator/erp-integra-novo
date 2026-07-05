import React from "react";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

/**
 * ToggleRowFixed — toggle fixo com layout consistente.
 * Componente focado recriado para restaurar imports ativos.
 */
export default function ToggleRowFixed({
  checked = false,
  onCheckedChange,
  label,
  desc,
  saving = false,
  disabled = false,
  accentColor = "blue",
}) {
  const accentMap = {
    blue: "text-blue-600",
    purple: "text-purple-600",
    green: "text-green-600",
    amber: "text-amber-600",
  };
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <div className="flex-1 pr-4">
        {label && <p className={`text-sm font-medium ${accentMap[accentColor] || accentMap.blue}`}>{label}</p>}
        {desc && <p className="text-xs text-slate-500 mt-0.5">{desc}</p>}
      </div>
      <div className="flex items-center gap-2">
        {saving && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
        <Switch
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled || saving}
        />
      </div>
    </div>
  );
}