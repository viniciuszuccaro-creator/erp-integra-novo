/**
 * AdminSaudeBar — barra compacta de saúde do sistema
 * Mostra: empresas vinculadas, usuários, propagação e status geral
 */
import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { useRLSQuery } from "@/components/lib/useRLSQuery";
import { CheckCircle2, AlertCircle, Loader2, ArrowDownUp, Users, Building2 } from "lucide-react";

export default function AdminSaudeBar() {
  const { grupoAtual, empresasDoGrupo } = useContextoVisual();
  const [stats, setStats] = useState({ usuarios: 0, perfis: 0, loading: true, error: false });
  const [propStatus, setPropStatus] = useState("idle"); // idle | ok | warn

  // Perfis via useRLSQuery (cache compartilhado)
  const { data: perfisCache = [] } = useRLSQuery(
    'PerfilAcesso', { ativo: true }, '-updated_date', 1,
    { enabled: !!grupoAtual?.id }
  );

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        // Usa entityListSorted (backend) em vez de SDK direto — protege contra 429/500
        const [usersRes, cfgRes] = await Promise.allSettled([
          base44.functions.invoke('entityListSorted', {
            entityName: 'User', filter: {}, sortField: 'created_date', sortDirection: 'desc', limit: 1,
          }),
          base44.functions.invoke('entityListSorted', {
            entityName: 'ConfiguracaoSistema',
            filter: { chave: "propagacao_grupo_empresas_ativa" },
            sortField: 'updated_date', sortDirection: 'desc', limit: 1,
          }),
        ]);
        if (!alive) return;

        const usersData = usersRes.status === "fulfilled" ? (Array.isArray(usersRes.value?.data) ? usersRes.value.data : []) : [];
        const usuarios = usersData.length;
        const perfis = perfisCache?.length || 0;
        const cfgData = cfgRes.status === "fulfilled" ? (Array.isArray(cfgRes.value?.data) ? cfgRes.value.data : []) : [];
        const propagacaoAtiva = cfgData.some(c => c.ativa === true);
        setPropStatus(propagacaoAtiva ? "ok" : "warn");
        setStats({ usuarios, perfis, loading: false, error: false });
      } catch {
        if (alive) setStats(s => ({ ...s, loading: false, error: true }));
      }
    };
    load();
    return () => { alive = false; };
  }, [grupoAtual?.id, perfisCache?.length]);

  if (stats.loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-200">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
        <span className="text-xs text-slate-400">Carregando status do sistema...</span>
      </div>
    );
  }

  const kpis = [
    {
      icon: Building2,
      label: "Empresas",
      value: empresasDoGrupo.length,
      color: "text-blue-600",
    },
    {
      icon: Users,
      label: "Usuários",
      value: stats.usuarios,
      color: "text-indigo-600",
    },
    {
      icon: ArrowDownUp,
      label: "Propagação",
      value: propStatus === "ok" ? "Ativa" : "Inativa",
      color: propStatus === "ok" ? "text-green-600" : "text-amber-600",
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-4 px-4 md:px-6 py-2 bg-white border-b border-slate-100 text-xs">
      {kpis.map(k => (
        <div key={k.label} className="flex items-center gap-1.5">
          <k.icon className={`w-3.5 h-3.5 ${k.color}`} />
          <span className="text-slate-500">{k.label}:</span>
          <span className={`font-semibold ${k.color}`}>{k.value}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 ml-auto">
        {stats.error ? (
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
        ) : (
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
        )}
        <span className={`font-medium ${stats.error ? "text-red-600" : "text-green-600"}`}>
          {stats.error ? "Verificar sistema" : "Sistema operacional"}
        </span>
      </div>
    </div>
  );
}