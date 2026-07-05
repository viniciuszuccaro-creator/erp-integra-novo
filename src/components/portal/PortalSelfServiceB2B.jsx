import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import {
  ShoppingCart, FileText, CreditCard, Package, MessageCircle,
  ChevronRight, Search, Clock, CheckCircle2, AlertCircle
} from "lucide-react";
import { createPageUrl } from "@/utils";
import { useContextoVisual } from "@/components/lib/useContextoVisual";

const ATALHOS = [
  { icon: ShoppingCart, label: "Novo Pedido",        cor: "bg-blue-100 text-blue-700",    action: "novo_pedido" },
  { icon: FileText,     label: "Meus Pedidos",        cor: "bg-purple-100 text-purple-700", action: "pedidos" },
  { icon: CreditCard,   label: "Financeiro",          cor: "bg-green-100 text-green-700",   action: "financeiro" },
  { icon: Package,      label: "Rastrear Entrega",    cor: "bg-orange-100 text-orange-700", action: "entregas" },
  { icon: FileText,     label: "Documentos / NF-e",   cor: "bg-slate-100 text-slate-700",   action: "documentos" },
  { icon: MessageCircle,label: "Suporte",             cor: "bg-rose-100 text-rose-700",     action: "suporte" },
];

const STATUS_CLS = {
  Aprovado:             'bg-emerald-100 text-emerald-700',
  Faturado:             'bg-blue-100 text-blue-700',
  'Em Trânsito':        'bg-indigo-100 text-indigo-700',
  Entregue:             'bg-green-100 text-green-700',
  Cancelado:            'bg-red-100 text-red-700',
  Rascunho:             'bg-slate-100 text-slate-600',
  'Em Produção':        'bg-amber-100 text-amber-700',
  'Aguardando Aprovação':'bg-yellow-100 text-yellow-700',
};

export default function PortalSelfServiceB2B({ clienteId, onAction }) {
  const [busca, setBusca] = useState('');
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: pedidos = [], isLoading } = useQuery({
    queryKey: ['portal-b2b-pedidos', clienteId, contextoKey],
    enabled: !!clienteId,
    staleTime: 120000,
    queryFn: async () => {
      const res = await filterInContext('Pedido',
        { cliente_id: clienteId, pode_ver_no_portal: true },
        '-data_pedido', 10
      );
      return res || [];
    },
  });

  const filtrados = pedidos.filter(p =>
    !busca || (p.numero_pedido || '').toLowerCase().includes(busca.toLowerCase())
  );

  const pendentes = pedidos.filter(p => ['Rascunho', 'Em Produção', 'Pronto para Faturar'].includes(p.status));
  const emTransito = pedidos.filter(p => ['Em Expedição', 'Em Trânsito'].includes(p.status));

  return (
    <div className="space-y-4 w-full">
      {/* KPIs rápidos */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center">
          <Clock className="w-4 h-4 text-amber-500 mb-1" />
          <span className="text-lg font-bold text-slate-900">{pendentes.length}</span>
          <span className="text-[10px] text-slate-500">Em andamento</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center">
          <Package className="w-4 h-4 text-blue-500 mb-1" />
          <span className="text-lg font-bold text-slate-900">{emTransito.length}</span>
          <span className="text-[10px] text-slate-500">Em trânsito</span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-3 flex flex-col items-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 mb-1" />
          <span className="text-lg font-bold text-slate-900">{pedidos.filter(p => p.status === 'Entregue').length}</span>
          <span className="text-[10px] text-slate-500">Entregues</span>
        </div>
      </div>

      {/* Atalhos Self-Service */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-slate-700">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ATALHOS.map((a) => (
              <button
                key={a.action}
                onClick={() => onAction?.(a.action)}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-3 ${a.cor} hover:opacity-80 transition-opacity`}
              >
                <a.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium text-center leading-tight">{a.label}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pedidos recentes com busca */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <CardTitle className="text-sm text-slate-700">Meus Pedidos Recentes</CardTitle>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <Input
                value={busca}
                onChange={e => setBusca(e.target.value)}
                placeholder="Buscar..."
                className="pl-8 h-7 text-xs w-36"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}
            </div>
          ) : filtrados.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-xs">Nenhum pedido encontrado.</div>
          ) : (
            <div className="space-y-1.5">
              {filtrados.map(p => (
                <div key={p.id} className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 rounded-lg px-3 py-2 transition-colors cursor-pointer"
                  onClick={() => onAction?.('ver_pedido', p)}>
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-slate-900">#{p.numero_pedido}</div>
                      <div className="text-[10px] text-slate-500">
                        {p.data_pedido} • R$ {Number(p.valor_total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`text-[9px] ${STATUS_CLS[p.status] || 'bg-slate-100 text-slate-600'}`}>
                      {p.status}
                    </Badge>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}