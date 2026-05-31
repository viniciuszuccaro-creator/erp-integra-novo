import React, { useState } from 'react';
import { Brain, Zap, TrendingDown, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function AnaliseDefeitosPanel() {
  const [analises] = useState([
    {
      id: 'AI-001',
      tipo_defeito: 'Dimensões Fora de Especificação',
      frequencia: 34,
      impacto: 'crítico',
      causa_raiz_ia: 'Desgaste de ferramenta - 89% confiança',
      acao_recomendada: 'Aumentar frequência de trocas de ferramentas',
      economia_estimada: 4200,
      confianca_ia: 89
    },
    {
      id: 'AI-002',
      tipo_defeito: 'Rebarbas e Imperfeições',
      frequencia: 28,
      impacto: 'alto',
      causa_raiz_ia: 'Velocidade de corte inadequada - 76% confiança',
      acao_recomendada: 'Ajustar parâmetros de corte conforme material',
      economia_estimada: 3100,
      confianca_ia: 76
    },
    {
      id: 'AI-003',
      tipo_defeito: 'Desvio de Cor/Acabamento',
      frequencia: 18,
      impacto: 'médio',
      causa_raiz_ia: 'Variação de temperatura - 82% confiança',
      acao_recomendada: 'Implementar sistema de controle de temperatura',
      economia_estimada: 2400,
      confianca_ia: 82
    },
    {
      id: 'AI-004',
      tipo_defeito: 'Soldagem Deficiente',
      frequencia: 12,
      impacto: 'alto',
      causa_raiz_ia: 'Calibração de equipamento - 91% confiança',
      acao_recomendada: 'Agenda preventiva de manutenção',
      economia_estimada: 1800,
      confianca_ia: 91
    }
  ]);

  const getImpactoColor = (impacto) => {
    switch(impacto) {
      case 'crítico':
        return 'bg-red-50 border-red-300';
      case 'alto':
        return 'bg-orange-50 border-orange-300';
      case 'médio':
        return 'bg-yellow-50 border-yellow-300';
      default:
        return 'bg-blue-50 border-blue-300';
    }
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 mb-4">
        <div className="flex items-start gap-3">
          <Brain className="w-5 h-5 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-semibold text-slate-900">Análise Preditiva de Defeitos (IA)</h3>
            <p className="text-sm text-slate-700 mt-1">
              Sistema de IA analisa padrões históricos de defeitos para identificar causas-raiz e recomendar ações preventivas.
            </p>
          </div>
        </div>
      </div>

      {analises.map((analise) => (
        <Card key={analise.id} className={`border-2 ${getImpactoColor(analise.impacto)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base text-slate-900">{analise.tipo_defeito}</CardTitle>
                <p className="text-xs text-slate-600 mt-1">
                  {analise.frequencia} ocorrências registradas
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-purple-700 font-semibold">
                  Confiança: {analise.confianca_ia}%
                </p>
                <Progress value={analise.confianca_ia} className="w-24 h-1.5 mt-1" />
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Causa Raiz */}
            <div className="bg-white/50 rounded p-3 border-l-2 border-purple-600">
              <div className="flex items-start gap-2">
                <Zap className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-slate-600 font-semibold mb-1">CAUSA-RAIZ DETECTADA (IA)</p>
                  <p className="text-sm text-slate-900">{analise.causa_raiz_ia}</p>
                </div>
              </div>
            </div>

            {/* Ação Recomendada */}
            <div className="bg-white/50 rounded p-3 border-l-2 border-green-600">
              <div className="flex items-start gap-2">
                <TrendingDown className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-slate-600 font-semibold mb-1">AÇÃO RECOMENDADA</p>
                  <p className="text-sm text-slate-900">{analise.acao_recomendada}</p>
                </div>
              </div>
            </div>

            {/* Economias */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/50 p-2 rounded text-center">
                <p className="text-xs text-slate-600 mb-1">Economia Estimada</p>
                <p className="text-sm font-bold text-green-700">R${analise.economia_estimada}</p>
              </div>
              <div className="bg-white/50 p-2 rounded text-center">
                <p className="text-xs text-slate-600 mb-1">Impacto</p>
                <p className="text-sm font-bold text-slate-900 uppercase">{analise.impacto}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Resumo */}
      <Card className="bg-gradient-to-r from-slate-50 to-slate-100 border-slate-300">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="text-slate-700">
              <span className="font-semibold">Total Economias Potenciais:</span>
              <span className="text-lg font-bold text-green-600 ml-2">R$11,500/mês</span>
            </p>
            <p className="text-slate-600">
              IA identificou 4 causas-raiz principais com confiança média de {Math.round((89+76+82+91)/4)}%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}