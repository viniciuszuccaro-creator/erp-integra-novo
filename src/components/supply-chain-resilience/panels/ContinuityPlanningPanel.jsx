import React, { useState } from 'react';
import { Shield, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export default function ContinuityPlanningPanel() {
  const [planos] = useState([
    {
      id: 'BCP-001',
      nome: 'Plano de Contingência - Fornecedor Crítico Indisponível',
      escopo: 'Matérias-primas estratégicas',
      status: 'ativo',
      data_criacao: '2026-04-15',
      ultima_atualizacao: '2026-05-20',
      teste_ultimo: '2026-04-28',
      rto_horas: 4,
      rpo_horas: 2,
      cobertura: 95,
      responsavel: 'João Silva'
    },
    {
      id: 'BCP-002',
      nome: 'Plano de Logística Alternativa',
      escopo: 'Transporte e distribuição',
      status: 'ativo',
      data_criacao: '2026-03-10',
      ultima_atualizacao: '2026-05-15',
      teste_ultimo: '2026-05-10',
      rto_horas: 8,
      rpo_horas: 6,
      cobertura: 88,
      responsavel: 'Maria Santos'
    },
    {
      id: 'BCP-003',
      nome: 'Plano de Contingência - Produção',
      escopo: 'Operações de produção',
      status: 'em_revisao',
      data_criacao: '2026-05-01',
      ultima_atualizacao: '2026-05-25',
      teste_ultimo: null,
      rto_horas: 2,
      rpo_horas: 1,
      cobertura: 75,
      responsavel: 'Carlos Mendes'
    }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'ativo':
        return 'bg-emerald-50 border-emerald-300';
      case 'em_revisao':
        return 'bg-yellow-50 border-yellow-300';
      default:
        return 'bg-slate-50 border-slate-300';
    }
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {planos.map((plano) => (
        <Card key={plano.id} className={`border-2 ${getStatusColor(plano.status)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{plano.nome}</CardTitle>
                <p className="text-xs text-slate-600 mt-1">
                  Escopo: {plano.escopo}
                </p>
              </div>
              <Badge className={`text-xs ${
                plano.status === 'ativo' ? 'bg-emerald-600' : 'bg-yellow-600'
              }`}>
                {plano.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Objetivos RTO/RPO */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/50 p-2 rounded">
                <p className="text-slate-600 mb-1">RTO (Tempo Recuperação)</p>
                <p className="text-lg font-bold text-slate-900">{plano.rto_horas}h</p>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <p className="text-slate-600 mb-1">RPO (Ponto Recuperação)</p>
                <p className="text-lg font-bold text-slate-900">{plano.rpo_horas}h</p>
              </div>
            </div>

            {/* Cobertura */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">Cobertura do Plano</span>
                <span className="text-xs font-semibold">{plano.cobertura}%</span>
              </div>
              <Progress value={plano.cobertura} className="h-2" />
            </div>

            {/* Datas */}
            <div className="grid grid-cols-2 gap-2 text-xs bg-white/50 p-2 rounded">
              <div>
                <p className="text-slate-600">Última Atualização</p>
                <p className="text-sm font-semibold text-slate-900">{plano.ultima_atualizacao}</p>
              </div>
              <div>
                <p className="text-slate-600">Último Teste</p>
                <p className="text-sm font-semibold text-slate-900">
                  {plano.teste_ultimo ? plano.teste_ultimo : 'Não testado'}
                </p>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              <Shield className="w-3 h-3 mr-1" />
              Visualizar Detalhes do Plano
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}