import React, { useState } from 'react';
import { Zap, Lock, Key, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function QuantumEncryptionPanel() {
  const [chaves] = useState([
    {
      id: 'QK-001',
      tipo: 'Kyber (Lattice-based)',
      descricao: 'Post-quantum key encapsulation',
      status: 'ativo',
      quantidade: 847,
      rotacao_dias: 90,
      proxima_rotacao: '2026-08-29',
      conformidade_pq: 100,
      computadores_protegidos: 847
    },
    {
      id: 'QK-002',
      tipo: 'Dilithium (Lattice Signature)',
      descricao: 'Post-quantum digital signatures',
      status: 'ativo',
      quantidade: 623,
      rotacao_dias: 180,
      proxima_rotacao: '2026-11-28',
      conformidade_pq: 98,
      computadores_protegidos: 623
    },
    {
      id: 'QK-003',
      tipo: 'SPHINCS+ (Hash-based)',
      descricao: 'Stateless hash-based signature',
      status: 'ativo',
      quantidade: 312,
      rotacao_dias: 365,
      proxima_rotacao: '2027-05-31',
      conformidade_pq: 95,
      computadores_protegidos: 312
    },
    {
      id: 'QK-004',
      tipo: 'AES-256 + Quantum Randomness',
      descricao: 'Criptografia simétrica hybridizada',
      status: 'ativo',
      quantidade: 1203,
      rotacao_dias: 30,
      proxima_rotacao: '2026-06-30',
      conformidade_pq: 99,
      computadores_protegidos: 1203
    }
  ]);

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {/* Resumo */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            Criptografia Quântico-Segura
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600 mb-1">Chaves Ativas</p>
              <p className="text-3xl font-bold text-purple-600">2.985</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Conformidade PQC</p>
              <p className="text-3xl font-bold text-emerald-600">98%</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Sistemas Protegidos</p>
              <p className="text-3xl font-bold text-blue-600">3.985</p>
            </div>
          </div>
          <Progress value={98} className="h-3" />
        </CardContent>
      </Card>

      {/* Algoritmos */}
      {chaves.map((chave) => (
        <Card key={chave.id} className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  {chave.tipo}
                </CardTitle>
                <p className="text-xs text-slate-600 mt-1">{chave.descricao}</p>
              </div>
              <Badge className="bg-purple-600">{chave.status.toUpperCase()}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Conformidade */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">Conformidade PQC</span>
                <span className="text-xs font-semibold">{chave.conformidade_pq}%</span>
              </div>
              <Progress value={chave.conformidade_pq} className="h-2" />
            </div>

            {/* Grid de Info */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-purple-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Chaves Ativas</p>
                <p className="text-lg font-bold text-purple-700">{chave.quantidade}</p>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Rotação (dias)</p>
                <p className="text-lg font-bold text-blue-700">{chave.rotacao_dias}</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Sistemas</p>
                <p className="text-lg font-bold text-emerald-700">{chave.computadores_protegidos}</p>
              </div>
            </div>

            {/* Próxima Rotação */}
            <div className="bg-slate-50 p-2 rounded border-l-2 border-slate-400">
              <p className="text-xs text-slate-600 mb-1">Próxima Rotação</p>
              <p className="text-sm font-semibold text-slate-900">{chave.proxima_rotacao}</p>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Info Post-Quantum */}
      <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-300">
        <CardContent className="pt-6 text-sm space-y-2">
          <p className="text-slate-700">
            <span className="font-semibold">Padrão NIST:</span> Algoritmos FIPS 203, 204 e 205 implementados
          </p>
          <p className="text-slate-700">
            <span className="font-semibold">Proteção Contra:</span> Ataques quânticos futuros (Shor's, Grover's)
          </p>
          <p className="text-slate-700">
            <span className="font-semibold">Hibridização:</span> Algoritmos clássicos + pós-quânticos simultâneos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}