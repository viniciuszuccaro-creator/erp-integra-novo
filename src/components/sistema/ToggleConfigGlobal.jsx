import React from "react";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToggleConfig, loadScopedConfiguracaoSistema } from "@/components/lib/useToggleConfig";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * ToggleConfigGlobal — toggle persistido via useToggleConfig.
 * Suporta dois modos:
 * 1) Gerenciado: recebe onToggle, getToggleValue, configs (usado pelo ConfigCenter)
 * 2) Auto-gerenciado: recebe configKey e gerencia seu próprio estado (usado pelo ParametrosGeraisPanel)
 */
export default function ToggleConfigGlobal({
  chave,
  configKey,
  label,
  desc,
  description,
  categoria = "Geral",
  saving: savingProp = false,
  isFetching: isFetchingProp = false,
  onToggle: onToggleProp,
  getToggleValue: getToggleValueProp,
  configs: configsProp = [],
  accentColor = "blue",
  disabled = false,
  defaultValue = false,
}) {
  // Normaliza props: configKey → chave, description → desc
  const chaveFinal = chave || configKey;
  const descFinal = desc || description;

  // Modo auto-gerenciado: se não recebeu onToggle/getToggleValue, usa useToggleConfig
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const eId = empresaAtual?.id;
  const gId = grupoAtual?.id || empresaAtual?.group_id || (() => {
    try { return localStorage.getItem('group_atual_id'); } catch { return null; }
  })();
  const queryKeySelf = ['toggle-self', eId ?? 'sem', gId ?? 'sem'];
  const { saving: savingSelf, handleToggle: handleToggleSelf, getToggleValue: getToggleValueSelf } = useToggleConfig(eId, gId, queryKeySelf);

  const { data: configsSelf = [], isFetching: isFetchingSelf } = useQuery({
    queryKey: queryKeySelf,
    queryFn: () => loadScopedConfiguracaoSistema({ empresaId: eId, grupoId: gId, limit: 200, includeGlobal: true }),
    enabled: !onToggleProp && !getToggleValueProp && Boolean(eId || gId),
    staleTime: 30000,
    refetchOnMount: true,
    retry: 3,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 8000),
    placeholderData: (prev) => prev, // Mantém dados anteriores durante refetch — impede reset para false
  });

  // Decide qual modo usar
  const isManaged = !!(onToggleProp && getToggleValueProp);
  const configs = isManaged ? configsProp : configsSelf;
  const onToggle = isManaged ? onToggleProp : handleToggleSelf;
  const getToggleValue = isManaged ? getToggleValueProp : getToggleValueSelf;
  const saving = isManaged ? savingProp : savingSelf;
  const isFetching = isManaged ? isFetchingProp : isFetchingSelf;

  const checked = getToggleValue ? getToggleValue(configs, chaveFinal) : defaultValue;
  const isSaving = saving && typeof saving === 'object' ? !!saving[chaveFinal] : !!saving;
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
        {descFinal && <p className="text-xs text-slate-500 mt-0.5">{descFinal}</p>}
      </div>
      <div className="flex items-center gap-2">
        {(isSaving || isFetching) && <Loader2 className="w-3 h-3 animate-spin text-slate-400" />}
        <Switch
          checked={checked}
          onCheckedChange={() => onToggle && onToggle(chaveFinal, categoria, !checked)}
          disabled={disabled || isSaving}
          data-permission="Sistema.Configuracao.editar"
        />
      </div>
    </div>
  );
}