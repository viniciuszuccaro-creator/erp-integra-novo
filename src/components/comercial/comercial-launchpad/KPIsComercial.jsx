import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ShoppingCart, TrendingUp, FileText, CheckCircle2, Clock, Percent, Factory } from 'lucide-react';
import { safeNumber } from '@/components/comercial/utils/comercialSafeData';

/**
 * KPIs Comercial — apenas essenciais operacionais.
 * V21.4: detalhes (peso, etapas, margem por tipo, fluxo de entrega) ficam dentro das abas/windows.
 */
export default function KPIsComercial({
  totalClientes, clientesAtivos, totalPedidos, totalVendas, ticketMedio,
  valorFaturado, valorPendenteFaturamento,
  pedidosFaturados, pedidosFaturamentoParcial, pedidosCancelados,
  margemBruta, margemPercentual, onDrillDown,
  // Mantidos na assinatura para compatibilidade do caller (Comercial.jsx), mas não renderizados aqui
  pesoTotalVendido, pesoFaturado, pesoPendenteFaturamento, margemFaturada,
  totalEtapasEntrega, etapasFaturadas, etapasPendentes,
  pedidosComProducao, pedidosSomenteRevenda, percentualFaturado, ticketFaturado,
  pedidosEmProducao, pedidosProntoFaturar, pedidosEmExpedicao, pedidosEmTransito, pedidosEntregues,
  quantidadesPorTipo, quantidadeTotalItens, margemPorTipo,
  taxaEntregaSucesso, taxaCancelamento, funilStatus,
}) {
  const vendas = safeNumber(totalVendas);
  const ticket = safeNumber(ticketMedio);
  const fat = safeNumber(valorFaturado);
  const pend = safeNumber(valorPendenteFaturamento);
  const margem = safeNumber(margemBruta);
  const margemPct = safeNumber(margemPercentual);
  const pctFat = safeNumber(percentualFaturado);

  const fmtMoeda = (v) => `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

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
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 min-h-[90px]">
      <CardBase icon={Users} iconColor="text-blue-600" title="Clientes" value={totalClientes} sub={`${clientesAtivos} ativos`} onClick={onDrillDown} dataKey="clientes" />
      <CardBase icon={ShoppingCart} iconColor="text-purple-600" title="Pedidos" value={totalPedidos} sub={`${pedidosCancelados} cancelados`} onClick={onDrillDown} dataKey="pedidos" />
      <CardBase icon={TrendingUp} iconColor="text-green-600" title="Total Vendas" value={fmtMoeda(vendas)} onClick={onDrillDown} dataKey="vendas" />
      <CardBase icon={FileText} iconColor="text-orange-600" title="Ticket Médio" value={fmtMoeda(ticket)} onClick={onDrillDown} dataKey="ticket" />
      <CardBase icon={CheckCircle2} iconColor="text-emerald-600" title="Faturado" value={fmtMoeda(fat)} sub={`${pctFat.toFixed(0)}% do total`} onClick={onDrillDown} dataKey="faturado" />
      <CardBase icon={Clock} iconColor="text-amber-600" title="Pend. Faturar" value={fmtMoeda(pend)} sub={pedidosFaturamentoParcial > 0 ? `${pedidosFaturamentoParcial} parciais` : undefined} onClick={onDrillDown} dataKey="pendente" />
      <CardBase icon={Percent} iconColor="text-indigo-600" title="Margem Bruta" value={fmtMoeda(margem)} sub={`${margemPct.toFixed(1)}%`} onClick={onDrillDown} dataKey="margem" />
      <CardBase icon={Factory} iconColor="text-rose-600" title="Em Produção" value={pedidosEmProducao || 0} sub={`${pedidosComProducao || 0} c/ produção`} onClick={onDrillDown} dataKey="producao" />
    </div>
  );
}