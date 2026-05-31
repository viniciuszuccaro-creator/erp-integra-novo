/**
 * AdminQuickActions — Ações rápidas do painel de administração.
 * Acesso rápido às funções mais usadas: seed, backup, propagação, RBAC.
 */
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import {
  Play, Shield, ArrowDownUp, Database, Loader2, Settings
} from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

export default function AdminQuickActions({ onTabChange }) {
  const { grupoAtual } = useContextoVisual();
  const [loading, setLoading] = useState(null);

  const run = async (key, fn) => {
    setLoading(key);
    try { await fn(); }
    catch (e) { toast.error(e.message || "Erro"); }
    finally { setLoading(null); }
  };

  const actions = [
    {
      key: "initConfigs",
      label: "Inicializar Configs",
      icon: Settings,
      color: "bg-blue-600 hover:bg-blue-700",
      fn: async () => {
        await base44.functions.invoke("initDefaultConfigs", {});
        toast.success("Configurações padrão inicializadas!");
      },
    },
    {
      key: "initRBAC",
      label: "Inicializar RBAC",
      icon: Shield,
      color: "bg-purple-600 hover:bg-purple-700",
      fn: async () => {
        await base44.functions.invoke("initializeRBACProfiles", {});
        toast.success("Perfis RBAC inicializados!");
      },
    },
    {
      key: "propagacao",
      label: "Sincronizar Grupo",
      icon: ArrowDownUp,
      color: "bg-teal-600 hover:bg-teal-700",
      fn: async () => {
        if (!grupoAtual?.id) throw new Error("Selecione um grupo.");
        await base44.functions.invoke("propagateGroupConfigs", { group_id: grupoAtual.id });
        toast.success("Propagação iniciada!");
      },
    },
    {
      key: "backup",
      label: "Backup Agora",
      icon: Database,
      color: "bg-slate-600 hover:bg-slate-700",
      fn: async () => {
        await base44.functions.invoke("autoBackup", {});
        toast.success("Backup realizado!");
      },
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ key, label, icon: Icon, color, fn }) => (
        <Button
          key={key}
          size="sm"
          disabled={!!loading}
          onClick={() => run(key, fn)}
          className={`gap-1.5 text-white text-xs ${color}`}
        >
          {loading === key
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Icon className="w-3.5 h-3.5" />}
          {label}
        </Button>
      ))}
    </div>
  );
}