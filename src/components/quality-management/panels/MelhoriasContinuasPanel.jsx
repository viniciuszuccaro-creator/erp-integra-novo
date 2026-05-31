import React, { useState } from 'react';
import { TrendingUp, Target, Zap, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function MelhoriasContinuasPanel() {
  const [melhorias] = useState([
    {
      id: 'IMPL-001',
      titulo: 'Automatizar Inspeção de Corte',
      objetivo: 'Reduzir rejeições de 2% para 0.5%',
      status: 'em_progresso',
      impacto_estimado: '8,500/mês',
      progresso: 75,
      prazo: '2026-06-15',
      proprietario: 'João Silva'
    },
    {
      id: 'IMPL-002',
      titulo: 'Otimizar Ciclo de Armação',
      objetivo: 'Aumentar capacidade em 15%',
      status: 'planejamento',
      impacto_estimado: '12,000/mês',
      progresso: 30,
      prazo: '2026-07-30',
      proprietario: 'Maria Santos'
    },
    {
      id: 'IMPL-003',
      titulo: 'Implementar Sistema RFID',
      objetivo: 'Rastreabilidade 100% de produtos',
      status: 'em_progresso',
      impacto_estimado: '5,000/mês',
      progresso: 60,
      prazo: '2026-06-30',
      proprietario: 'Carlos Mendes'
    },
    {
      id: 'IMPL-004',
      titulo: 'Treinamento 5S Avançado',
      objetivo: 'Melhorar organização do chão de fábrica',
      status: 'concluido',
      impacto_estimado: '3,000/mês',
      progresso: 100,
      prazo: '2026-05-15',
      proprietario: 'Ana Costa'
    }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'concluido':
        return { bg: 'bg-emerald-50', border: 'border-emerald-300', badge: 'bg-emerald-600' };
      case 'em_progresso':
        return { bg: 'bg-blue-50', border: 'border-blue-300', badge: 'bg-blue-600' };
      case 'planejamento':
        return { bg: 'bg-purple-50', border: 'border-purple-300', badge: 'bg-purple-600' };
      default:
        return { bg: 'bg-slate-50', border: 'border-slate-300', badge: 'bg-slate-600' };
    }
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {melhorias.map((mel) => {
        const colors = getStatusColor(mel.status);
        return (
          <Card key={mel.id} className={`border-2 ${colors.bg} ${colors.border}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-base">{mel.id} - {mel.titulo}</CardTitle>
                    <Badge className={`text-xs ${colors.badge}`}>
                      {mel.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-700">{mel.objetivo}</p>
                </div>
                <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Progresso */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-slate-600">Progresso</span>
                  <span className="text-xs font-semibold">{mel.progresso}%</span>
                </div>
                <Progress value={mel.progresso} className="h-2" />
              </div>

              {/* Detalhes */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="bg-white/50 p-2 rounded">
                  <p className="text-slate-600 mb-1">Impacto Estimado</p>
                  <p className="font-semibold text-slate-900">R${mel.impacto_estimado}</p>
                </div>
                <div className="bg-white/50 p-2 rounded">
                  <p className="text-slate-600 mb-1">Prazo</p>
                  <p className="font-semibold text-slate-900">{mel.prazo}</p>
                </div>
                <div className="bg-white/50 p-2 rounded">
                  <p className="text-slate-600 mb-1">Proprietário</p>
                  <p className="font-semibold text-slate-900 truncate">{mel.proprietario}</p>
                </div>
              </div>

              <Button variant="outline" size="sm" className="w-full">
                <Target className="w-3 h-3 mr-1" />
                Gerenciar Melhoria
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}