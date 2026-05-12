import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Network, CheckCircle2, AlertTriangle, XCircle, RefreshCw, Loader2 } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

const INTEGRACOES = [
  { key: "nfe", nome: "NF-e / SEFAZ", icon: "📄", campo: "integracao_nfe" },
  { key: "boletos", nome: "Boletos / PIX", icon: "💳", campo: "integracao_boletos" },
  { key: "whatsapp", nome: "WhatsApp", icon: "💬", campo: "integracao_whatsapp" },
  { key: "maps", nome: "Google Maps", icon: "🗺️", campo: "integracao_maps" },
];

export default function IntegracoesSaudePanel() {
  const { empresaAtual } = useContextoVisual();
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: cfg, isLoading } = useQuery({
    queryKey: ['integracoes-saude', empresaAtual?.id, refreshKey],
    queryFn: async () => {
      if (!empresaAtual?.id) return null;
      const res = await base44.functions.invoke('getEntityRecord', {
        entityName: 'ConfiguracaoSistema',
        filter: { chave: `integracoes_${empresaAtual.id}` },
        limit: 1,
      });
      return Array.isArray(res?.data) ? res.data[0] : null;
    },
    staleTime: 60000,
    enabled: !!empresaAtual?.id,
  });

  const getStatus = (campo) => {
    if (!cfg) return "desconhecido";
    const val = cfg[campo];
    if (!val) return "não configurado";
    if (val.api_key || val.token || val.ativa) return "ativo";
    return "pendente";
  };

  const statusIcon = {
    "ativo": <CheckCircle2 className="w-4 h-4 text-green-600" />,
    "pendente": <AlertTriangle className="w-4 h-4 text-amber-500" />,
    "não configurado": <XCircle className="w-4 h-4 text-red-500" />,
    "desconhecido": <AlertTriangle className="w-4 h-4 text-slate-400" />,
  };
  const statusBadge = {
    "ativo": "bg-green-100 text-green-700",
    "pendente": "bg-amber-100 text-amber-700",
    "não configurado": "bg-red-100 text-red-700",
    "desconhecido": "bg-slate-100 text-slate-600",
  };

  const ativos = INTEGRACOES.filter(i => getStatus(i.campo) === "ativo").length;

  return (
    <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Network className="w-5 h-5 text-cyan-600" />
          Integrações
          <Badge className={`ml-auto text-xs ${ativos === INTEGRACOES.length ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
            {ativos}/{INTEGRACOES.length} ativas
          </Badge>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRefreshKey(k => k + 1)}>
            {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {INTEGRACOES.map(intg => {
            const status = getStatus(intg.campo);
            return (
              <div key={intg.key} className="flex items-center justify-between bg-white/70 rounded-lg px-3 py-2">
                <span className="text-sm flex items-center gap-2">
                  <span>{intg.icon}</span>
                  {intg.nome}
                </span>
                <div className="flex items-center gap-2">
                  {statusIcon[status]}
                  <Badge className={`text-xs ${statusBadge[status]}`}>{status}</Badge>
                </div>
              </div>
            );
          })}
        </div>
        {!empresaAtual?.id && (
          <p className="text-xs text-slate-400 text-center mt-2">Selecione uma empresa para ver o status</p>
        )}
      </CardContent>
    </Card>
  );
}