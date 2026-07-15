import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, TrendingUp, FileText, Scale, Percent, Clock, CheckCircle2, Factory, Truck, Package, Layers } from 'lucide-react';
import { safeNumber } from '@/components/comercial/utils/comercialSafeData';

/**
 * V21.4 KPIs Comercial — Ampliado com faturamento parcial, peso, margem, etapas, produção e entrega
 */
export default function KPIsComercial({
  totalClientes, clientesAtivos, totalPedidos, totalVendas, ticketMedio,
  valorFaturado, valorPendenteFaturamento, pesoTotalVendido,
  pedidosFaturados, pedidosFaturamentoParcial, pedidosCancelados,
  margemBruta, margemPercentual, onDrillDown,
  // V21.4: Novos KPIs
  pesoFaturado, pesoPendenteFaturamento, margemFaturada,
  totalEtapasEntrega, etapasFaturadas, etapasPendentes,
  pedidosComProducao, pedidosSomenteRevenda,
  percentualFaturado, ticketFaturado,
  pedidosEmProducao, pedidosProntoFaturar, pedidosEmExpedicao, pedidosEmTransito, pedidosEntregues,
}) {
  const vendas = safeNumber(totalVendas);
  const ticket = safeNumber(ticketMedio);
  const fat = safeNumber(valorFaturado);
  const pend = safeNumber(valorPendenteFaturamento);
  const peso = safeNumber(pesoTotalVendido);
  const pesoFat = safeNumber(pesoFaturado);
  const pesoPend = safeNumber(pesoPendenteFaturamento);
  const margem = safeNumber(margemBruta);
  const margemPct = safeNumber(margemPercentual);
  const margemFat = safeNumber(margemFaturada);
  const pctFat = safeNumber(percentualFaturado);
  const ticketFat = safeNumber(ticketFaturado);

  const fmtMoeda = (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
  const fmtPeso = (v) => v >= 1000 ? `${(v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ton` : `${v.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} kg`;
  const fmtPct = (v) => `${v.toFixed(1)}%`;

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
      {/* ── Vendas ── */}
      <CardBase icon={Users} iconColor="text-blue-600" title="Clientes" value={totalClientes} sub={`${clientesAtivos} ativos`} onClick={onDrillDown} dataKey="clientes" />
      <CardBase icon={ShoppingCart} iconColor="text-purple-600" title="Pedidos" value={totalPedidos} sub={`${pedidosCancelados} cancelados`} onClick={onDrillDown} dataKey="pedidos" />
      <CardBase icon={TrendingUp} iconColor="text-green-600" title="Total Vendas" value={fmtMoeda(vendas)} onClick={onDrillDown} dataKey="vendas" />
      <CardBase icon={FileText} iconColor="text-orange-600" title="Ticket Médio" value={fmtMoeda(ticket)} onClick={onDrillDown} dataKey="ticket" />

      {/* ── Faturamento ── */}
      <CardBase icon={CheckCircle2} iconColor="text-emerald-600" title="Faturado" value={fmtMoeda(fat)} sub={`${pctFat.toFixed(0)}% do total`} onClick={onDrillDown} dataKey="faturado" />
      <CardBase icon={Clock} iconColor="text-amber-600" title="Pend. Faturar" value={fmtMoeda(pend)} sub={pedidosFaturamentoParcial > 0 ? `${pedidosFaturamentoParcial} parciais` : undefined} onClick={onDrillDown} dataKey="pendente" />
      <CardBase icon={FileText} iconColor="text-emerald-700" title="Ticket Faturado" value={fmtMoeda(ticketFat)} sub={`${pedidosFaturados} pedidos`} onClick={onDrillDown} dataKey="faturado" />

      {/* ── Peso ── */}
      <CardBase icon={Scale} iconColor="text-cyan-600" title="Peso Vendido" value={fmtPeso(peso)} sub={`${fmtPeso(pesoFat)} faturado`} onClick={onDrillDown} dataKey="peso" />
      <CardBase icon={Scale} iconColor="text-cyan-700" title="Peso Pendente" value={fmtPeso(pesoPend)} onClick={onDrillDown} dataKey="peso" />

      {/* ── Margem ── */}
      <CardBase icon={Percent} iconColor="text-indigo-600" title="Margem Bruta" value={fmtMoeda(margem)} sub={fmtPct(margemPct)} onClick={onDrillDown} dataKey="margem" />
      <CardBase icon={Percent} iconColor="text-indigo-700" title="Margem Faturada" value={fmtMoeda(margemFat)} onClick={onDrillDown} dataKey="margem" />

      {/* ── Etapas de Entrega/Faturamento ── */}
      <CardBase icon={Layers} iconColor="text-violet-600" title="Etapas Entrega" value={totalEtapasEntrega || 0} sub={`${etapasFaturadas || 0} faturadas`} onClick={onDrillDown} dataKey="pedidos" />
      <CardBase icon={Layers} iconColor="text-violet-700" title="Etapas Pendentes" value={etapasPendentes || 0} onClick={onDrillDown} dataKey="pendente" />

      {/* ── Produção ── */}
      <CardBase icon={Factory} iconColor="text-rose-600" title="Com Produção" value={pedidosComProducao || 0} sub="armado/corte-dobra" onClick={onDrillDown} dataKey="pedidos" />
      <CardBase icon={Package} iconColor="text-rose-700" title="Somente Revenda" value={pedidosSomenteRevenda || 0} onClick={onDrillDown} dataKey="pedidos" />

      {/* ── Fluxo de Entrega ── */}
      <CardBase icon={Factory} iconColor="text-blue-700" title="Em Produção" value={pedidosEmProducao || 0} onClick={onDrillDown} dataKey="pedidos" />
      <CardBase icon={CheckCircle2} iconColor="text-amber-700" title="Pronto Faturar" value={pedidosProntoFaturar || 0} onClick={onDrillDown} dataKey="faturado" />
      <CardBase icon={Truck} iconColor="text-orange-700" title="Em Expedição" value={pedidosEmExpedicao || 0} onClick={onDrillDown} dataKey="pedidos" />
      <CardBase icon={Truck} iconColor="text-blue-800" title="Em Trânsito" value={pedidosEmTransito || 0} onClick={onDrillDown} dataKey="pedidos" />
      <CardBase icon={CheckCircle2} iconColor="text-green-700" title="Entregues" value={pedidosEntregues || 0} onClick={onDrillDown} dataKey="pedidos" />
    </div>
  );
}