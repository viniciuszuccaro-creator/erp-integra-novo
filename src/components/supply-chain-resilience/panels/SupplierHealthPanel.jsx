import React, { useState } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function SupplierHealthPanel() {
  const [fornecedores] = useState([
    {
      id: 'FOR-001',
      nome: 'Aço Mineiro LTDA',
      categoria: 'Matéria-Prima',
      score_saude: 88,
      on_time: 94,
      qualidade: 96,
      estabilidade_financeira: 'verde',
      risco_nivel: 'baixo',
      ultimas_issues: 0
    },
    {
      id: 'FOR-002',
      nome: 'Transportes Brasil Express',
      categoria: 'Logística',
      score_saude: 62,
      on_time: 78,
      qualidade: 68,
      estabilidade_financeira: 'amarelo',
      risco_nivel: 'médio',
      ultimas_issues: 3
    },
    {
      id: 'FOR-003',
      nome: 'Componentes Importados XYZ',
      categoria: 'Componentes',
      score_saude: 45,
      on_time: 65,
      qualidade: 52,
      estabilidade_financeira: 'vermelho',
      risco_nivel: 'crítico',
      ultimas_issues: 7
    },
    {
      id: 'FOR-004',
      nome: 'Serviços Industriais Premium',
      categoria: 'Serviços',
      score_saude: 91,
      on_time: 98,
      qualidade: 99,
      estabilidade_financeira: 'verde',
      risco_nivel: 'baixo',
      ultimas_issues: 0
    }
  ]);

  const getHealthColor = (score) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-300';
    if (score >= 60) return 'bg-yellow-50 border-yellow-300';
    return 'bg-red-50 border-red-300';
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {fornecedores.map((f) => (
        <Card key={f.id} className={`border-2 ${getHealthColor(f.score_saude)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{f.nome}</CardTitle>
                <p className="text-xs text-slate-600 mt-1">
                  {f.categoria} • Risco: <span className="font-semibold">{f.risco_nivel.toUpperCase()}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-slate-900">{f.score_saude}</p>
                <p className="text-xs text-slate-600">Saúde Geral</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Métricas */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white/50 p-2 rounded text-center">
                <p className="text-slate-600 mb-1">On-Time</p>
                <p className="text-lg font-bold text-slate-900">{f.on_time}%</p>
              </div>
              <div className="bg-white/50 p-2 rounded text-center">
                <p className="text-slate-600 mb-1">Qualidade</p>
                <p className="text-lg font-bold text-slate-900">{f.qualidade}%</p>
              </div>
              <div className="bg-white/50 p-2 rounded text-center">
                <p className="text-slate-600 mb-1">Issues (30d)</p>
                <p className="text-lg font-bold text-slate-900">{f.ultimas_issues}</p>
              </div>
            </div>

            {/* Estabilidade Financeira */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-600">Estabilidade Financeira:</span>
              <Badge className={`text-xs ${
                f.estabilidade_financeira === 'verde' ? 'bg-emerald-600' :
                f.estabilidade_financeira === 'amarelo' ? 'bg-yellow-600' :
                'bg-red-600'
              }`}>
                {f.estabilidade_financeira.toUpperCase()}
              </Badge>
            </div>

            {/* Score Total */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">Score de Saúde</span>
                <span className="text-xs font-semibold">{f.score_saude}%</span>
              </div>
              <Progress value={f.score_saude} className="h-2" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}