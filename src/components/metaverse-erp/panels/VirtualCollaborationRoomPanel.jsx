import React, { useState } from 'react';
import { Users, Video, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function VirtualCollaborationRoomPanel() {
  const [salas] = useState([
    {
      id: 'VR-001',
      nome: 'War Room — Vendas Q2',
      tipo: 'estrategia',
      participantes: 8,
      max_participantes: 15,
      status: 'ativa',
      tema: 'Revisão de Pipeline e Metas',
      tecnologia: 'WebXR + Spatial Audio',
      duracao_min: 47,
      documentos_compartilhados: 3,
      cor: 'blue'
    },
    {
      id: 'VR-002',
      nome: 'Design Sprint — Produto v3',
      tipo: 'criativo',
      participantes: 5,
      max_participantes: 10,
      status: 'ativa',
      tema: 'Prototipagem 3D em tempo real',
      tecnologia: 'AR Collaborative + Whiteboard 3D',
      duracao_min: 23,
      documentos_compartilhados: 7,
      cor: 'purple'
    },
    {
      id: 'VR-003',
      nome: 'Briefing Executivo — Board',
      tipo: 'executivo',
      participantes: 0,
      max_participantes: 8,
      status: 'agendada',
      tema: 'Resultados mensais e projeções',
      tecnologia: 'Holographic Presentation',
      duracao_min: 0,
      documentos_compartilhados: 5,
      cor: 'violet'
    },
    {
      id: 'VR-004',
      nome: 'Treinamento — Novos Colaboradores',
      tipo: 'treinamento',
      participantes: 12,
      max_participantes: 20,
      status: 'ativa',
      tema: 'Onboarding imersivo ERP',
      tecnologia: 'VR Training Module',
      duracao_min: 89,
      documentos_compartilhados: 9,
      cor: 'emerald'
    },
  ]);

  const getStatusBadge = (status) => {
    if (status === 'ativa') return 'bg-emerald-600';
    if (status === 'agendada') return 'bg-blue-600';
    return 'bg-slate-500';
  };

  return (
    <div className="w-full h-full space-y-4">
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Video className="w-5 h-5 text-indigo-600" />
          <div>
            <h3 className="font-semibold text-slate-900">Salas de Colaboração Virtual Ativas</h3>
            <p className="text-sm text-slate-600">XR + Spatial Audio + Holographic Sharing</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Badge className="bg-emerald-600">3 ativas</Badge>
            <Badge className="bg-blue-600">25 usuários</Badge>
          </div>
        </div>
      </div>

      {salas.map((sala) => (
        <Card key={sala.id} className="border-slate-200 hover:border-indigo-400 transition-all">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">{sala.nome}</CardTitle>
                <p className="text-xs text-slate-600 mt-1">{sala.tema}</p>
              </div>
              <Badge className={getStatusBadge(sala.status)}>{sala.status.toUpperCase()}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {/* Participantes */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-500" />
                <span>{sala.participantes}/{sala.max_participantes} participantes</span>
              </div>
              {sala.status === 'ativa' && (
                <span className="text-emerald-600 font-semibold">{sala.duracao_min}min em andamento</span>
              )}
            </div>

            {/* Barra de participação */}
            <div className="w-full bg-slate-100 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{ width: `${(sala.participantes / sala.max_participantes) * 100}%` }}
              />
            </div>

            {/* Tecnologia */}
            <div className="bg-indigo-50 p-2 rounded border-l-2 border-indigo-600">
              <p className="text-xs text-slate-600">Tecnologia</p>
              <p className="text-sm font-semibold text-indigo-900">{sala.tecnologia}</p>
            </div>

            {/* Docs + Ação */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-slate-600">
                <Share2 className="w-3 h-3" />
                <span>{sala.documentos_compartilhados} docs compartilhados</span>
              </div>
              <Button size="sm" variant={sala.status === 'ativa' ? 'default' : 'outline'} className="text-xs">
                {sala.status === 'ativa' ? 'Entrar na Sala' : 'Agendar'}
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}