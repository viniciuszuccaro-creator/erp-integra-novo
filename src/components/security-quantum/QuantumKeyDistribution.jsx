import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Key, ShieldCheck, RefreshCw } from 'lucide-react';

export default function QuantumKeyDistribution() {
  const chaves = [
    { id: 'QK001', tipo: 'Post-Quantum RSA', algoritmo: 'CRYSTALS-Kyber', bits: 3072, expira: '2027-01-01', status: 'ativa' },
    { id: 'QK002', tipo: 'Digital Signature', algoritmo: 'CRYSTALS-Dilithium', bits: 2048, expira: '2026-06-30', status: 'ativa' },
    { id: 'QK003', tipo: 'Hash Function', algoritmo: 'SPHINCS+', bits: 4096, expira: '2027-12-01', status: 'ativa' },
    { id: 'QK004', tipo: 'Key Exchange', algoritmo: 'NTRU', bits: 2048, expira: '2026-09-15', status: 'rotacionar' },
  ];

  const roadmap = [
    { fase: 'Fase 1: Inventário', concluida: true, desc: 'Mapeamento de todos os algoritmos vulneráveis a quantum' },
    { fase: 'Fase 2: Algoritmos PQC', concluida: true, desc: 'Implementação de CRYSTALS-Kyber e Dilithium (NIST PQC)' },
    { fase: 'Fase 3: Migração Gradual', concluida: false, desc: 'Troca dos RSA-2048 por post-quantum — 60% concluído' },
    { fase: 'Fase 4: Quantum-Native', concluida: false, desc: 'Infraestrutura 100% quantum-resistant até 2027' },
  ];

  const metricas = [
    { label: 'Algoritmos PQC Ativos', valor: '3/4', cor: 'text-purple-400' },
    { label: 'Chaves Rotacionadas (30d)', valor: '18', cor: 'text-blue-400' },
    { label: 'Vulnerabilidade Quântica', valor: '12%', cor: 'text-amber-400' },
    { label: 'Maturidade PQC', valor: '72%', cor: 'text-emerald-400' },
  ];

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Métricas */}
      <div className="grid grid-cols-2 gap-3">
        {metricas.map((m, idx) => (
          <Card key={idx} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <p className="text-xs text-slate-400">{m.label}</p>
              <p className={`text-xl font-bold ${m.cor}`}>{m.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chaves Post-Quantum */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Chaves Post-Quantum (PQC)</h3>
        {chaves.map(c => (
          <Card key={c.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <Key className={`w-5 h-5 shrink-0 mt-0.5 ${c.status === 'ativa' ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm">{c.tipo}</p>
                    <p className="text-xs text-slate-400">{c.algoritmo} • {c.bits} bits</p>
                    <p className="text-xs text-slate-500 mt-0.5">Expira: {c.expira}</p>
                  </div>
                </div>
                <Badge className={`text-xs ${c.status === 'ativa' ? 'bg-emerald-900 text-emerald-200' : 'bg-amber-900 text-amber-200'}`}>
                  {c.status === 'ativa' ? 'Ativa' : 'Rotacionar'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Roadmap */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Roadmap Quantum-Ready</h3>
        {roadmap.map((r, idx) => (
          <Card key={idx} className={`border ${r.concluida ? 'bg-emerald-900/20 border-emerald-800' : 'bg-slate-800 border-slate-700'}`}>
            <CardContent className="p-3">
              <div className="flex gap-3">
                <ShieldCheck className={`w-5 h-5 shrink-0 mt-0.5 ${r.concluida ? 'text-emerald-400' : 'text-slate-400'}`} />
                <div>
                  <p className="font-semibold text-white text-sm">{r.fase}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.desc}</p>
                </div>
                {r.concluida && <Badge className="ml-auto shrink-0 bg-emerald-900 text-emerald-200 text-xs">✓</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}