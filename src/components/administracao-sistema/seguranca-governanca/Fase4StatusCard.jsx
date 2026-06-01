/**
 * Fase4StatusCard — Checklist visual da Fase 4: Omnicanal Integrado
 */
import React, { useState, useEffect, useCallback } from "react";
import {
  CheckCircle2, XCircle, Loader2, RefreshCw, MessageCircle,
  ChevronDown, ChevronUp, AlertTriangle, Info, Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";

const ITEM_META = {
  chatbot_crm_linked:           { label: "Chatbot + CRM — conversas vinculadas",             group: "CRM"           },
  portal_chat_integrado:        { label: "Portal do Cliente + Chat integrado",                group: "Portal"        },
  app_motorista_rastreamento:   { label: "App Motorista — rastreamento realtime",             group: "Logística"     },
  whatsapp_linking:             { label: "WhatsApp linking automático clientes/pedidos",      group: "WhatsApp"      },
  painel_unificado_comunicacao: { label: "Painel único de comunicação — HubAtendimento",      group: "Hub"           },
  notificacoes_automaticas:     { label: "Notificações push automáticas multicanal",          group: "Hub"           },
  rastreamento_publico:         { label: "Rastreamento público de entregas",                  group: "Logística"     },
  chatbot_multicanal:           { label: "Chatbot multicanal — intent engine",                group: "CRM"           },
  sla_fila_espera:              { label: "SLA + fila de espera (MonitorSLA)",                 group: "Hub"           },
  rbac_auditoria_comunicacao:   { label: "RBAC + auditoria de comunicação multiempresa",      group: "Segurança"     },
};

const GROUP_ORDER = ["CRM", "Portal", "Logística", "WhatsApp", "Hub", "Segurança"];
const GROUP_COLORS = {
  CRM:       "bg-blue-100 text-blue-700",
  Portal:    "bg-purple-100 text-purple-700",
  Logística: "bg-orange-100 text-orange-700",
  WhatsApp:  "bg-green-100 text-green-700",
  Hub:       "bg-cyan-100 text-cyan-700",
  Segurança: "bg-red-100 text-red-700",
};

function StatusRow({ item }) {
  const [open, setOpen] = useState(false);
  const meta = ITEM_META[item.id] || { label: item.id, group: "Hub" };
  return (
    <div className="border-b last:border-0">
      <button
        className="w-full flex items-center gap-3 py-2.5 px-1 hover:bg-slate-50 transition-colors text-left"
        onClick={() => setOpen(o => !o)}
      >
        <div className="shrink-0">
          {item.ok ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
        </div>
        <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
          <span className={`text-sm font-medium truncate ${item.ok ? "text-slate-800" : "text-red-700"}`}>
            {meta.label}
          </span>
          <Badge className={`text-xs shrink-0 ${GROUP_COLORS[meta.group] || "bg-slate-100 text-slate-600"}`}>{meta.group}</Badge>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge className={`text-xs ${item.ok ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
            {item.ok ? "✓ OK" : "✗ Falha"}
          </Badge>
          {item.detail && (open ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />)}
        </div>
      </button>
      {open && item.detail && (
        <div className="px-8 pb-2.5">
          <div className="flex items-start gap-1.5 text-xs text-slate-500 bg-slate-50 rounded-lg px-3 py-2">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
            <span>{item.detail}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreCircle({ score }) {
  const color = score >= 100 ? "#22c55e" : score >= 80 ? "#f59e0b" : "#ef4444";
  const r = 26, c = 32, circumference = 2 * Math.PI * r;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={64} height={64} className="-rotate-90">
        <circle cx={c} cy={c} r={r} stroke="#e2e8f0" strokeWidth={6} fill="none" />
        <circle cx={c} cy={c} r={r} stroke={color} strokeWidth={6} fill="none"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s ease" }} />
      </svg>
      <span className="absolute text-sm font-bold" style={{ color }}>{score}%</span>
    </div>
  );
}

export default function Fase4StatusCard() {
  const [items, setItems]     = useState([]);
  const [score, setScore]     = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastRun, setLastRun] = useState(null);
  const [error, setError]     = useState(null);

  const runChecks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await base44.functions.invoke("fase4Check", {});
      const data = res?.data;
      if (!data || typeof data.score !== "number") throw new Error("Resposta inválida do servidor");
      setItems(data.items || []);
      setScore(data.score);
      setLastRun(new Date().toLocaleTimeString("pt-BR"));
    } catch (e) {
      setError(e?.message || "Erro ao executar verificação");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { runChecks(); }, []);

  const grouped = GROUP_ORDER.map(g => ({
    group: g,
    items: items.filter(i => (ITEM_META[i.id]?.group || "Hub") === g),
  })).filter(g => g.items.length > 0);

  const passed = items.filter(i => i.ok).length;
  const total  = items.length;

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="pb-3 shrink-0">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2.5">
            <MessageCircle className="w-5 h-5 text-cyan-600" />
            <div>
              <CardTitle className="text-sm font-semibold text-slate-800">
                Fase 4 — Omnicanal Integrado
              </CardTitle>
              {lastRun && <p className="text-xs text-slate-400">Verificado às {lastRun}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {score !== null && <ScoreCircle score={score} />}
            {score !== null && (
              <div className="text-right">
                <p className={`text-xs font-semibold ${score === 100 ? "text-green-600" : score >= 80 ? "text-amber-600" : "text-red-600"}`}>
                  {score === 100 ? "✓ Completo" : score >= 80 ? "Quase lá" : "Atenção"}
                </p>
                <p className="text-xs text-slate-400">{passed}/{total} itens</p>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={runChecks} disabled={loading} className="h-8 w-8 p-0">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        {score !== null && (
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all duration-700 ${score === 100 ? "bg-green-500" : score >= 80 ? "bg-amber-400" : "bg-red-500"}`}
              style={{ width: `${score}%` }}
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-auto px-4 pb-4">
        {loading && items.length === 0 && (
          <div className="flex items-center justify-center py-8 gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Verificando omnicanal integrado…</span>
          </div>
        )}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-3 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {score === 100 && !loading && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-3">
            <Zap className="w-4 h-4 text-green-600 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-700">Fase 4 concluída com 100%!</p>
              <p className="text-xs text-green-600">Chatbot+CRM, Portal, App Motorista, WhatsApp e Hub de Atendimento unificados.</p>
            </div>
          </div>
        )}
        {grouped.map(({ group, items: gItems }) => (
          <div key={group} className="mb-4 last:mb-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${GROUP_COLORS[group] || "bg-slate-100 text-slate-600"}`}>{group}</span>
              <span className="text-xs text-slate-400">{gItems.filter(i => i.ok).length}/{gItems.length}</span>
            </div>
            <div className="border rounded-lg overflow-hidden">
              {gItems.map(item => <StatusRow key={item.id} item={item} />)}
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && !error && (
          <div className="text-center py-6 text-slate-400 text-sm">
            Clique em atualizar para executar a verificação.
          </div>
        )}
      </CardContent>
    </Card>
  );
}