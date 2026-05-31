import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, CheckCircle, BookOpen, Zap } from 'lucide-react';

export default function CopilotLearningPanel() {
  const [expanded, setExpanded] = useState(null);

  const aprendizados = [
    {
      id: 1,
      titulo: 'Padrão: Desconto + Margem',
      descricao: 'IA aprendeu que descontos > 15% reduzem margem abaixo de 12%. Sugerir aumento de volume ao invés de desconto.',
      tipo: 'insight',
      frequencia: 'Detectado em 23 pedidos',
      acao: 'Aplicar automaticamente',
    },
    {
      id: 2,
      titulo: 'Previsão de Churn',
      descricao: 'Clientes sem compra > 45 dias têm 72% de risco de churn. Score melhora com contato pessoal.',
      tipo: 'comportamento',
      frequencia: '5 clientes identificados',
      acao: 'Disparar campanha reativação',
    },
    {
      id: 3,
      titulo: 'Sazonalidade Produção',
      descricao: 'OEE cai 8% às quartas. Manutenção planejada impacta segunda seguinte.',
      tipo: 'operacional',
      frequencia: 'Observado 4 semanas',
      acao: 'Rescheduler para terça',
    },
    {
      id: 4,
      titulo: 'Otimização de Rota',
      descricao: 'Rota A + B economizam 120km vs rota AB. Economia: R$ 850/semana.',
      tipo: 'logística',
      frequencia: 'Validado 3x',
      acao: 'Implementar padrão',
    },
  ];

  const tipoIcon = (tipo) => {
    switch (tipo) {
      case 'insight': return '💡';
      case 'comportamento': return '👥';
      case 'operacional': return '⚙️';
      case 'logística': return '🚚';
      default: return '📊';
    }
  };

  const tipoCor = (tipo) => {
    switch (tipo) {
      case 'insight': return 'bg-yellow-900 text-yellow-200';
      case 'comportamento': return 'bg-purple-900 text-purple-200';
      case 'operacional': return 'bg-blue-900 text-blue-200';
      case 'logística': return 'bg-emerald-900 text-emerald-200';
      default: return 'bg-slate-700 text-slate-200';
    }
  };

  return (
    <div className="w-full h-full overflow-auto space-y-3 p-1">
      <div className="flex items-center gap-2 px-2 mb-3">
        <Brain className="w-5 h-5 text-yellow-400" />
        <h3 className="text-sm font-bold text-white">Aprendizados IA — Recomendações Validadas</h3>
      </div>

      {aprendizados.map((ap) => (
        <Card key={ap.id} className="bg-slate-800 border-slate-700 cursor-pointer hover:border-slate-600" onClick={() => setExpanded(expanded === ap.id ? null : ap.id)}>
          <CardContent className="p-3">
            <div className="flex items-start gap-3">
              <div className="text-2xl shrink-0">{tipoIcon(ap.tipo)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-white">{ap.titulo}</p>
                  <Badge className={tipoCor(ap.tipo)}>
                    {ap.tipo}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400 mb-2">{ap.descricao}</p>
                <p className="text-xs text-slate-500 mb-2">📍 {ap.frequencia}</p>

                {expanded === ap.id && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                      <CheckCircle className="w-4 h-4" />
                      {ap.acao}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Confiança da IA */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Nível de Confiança IA
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            { area: 'Insights Comerciais', confianca: 87 },
            { area: 'Previsões Operacionais', confianca: 79 },
            { area: 'Detecção Anomalias', confianca: 92 },
            { area: 'Recomendações Logísticas', confianca: 85 },
          ].map((item, idx) => (
            <div key={idx}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">{item.area}</span>
                <span className="font-bold text-emerald-400">{item.confianca}%</span>
              </div>
              <div className="bg-slate-700 rounded-full h-1.5">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${item.confianca}%` }} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}