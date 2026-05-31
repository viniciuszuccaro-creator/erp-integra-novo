import React, { useState } from 'react';
import { Brain, TrendingUp, AlertTriangle, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function AISecurityIntelligencePanel() {
  const [modelos] = useState([
    {
      id: 'AI-SEC-001',
      nome: 'Detecção Anomalias Comportamental',
      descricao: 'ML para detectar padrões de acesso anormais',
      confianca: 94,
      anomalias_detectadas_7d: 47,
      falsos_positivos: 3,
      precision: 94,
      recall: 91
    },
    {
      id: 'AI-SEC-002',
      nome: 'Análise de Ameaças em Tempo Real',
      descricao: 'IA correlaciona logs e tráfego de rede',
      confianca: 96,
      ameacas_correlacionadas_7d: 12,
      falsos_positivos: 1,
      precision: 96,
      recall: 93
    },
    {
      id: 'AI-SEC-003',
      nome: 'Predição de Violações Zero-Day',
      descricao: 'Deep learning prediz vulnerabilidades antes da exploração',
      confianca: 87,
      vulnerabilidades_preditas_7d: 8,
      falsos_positivos: 2,
      precision: 87,
      recall: 85
    },
    {
      id: 'AI-SEC-004',
      nome: 'Recomendações Adaptativas',
      descricao: 'IA sugere políticas de segurança otimizadas',
      confianca: 92,
      recomendacoes_implementadas_7d: 23,
      reducao_risco: 18,
      precision: 92,
      recall: 89
    }
  ]);

  const confiancaMedia = Math.round(modelos.reduce((sum, m) => sum + m.confianca, 0) / modelos.length);

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {/* Resumo */}
      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-pink-600" />
            IA Security Intelligence
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600 mb-1">Confiança Média</p>
              <p className="text-3xl font-bold text-pink-600">{confiancaMedia}%</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Ameaças Detectadas (7d)</p>
              <p className="text-3xl font-bold text-red-600">67</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Modelos Ativos</p>
              <p className="text-3xl font-bold text-blue-600">{modelos.length}</p>
            </div>
          </div>
          <Progress value={confiancaMedia} className="h-3" />
        </CardContent>
      </Card>

      {/* Modelos */}
      {modelos.map((modelo) => (
        <Card key={modelo.id} className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{modelo.nome}</CardTitle>
                <p className="text-xs text-slate-600 mt-1">{modelo.descricao}</p>
              </div>
              <Badge className="bg-pink-600">{modelo.confianca}%</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Confiança */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">Confiança do Modelo</span>
                <span className="text-xs font-semibold">{modelo.confianca}%</span>
              </div>
              <Progress value={modelo.confianca} className="h-2" />
            </div>

            {/* Métricas de Desempenho */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-emerald-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Precision</p>
                <p className="text-lg font-bold text-emerald-700">{modelo.precision}%</p>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Recall</p>
                <p className="text-lg font-bold text-blue-700">{modelo.recall}%</p>
              </div>
            </div>

            {/* Atividade Recente */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded">
                <p className="text-slate-600 mb-1">
                  {modelo.id === 'AI-SEC-001' && 'Anomalias (7d)'}
                  {modelo.id === 'AI-SEC-002' && 'Ameaças (7d)'}
                  {modelo.id === 'AI-SEC-003' && 'Vulns (7d)'}
                  {modelo.id === 'AI-SEC-004' && 'Recomendações (7d)'}
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {modelo.id === 'AI-SEC-001' && modelo.anomalias_detectadas_7d}
                  {modelo.id === 'AI-SEC-002' && modelo.ameacas_correlacionadas_7d}
                  {modelo.id === 'AI-SEC-003' && modelo.vulnerabilidades_preditas_7d}
                  {modelo.id === 'AI-SEC-004' && modelo.recomendacoes_implementadas_7d}
                </p>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Falsos Positivos</p>
                <p className="text-lg font-bold text-red-700">{modelo.falsos_positivos}</p>
              </div>
            </div>

            {/* Info Extra */}
            {modelo.id === 'AI-SEC-003' && (
              <div className="bg-purple-50 p-2 rounded border-l-2 border-purple-600">
                <p className="text-xs text-slate-600 mb-1">Risco Predito</p>
                <p className="text-sm font-semibold text-slate-900">Deep Learning + NLP + Threat Intel</p>
              </div>
            )}
            {modelo.id === 'AI-SEC-004' && (
              <div className="bg-emerald-50 p-2 rounded border-l-2 border-emerald-600">
                <p className="text-xs text-slate-600 mb-1">Redução de Risco</p>
                <p className="text-sm font-semibold text-slate-900">{modelo.reducao_risco}% (últimos 30d)</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}