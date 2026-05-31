import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, User, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function RiskAssessmentPanel() {
  const [riscos] = useState([
    {
      id: 'R-001',
      tipo: 'Geopolítico',
      descricao: 'Instabilidade em região produtora de matérias-primas',
      severidade: 'crítica',
      probabilidade: 85,
      impacto: 8500,
      status: 'monitorado',
      plano_mitigacao: 'Diversificar fornecedores'
    },
    {
      id: 'R-002',
      tipo: 'Operacional',
      descricao: 'Capacidade limitada de fornecedor estratégico',
      severidade: 'alta',
      probabilidade: 60,
      impacto: 5200,
      status: 'ativo',
      plano_mitigacao: 'Aumentar estoque de segurança'
    },
    {
      id: 'R-003',
      tipo: 'Financeiro',
      descricao: 'Volatilidade cambial afetando custos',
      severidade: 'alta',
      probabilidade: 75,
      impacto: 4100,
      status: 'mitigando',
      plano_mitigacao: 'Contratos com cláusulas de proteção'
    },
    {
      id: 'R-004',
      tipo: 'Climático',
      descricao: 'Risco de atrasos logísticos por condições climáticas',
      severidade: 'média',
      probabilidade: 45,
      impacto: 2800,
      status: 'monitorado',
      plano_mitigacao: 'Rotas alternativas pré-planejadas'
    }
  ]);

  const getSeveridadeColor = (sev) => {
    switch(sev) {
      case 'crítica':
        return 'bg-red-50 border-red-300';
      case 'alta':
        return 'bg-orange-50 border-orange-300';
      case 'média':
        return 'bg-yellow-50 border-yellow-300';
      default:
        return 'bg-slate-50 border-slate-300';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ativo':
        return 'bg-red-600 hover:bg-red-700';
      case 'mitigando':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'monitorado':
        return 'bg-blue-600 hover:bg-blue-700';
      default:
        return 'bg-slate-600 hover:bg-slate-700';
    }
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {riscos.map((risco) => (
        <Card key={risco.id} className={`border-2 ${getSeveridadeColor(risco.severidade)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base">{risco.tipo}</CardTitle>
                  <Badge className={getStatusColor(risco.status)}>
                    {risco.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-slate-900">{risco.descricao}</p>
              </div>
              <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{
                color: risco.severidade === 'crítica' ? '#dc2626' :
                       risco.severidade === 'alta' ? '#ea580c' :
                       '#eab308'
              }} />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Scores */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-600">Probabilidade</span>
                  <span className="text-xs font-semibold">{risco.probabilidade}%</span>
                </div>
                <Progress value={risco.probabilidade} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-600">Impacto Potencial</span>
                  <span className="text-xs font-semibold">R${risco.impacto}</span>
                </div>
                <Progress value={Math.min((risco.impacto / 10000) * 100, 100)} className="h-2" />
              </div>
            </div>

            {/* Plano de Mitigação */}
            <div className="bg-white/50 p-3 rounded border-l-2 border-emerald-600">
              <p className="text-xs text-slate-600 font-semibold mb-1">Plano de Mitigação</p>
              <p className="text-sm text-slate-900">{risco.plano_mitigacao}</p>
            </div>

            {/* Score de Risco */}
            <div className="text-center bg-white/50 p-2 rounded">
              <p className="text-xs text-slate-600 mb-1">Escore de Risco</p>
              <p className="text-lg font-bold text-slate-900">
                {Math.round((risco.probabilidade * risco.impacto) / 1000)}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}