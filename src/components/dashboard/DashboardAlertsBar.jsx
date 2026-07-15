/**
 * DashboardAlertsBar — Barra de alertas prioritários em tempo real
 * Exibe alertas de estoque baixo, inadimplência, pedidos pendentes e anomalias IA
 */
import React, { useState } from "react";
import { AlertTriangle, X, ChevronRight, Package, DollarSign, ShoppingCart, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

const ALERT_CONFIG = {
  estoque: { icon: Package, color: "text-red-700", bg: "bg-red-50 border-red-200", label: "Estoque crítico" },
  inadimplencia: { icon: DollarSign, color: "text-orange-700", bg: "bg-orange-50 border-orange-200", label: "Inadimplência alta" },
  pedidos: { icon: ShoppingCart, color: "text-yellow-700", bg: "bg-yellow-50 border-yellow-200", label: "Pedidos aguardando" },
  anomalia: { icon: Zap, color: "text-purple-700", bg: "bg-purple-50 border-purple-200", label: "Anomalia financeira" },
};

function AlertChip({ type, message, to }) {
  const navigate = useNavigate();
  const cfg = ALERT_CONFIG[type] || ALERT_CONFIG.anomalia;
  const Icon = cfg.icon;
  return (
    <button
      onClick={() => navigate(to)}
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all hover:shadow-sm hover:scale-[1.01] ${cfg.bg}`}
    >
      <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${cfg.color}`} />
      <span className={`${cfg.color} truncate max-w-[180px]`}>{message}</span>
      <ChevronRight className={`w-3 h-3 flex-shrink-0 ${cfg.color} opacity-60`} />
    </button>
  );
}

export default function DashboardAlertsBar({
  produtosBaixoEstoque = 0,
  taxaInadimplencia = 0,
  pedidosAguardando = 0,
  anomaliasCount = 0,
  vencendoHoje = 0,
}) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      const ts = Number(localStorage.getItem('alerts_dismissed_at') || 0);
      // Auto-reexibir após 15 minutos
      return ts > 0 && Date.now() - ts < 15 * 60 * 1000;
    } catch { return false; }
  });

  const handleDismiss = () => {
    try { localStorage.setItem('alerts_dismissed_at', String(Date.now())); } catch (_) { console.error('[dashboard] catch:', _); }
    setDismissed(true);
  };

  const alerts = [
    produtosBaixoEstoque > 0 && {
      type: "estoque",
      message: `${produtosBaixoEstoque} produto${produtosBaixoEstoque > 1 ? 's' : ''} com estoque baixo`,
      to: createPageUrl("Estoque"),
    },
    taxaInadimplencia >= 10 && {
      type: "inadimplencia",
      message: `Inadimplência em ${taxaInadimplencia}% — atenção`,
      to: createPageUrl("Financeiro"),
    },
    pedidosAguardando > 0 && {
      type: "pedidos",
      message: `${pedidosAguardando} pedido${pedidosAguardando > 1 ? 's' : ''} aguardando aprovação`,
      to: createPageUrl("Comercial"),
    },
    vencendoHoje > 0 && {
      type: "inadimplencia",
      message: `${vencendoHoje} conta${vencendoHoje > 1 ? 's' : ''} vencendo hoje`,
      to: createPageUrl("Financeiro"),
    },
    anomaliasCount > 0 && {
      type: "anomalia",
      message: `${anomaliasCount} anomalia${anomaliasCount > 1 ? 's' : ''} detectada${anomaliasCount > 1 ? 's' : ''}`,
      to: createPageUrl("Financeiro"),
    },
  ].filter(Boolean);

  if (alerts.length === 0 || dismissed) return null;

  return (
    <div className="w-full flex items-center gap-2 px-3 py-2 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm">
      <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
      <span className="text-xs text-slate-500 font-medium flex-shrink-0">Alertas:</span>
      <div className="flex flex-wrap gap-2 flex-1 min-w-0">
        {alerts.map((a, i) => <AlertChip key={i} {...a} />)}
      </div>
      <button onClick={handleDismiss} className="ml-auto flex-shrink-0 text-slate-400 hover:text-slate-600">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}