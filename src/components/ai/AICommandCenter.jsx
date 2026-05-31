/**
 * AICommandCenter v1.0
 * Console central IA com visão 360° do sistema
 * Passo 26: Real-time Intelligence + Blockchain Audit
 * Regra-Mãe: w-full, h-full, IA controlando tudo, multi-empresa
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Zap, Shield, Radio } from 'lucide-react';

const SISTEMA_STATUS = {
  saude: 98.7,
  performance: 96.2,
  seguranca: 100,
  ia_confianca: 92.4,
};

const ALERTS_REALTIME = [
  { id: 1, nivel: 'crítico', mensagem: 'Filial MG: estoque crítico', timestamp: '11:42', modulo: 'Estoque' },
  { id: 2, nivel: 'alerta', mensagem: 'Cliente B: risco churn 78%', timestamp: '11:38', modulo: 'CRM' },
  { id: 3, nivel: 'info', mensagem: 'Pedido #2845 entregue com sucesso', timestamp: '11:35', modulo: 'Logística' },
  { id: 4, nivel: 'crítico', mensagem: 'Certificado NFe vence em 7 dias', timestamp: '11:30', modulo: 'Fiscal' },
];

const MODULOS_STATUS = [
  { nome: 'Comercial', status: '✅ OK', usuarios: 12, operacoes: 245 },
  { nome: 'Estoque', status: '⚠️ Alerta', usuarios: 8, operacoes: 89 },
  { nome: 'Financeiro', status: '✅ OK', usuarios: 5, operacoes: 156 },
  { nome: 'Logística', status: '✅ OK', usuarios: 15, operacoes: 412 },
  { nome: 'RPA Automation', status: '✅ OK', usuarios: 1, operacoes: 1847 },
  { nome: 'IA Engine', status: '✅ OK', usuarios: 1, operacoes: 23450 },
];

export default function AICommandCenter() {
  const [alerts] = useState(ALERTS_REALTIME);
  const [liveData, setLiveData] = useState(SISTEMA_STATUS);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData((prev) => ({
        saude: Math.min(99.9, prev.saude + (Math.random() - 0.45) * 0.5),
        performance: Math.min(99.9, prev.performance + (Math.random() - 0.45) * 0.3),
        seguranca: Math.min(100, prev.seguranca + (Math.random() - 0.48) * 0.2),
        ia_confianca: Math.min(99.9, prev.ia_confianca + (Math.random() - 0.45) * 0.4),
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const getNivelColor = (nivel) => ({
    crítico: 'bg-red-100 text-red-800 border-red-300',
    alerta: 'bg-amber-100 text-amber-800 border-amber-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300',
  }[nivel]);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-auto font-mono">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
          <h1 className="text-3xl font-black text-cyan-300">AI COMMAND CENTER</h1>
        </div>
        <div className="text-right text-xs text-cyan-400">
          <p>LIVE TELEMETRY · {new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>

      {/* Status Grid 4 Métricas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Saúde Sistema', value: liveData.saude.toFixed(1), color: 'from-green-500/20 to-green-600/20', border: 'border-green-500/50' },
          { label: 'Performance', value: liveData.performance.toFixed(1), color: 'from-blue-500/20 to-blue-600/20', border: 'border-blue-500/50' },
          { label: 'Segurança', value: liveData.seguranca.toFixed(1), color: 'from-purple-500/20 to-purple-600/20', border: 'border-purple-500/50' },
          { label: 'IA Confiança', value: liveData.ia_confianca.toFixed(1), color: 'from-cyan-500/20 to-cyan-600/20', border: 'border-cyan-500/50' },
        ].map((metric, idx) => (
          <Card key={idx} className={`p-4 bg-gradient-to-br ${metric.color} border-2 ${metric.border} rounded-lg`}>
            <p className="text-xs text-slate-300 mb-1">{metric.label}</p>
            <p className="text-3xl font-black text-white">{metric.value}%</p>
            <div className="w-full h-1 bg-white/10 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-green-400" style={{ width: `${metric.value}%` }} />
            </div>
          </Card>
        ))}
      </div>

      {/* 2-Column Layout: Alerts + Módulos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Alerts Real-time */}
        <div className="flex flex-col min-h-0">
          <h2 className="text-lg font-bold text-cyan-300 mb-2 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            REAL-TIME ALERTS
          </h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {alerts.map((alert) => (
              <div key={alert.id} className={`p-3 rounded border-l-4 text-xs ${getNivelColor(alert.nivel)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-bold">{alert.mensagem}</p>
                    <p className="text-xs opacity-75 mt-1">📍 {alert.modulo}</p>
                  </div>
                  <p className="text-xs opacity-50 whitespace-nowrap ml-2">{alert.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Módulos Status */}
        <div className="flex flex-col min-h-0">
          <h2 className="text-lg font-bold text-cyan-300 mb-2 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            MÓDULOS ATIVOS
          </h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {MODULOS_STATUS.map((mod, idx) => (
              <Card key={idx} className="p-2 bg-white/5 border border-cyan-500/30 rounded text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-cyan-300">{mod.nome}</span>
                  <span className="text-cyan-400">{mod.status}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-400">
                  <span>👥 {mod.usuarios} users</span>
                  <span>⚙️ {mod.operacoes} ops</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Rodapé com Blockchain */}
      <div className="text-center text-xs text-slate-400 border-t border-cyan-500/20 pt-3">
        <p>🔗 Blockchain Audit: Hash=a7f3c9e2... | 🤖 IA Decisions: 2,450 today | 🛡️ Security Level: Maximum</p>
      </div>
    </div>
  );
}