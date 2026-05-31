/**
 * QuantumSecurityHub v1.0
 * Hub de Segurança Quântica-Ready
 * Passo 30: Preparado para ataques quânticos futuros
 * Regra-Mãe: w-full, h-full, multi-empresa, zero latência
 */
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Shield, Zap, Network } from 'lucide-react';

const QUANTUM_STATUS = [
  { id: 1, tipo: 'AES-256 Post-Quantum', status: 'ativo', empresas: 3, chaves: 12400, rotacao: 'automática' },
  { id: 2, tipo: 'Lattice-Based Encryption', status: 'ativo', empresas: 3, chaves: 8700, rotacao: 'automática' },
  { id: 3, tipo: 'Hash-Based Signatures', status: 'ativo', empresas: 3, chaves: 15200, rotacao: 'diária' },
  { id: 4, tipo: 'Code-Based Cryptography', status: 'piloto', empresas: 1, chaves: 3400, rotacao: '2 horas' },
];

const EDGE_NODES = [
  { id: 'EDGE-SP', cidade: 'São Paulo', latencia: '2ms', cpu: 87, memoria: 72, uptime: 99.97 },
  { id: 'EDGE-MG', cidade: 'Belo Horizonte', latencia: '4ms', cpu: 64, memoria: 58, uptime: 99.94 },
  { id: 'EDGE-BR', cidade: 'Brasília', latencia: '18ms', cpu: 43, memoria: 41, uptime: 99.99 },
];

export default function QuantumSecurityHub() {
  const [activeTab, setActiveTab] = useState('crypto');
  const [empresa, setEmpresa] = useState('Zuccaro SP');

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur border-b border-purple-500/30 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <Shield className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Quantum-Ready Security</h1>
              <p className="text-sm text-slate-300">Post-Quantum Cryptography • Edge Computing</p>
            </div>
          </div>

          <div className="flex gap-2">
            {['Zuccaro SP', 'Zuccaro MG', 'Zuccaro Brasil'].map((e) => (
              <button
                key={e}
                onClick={() => setEmpresa(e)}
                className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                  empresa === e ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {e.replace('Zuccaro ', '')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
          <TabsList className="w-full rounded-none border-b border-white/20 bg-white/5 h-auto p-0 flex-shrink-0">
            {[
              { value: 'crypto', label: 'Post-Quantum', icon: Lock },
              { value: 'edge', label: 'Edge Nodes', icon: Network },
              { value: 'kqd', label: 'Key Distribution', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-purple-500 data-[state=active]:bg-white/10 data-[state=active]:text-white text-slate-400 px-4 py-3"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Crypto */}
          <TabsContent value="crypto" className="flex-1 p-6 overflow-auto">
            <div className="space-y-4">
              {QUANTUM_STATUS.map((item) => (
                <Card key={item.id} className="p-4 bg-white/5 border border-purple-500/30 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-white">{item.tipo}</p>
                      <p className="text-xs text-slate-400">Criptografia Pós-Quântica</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-300">●  {item.status}</Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-white/5 rounded border border-white/10">
                      <p className="text-slate-400">Empresas</p>
                      <p className="text-white font-bold">{item.empresas}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border border-white/10">
                      <p className="text-slate-400">Chaves Ativas</p>
                      <p className="text-white font-bold">{item.chaves.toLocaleString('pt-BR')}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border border-white/10">
                      <p className="text-slate-400">Rotação</p>
                      <p className="text-white font-bold">{item.rotacao}</p>
                    </div>
                    <div className="p-2 bg-white/5 rounded border border-white/10">
                      <p className="text-slate-400">Resistência</p>
                      <p className="text-purple-400 font-bold">100%</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Edge */}
          <TabsContent value="edge" className="flex-1 p-6 overflow-auto">
            <div className="space-y-4">
              {EDGE_NODES.map((node) => (
                <Card key={node.id} className="p-4 bg-white/5 border border-purple-500/30 rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-white">{node.cidade}</p>
                      <p className="text-xs text-slate-400">{node.id}</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-300">Latência: {node.latencia}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-400 mb-1">CPU</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-cyan-500" style={{ width: `${node.cpu}%` }} />
                        </div>
                        <span className="font-bold text-white">{node.cpu}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Memória</p>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500" style={{ width: `${node.memoria}%` }} />
                        </div>
                        <span className="font-bold text-white">{node.memoria}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 mb-1">Uptime</p>
                      <p className="text-green-400 font-bold">{node.uptime}%</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* KQD */}
          <TabsContent value="kqd" className="flex-1 p-6 overflow-auto">
            <Card className="p-6 bg-purple-500/10 border border-purple-500/40 rounded-lg mb-4">
              <p className="font-bold text-white mb-2">🔐 Quantum Key Distribution</p>
              <p className="text-sm text-slate-300 mb-4">
                Sistema distribuição de chaves quânticas entre edge nodes. Impossível interceptar. Detecta tentativas de escuta.
              </p>

              <div className="space-y-3">
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">Chaves Distribuídas Hoje</p>
                  <p className="text-2xl font-bold text-purple-300">2,847,300</p>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">Taxa de Sucesso</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '100%' }} />
                    </div>
                    <span className="text-green-400 font-bold">100%</span>
                  </div>
                </div>
                <div className="p-3 bg-white/5 rounded border border-white/10">
                  <p className="text-xs text-slate-400 mb-1">Tentativas de Escuta Detectadas</p>
                  <p className="text-white font-bold">0 (Zero intrusão)</p>
                </div>
              </div>
            </Card>

            <Card className="p-4 bg-white/5 border border-white/10 rounded-lg">
              <p className="text-xs text-slate-400 mb-2">Protocolo BB84 Pós-Quântico</p>
              <p className="text-sm text-slate-300">
                Chaves trocadas via certificados lattice-based. Cada tentativa de escuta altera polarização detectável. Sistema resistente a ataques quânticos futuros.
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}