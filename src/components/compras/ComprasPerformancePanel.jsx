import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Package, Clock, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ComprasPerformancePanel({ ordensCompra = [], fornecedores = [], solicitacoes = [] }) {
  const stats = useMemo(() => {
    const recebidas = ordensCompra.filter(o => o.status === 'Recebida');
    const emProcesso = ordensCompra.filter(o => ['Aprovada', 'Enviada ao Fornecedor', 'Em Processo'].includes(o.status));
    const leadTimeMedio = recebidas.reduce((sum, o) => {
      if (o.lead_time_real) return sum + o.lead_time_real;
      return sum;
    }, 0) / (recebidas.filter(o => o.lead_time_real).length || 1);

    const atrasadas = ordensCompra.filter(o => {
      if (!o.data_entrega_prevista || o.status === 'Recebida' || o.status === 'Cancelada') return false;
      return new Date(o.data_entrega_prevista) < new Date();
    });

    const fornAtivos = fornecedores.filter(f => f.status_fornecedor === 'Ativo' || f.status === 'Ativo').length;
    const solicitacoesPendentes = solicitacoes.filter(s => s.status === 'Pendente').length;
    const totalGasto = ordensCompra.filter(o => o.status !== 'Cancelada').reduce((s, o) => s + (o.valor_total || 0), 0);

    return { recebidas: recebidas.length, emProcesso: emProcesso.length, leadTimeMedio: Math.round(leadTimeMedio), atrasadas: atrasadas.length, fornAtivos, solicitacoesPendentes, totalGasto };
  }, [ordensCompra, fornecedores, solicitacoes]);

  return (
    <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-sky-50 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          Performance Compras
          <Badge className="bg-cyan-100 text-cyan-700 text-xs ml-auto">{ordensCompra.length} OCs</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-white/70 rounded-lg p-2">
            <CheckCircle2 className="w-4 h-4 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{stats.recebidas}</p>
            <p className="text-xs text-slate-500">Recebidas</p>
          </div>
          <div className="bg-white/70 rounded-lg p-2">
            <Package className="w-4 h-4 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{stats.emProcesso}</p>
            <p className="text-xs text-slate-500">Em processo</p>
          </div>
          <div className="bg-white/70 rounded-lg p-2">
            <Clock className="w-4 h-4 text-purple-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-purple-600">{stats.leadTimeMedio}d</p>
            <p className="text-xs text-slate-500">Lead time médio</p>
          </div>
          <div className="bg-white/70 rounded-lg p-2">
            <AlertCircle className="w-4 h-4 text-red-500 mx-auto mb-1" />
            <p className="text-lg font-bold text-red-500">{stats.atrasadas}</p>
            <p className="text-xs text-slate-500">Atrasadas</p>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-600 bg-white/60 rounded-lg p-2 flex justify-between">
          <span>Fornecedores ativos: <strong>{stats.fornAtivos}</strong></span>
          <span>Solicitações pendentes: <strong>{stats.solicitacoesPendentes}</strong></span>
        </div>
        <div className="mt-1 text-xs text-center text-emerald-700 font-semibold bg-emerald-50 rounded-lg p-1">
          Total compras: R$ {stats.totalGasto.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
        </div>
      </CardContent>
    </Card>
  );
}