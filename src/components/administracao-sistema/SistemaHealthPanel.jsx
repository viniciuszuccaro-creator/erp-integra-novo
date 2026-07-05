import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Clock, RefreshCw, Shield, Zap, Link } from "lucide-react";

const StatusDot = ({ ok, loading }) => {
  if (loading) return <div className="w-2.5 h-2.5 rounded-full bg-slate-300 animate-pulse" />;
  return <div className={`w-2.5 h-2.5 rounded-full ${ok ? 'bg-green-500' : 'bg-red-500'}`} />;
};

export default function SistemaHealthPanel() {
  const { grupoAtual, empresaAtual } = useContextoVisual();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: healthData, isLoading } = useQuery({
    queryKey: ["sistema-health", grupoAtual?.id, empresaAtual?.id, refreshKey],
    queryFn: async () => {
      const since = Date.now() - 2 * 60 * 60 * 1000;
      const logs = await base44.entities.AuditLog.filter(grupoAtual?.id ? { group_id: grupoAtual.id } : {}, '-data_hora', 200).catch(() => []);
      const recent = (logs || []).filter(l => new Date(l?.data_hora || l?.created_date || 0).getTime() >= since);
      const errors = recent.filter(l => /erro|error|failed|exception/i.test(`${l?.descricao || ''} ${l?.acao || ''}`));
      const secAlerts = recent.filter(l => l?.tipo_auditoria === 'seguranca');
      const propagacoes = recent.filter(l => l?.entidade === 'PropagacaoGrupo');

      let syncMaps = 0;
      try {
        const maps = await base44.entities.SyncMap.filter(grupoAtual?.id ? { group_id: grupoAtual.id } : {}, '-updated_date', 1);
        syncMaps = Array.isArray(maps) ? maps.length : 0;
      } catch {}

      let cfgCount = 0;
      try {
        const cfgs = await base44.entities.ConfiguracaoSistema.filter(grupoAtual?.id ? { group_id: grupoAtual.id } : {}, '-updated_date', 1);
        cfgCount = Array.isArray(cfgs) ? cfgs.length : 0;
      } catch {}

      return {
        errors: errors.length,
        secAlerts: secAlerts.length,
        propagacoes: propagacoes.length,
        syncMaps,
        cfgCount,
        totalRecentLogs: recent.length,
        ok: errors.length === 0 && secAlerts.length === 0,
      };
    },
    staleTime: 60_000,
    retry: 1,
  });

  const items = [
    { label: "Erros Recentes (2h)", icon: AlertCircle, ok: !isLoading && (healthData?.errors ?? 0) === 0, value: isLoading ? "—" : String(healthData?.errors ?? 0), sub: "erros no AuditLog", color: !isLoading && (healthData?.errors ?? 0) === 0 ? "text-green-600" : "text-red-600" },
    { label: "Alertas de Segurança", icon: Shield, ok: !isLoading && (healthData?.secAlerts ?? 0) === 0, value: isLoading ? "—" : String(healthData?.secAlerts ?? 0), sub: "últimas 2h", color: !isLoading && (healthData?.secAlerts ?? 0) === 0 ? "text-green-600" : "text-amber-600" },
    { label: "Propagações", icon: RefreshCw, ok: true, value: isLoading ? "—" : String(healthData?.propagacoes ?? 0), sub: "últimas 2h", color: "text-blue-600" },
    { label: "Sync Maps", icon: Link, ok: true, value: isLoading ? "—" : String(healthData?.syncMaps ?? 0), sub: "vínculos ativos", color: "text-purple-600" },
    { label: "Configurações", icon: Zap, ok: true, value: isLoading ? "—" : String(healthData?.cfgCount ?? 0), sub: "toggles/configs", color: "text-indigo-600" },
    { label: "Logs Recentes", icon: Clock, ok: true, value: isLoading ? "—" : String(healthData?.totalRecentLogs ?? 0), sub: "eventos (2h)", color: "text-slate-600" },
  ];

  return (
    <Card className="w-full">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-base flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Saúde do Sistema
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-xs ${!isLoading && healthData?.ok ? 'border-green-500 text-green-600' : 'border-amber-500 text-amber-600'}`}>
            {isLoading ? "Verificando..." : healthData?.ok ? "✓ Sistema OK" : "⚠ Atenção"}
          </Badge>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setRefreshKey(k => k + 1)}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {items.map((item, i) => {
            const ItemIcon = item.icon;
            return (
              <div key={i} className="flex flex-col gap-1 p-3 rounded-lg border border-slate-100 bg-slate-50">
                <div className="flex items-center gap-1.5">
                  <StatusDot ok={item.ok} loading={isLoading} />
                  <ItemIcon className={`w-3.5 h-3.5 ${item.color}`} />
                </div>
                <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs font-medium text-slate-700 leading-tight">{item.label}</div>
                <div className="text-xs text-slate-400">{item.sub}</div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}