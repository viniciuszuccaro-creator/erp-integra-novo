import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lock, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

export default function EncryptionAuditPanel() {
  const certificados = [
    { id: 'C001', dominio: 'api.zuccaro.com', algoritmo: 'RSA-4096', validade: '45 dias', status: 'ativo', confianca: 'A+' },
    { id: 'C002', dominio: 'payment.zuccaro.com', algoritmo: 'ECDSA-384', validade: '120 dias', status: 'ativo', confianca: 'A+' },
    { id: 'C003', dominio: 'backup.zuccaro.com', algoritmo: 'RSA-2048', validade: '5 dias', status: 'expirando', confianca: 'A' },
    { id: 'C004', dominio: 'internal.zuccaro.com', algoritmo: 'AES-256', validade: '340 dias', status: 'ativo', confianca: 'A' },
  ];

  const criptografiaData = [
    { tipo: 'TLS 1.3', percentual: 78 },
    { tipo: 'TLS 1.2', percentual: 18 },
    { tipo: 'TLS 1.1', percentual: 3 },
    { tipo: 'Legacy', percentual: 1 },
  ];

  const getStatusIcon = (status) => {
    if (status === 'ativo') return CheckCircle2;
    if (status === 'expirando') return AlertCircle;
    return Clock;
  };

  const getStatusColor = (status) => {
    if (status === 'ativo') return 'text-emerald-400 bg-emerald-900/30';
    if (status === 'expirando') return 'text-amber-400 bg-amber-900/30';
    return 'text-slate-400 bg-slate-700/30';
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Distribuição TLS */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Distribuição de Protocolos TLS</CardTitle>
        </CardHeader>
        <CardContent className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={criptografiaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="tipo" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569' }} />
              <Bar dataKey="percentual" fill="#3b82f6" name="%" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Certificados */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Certificados SSL/TLS</h3>
        {certificados.map(c => {
          const StatusIcon = getStatusIcon(c.status);
          const statusColor = getStatusColor(c.status);
          
          return (
            <Card key={c.id} className={`${statusColor} border-slate-700`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1">
                    <StatusIcon className="w-5 h-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-white text-sm">{c.dominio}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{c.algoritmo} • Validade: {c.validade}</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Badge className="bg-slate-700 text-slate-200 text-xs">SSL {c.confianca}</Badge>
                    <Badge className={`text-xs font-semibold ${c.status === 'ativo' ? 'bg-emerald-900 text-emerald-200' : 'bg-amber-900 text-amber-200'}`}>
                      {c.status === 'ativo' ? 'Ativo' : 'Expirando'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Conformidade */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400 mb-1">Conformidade PCI DSS</p>
            <p className="text-2xl font-bold text-emerald-400">100%</p>
            <p className="text-xs text-emerald-400 mt-1">Level 1 Compliance</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400 mb-1">Auditoria HIPAA</p>
            <p className="text-2xl font-bold text-blue-400">Aprovado</p>
            <p className="text-xs text-blue-400 mt-1">Até 2026-12-31</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}