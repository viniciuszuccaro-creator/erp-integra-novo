import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function ZeroTrustArchitecture() {
  const pilares = [
    { nome: 'Identidade & Autenticação', score: 98, detalhes: 'MFA obrigatória, sessões <8h' },
    { nome: 'Autorização Granular', score: 94, detalhes: 'RBAC + ABAC em todos os endpoints' },
    { nome: 'Inspeção de Dados', score: 89, detalhes: 'DLP em 847 endpoints' },
    { nome: 'Monitoramento Real-Time', score: 92, detalhes: '1.2M eventos/dia auditados' },
    { nome: 'Segmentação de Rede', score: 86, detalhes: 'Microsserviços isolados' },
    { nome: 'Resposta a Incidentes', score: 88, detalhes: 'Tempo médio < 15 min' },
  ];

  const validacoes = [
    { id: 'V001', tipo: 'Biométrica', usuario: 'João Silva', timestamp: '10:34 hoje', resultado: 'Sucesso', risco: 'Baixo' },
    { id: 'V002', tipo: 'IP Whitelist', usuario: 'Sistema Externo', timestamp: '09:12 hoje', resultado: 'Bloqueado', risco: 'Alto' },
    { id: 'V003', tipo: 'MFA SMS', usuario: 'Pedro Costa', timestamp: '15:45 ontem', resultado: 'Sucesso', risco: 'Baixo' },
    { id: 'V004', tipo: 'Behavior Analysis', usuario: 'Ana Oliveira', timestamp: 'Agora', resultado: 'Suspeito', risco: 'Médio' },
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return { text: 'text-emerald-400', bar: 'bg-emerald-500' };
    if (score >= 80) return { text: 'text-amber-400', bar: 'bg-amber-500' };
    return { text: 'text-red-400', bar: 'bg-red-500' };
  };

  const getRiscoColor = (risco) => {
    if (risco === 'Alto') return 'bg-red-900 text-red-200';
    if (risco === 'Médio') return 'bg-amber-900 text-amber-200';
    return 'bg-emerald-900 text-emerald-200';
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Score Geral */}
      <Card className="bg-gradient-to-br from-emerald-900/30 to-slate-800 border-emerald-700">
        <CardContent className="p-4 text-center">
          <p className="text-slate-400 text-sm mb-1">Zero Trust Maturity Score</p>
          <p className="text-5xl font-bold text-emerald-400">91.2%</p>
          <p className="text-xs text-emerald-400 mt-2">Nível: Advanced • Próximo alvo: 95%</p>
        </CardContent>
      </Card>

      {/* Pilares */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">6 Pilares Zero Trust</h3>
        {pilares.map((p, idx) => {
          const colors = getScoreColor(p.score);
          return (
            <Card key={idx} className="bg-slate-800 border-slate-700">
              <CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-white text-sm">{p.nome}</p>
                  <span className={`font-bold ${colors.text}`}>{p.score}%</span>
                </div>
                <p className="text-xs text-slate-400">{p.detalhes}</p>
                <div className="w-full bg-slate-700 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${colors.bar}`} style={{ width: `${p.score}%` }} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Validações Recentes */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Validações Recentes</h3>
        {validacoes.map(v => (
          <Card key={v.id} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{v.usuario}</p>
                  <p className="text-xs text-slate-400">{v.tipo} • {v.timestamp}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className={`px-2 py-1 text-xs rounded font-semibold ${
                    v.resultado === 'Sucesso' ? 'bg-emerald-900 text-emerald-200' :
                    v.resultado === 'Bloqueado' ? 'bg-red-900 text-red-200' :
                    'bg-amber-900 text-amber-200'
                  }`}>{v.resultado}</span>
                  <span className={`px-2 py-1 text-xs rounded ${getRiscoColor(v.risco)}`}>{v.risco}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}