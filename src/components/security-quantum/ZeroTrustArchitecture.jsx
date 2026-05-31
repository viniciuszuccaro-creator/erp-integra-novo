import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

export default function ZeroTrustArchitecture() {
  const pilares = [
    { nome: 'Identidade & Autenticação', score: 98, status: 'optimal', detalhes: 'MFA obrigatória, sessões <8h' },
    { nome: 'Autorização Granular', score: 94, status: 'optimal', detalhes: 'RBAC + ABAC em todos os endpoints' },
    { nome: 'Inspeção de Dados', score: 89, status: 'bom', detalhes: 'DLP em 847 endpoints' },
    { nome: 'Monitoramento em Tempo Real', score: 92, status: 'optimal', detalhes: '1.2M eventos/dia auditados' },
    { nome: 'Segmentação de Rede', score: 86, status: 'bom', detalhes: 'Microsserviços isolados' },
    { nome: 'Resposta a Incidentes', score: 88, status: 'bom', detalhes: '< 15 min tempo resposta' },
  ];

  const validacoes = [
    { id: 'V001', tipo: 'Biométrica', usuario: 'João Silva', timestamp: '10:34 hoje', resultado: 'Sucesso', risco: 'Baixo' },
    { id: 'V002', tipo: 'IP Whitelist', usuario: 'Maria Santos', timestamp: '09:12 hoje', resultado: 'Bloqueado', risco: 'Alto' },
    { id: 'V003', tipo: 'MFA SMS', usuario: 'Pedro Costa', timestamp: '15:45 ontem', resultado: 'Sucesso', risco: 'Baixo' },
    { id: 'V004', tipo: 'Behavior Analysis', usuario: 'Ana Oliveira', timestamp: 'Agora', resultado: 'Suspeito', risco: 'Médio' },
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-emerald-400';
    if (score >= 80) return 'text-amber-400';
    return 'text-red-400';
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Score Geral */}
      <Card className="bg-gradient-to-br from-emerald-900/30 to-slate-800 border-emerald-700">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Zero Trust Maturity Score</p>
            <p className="text-5xl font-bold text-emerald-400">91.2%</p>
            <p className="text-xs text-emerald-400 mt-2">Próximo nível em: 93% (2 pilares)</p>
          </div>
        </CardContent>
      </Card>

      {/* Pilares */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">6 Pilares Zero Trust</h3>
        {pilares.map((p, idx) => (
          <Card key={idx} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white text-sm">{p.nome}</p>
                  <span className={`text-lg font-bold ${getScoreColor(p.score)}`}>{p.score}%</span>
                </div>
                <p className="text-xs text-slate-400">{p.detalhes}</p>