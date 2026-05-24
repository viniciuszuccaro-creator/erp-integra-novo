/**
 * ToggleRow — linha de toggle persistente para ConfiguracaoSistema.
 * Usa useToggleConfig v9 com upsertConfig para garantir persistência real.
 */
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock } from "lucide-react";
import { canEditConfigByPermission } from "@/components/lib/useToggleConfig";
import usePermissions from "@/components/lib/usePermissions";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export default function ToggleRow({
  chave,
  categoria,
  label,
  descricao,
  configs = [],
  saving = {},
  getToggleValue,
  handleToggle,
  badge,
  badgeColor = "bg-blue-100 text-blue-700",
  disabled = false,
}) {
  const { hasPermission } = usePermissions();
  const canEdit = canEditConfigByPermission(hasPermission, chave, categoria);
  const value = getToggleValue(configs, chave);
  const isSaving = !!saving[chave];
  const isDisabled = disabled || !canEdit || isSaving;

  return (
    <div className={`flex items-center justify-between gap-3 py-3 px-1 border-b border-slate-100 last:border-0 transition-colors ${!canEdit ? "opacity-60" : ""}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-slate-800 truncate">{label}</span>
          {badge && (
            <Badge className={`text-[10px] px-1.5 py-0 h-4 ${badgeColor}`}>{badge}</Badge>
          )}
          {!canEdit && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Lock className="w-3 h-3 text-slate-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>Sem permissão para editar</TooltipContent>
            </Tooltip>
          )}
        </div>
        {descricao && <p className="text-xs text-slate-500 mt-0.5 leading-tight">{descricao}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isSaving && <Loader2 className="w-3.5 h-3.5 text-blue-500 animate-spin" />}
        <Switch
          checked={!!value}
          onCheckedChange={(newVal) => !isDisabled && handleToggle(chave, categoria, newVal)}
          disabled={isDisabled}
          className={`transition-all ${value ? "data-[state=checked]:bg-blue-600" : ""}`}
          aria-label={label}
        />
      </div>
    </div>
  );
}