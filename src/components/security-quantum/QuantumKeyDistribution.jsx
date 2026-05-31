/**
 * QuantumKeyDistribution v1.0
 * Distribuição de chaves quântica (QKD)
 * Passo 30: Chaves criptográficas à prova do quântico
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock } from 'lucide-react';

const QKD_SESSIONS = [
  { id: 'QKD-001', origem: 'Zuccaro SP', destino: 'Zuccaro MG', bits: 2048, status: 'ativo', segurança: 'SHA-3 + NTRU' },
  { id: 'QKD-002', origem: 'Zuccaro SP', destino: 'AWS Cloud', bits: 4096, status: 'ativo', segurança: 'Dilithium + KYBER' },
  { id: 'QKD-003', origem: 'Zuccaro MG', destino: 'Portal', bits: 2048, status: 'ativo', segurança: 'FALCON + SPHINCS' },
  { id: 'QKD-004', origem: 'API Gateway', destino: 'Database', bits: 8192, status: 'ativo', segurança: 'NTRU-Prime' },
];

export default function QuantumKeyDistribution({ empresa }) {
  const [sessions] = useState(QKD_SESSIONS);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-indigo-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Lock className="w-6 h-6 text-cyan-400" />
        Quantum Key Distribution (QKD)
      </h2>

      <div className="space-y-3">
        {sessions.map((session) => (
          <Card key={session.id} className="p-4 bg-white/5 border border-cyan-500/30 rounded-lg">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-bold text-white">{session.id}</p>
                <p className="text-xs text-slate-400">
                  {session.origem} → {session.destino}
                </p>
              </div>
              <Badge className="bg-green-500/20 text-green-300">● ATIVO</Badge>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 bg-white/5 rounded border border-white/10">
                <p className="text-slate-400">Bits</p>
                <p className="text-white font-bold">{session.bits}</p>
              </div>
              <div className="p-2 bg-white/5 rounded border border-white/10">
                <p className="text-slate-400">Algoritmo</p>
                <p className="text-cyan-300 font-semibold">{session.segurança.split(' + ')[0]}</p>
              </div>
              <div className="p-2 bg-white/5 rounded border border-white/10">
                <p className="text-slate-400">Pós-Quântico</p>
                <p className="text-green-300 font-bold">✓ SIM</p>
              </div>
            </div>

            <div className="mt-2 p-2 bg-indigo-500/10 rounded text-xs text-indigo-300">
              🔐 {session.segurança} — À prova de computadores quânticos
            </div>
          </Card>
        ))}
      </div>

      {/* Info */}
      <Card className="p-4 bg-cyan-500/10 border border-cyan-400/40 rounded-lg">
        <p className="text-sm text-cyan-300 font-semibold mb-2">🔐 Algoritmos Pós-Quânticos</p>
        <ul className="text-xs text-slate-300 space-y-1">
          <li>✓ <strong>NTRU / NTRU-Prime</strong>: Criptografia baseada em látices</li>
          <li>✓ <strong>Dilithium</strong>: Assinatura digital pós-quântica</li>
          <li>✓ <strong>KYBER / Kyber-512/768/1024</strong>: Encapsulamento de chaves</li>
          <li>✓ <strong>FALCON</strong>: Assinatura rápida</li>
          <li>✓ <strong>SPHINCS+</strong>: Hash-based stateless signature</li>
        </ul>
      </Card>
    </div>
  );
}