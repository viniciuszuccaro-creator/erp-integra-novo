/**
 * EdgeNodeMonitor v1.0
 * Monitor distribuído de nós edge
 * Passo 30: Computação na borda com latência 2-18ms
 */
import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Activity } from 'lucide-react';

const NODES_DETAILED = [
  {
    id: 'EDGE-SP',
    cidade: 'São Paulo',
    regiao: 'Sudeste',
    latencia: 2,
    operacoes: 2847300,
    cacheHit: 94.2,
    queries: 134500,
    processamento: 'local',
  },
  {
    id: 'EDGE-MG',
    cidade: 'Belo Horizonte',
    regiao: 'Sudeste',
    latencia: 4,
    operacoes: 1456200,
    cacheHit: 89.7,
    queries: 67300,
    processamento: 'local',
  },
  {
    id: 'EDGE-BR',
    cidade: 'Brasília',
    regiao: 'Centro-Oeste',
    latencia: 18,
    operacoes: 623400,
    cacheHit: 82.1,
    queries: 28900,
    processamento: 'local',
  },
];

export default function EdgeNodeMonitor() {
  const [nodes] = useState(NODES_DETAILED);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-cyan-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Network className="w-6 h-6 text-cyan-400" />
        Edge Node Network
      </h2>

      {/* Network Topology */}
      <Card className="p-4 bg-white/5 border border-cyan-500/30 rounded-lg">
        <p className="text-xs text-slate-400 mb-3 font-semibold">Topologia de Rede Distribuída</p>
        <div className="flex items-center justify-between">
          {nodes.map((node, idx) => (
            <div key={node.id} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 rounded-lg bg-cyan-500/20 border border-cyan-500 flex items-center justify-center">
                <Activity className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-xs text-white font-semibold">{node.cidade}</p>
              <Badge className="bg-cyan-500/20 text-cyan-300 text-xs">{node.latencia}ms</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Detalhes por Node */}
      <div className="space-y-3">
        {nodes.map((node) => (
          <Card key={node.id} className="p-4 bg-white/5 border border-cyan-500/30 rounded-lg">
            <div className="grid grid-cols-6 gap-2 text-sm">
              <div>
                <p className="text-xs text-slate-400">Node</p>
                <p className="font-bold text-white">{node.id}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Latência</p>
                <p className="text-cyan-400 font-bold">{node.latencia}ms</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Operações</p>
                <p className="font-bold text-white">{(node.operacoes / 1000000).toFixed(1)}M</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Cache Hit</p>
                <p className="text-green-400 font-bold">{node.cacheHit}%</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Queries</p>
                <p className="font-bold text-white">{(node.queries / 1000).toFixed(0)}k</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Processamento</p>
                <Badge className="bg-blue-500/20 text-blue-300">{node.processamento}</Badge>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Global Stats */}
      <div className="grid grid-cols-3 gap-3 border-t border-cyan-500/20 pt-4">
        <Card className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
          <p className="text-xs text-slate-400">Total Operações</p>
          <p className="text-2xl font-bold text-cyan-400">4.9M</p>
        </Card>
        <Card className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-xs text-slate-400">Latência Média</p>
          <p className="text-2xl font-bold text-green-400">8ms</p>
        </Card>
        <Card className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <p className="text-xs text-slate-400">Uptime Médio</p>
          <p className="text-2xl font-bold text-purple-400">99.97%</p>
        </Card>
      </div>
    </div>
  );
}