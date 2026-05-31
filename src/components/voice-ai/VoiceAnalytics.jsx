/**
 * VoiceAnalytics v1.0
 * Analítica de uso de voz
 * Passo 32: Comandos por departamento, taxa de erro, tempo resposta
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

const VOICE_METRICS = [
  { departamento: 'Produção', comandos: 342, taxa_sucesso: 98.2, tempo_medio_ms: 234 },
  { departamento: 'Estoque', comandos: 287, taxa_sucesso: 97.6, tempo_medio_ms: 189 },
  { departamento: 'Financeiro', comandos: 156, taxa_sucesso: 99.4, tempo_medio_ms: 267 },
  { departamento: 'Comercial', comandos: 423, taxa_sucesso: 96.8, tempo_medio_ms: 312 },
];

export default function VoiceAnalytics({ empresa }) {
  const [metrics] = useState(VOICE_METRICS);

  const totalComandos = metrics.reduce((acc, m) => acc + m.comandos, 0);
  const taxaSucessoMedia = Math.round(metrics.reduce((acc, m) => acc + m.taxa_sucesso, 0) / metrics.length);

  return (
    <div className="w-full h-flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-blue-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Activity className="w-6 h-6 text-cyan-400" />
        Voice Analytics
      </h2>

      {/* KPIs */}
      <div className="grid grid-cols-4 gap-3">
        <Card className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-slate-400">Total Comandos</p>
          <p className="text-2xl font-bold text-blue-400">{totalComandos}</p>
        </Card>
        <Card className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-xs text-slate-400">Taxa Sucesso</p>
          <p className="text-2xl font-bold text-green-400">{taxaSucessoMedia}%</p>
        </Card>
        <Card className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-xs text-slate-400">Tempo Médio</p>
          <p className="text-2xl font-bold text-cyan-400">247ms</p>
        </Card>
        <Card className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <p className="text-xs text-slate-400">Linguagem</p>
          <p className="text-2xl font-bold text-purple-400">PT-BR</p>
        </Card>
      </div>

      {/* Por Departamento */}
      <div className="space-y-2 flex-1 overflow-y-auto">
        {metrics.map((metric, idx) => (
          <Card key={idx} className="p-4 bg-white/5 border border-cyan-500/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="font-bold text-white">{metric.departamento}</p>
              <Badge className="bg-cyan-500/20 text-cyan-300">{metric.comandos} comandos</Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-2">
              <div>
                <p className="text-slate-400 mb-1">Taxa Sucesso</p>
                <div className="flex items-center gap-1">
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500" style={{ width: `${metric.taxa_sucesso}%` }} />
                  </div>
                  <span className="text-green-400 font-semibold">{metric.taxa_sucesso}%</span>
                </div>
              </div>
              <div>
                <p className="text-slate-400 mb-1">Tempo Resposta</p>
                <p className="text-white font-semibold">{metric.tempo_medio_ms}ms</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}