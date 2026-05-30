import React, { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

/**
 * ToggleConfigGlobal — componente para toggles que persistem via backend
 * Otimistic UI + backend persistence
 * Uso: <ToggleConfigGlobal configKey="propagacao_ativa" label="Ativar Propagação" />
 */

export default function ToggleConfigGlobal({
  configKey,
  label,
  description,
  onChangeLocal,
  defaultValue = false,
}) {
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState("idle"); // idle | saving | saved | error

  // Carrega valor inicial do backend
  useEffect(() => {
    loadConfigValue();
  }, []);

  const loadConfigValue = async () => {
    try {
      const result = await base44.functions.invoke("upsertConfig", {
        key: configKey,
        operation: "read",
      });
      if (result.data?.value !== undefined) {
        setValue(result.data.value);
      }
    } catch (err) {
      console.warn("Erro ao carregar config:", err.message);
    }
  };

  const handleToggle = async (newValue) => {
    // Optimistic UI
    setValue(newValue);
    setSyncStatus("saving");
    setLoading(true);

    try {
      await base44.functions.invoke("upsertConfig", {
        key: configKey,
        value: newValue,
        operation: "write",
      });

      setSyncStatus("saved");
      if (onChangeLocal) onChangeLocal(newValue);

      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (err) {
      // Rollback
      setValue(!newValue);
      setSyncStatus("error");
      console.error("Erro ao salvar config:", err.message);
      setTimeout(() => setSyncStatus("idle"), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-between py-3 px-4 bg-slate-50 rounded-lg border border-slate-200">
      <div className="flex-1">
        <Label className="block font-semibold text-slate-900 cursor-pointer">{label}</Label>
        {description && <p className="text-sm text-slate-600 mt-1">{description}</p>}
      </div>

      <div className="flex items-center gap-3 ml-4">
        <Switch checked={value} onCheckedChange={handleToggle} disabled={loading} />

        {syncStatus === "saving" && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
        {syncStatus === "saved" && <CheckCircle2 className="w-4 h-4 text-green-600" />}
        {syncStatus === "error" && <AlertCircle className="w-4 h-4 text-red-600" />}
      </div>
    </div>
  );
}