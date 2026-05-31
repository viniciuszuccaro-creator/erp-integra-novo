/**
 * IAHealthRecommendations v1.0
 * Sistema de recomendações baseado em IA para saúde do sistema
 * Regra-Mãe: inovação + IA + melhoria contínua
 */
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { base44 } from '@/api/base44Client';
import { Lightbulb, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

export default function IAHealthRecommendations({
  healthScore,
  circuitState,
  perfLogs = [],
  counts = {}
}) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    generateRecommendations();
  }, [healthScore, circuitState, perfLogs]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Análise local de problemas detectados
      const issues = [];

      // 1. Circuit breaker aberto
      if (circuitState === 'OPEN') {
        issues.push({
          severity: 'critical',
          title: '🚨 Circuit Breaker Ativo',
          description: 'Sistema em modo proteção contra rate limits. Reduzir frequência de requisições.',
          action: 'Ativar throttling, aumentar debounce ou escalar recursos'
        });
      }

      // 2. Funções lentas
      const slowFunctions = perfLogs.filter(l => l.duracao_ms > 5000);
      if (slowFunctions.length > 3) {
        issues.push({
          severity: 'warning',
          title: '⚠️ Funções Lentas Detectadas',
          description: `${slowFunctions.length} funções excedendo 5s nos últimos logs.`,
          action: 'Otimizar queries, adicionar índices ou considerar cache'
        });
      }

      // 3. Saúde baixa
      if (healthScore < 50) {
        issues.push({
          severity: 'critical',
          title: '❌ Saúde do Sistema Crítica',
          description: `Score: ${healthScore}%. Sistema em estado degradado.`,
          action: 'Revisar logs, aumentar recursos ou investigar gargalos'
        });
      }

      // 4. Muitos pedidos pendentes
      if (counts.Pedido > 1000) {
        issues.push({
          severity: 'info',
          title: '📈 Alto Volume de Pedidos',
          description: `${counts.Pedido} pedidos no sistema.`,
          action: 'Considerar processamento em background ou escalabilidade'
        });
      }

      // 5. Contas a receber altas
      if (counts.ContaReceber > 500) {
        issues.push({
          severity: 'info',
          title: '💰 Contas a Receber Elevadas',
          description: `${counts.ContaReceber} contas pendentes de pagamento.`,
          action: 'Intensificar cobrança ou revisar prazos concedidos'
        });
      }

      // Chamar IA para análise profunda (opcional)
      if (issues.length > 0 && healthScore < 60) {
        try {
          const iaResponse = await base44.integrations.Core.InvokeLLM({
            prompt: `Baseado nestes problemas no ERP, gere 3 recomendações prioritárias:\n${
              issues.map(i => `- ${i.title}: ${i.description}`).join('\n')
            }\nForneça em formato JSON: [{severity: "high|medium|low", action: "...", benefício: "..."}]`,
            response_json_schema: {
              type: 'object',
              properties: {
                recommendations: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      severity: { type: 'string' },
                      action: { type: 'string' },
                      beneficio: { type: 'string' }
                    }
                  }
                }
              }
            }
          });

          if (iaResponse?.data?.recommendations) {
            setRecommendations(iaResponse.data.recommendations);
          } else {
            setRecommendations(issues);
          }
        } catch (_) {
          // Fallback para recomendações locais
          setRecommendations(issues);
        }
      } else {
        setRecommendations(issues.length > 0 ? issues : [
          {
            severity: 'success',
            title: '✅ Sistema Operacional',
            description: 'Todos os indicadores em nível saudável.',
            action: 'Continuar monitorando rotineiramente'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const severityIcon = {
    critical: <AlertTriangle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-orange-600" />,
    info: <Lightbulb className="w-5 h-5 text-blue-600" />,
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />
  };

  const severityColor = {
    critical: 'bg-red-50 border-red-200',
    warning: 'bg-orange-50 border-orange-200',
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200'
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto p-4">
      {loading && (
        <Alert className="bg-blue-50 border-blue-200">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 ml-2">
            Analisando sistema com IA...
          </AlertDescription>
        </Alert>
      )}

      {recommendations.length === 0 && !loading && (
        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-6 text-center text-slate-600">
            Nenhuma recomendação no momento. Sistema operacional.
          </CardContent>
        </Card>
      )}

      {recommendations.map((rec, i) => (
        <Card key={i} className={`border-2 ${severityColor[rec.severity] || severityColor.info}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {severityIcon[rec.severity]}
                <div>
                  <CardTitle className="text-base">{rec.title}</CardTitle>
                  <p className="text-sm text-slate-600 mt-1">{rec.description}</p>
                </div>
              </div>
              <Badge className={
                rec.severity === 'critical' ? 'bg-red-100 text-red-800' :
                rec.severity === 'warning' ? 'bg-orange-100 text-orange-800' :
                rec.severity === 'info' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }>
                {rec.severity}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-white/50 rounded border border-slate-200">
              <p className="text-sm font-semibold text-slate-900 mb-1">✨ Ação Recomendada</p>
              <p className="text-sm text-slate-700">{rec.action || rec.beneficio}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}