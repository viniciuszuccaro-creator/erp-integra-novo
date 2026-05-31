import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export default function RiskMitigationMatrix() {
  const mitigacoes = [
    { 
      id: 'M001', 
      risco: 'Falha de infraestrutura crítica', 
      estrategia: 'Redundância de data centers',
      status: 'ativo',
      progresso: 85,
      responsavel: 'TI/Infraestrutura',
      deadline: '2026-07-15',
      custo: 'R$ 450.000'
    },
    { 
      id: 'M002', 
      risco: 'Fraude em pagamentos internacionais', 
      estrategia: 'Implementar machine learning para detecção',
      status: 'planejado',
      progresso: 30,
      responsavel: 'Financeiro/IA',
      deadline: '2026-09-01',
      custo: 'R$ 120.000'
    },
    { 
      id: 'M003', 
      risco: 'Não-conformidade fiscal municipal', 
      estrategia: 'Auditoria municipal completa + correções',
      status: 'ativo',
      progresso: 65,
      responsavel: 'Fiscal/Compliance',
      deadline: '2026-06-30',
      custo: 'R$ 85.000'
    },
    { 
      id: 'M004', 
      risco: 'Vulnerabilidade de dados do cliente', 
      estrategia: 'Penetration testing + hardening',
      status: 'concluído',
      progresso: 100,
      responsavel: 'Segurança',
      deadline: '2026-05-20',
      custo: 'R$ 95.000'
    },
    { 
      id: 'M005', 
      risco: 'Incidente de privacidade de dados', 
      estrategia: 'Treinamento LGPD para toda equipe',
      status: 'ativo',
      progresso: 72,
      responsavel: 'RH/Compliance',
      deadline: '2026-08-15',
      custo: 'R$ 45.000'
    },
  ];

  const getStatusIcon = (status) => {
    if (status === 'concluído') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (status === 'ativo') return <Clock className="w-4 h-4 text-blue-400" />;
    return <AlertCircle className="w-4 h-4 text-slate-400" />;
  };

  const getStatusColor = (status) => {
    if (status === 'concluído') return 'text-emerald-400 bg-emerald-900/30';
    if (status === 'ativo') return 'text-blue-400 bg-blue-900/30';
    return 'text-slate-400 bg-slate-700/30';
  };

  const getStatusBadge = (status) => {
    if (status === 'concluído') return <Badge className="bg-emerald-900 text-emerald-200 text-xs">Concluído</Badge>;
    if (status === 'ativo') return <Badge className="bg-blue-900 text-blue-200 text-xs">Em Progresso</Badge>;
    return <Badge className="bg-slate-700 text-slate-200 text-xs">Planejado</Badge>;
  };

  return (
    <div className="w-full h-full overflow-auto space-y-4 p-1">
      {/* Resumo */}
      <div className="grid grid-cols-4 gap-2">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Total</p>
            <p className="text-2xl font-bold text-white">{mitigacoes.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Concluído</p>
            <p className="text-2xl font-bold text-emerald-400">{mitigacoes.filter(m => m.status === 'concluído').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Ativo</p>
            <p className="text-2xl font-bold text-blue-400">{mitigacoes.filter(m => m.status === 'ativo').length}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3 text-center">
            <p className="text-xs text-slate-400 mb-1">Investimento</p>
            <p className="text-xl font-bold text-amber-400">R$ 795k</p>
          </CardContent>
        </Card>
      </div>

      {/* Plano de Mitigação */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Plano de Mitigação de Riscos</h3>
        {mitigacoes.map(m => (
          <Card key={m.id} className={`${getStatusColor(m.status)} border-slate-700`}>
            <CardContent className="p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1">
                    {getStatusIcon(m.status)}
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white text-sm">{m.risco}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{m.estrategia}</p>
                    </div>
                  </div>
                  {getStatusBadge(m.status)}
                </div>

                <Progress value={m.progresso} className="h-1.5 bg-slate-700" />
                
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-slate-500">Responsável</p>
                    <p className="text-slate-300 font-medium">{m.responsavel}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Deadline</p>
                    <p className="text-slate-300 font-medium">{new Date(m.deadline).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Investimento</p>
                    <p className="text-slate-300 font-medium">{m.custo}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Indicadores */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm text-white">Indicadores de Efetividade</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-slate-400 mb-1">Progresso Médio de Mitigação</p>
            <p className="text-xl font-bold text-blue-400">70.4%</p>
            <Progress value={70.4} className="h-1.5 bg-slate-700 mt-1" />
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">ROI Esperado de Mitigações</p>
            <p className="text-xl font-bold text-emerald-400">R$ 2.8M</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}