import React, { useState } from 'react';
import { Shield, CheckCircle2, AlertCircle, Lock, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function ZeroTrustPanel() {
  const [pilares] = useState([
    {
      id: 'ZT-001',
      nome: 'Verificação Contínua de Identidade',
      descricao: 'Autenticação multifator em cada acesso',
      conformidade: 99,
      usuarios_verificados: 847,
      tentativas_bloqueadas_7d: 23,
      metodo_principal: 'Biometria + Token Quântico',
      status: 'ativo'
    },
    {
      id: 'ZT-002',
      nome: 'Segmentação de Rede (Microsegmentação)',
      descricao: 'Isolamento de tráfego por contexto de acesso',
      conformidade: 92,
      segmentos_ativos: 156,
      tentativas_bloqueadas_7d: 8,
      metodo_principal: 'VLANs + SDN + Criptografia',
      status: 'ativo'
    },
    {
      id: 'ZT-003',
      nome: 'Verificação de Dispositivo (Device Trust)',
      descricao: 'Análise de saúde e conformidade do dispositivo',
      conformidade: 88,
      dispositivos_verificados: 1203,
      tentativas_bloqueadas_7d: 14,
      metodo_principal: 'TPM 2.0 + Attestation Remoto',
      status: 'ativo'
    },
    {
      id: 'ZT-004',
      nome: 'Acesso com Privilégio Mínimo (PAM)',
      descricao: 'Just-in-Time access com auditoria total',
      conformidade: 96,
      sessoes_jit_7d: 342,
      tentativas_bloqueadas_7d: 5,
      metodo_principal: 'Elevação Temporária + Auditoria',
      status: 'ativo'
    }
  ]);

  const conformidadeMedia = Math.round(pilares.reduce((sum, p) => sum + p.conformidade, 0) / pilares.length);

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {/* Resumo Geral */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Zero-Trust Architecture - Status Geral
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-600 mb-1">Conformidade Média</p>
              <p className="text-3xl font-bold text-blue-600">{conformidadeMedia}%</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Bloqueios Últimos 7 dias</p>
              <p className="text-3xl font-bold text-red-600">50</p>
            </div>
            <div>
              <p className="text-slate-600 mb-1">Pilares Ativos</p>
              <p className="text-3xl font-bold text-emerald-600">{pilares.length}/4</p>
            </div>
          </div>
          <Progress value={conformidadeMedia} className="h-3" />
        </CardContent>
      </Card>

      {/* Pilares */}
      {pilares.map((pilar) => (
        <Card key={pilar.id} className="border-slate-200">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{pilar.nome}</CardTitle>
                <p className="text-xs text-slate-600 mt-1">{pilar.descricao}</p>
              </div>
              <Badge className="bg-emerald-600">{pilar.status.toUpperCase()}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Conformidade */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">Conformidade Zero-Trust</span>
                <span className="text-xs font-semibold">{pilar.conformidade}%</span>
              </div>
              <Progress value={pilar.conformidade} className="h-2" />
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2 rounded">
                <p className="text-slate-600 mb-1">
                  {pilar.id === 'ZT-001' && 'Usuários Verificados'}
                  {pilar.id === 'ZT-002' && 'Segmentos Ativos'}
                  {pilar.id === 'ZT-003' && 'Dispositivos Verificados'}
                  {pilar.id === 'ZT-004' && 'Sessões JIT (7d)'}
                </p>
                <p className="text-lg font-bold text-slate-900">
                  {pilar.id === 'ZT-001' && pilar.usuarios_verificados}
                  {pilar.id === 'ZT-002' && pilar.segmentos_ativos}
                  {pilar.id === 'ZT-003' && pilar.dispositivos_verificados}
                  {pilar.id === 'ZT-004' && pilar.sessoes_jit_7d}
                </p>
              </div>
              <div className="bg-red-50 p-2 rounded">
                <p className="text-slate-600 mb-1">Bloqueios (7d)</p>
                <p className="text-lg font-bold text-red-700">{pilar.tentativas_bloqueadas_7d}</p>
              </div>
            </div>

            {/* Método */}
            <div className="bg-blue-50 p-2 rounded border-l-2 border-blue-600">
              <p className="text-xs text-slate-600 mb-1">Método Principal</p>
              <p className="text-sm font-semibold text-slate-900">{pilar.metodo_principal}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}