import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';

export default function ComplianceMonitoringPanel() {
  const frameworks = [
    { nome: 'LGPD/GDPR', progresso: 100, status: 'compliant', proxima_auditoria: '2026-08-15', detalhes: 'Data Processing Agreement ativo' },
    { nome: 'ISO 27001', progresso: 94, status: 'em-progresso', proxima_auditoria: '2026-06-30', detalhes: '2 achados menores em resolução' },
    { nome: 'SOC 2 Type II', progresso: 88, status: 'em-progresso', proxima_auditoria: '2026-09-01', detalhes: 'Controles de acesso em review' },
    { nome: 'PCI DSS 3.2.1', progresso: 100, status: 'compliant', proxima_auditoria: '2026-07-20', detalhes: 'Level 1 Compliance mantida' },
    { nome: 'HIPAA', progresso: 92, status: 'em-progresso', proxima_auditoria: '2026-10-15', detalhes: '1 achado crítico e 3 menores' },
  ];

  const regulacoes = [
    { pais: 'Brasil', regra: 'Lei 12.527/2011 (Lei de Acesso)', status: 'ativo', validacao: '2026-12-31' },
    { pais: 'Brasil', regra: 'LGPD (Lei 13.709/2018)', status: 'ativo', validacao: '2026-12-31' },
    { pais: 'EU', regra: 'GDPR (Reg. 2016/679)', status: 'ativo', validacao: '2027-03-15' },
    { pais: 'EUA', regra: 'CCPA (California Consumer Privacy)', status: 'ativo', validacao: '2026-06-30' },
  ];

  const getStatusIcon = (status) => {
    if (status === 'compliant') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (status === 'em-progresso') return <Clock className="w-4 h-4 text-amber-400" />;
    return <AlertCircle className="w-4 h-4 text-red-400" />;
  };

  const getStatusColor = (status) => {
    if (status === 'compliant') return 'text-emerald-400 bg-emerald-900/30';
    if (status === 'em-progresso') return 'text-amber-400 bg-amber-900/30';
    return 'text-red-400 bg-red-900/30';
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Compliance Score */}
      <Card className="bg-gradient-to-br from-emerald-900/30 to-slate-800 border-emerald-700">
        <CardContent className="p-4">
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-2">Compliance Score Geral</p>
            <p className="text-5xl font-bold text-emerald-400">94%</p>
            <p className="text-xs text-emerald-400 mt-2">Apenas 1 achado crítico pendente</p>
          </div>
        </CardContent>
      </Card>

      {/* Frameworks */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Frameworks de Conformidade</h3>
        {frameworks.map((f, idx) => (
          <Card key={idx} className={`${getStatusColor(f.status)} border-slate-700`}>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(f.status)}
                    <p className="font-semibold text-white text-sm">{f.nome}</p>
                  </div>
                  <span className="text-sm font-bold">{f.progresso}%</span>
                </div>
                <Progress value={f.progresso} className="h-1.5 bg-slate-700" />
                <p className="text-xs text-slate-400">{f.detalhes}</p>
                <p className="text-xs text-slate-500">Próxima auditoria: {new Date(f.proxima_auditoria).toLocaleDateString('pt-BR')}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Regulações */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Regulações Aplicáveis</h3>
        {regulacoes.map((r, idx) => (
          <Card key={idx} className="bg-slate-800 border-slate-700">
            <CardContent className="p-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm">{r.regra}</p>
                  <p className="text-xs text-slate-400">{r.pais}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Badge className="bg-emerald-900 text-emerald-200 text-xs">Ativo</Badge>
                  <Badge className="bg-slate-700 text-slate-200 text-xs">Até {new Date(r.validacao).toLocaleDateString('pt-BR')}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Achados Críticos</p>
            <p className="text-2xl font-bold text-red-400">1</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Achados Maiores</p>
            <p className="text-2xl font-bold text-amber-400">4</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Achados Menores</p>
            <p className="text-2xl font-bold text-yellow-400">7</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}