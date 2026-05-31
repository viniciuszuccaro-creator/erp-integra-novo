import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp, Zap, ChevronRight } from 'lucide-react';

export default function CopilotInsightsFeed({ modulo = 'geral' }) {
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    // Carregar insights por módulo
    const mockInsights = {
      comercial: [
        { tipo: 'opportunity', titulo: 'Upsell em Cliente A', descricao: 'Cliente comprando bitola CA-50, sugerir CA-60 (30% mais margem)', icon: TrendingUp, cor: 'text-emerald-400' },
        { tipo: 'risk', titulo: 'Margem Baixa', descricao: '3 pedidos com margem < 12%. Revisar pricing.', icon: AlertCircle, cor: 'text-red-400' },
        { tipo: 'action', titulo: 'Acompanhar Desconto', descricao: 'Pedido L2024-05-042 com 18% desconto aprovado. Follow-up em 3 dias?', icon: Zap, cor: 'text-yellow-400' },
      ],
      estoque: [
        { tipo: 'opportunity', titulo: 'Otimizar Giro', descricao: 'CA-50 girando em 4.2 dias. Aumentar volume de compra em 20%?', icon: TrendingUp, cor: 'text-emerald-400' },
        { tipo: 'risk', titulo: 'Estoque Crítico', descricao: 'Tubo Galvanizado com 1.2 toneladas. Reposição em 2 dias.', icon: AlertCircle, cor: 'text-red-400' },
      ],
      financeiro: [
        { tipo: 'risk', titulo: 'Inadimplência Detectada', descricao: '12 clientes com atraso > 30 dias. Total R$180k em risco.', icon: AlertCircle, cor: 'text-red-400' },
        { tipo: 'action', titulo: 'Fluxo de Caixa', descricao: 'Análise: saída de caixa em 15 dias. Agendar recebimentos?', icon: Zap, cor: 'text-yellow-400' },
      ],
      producao: [
        { tipo: 'opportunity', titulo: 'OEE Melhorado', descricao: 'Linha A atingiu 94%. Replicar procedimento nas outras linhas.', icon: TrendingUp, cor: 'text-emerald-400' },
        { tipo: 'risk', titulo: 'Linha C Parada', descricao: 'Solda com manutenção. ETA retorno: 2h30. Impacto: -120 ciclos/hora.', icon: AlertCircle, cor: 'text-red-400' },
      ],
      crm: [
        { tipo: 'risk', titulo: 'Clientes em Risco', descricao: '5 clientes (A+B) com 45+ dias sem compra. Score churn: 72%.', icon: AlertCircle, cor: 'text-red-400' },
        { tipo: 'action', titulo: 'Campanha de Reativação', descricao: 'NPS 4.6/5. Aproveitar satisfação para cross-sell.', icon: Zap, cor: 'text-yellow-400' },
      ],
      geral: [
        { tipo: 'opportunity', titulo: 'Saúde do ERP', descricao: '12/14 KPIs no verde. OEE médio: 83%. Rumo à meta 85%.', icon: TrendingUp, cor: 'text-emerald-400' },
        { tipo: 'action', titulo: '2 Alertas Operacionais', descricao: 'Revisar paradas não-planejadas em produção e lead time em logística.', icon: Zap, cor: 'text-yellow-400' },
      ],
    };

    setInsights(mockInsights[modulo] || mockInsights['geral']);
  }, [modulo]);

  const tipoBg = (tipo) => {
    switch (tipo) {
      case 'opportunity': return 'border-emerald-600 bg-emerald-900/20';
      case 'risk': return 'border-red-600 bg-red-900/20';
      case 'action': return 'border-yellow-600 bg-yellow-900/20';
      default: return 'border-slate-600 bg-slate-900/20';
    }
  };

  return (
    <div className="w-full h-full overflow-auto space-y-3 p-1">
      <h3 className="text-sm font-bold text-white px-2">Insights IA — {modulo.charAt(0).toUpperCase() + modulo.slice(1)}</h3>
      
      {insights.map((insight, idx) => {
        const Icon = insight.icon;
        return (
          <Card key={idx} className={`border ${tipoBg(insight.tipo)} bg-slate-800/50 cursor-pointer hover:shadow-lg transition-all`}>
            <CardContent className="p-3">
              <div className="flex gap-3">
                <div className={`shrink-0 ${insight.cor} mt-1`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-sm font-bold text-white">{insight.titulo}</p>
                    <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
                  </div>
                  <p className="text-xs text-slate-300">{insight.descricao}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}