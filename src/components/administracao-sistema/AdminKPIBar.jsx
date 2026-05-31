/**
 * AdminKPIBar — Barra de KPIs do Admin (compacta, em tempo real)
 * Mostra: empresas ativas, usuários, configs, erros últimas 24h, propagações
 */
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Building2, Users, Settings, AlertCircle, ArrowDownUp, CheckCircle2 } from "lucide-react";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

function KPIItem({ icon: Icon, label, value, color = "text-blue-600", bg = "bg-blue-50" }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${bg} min-w-0`}>
      <Icon className={`w-4 h-4 ${color} shrink-0`} />
      <div className="min-w-0">
        <div className={`text-lg font-bold leading-tight ${color}`}>{value ?? "–"}</div>
        <div className="text-[10px] text-slate-500 truncate">{label}</div>
      </div>
    </div>
  );
}

export default function AdminKPIBar() {
  const { grupoAtual } = useContextoVisual();

  const { data } = useQuery({
    queryKey: ["admin-kpi-bar", grupoAtual?.id],
    queryFn: async () => {
      const [empresas, users, configs, logs] = await Promise.allSettled([
        base44.entities.Empresa.filter(grupoAtual?.id ? { group_id: grupoAtual.id } : {}, null, 100),
        base44.entities.User.list(null, 200),
        base44.entities.ConfiguracaoSistema.filter({}, null, 200),
        base44.entities.AuditLog.filter({}, "-created_date", 100),
      ]);

      const empresasList = empresas.status === "fulfilled" ? empresas.value : [];
      const usersList = users.status === "fulfilled" ? users.value : [];
      const configsList = configs.status === "fulfilled" ? configs.value : [];
      const logsList = logs.status === "fulfilled" ? logs.value : [];

      const since24h = Date.now() - 86400000;
      const erros24h = logsList.filter(l => {
        const ts = new Date(l?.data_hora || l?.created_date || 0).getTime();
        return ts >= since24h && /erro|error|fail/i.test(l?.descricao || "");
      }).length;

      const propagacoes24h = logsList.filter(l => {
        const ts = new Date(l?.data_hora || l?.created_date || 0).getTime();
        return ts >= since24h && /propag/i.test(l?.descricao || "");
      }).length;

      return {
        empresas: empresasList.filter(e => e.status === "Ativa" || !e.status).length,
        usuarios: usersList.length,
        configs: configsList.filter(c => c.ativa === true).length,
        erros24h,
        propagacoes24h,
      };
    },
    staleTime: 120000,
    refetchInterval: 300000,
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 w-full">
      <KPIItem icon={Building2} label="Empresas Ativas" value={data?.empresas} color="text-blue-600" bg="bg-blue-50" />
      <KPIItem icon={Users} label="Usuários" value={data?.usuarios} color="text-indigo-600" bg="bg-indigo-50" />
      <KPIItem icon={Settings} label="Configs Ativas" value={data?.configs} color="text-purple-600" bg="bg-purple-50" />
      <KPIItem
        icon={data?.erros24h > 0 ? AlertCircle : CheckCircle2}
        label="Erros (24h)"
        value={data?.erros24h ?? 0}
        color={data?.erros24h > 0 ? "text-red-600" : "text-green-600"}
        bg={data?.erros24h > 0 ? "bg-red-50" : "bg-green-50"}
      />
      <KPIItem icon={ArrowDownUp} label="Propagações (24h)" value={data?.propagacoes24h ?? 0} color="text-teal-600" bg="bg-teal-50" />
    </div>
  );
}