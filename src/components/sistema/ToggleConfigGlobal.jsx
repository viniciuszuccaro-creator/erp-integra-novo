import React, { useState, useEffect, useRef } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

/**
 * ToggleConfigGlobal v3.0
 * - API corrigida para usar upsertConfig com { chave, data, scope }
 * - Carrega valor via getEntityRecord (mais confiável que upsertConfig read)
 * - Optimistic UI + rollback em erro
 * - Contexto multiempresa (group_id + empresa_id)
 */
export default function ToggleConfigGlobal({
  configKey,
  label,
  description,
  onChangeLocal,
  defaultValue = false,
}) {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const [value, setValue] = useState(defaultValue);
  const [loading, setLoading] = useState(true); // começa loading até buscar
  const [syncStatus, setSyncStatus] = useState("idle");
  const loadedRef = useRef(false);
  const prevContextRef = useRef(`${grupoAtual?.id}-${empresaAtual?.id}`);

  const scopeObj = {
    group_id: grupoAtual?.id || null,
    empresa_id: empresaAtual?.id || null,
  };

  useEffect(() => {
    const ctxKey = `${grupoAtual?.id}-${empresaAtual?.id}`;
    const contextChanged = prevContextRef.current !== ctxKey;
    if (!loadedRef.current || contextChanged) {
      loadedRef.current = true;
      prevContextRef.current = ctxKey;
      loadConfigValue();
    }
  }, [grupoAtual?.id, empresaAtual?.id]);

  const loadConfigValue = async () => {
    setLoading(true);
    try {
      // Busca progressiva: escopo exato → grupo → sem escopo
      const attempts = [];
      if (scopeObj.empresa_id && scopeObj.group_id) {
        attempts.push({ chave: configKey, empresa_id: scopeObj.empresa_id, group_id: scopeObj.group_id });
      }
      if (scopeObj.empresa_id) {
        attempts.push({ chave: configKey, empresa_id: scopeObj.empresa_id });
      }
      if (scopeObj.group_id) {
        attempts.push({ chave: configKey, group_id: scopeObj.group_id });
      }
      attempts.push({ chave: configKey }); // fallback global

      let record = null;
      for (const filter of attempts) {
        const res = await base44.functions.invoke("getEntityRecord", {
          entityName: "ConfiguracaoSistema",
          filter,
          limit: 1,
        });
        const data = Array.isArray(res?.data) ? res.data : [];
        if (data.length > 0) { record = data[0]; break; }
      }

      if (record) {
        setValue(record.ativa === true);
      } else {
        setValue(defaultValue);
      }
    } catch (_) {
      setValue(defaultValue);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (newValue) => {
    const prev = value;
    setValue(newValue); // Optimistic UI
    setSyncStatus("saving");
    setLoading(true);

    try {
      await base44.functions.invoke("upsertConfig", {
        chave: configKey,
        data: {
          chave: configKey,
          ativa: newValue,           // boolean — campo correto no schema
          categoria: "sistema",
        },
        scope: scopeObj,
      });
      setSyncStatus("saved");
      if (onChangeLocal) onChangeLocal(newValue);
      setTimeout(() => setSyncStatus("idle"), 2000);
    } catch (err) {
      setValue(prev); // rollback
      setSyncStatus("error");
      console.error("Erro ao salvar config:", err?.message || err);
      setTimeout(() => setSyncStatus("idle"), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-between py-3 px-3 bg-white rounded border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
      <div className="flex-1 min-w-0">
        <Label className="block font-medium text-slate-900 cursor-pointer text-sm">{label}</Label>
        {description && <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>}
      </div>

      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
        {loading && syncStatus !== "saving" ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
        ) : null}
        <Switch
          checked={value}
          onCheckedChange={handleToggle}
          disabled={loading}
          className={value ? "data-[state=checked]:bg-blue-600" : ""}
        />
        {syncStatus === "saving" && <Loader2 className="w-3 h-3 animate-spin text-blue-600" />}
        {syncStatus === "saved" && <CheckCircle2 className="w-3 h-3 text-green-600" />}
        {syncStatus === "error" && <AlertCircle className="w-3 h-3 text-red-600" />}
      </div>
    </div>
  );
}