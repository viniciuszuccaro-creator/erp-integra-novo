import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from "@/api/base44Client";
import { Activity } from "lucide-react";
import { useContextoVisual } from '@/components/lib/useContextoVisual';
import useRLSQuery from '@/components/lib/useRLSQuery';
import KPIsRealtime from './dashboard-realtime/KPIsRealtime';
import GraficoFluxo7Dias from './dashboard-realtime/GraficoFluxo7Dias';

/**
 * DASHBOARD FINANCEIRO TEMPO REAL COMPACTO V22.0 ETAPA 2
 * Consolidação Caixa Diário + Conciliação Bancária - 100% modular
 */
export default function DashboardFinanceiroRealtimeCompacto({ empresaId, windowMode = false }) {
  const { filterInContext } = useContextoVisual();
  const [metricas, setMetricas] = useState({
    saldoCaixa: 0,
    receitasHoje: 0,
    despesasHoje: 0,
    contasVencerHoje: 0,
    contasVencidas: 0,
    cartoesACompensar: 0,
    conciliacoesHoje: 0,
    divergenciasBancarias: 0
  });

  const { data: contasReceber = [] } = useRLSQuery('ContaReceber');
  const { data: contasPagar = [] } = useRLSQuery('ContaPagar');
  const { data: movimentosCartao = [] } = useRLSQuery('MovimentoCartao');
  const { data: conciliacoes = [] } = useRLSQuery('ConciliacaoBancaria');
  const { data: caixaMovimentos = [] } = useRLSQuery('CaixaMovimento');

  useEffect(() => {
    const hoje = new Date().toISOString().split('T')[0];

    const receitasHoje = caixaMovimentos
      .filter(m => m.data_movimento?.startsWith(hoje) && m.tipo === 'Entrada')
      .reduce((sum, m) => sum + (m.valor || 0), 0);

    const despesasHoje = caixaMovimentos
      .filter(m => m.data_movimento?.startsWith(hoje) && m.tipo === 'Saída')
      .reduce((sum, m) => sum + (m.valor || 0), 0);

    const saldo = receitasHoje - despesasHoje;
    const vencerHoje = contasPagar.filter(c => c.data_vencimento === hoje && c.status === 'Pendente').length;
    const vencidas = contasPagar.filter(c => {
      if (c.status !== 'Pendente') return false;
      return new Date(c.data_vencimento) < new Date(hoje);
    }).length;

    const cartoesACompensar = movimentosCartao.filter(m => 
      m.status_compensacao === 'A Compensar' || m.status_compensacao === 'Em Trânsito'
    ).length;

    const conciliacoesHoje = conciliacoes.filter(c => c.data_conciliacao?.startsWith(hoje)).length;
    const divergencias = conciliacoes.reduce((sum, c) => 
      sum + (c.divergencias_pendentes?.filter(d => !d.resolvido).length || 0), 0
    );

    setMetricas({
      saldoCaixa: saldo,
      receitasHoje,
      despesasHoje,
      contasVencerHoje: vencerHoje,
      contasVencidas: vencidas,
      cartoesACompensar,
      conciliacoesHoje,
      divergenciasBancarias: divergencias
    });
  }, [contasReceber, contasPagar, movimentosCartao, conciliacoes, caixaMovimentos]);

  const dadosFluxoCaixa7Dias = [];
  for (let i = 6; i >= 0; i--) {
    const data = new Date();
    data.setDate(data.getDate() - i);
    const dataStr = data.toISOString().split('T')[0];
    
    const receitas = caixaMovimentos
      .filter(m => m.data_movimento?.startsWith(dataStr) && m.tipo === 'Entrada')
      .reduce((sum, m) => sum + (m.valor || 0), 0);
    
    const despesas = caixaMovimentos
      .filter(m => m.data_movimento?.startsWith(dataStr) && m.tipo === 'Saída')
      .reduce((sum, m) => sum + (m.valor || 0), 0);

    dadosFluxoCaixa7Dias.push({
      dia: data.toLocaleDateString('pt-BR', { weekday: 'short' }),
      receitas: receitas / 1000,
      despesas: despesas / 1000,
      saldo: (receitas - despesas) / 1000
    });
  }

  return (
    <div className={windowMode ? "w-full h-full flex flex-col overflow-auto" : "w-full"}>
      <div className={windowMode ? "p-3 space-y-3 flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-blue-50" : "p-3 space-y-3 bg-gradient-to-br from-slate-50 to-blue-50"}>
        <KPIsRealtime metricas={metricas} />
        <GraficoFluxo7Dias dadosFluxoCaixa7Dias={dadosFluxoCaixa7Dias} />
      </div>
    </div>
  );
}