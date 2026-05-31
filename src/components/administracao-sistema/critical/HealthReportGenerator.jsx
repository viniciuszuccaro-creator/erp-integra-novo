/**
 * HealthReportGenerator v1.0
 * Gera relatórios de saúde do sistema (PDF/CSV)
 * Regra-Mãe: insights acionáveis, multi-empresa
 */
import { useState } from 'react';
import { Download, BarChart3, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function HealthReportGenerator() {
  const { empresaAtual, grupoAtual } = useContextoVisual();
  const [isGenerating, setIsGenerating] = useState(false);

  const generateReport = async (format = 'csv') => {
    setIsGenerating(true);
    try {
      // Buscar logs de performance
      const logs = await base44.entities.AuditLog.filter({
        tipo_auditoria: 'sistema',
        empresa_id: empresaAtual?.id,
      }, '-data_hora', 1000);

      // Buscar últimos 429s
      const errors429 = logs.filter(l => l.descricao?.includes('429') || l.descricao?.includes('rate limit'));

      // Calcular métricas
      const metrics = {
        totalRequests: logs.length,
        totalErrors429: errors429.length,
        errorRate429: ((errors429.length / logs.length) * 100).toFixed(2),
        avgLatency: (logs.reduce((sum, l) => sum + (l.duracao_ms || 0), 0) / logs.length).toFixed(0),
        lastError: errors429[0]?.data_hora,
        recoveryRate: ((logs.filter(l => l.acao === 'Recuperação').length / errors429.length) * 100).toFixed(2),
      };

      const reportData = {
        empresa: empresaAtual?.nome_fantasia || 'Sistema',
        grupo: grupoAtual?.nome_do_grupo,
        dataGeracao: new Date().toLocaleString('pt-BR'),
        metricas: metrics,
        logs: logs.slice(0, 100), // últimos 100
      };

      if (format === 'csv') {
        generateCSV(reportData);
      } else if (format === 'json') {
        generateJSON(reportData);
      }

      // Log
      await base44.entities.AuditLog.create({
        usuario: 'Sistema',
        acao: 'Relatório',
        modulo: 'Sistema',
        tipo_auditoria: 'sistema',
        entidade: 'HealthReport',
        descricao: `Relatório de saúde gerado em ${format.toUpperCase()}`,
        empresa_id: empresaAtual?.id,
        dados_novos: metrics,
        data_hora: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generateCSV = (data) => {
    const csv = `
RELATÓRIO DE SAÚDE DO SISTEMA
Empresa: ${data.empresa}
Grupo: ${data.grupo}
Data: ${data.dataGeracao}

MÉTRICAS GERAIS
Total de Requisições,${data.metricas.totalRequests}
Total de Erros 429,${data.metricas.totalErrors429}
Taxa de Erro,${data.metricas.errorRate429}%
Latência Média (ms),${data.metricas.avgLatency}
Taxa de Recuperação,${data.metricas.recoveryRate}%
Último Erro,${data.metricas.lastError}
    `.trim();

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${Date.now()}.csv`;
    a.click();
  };

  const generateJSON = (data) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `health-report-${Date.now()}.json`;
    a.click();
  };

  return (
    <Card className="w-full p-6 bg-gradient-to-br from-slate-50 to-blue-50 border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-blue-600" />
          <h3 className="font-bold text-lg">Gerar Relatório de Saúde</h3>
        </div>
        {isGenerating && <TrendingUp className="w-5 h-5 animate-spin text-blue-600" />}
      </div>

      <p className="text-sm text-slate-600 mb-4">
        Exporte métricas de performance e taxa de erro (últimas 24h)
      </p>

      <div className="flex gap-2">
        <Button
          onClick={() => generateReport('csv')}
          disabled={isGenerating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Download className="w-4 h-4 mr-2" />
          CSV
        </Button>
        <Button
          onClick={() => generateReport('json')}
          disabled={isGenerating}
          variant="outline"
        >
          <Download className="w-4 h-4 mr-2" />
          JSON
        </Button>
      </div>
    </Card>
  );
}