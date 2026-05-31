/**
 * SmartAlerts v1.0
 * Alertas inteligentes baseados em IA
 * Passo 26: Notificações adaptativas por módulo
 * Regra-Mãe: predict + previne + ativa
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, Zap, TrendingDown, AlertCircle } from 'lucide-react';

const SMART_ALERTS_LIST = [
  {
    id: 1,
    tipo: 'Predictivo',
    mensagem: 'Demanda de SKU-001 aumentará 40% na próxima semana',
    acao: 'Aumentar OC com Fornecedor A',
    confianca: 94,
    modulo: 'IA',
    icon: Brain,
  },
  {
    id: 2,
    tipo: 'Prevenção',
    mensagem: '3 clientes em risco churn (score >70%)',
    acao: 'Iniciar campanha de retenção',
    confianca: 87,
    modulo: 'CRM',
    icon: AlertCircle,
  },
  {
    id: 3,
    tipo: 'Otimização',
    mensagem: 'Lead time com Fornecedor B pode ser reduzido em 3 dias',
    acao: 'Negociar novo acordo',
    confianca: 81,
    modulo: 'Compras',
    icon: TrendingDown,
  },
  {
    id: 4,
    tipo: 'Automação',
    mensagem: 'Execução RPA economizou R$ 45.200 este mês',
    acao: 'Expandir automações',
    confianca: 100,
    modulo: 'RPA',
    icon: Zap,
  },
];

export default function SmartAlerts() {
  const [alerts] = useState(SMART_ALERTS_LIST);
  const [dismissed, setDismissed] = useState([]);

  const handleDismiss = (id) => {
    setDismissed((prev) => [...prev, id]);
  };

  const filteredAlerts = alerts.filter((a) => !dismissed.includes(a.id));

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-blue-900 overflow-auto">
      <h2 className="text-3xl font-bold text-blue-300 flex items-center gap-2">
        <Brain className="w-8 h-8" />
        Smart Alerts IA
      </h2>

      <div className="space-y-3 flex-1 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-400">Nenhum alerta no momento</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const Icon = alert.icon;
            return (
              <Card key={alert.id} className="p-4 bg-gradient-to-r from-white/5 to-blue-500/10 border border-blue-400/30 rounded-lg hover:border-blue-400/60 transition-all">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="bg-blue-500/30 text-blue-200">{alert.tipo}</Badge>
                      <Badge className="bg-slate-700 text-slate-200">{alert.modulo}</Badge>
                      <span className="ml-auto text-sm font-bold text-green-300">
                        {alert.confianca}% confiança
                      </span>
                    </div>

                    <p className="font-bold text-white mb-1">{alert.mensagem}</p>
                    <p className="text-sm text-blue-300">✨ Sugestão: {alert.acao}</p>
                  </div>

                  <button
                    onClick={() => handleDismiss(alert.id)}
                    className="text-slate-400 hover:text-slate-200 transition-all text-xl"
                  >
                    ✕
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      <div className="p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg">
        <p className="text-sm font-bold text-blue-300">🧠 IA Monitorando 360°</p>
        <p className="text-xs text-slate-300">
          Processando 10,000+ eventos/hora · Confiança média: {(alerts.reduce((a, b) => a + b.confianca, 0) / alerts.length).toFixed(1)}%
        </p>
      </div>
    </div>
  );
}