import React, { useState } from 'react';
import { Zap, AlertTriangle, Clock, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function ContingencyScenarioPanel() {
  const [cenarios] = useState([
    {
      id: 'SCEN-001',
      nome: 'Indisponibilidade Total de Fornecedor Crítico',
      probabilidade: 'baixa',
      impacto_producao: 45,
      atraso_estimado_dias: 8,
      custo_mitigacao: 120000,
      tempo_ativacao_horas: 4,
      plano_acao: 'Ativar fornecedor alternativo pré-qualificado em Minas Gerais'
    },
    {
      id: 'SCEN-002',
      nome: 'Falha de Transporte Logístico',
      probabilidade: 'média',
      impacto_producao: 25,
      atraso_estimado_dias: 3,
      custo_mitigacao: 45000,
      tempo_ativacao_horas: 2,
      plano_acao: 'Utilizar rotas alternativas por modal diferente (aéreo/multimodal)'
    },
    {
      id: 'SCEN-003',
      nome: 'Crise Econômica / Instabilidade Política',
      probabilidade: 'média',
      impacto_producao: 60,
      atraso_estimado_dias: 15,
      custo_mitigacao: 280000,
      tempo_ativacao_horas: 12,
      plano_acao: 'Diversificar fornecedores geograficamente; aumentar estoques'
    },
    {
      id: 'SCEN-004',
      nome: 'Desastres Naturais / Força Maior',
      probabilidade: 'baixa',
      impacto_producao: 80,
      atraso_estimado_dias: 21,
      custo_mitigacao: 350000,
      tempo_ativacao_horas: 24,
      plano_acao: 'Ativar centros de distribuição regionais; renegociar prazos'
    }
  ]);

  const getProbabilidadeColor = (prob) => {
    switch(prob) {
      case 'alta':
        return 'bg-red-50 border-red-300';
      case 'média':
        return 'bg-yellow-50 border-yellow-300';
      case 'baixa':
        return 'bg-blue-50 border-blue-300';
      default:
        return 'bg-slate-50 border-slate-300';
    }
  };

  const getProbabilidadeBadge = (prob) => {
    switch(prob) {
      case 'alta':
        return 'bg-red-600';
      case 'média':
        return 'bg-yellow-600';
      case 'baixa':
        return 'bg-blue-600';
    }
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {cenarios.map((cenario) => (
        <Card key={cenario.id} className={`border-2 ${getProbabilidadeColor(cenario.probabilidade)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base">{cenario.nome}</CardTitle>
                  <Badge className={`text-xs ${getProbabilidadeBadge(cenario.probabilidade)}`}>
                    {cenario.probabilidade.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <Zap className="w-5 h-5 text-blue-600 flex-shrink-0" />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Impactos */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/50 p-2 rounded">
                <p className="text-slate-600 mb-1">Impacto Produção</p>
                <p className="text-lg font-bold text-red-700">{cenario.impacto_producao}%</p>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <p className="text-slate-600 mb-1">Atraso Estimado</p>
                <p className="text-lg font-bold text-orange-700">{cenario.atraso_estimado_dias}d</p>
              </div>
            </div>

            {/* Plano de Ação */}
            <div className="bg-white/50 p-3 rounded border-l-2 border-emerald-600">
              <p className="text-xs text-slate-600 font-semibold mb-1">Plano de Ação</p>
              <p className="text-sm text-slate-900">{cenario.plano_acao}</p>
            </div>

            {/* Custos e Tempo */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-white/50 p-2 rounded">
                <p className="text-slate-600 mb-1">Custo Mitigação</p>
                <p className="font-bold text-slate-900">R${(cenario.custo_mitigacao / 1000).toFixed(0)}k</p>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <p className="text-slate-600 mb-1">Tempo Ativação</p>
                <p className="font-bold text-slate-900">{cenario.tempo_ativacao_horas}h</p>
              </div>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              Simular Cenário
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}