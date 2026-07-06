import React, { useState } from 'react';
import { AlertTriangle, Clock, User, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function NaoConformidadePanel() {
  const [ncrs] = useState([
    {
      id: 'NCR-001',
      descricao: 'Dimensão fora de especificação',
      severidade: 'crítica',
      data_abertura: '2026-05-28',
      responsavel: 'João Silva',
      progresso: 65,
      acao_corretiva: 'Ajuste de máquina programado'
    },
    {
      id: 'NCR-002',
      descricao: 'Acabamento de superfície inadequado',
      severidade: 'alta',
      data_abertura: '2026-05-29',
      responsavel: 'Maria Santos',
      progresso: 40,
      acao_corretiva: 'Revisão do processo de pintura'
    },
    {
      id: 'NCR-003',
      descricao: 'Documentação incompleta',
      severidade: 'média',
      data_abertura: '2026-05-30',
      responsavel: 'Carlos Mendes',
      progresso: 20,
      acao_corretiva: 'Treinamento de registros'
    },
    {
      id: 'NCR-004',
      descricao: 'Embalagem danificada',
      severidade: 'baixa',
      data_abertura: '2026-05-31',
      responsavel: 'Ana Costa',
      progresso: 80,
      acao_corretiva: 'Substituição de materiais'
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
      case 'baixa':
        return 'bg-blue-50 border-blue-300';
      default:
        return 'bg-slate-50 border-slate-300';
    }
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {ncrs.map((ncr) => (
        <Card key={ncr.id} className={`border-2 ${getSeveridadeColor(ncr.severidade)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-base">{ncr.id}</CardTitle>
                  <Badge className={`text-xs ${
                    ncr.severidade === 'crítica' ? 'bg-red-600' :
                    ncr.severidade === 'alta' ? 'bg-orange-600' :
                    ncr.severidade === 'média' ? 'bg-yellow-600' :
                    'bg-blue-600'
                  }`}>
                    {ncr.severidade.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-sm text-slate-900">{ncr.descricao}</p>
              </div>
              <AlertTriangle className="w-5 h-5 flex-shrink-0" style={{
                color: ncr.severidade === 'crítica' ? '#dc2626' :
                       ncr.severidade === 'alta' ? '#ea580c' :
                       ncr.severidade === 'média' ? '#eab308' :
                       '#0ea5e9'
              }} />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/50 p-2 rounded">
                <p className="text-slate-600 mb-1">Data Abertura</p>
                <p className="font-semibold text-slate-900">{ncr.data_abertura}</p>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <p className="text-slate-600 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Responsável
                </p>
                <p className="font-semibold text-slate-900">{ncr.responsavel}</p>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">Ação Corretiva: {ncr.acao_corretiva}</span>
                <span className="text-xs font-semibold">{ncr.progresso}%</span>
              </div>
              <Progress value={ncr.progresso} className="h-2" />
            </div>

            <Button data-permission="Sistema.NaoConformidade.atualizar" variant="outline" size="sm" className="w-full">
              <Zap className="w-3 h-3 mr-1" />
              Atualizar Progresso
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}