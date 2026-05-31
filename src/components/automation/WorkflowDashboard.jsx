/**
 * WorkflowDashboard v1.0
 * Dashboard de workflows em execução, histórico e métricas
 * Regra-Mãe: tempo real, multi-empresa
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function WorkflowDashboard() {
  const [execucoes, setExecucoes] = useState([
    {
      id: 1,
      automacao: 'Notificar cliente pedido criado',
      trigger: 'pedido_criado',
      status: 'sucesso',
      executadoEm: new Date(Date.now() - 5 * 60000),
      tempo: '1.2s',
    },
    {
      id: 2,
      automacao: 'Atualizar estoque baixo',
      trigger: 'estoque_baixo',
      status: 'sucesso',
      executadoEm: new Date(Date.now() - 15 * 60000),
      tempo: '0.8s',
    },
    {
      id: 3,
      automacao: 'Enviar recibo pagamento',
      trigger: 'pagamento_recebido',
      status: 'erro',
      executadoEm: new Date(Date.now() - 30 * 60000),
      tempo: '2.1s',
    },
    {
      id: 4,
      automacao: 'Bem-vindo cliente novo',
      trigger: 'cliente_novo',
      status: 'pendente',
      executadoEm: new Date(Date.now() - 2 * 60000),
      tempo: '-',
    },
  ]);

  const getStatusColor = (status) => {
    const colors = {
      sucesso: 'bg-green-100 text-green-800',
      erro: 'bg-red-100 text-red-800',
      pendente: 'bg-amber-100 text-amber-800',
    };
    return colors[status];
  };

  const getStatusIcon = (status) => {
    const icons = {
      sucesso: <CheckCircle2 className="w-4 h-4 text-green-600" />,
      erro: <AlertCircle className="w-4 h-4 text-red-600" />,
      pendente: <Clock className="w-4 h-4 text-amber-600" />,
    };
    return icons[status];
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-50 to-cyan-50 overflow-auto">
      {/* Header */}
      <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
        <Activity className="w-8 h-8 text-cyan-600" />
        Dashboard de Workflows
      </h2>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Execuções', value: '1.2k', cor: 'text-blue-600' },
          { label: 'Taxa Sucesso', value: '99.2%', cor: 'text-green-600' },
          { label: 'Tempo Médio', value: '1.3s', cor: 'text-cyan-600' },
          { label: 'Economia', value: '45h/mês', cor: 'text-purple-600' },
        ].map((kpi, idx) => (
          <Card key={idx} className="p-4 bg-white rounded-lg shadow-sm">
            <p className="text-xs text-slate-600 mb-1">{kpi.label}</p>
            <p className={`text-2xl font-bold ${kpi.cor}`}>{kpi.value}</p>
          </Card>
        ))}
      </div>

      {/* Execuções Recentes */}
      <Card className="w-full p-6 bg-white rounded-lg shadow-md">
        <h3 className="font-bold text-lg mb-4">Últimas Execuções</h3>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {execucoes.map((exec) => (
            <div key={exec.id} className="flex items-center gap-4 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
              {getStatusIcon(exec.status)}

              <div className="flex-1">
                <p className="font-semibold text-slate-900">{exec.automacao}</p>
                <p className="text-xs text-slate-500">
                  {exec.executadoEm.toLocaleTimeString('pt-BR')} · {exec.tempo}
                </p>
              </div>

              <Badge className={getStatusColor(exec.status)}>
                {exec.status === 'sucesso' ? '✅ Sucesso' : exec.status === 'erro' ? '❌ Erro' : '⏳ Pendente'}
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}