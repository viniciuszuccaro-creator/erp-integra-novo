import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, BarChart3, RefreshCw } from 'lucide-react';

const fmt = (v) => v?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }) ?? 'R$ 0';

function KPICard({ label, atual, anterior, formato = 'numero', inverse = false }) {
  const delta = anterior > 0 ? (((atual - anterior) / anterior) * 100).toFixed(1) : null;
  const isUp = atual >= anterior;
  const isGood = inverse ? !isUp : isUp;
  const color = delta === null ? 'text-slate-500' : isGood ? 'text-emerald-600' : 'text-red-500';
  const Icon = delta === null ? Minus : isUp ? TrendingUp : TrendingDown;
  const display = formato === 'moeda' ? fmt(atual) : formato === 'pct' ? `${atual}%` : atual?.toLocaleString('pt-BR') ?? '0';

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <p className="text-xs text-slate-500 mb-1 truncate">{label}</p>
      <p className="text-xl font-bold text-slate-900">{display}</p>
      <div className={`flex items-center gap-1 text-xs font-medium mt-1 ${color}`}>
        <Icon className="w-3.5 h-3.5" />
        {delta !== null ? `${delta > 0 ? '+' : ''}${delta}% vs anterior` : 'Sem dado anterior'}
      </div>
      <p className="text-[10px] text-slate-400 mt-0.5">Anterior: {formato === 'moeda' ? fmt(anterior) : anterior?.toLocaleString('pt-BR') ?? '0'}</p>
    </div>
  );
}

export default function DashboardKPIsComparativosWidget() {
  const { empresaAtual, grupoAtual, estaNoGrupo, filterInContext } = useContextoVisual();
  const [refetchKey, setRefetchKey] = useState(0);

  const hasCtx = Boolean(empresaAtual?.id || estaNoGrupo || grupoAtual?.id);

  const { data, isLoading } = useQuery({
    queryKey: ['kpis-comparativos', empresaAtual?.id, grupoAtual?.id, estaNoGrupo, refetchKey],
    queryFn: async () => {
      const now = new Date();
      const mesAtualInicio = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const mesAnteriorInicio = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      const mesAnteriorFim = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];

      const [pedidosAtual, pedidosAnterior, recAtual, recAnterior] = await Promise.all([
        filterInContext('Pedido', {}, '-created_date', 200),
        filterInContext('Pedido', {}, '-created_date', 200),
        filterInContext('ContaReceber', {}, '-data_vencimento', 200),
        filterInContext('ContaReceber', {}, '-data_vencimento', 200),
      ]);

      const filtraByMonth = (arr, inicio, fim) => (arr || []).filter(p => {
        const d = p?.data_pedido || p?.created_date || '';
        return d >= inicio && (fim ? d <= fim : true);
      });

      const paAtual = filtraByMonth(pedidosAtual, mesAtualInicio, null);
      const paAnterior = filtraByMonth(pedidosAnterior, mesAnteriorInicio, mesAnteriorFim);
      const somaPed = (arr) => (arr || []).reduce((s, p) => s + (Number(p?.valor_total) || 0), 0);

      const filtraRecByMonth = (arr, inicio, fim) => (arr || []).filter(r => {
        const d = r?.data_emissao || r?.created_date || '';
        return d >= inicio && (fim ? d <= fim : true);
      });

      const recAtualF = filtraRecByMonth(recAtual, mesAtualInicio, null);
      const recAnteriorF = filtraRecByMonth(recAnterior, mesAnteriorInicio, mesAnteriorFim);
      const somaRec = (arr) => (arr || []).reduce((s, r) => s + (Number(r?.valor) || 0), 0);

      return {
        vendas: { atual: somaPed(paAtual), anterior: somaPed(paAnterior) },
        pedidos: { atual: paAtual.length, anterior: paAnterior.length },
        receitas: { atual: somaRec(recAtualF), anterior: somaRec(recAnteriorF) },
        ticketMedio: {
          atual: paAtual.length ? somaPed(paAtual) / paAtual.length : 0,
          anterior: paAnterior.length ? somaPed(paAnterior) / paAnterior.length : 0,
        },
      };
    },
    staleTime: 300000,
    enabled: hasCtx,
  });

  return (
    <Card className="w-full bg-white/90 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            KPIs Comparativos — Mês Atual vs Anterior
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-100 text-blue-700 text-xs">IA</Badge>
            <button onClick={() => setRefetchKey(k => k + 1)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
              <RefreshCw className={`w-4 h-4 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : !hasCtx ? (
          <p className="text-sm text-slate-500">Selecione uma empresa ou grupo para carregar.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <KPICard label="Vendas do Mês" atual={data?.vendas?.atual ?? 0} anterior={data?.vendas?.anterior ?? 0} formato="moeda" />
            <KPICard label="Pedidos" atual={data?.pedidos?.atual ?? 0} anterior={data?.pedidos?.anterior ?? 0} />
            <KPICard label="Receitas Lançadas" atual={data?.receitas?.atual ?? 0} anterior={data?.receitas?.anterior ?? 0} formato="moeda" />
            <KPICard label="Ticket Médio" atual={Math.round(data?.ticketMedio?.atual ?? 0)} anterior={Math.round(data?.ticketMedio?.anterior ?? 0)} formato="moeda" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}