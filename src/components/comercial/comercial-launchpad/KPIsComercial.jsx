import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, TrendingUp, FileText, Scale, Percent, Clock, CheckCircle2 } from 'lucide-react';
import { safeNumber } from '@/components/comercial/utils/comercialSafeData';

/**
 * V21.0 KPIs Comercial — Vol 5.1: Ampliado com faturamento parcial, peso, margem e drill-down
 */
export default function KPIsComercial({
  totalClientes, clientesAtivos, totalPedidos, totalVendas, ticketMedio,
  valorFaturado, valorPendenteFaturamento, pesoTotalVendido,
  pedidosFaturados, pedidosFaturamentoParcial, pedidosCancelados,
  margemBruta, margemPercentual, onDrillDown
}) {
  const vendas = safeNumber(totalVendas);
  const ticket = safeNumber(ticketMedio);
  const fat = safeNumber(valorFaturado);
  const pend = safeNumber(valorPendenteFaturamento);
  const peso = safeNumber(pesoTotalVendido);
  const margem = safeNumber(margemBruta);
  const margemPct = safeNumber(margemPercentual);

  const fmtMoeda = (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const fmtPeso = (v) => v >= 1000 ? `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ton` : `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;

  const CardBase = ({ icon: Icon, iconColor, title, value, sub, onClick, dataKey }) => (
    <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => onClick?.(dataKey)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 pt-3 px-3">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </CardHeader>
      <CardContent className="px-3 pb-2">
        <div className="text-lg font-bold text-slate-800 truncate">{value}</div>
        {sub && <p className="text-xs text-slate-500 truncate">{sub}</p>}
      </CardContent>
    </Card>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 min-h-[90px]">
      <CardBase icon={Users} iconColor="text-blue-600" title="Clientes" value={totalClientes} sub={`${clientesAtivos} ativos`} onClick={onDrillDown} dataKey="clientes" />
      <CardBase icon={ShoppingCart} iconColor="text-purple-600" title="Pedidos" value={totalPedidos} sub={`${pedidosCancelados} cancelados`} onClick={onDrillDown} dataKey="pedidos" />
      <CardBase icon={TrendingUp} iconColor="text-green-600" title="Total Vendas" value={fmtMoeda(vendas)} onClick={onDrillDown} dataKey="vendas" />
      <CardBase icon={FileText} iconColor="text-orange-600" title="Ticket Médio" value={fmtMoeda(ticket)} onClick={onDrillDown} dataKey="ticket" />
      <CardBase icon={CheckCircle2} iconColor="text-emerald-600" title="Faturado" value={fmtMoeda(fat)} sub={`${pedidosFaturados} pedidos`} onClick={onDrillDown} dataKey="faturado" />
      <CardBase icon={Clock} iconColor="text-amber-600" title="Pend. Faturar" value={fmtMoeda(pend)} sub={pedidosFaturamentoParcial > 0 ? `${pedidosFaturamentoParcial} parciais` : undefined} onClick={onDrillDown} dataKey="pendente" />
      <CardBase icon={Scale} iconColor="text-cyan-600" title="Peso Vendido" value={fmtPeso(peso)} onClick={onDrillDown} dataKey="peso" />
      <CardBase icon={Percent} iconColor="text-indigo-600" title="Margem" value={fmtMoeda(margem)} sub={`${margemPct.toFixed(1)}%`} onClick={onDrillDown} dataKey="margem" />
    </div>
  );
}