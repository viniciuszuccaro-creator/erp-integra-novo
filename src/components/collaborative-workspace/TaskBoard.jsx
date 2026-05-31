import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, Clock, User, Flag, MessageSquare } from 'lucide-react';

export default function TaskBoard() {
  const [view, setView] = useState('minhas');

  const tarefas = [
    {
      id: 'T001', titulo: 'Revisar Plano Q3', status: 'Em Progresso', prioridade: 'Alta',
      atribuido_a: 'Você', criador: 'Ana Costa', prazo: '02/06', progresso: 65,
      subtarefas_total: 5, subtarefas_concluidas: 3, comentarios: 2, empresa: 'Zuccaro SP'
    },
    {
      id: 'T002', titulo: 'Preparar relatório de Estoque', status: 'Pendente', prioridade: 'Média',
      atribuido_a: 'Você', criador: 'Carlos M.', prazo: '05/06', progresso: 0,
      subtarefas_total: 3, subtarefas_concluidas: 0, comentarios: 1, empresa: 'Zuccaro SP'
    },
    {
      id: 'T003', titulo: 'Aprovar inversões Q3', status: 'Concluído', prioridade: 'Alta',
      atribuido_a: 'João Silva', criador: 'Você', prazo: '31/05', progresso: 100,
      subtarefas_total: 4, subtarefas_concluidas: 4, comentarios: 5, empresa: 'Zuccaro RJ'
    },
    {
      id: 'T004', titulo: 'Sincronizar base de produtos', status: 'Em Progresso', prioridade: 'Crítica',
      atribuido_a: 'Carlos M.', criador: 'TI', prazo: '02/06', progresso: 45,
      subtarefas_total: 8, subtarefas_concluidas: 3, comentarios: 7, empresa: 'Zuccaro Grupo'
    },
  ];

  const statusIcon = (s) => {
    if (s === 'Concluído') return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    if (s === 'Em Progresso') return <Clock className="w-4 h-4 text-blue-400" />;
    return <Circle className="w-4 h-4 text-slate-400" />;
  };

  const statusColor = (s) => {
    if (s === 'Concluído') return 'bg-emerald-900 text-emerald-200';
    if (s === 'Em Progresso') return 'bg-blue-900 text-blue-200';
    return 'bg-slate-700 text-slate-300';
  };

  const prioridadeColor = (p) => {
    if (p === 'Crítica') return 'bg-red-900 text-red-200';
    if (p === 'Alta') return 'bg-orange-900 text-orange-200';
    if (p === 'Média') return 'bg-yellow-900 text-yellow-200';
    return 'bg-slate-700 text-slate-300';
  };

  const filtradas = tarefas.filter(t => {
    if (view === 'minhas') return t.atribuido_a === 'Você';
    if (view === 'delegadas') return t.criador === 'Você';
    if (view === 'concluidas') return t.status === 'Concluído';
    return true;
  });

  const totalPorStatus = {
    pendente: tarefas.filter(t => t.status === 'Pendente').length,
    progresso: tarefas.filter(t => t.status === 'Em Progresso').length,
    concluida: tarefas.filter(t => t.status === 'Concluído').length,
  };

  return (
    <div className="w-full h-full overflow-auto space-y-3 p-1">
      {/* KPIs */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Pendente</p>
            <p className="text-2xl font-bold text-yellow-400">{totalPorStatus.pendente}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Em Progresso</p>
            <p className="text-2xl font-bold text-blue-400">{totalPorStatus.progresso}</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-3">
            <p className="text-xs text-slate-400">Concluída</p>
            <p className="text-2xl font-bold text-emerald-400">{totalPorStatus.concluida}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {['minhas', 'delegadas', 'concluidas', 'todas'].map(v => (
          <button key={v} onClick={() => setView(v)}
            className={`px-3 py-2 text-sm rounded-lg font-semibold ${view === v ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {v === 'minhas' ? 'Minhas' : v === 'delegadas' ? 'Delegadas' : v === 'concluidas' ? 'Concluídas' : 'Todas'}
          </button>
        ))}
      </div>

      {/* Lista de Tarefas */}
      <div className="space-y-2">
        {filtradas.map((t) => (
          <Card key={t.id} className="bg-slate-800 border-slate-700 hover:border-blue-600 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <button className="mt-1">{statusIcon(t.status)}</button>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold ${t.status === 'Concluído' ? 'line-through text-slate-400' : 'text-white'}`}>
                    {t.titulo}
                  </p>
                  <p className="text-xs text-slate-400">{t.empresa} • {t.criador}</p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Badge className={prioridadeColor(t.prioridade)}>
                    <Flag className="w-3 h-3 mr-1" />
                    {t.prioridade}
                  </Badge>
                  <Badge className={statusColor(t.status)}>{t.status}</Badge>
                </div>
              </div>

              {/* Progresso */}
              <div className="mb-3">
                <div className="flex justify-between mb-1 text-xs">
                  <span className="text-slate-400">Progresso</span>
                  <span className="text-slate-300">{t.progresso}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="h-2 rounded-full bg-blue-500" style={{ width: `${t.progresso}%` }} />
                </div>
              </div>

              {/* Subtarefas e Comentários */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t.subtarefas_concluidas}/{t.subtarefas_total}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-3 h-3" />
                  <span>{t.atribuido_a}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <MessageSquare className="w-3 h-3" />
                  <span>{t.comentarios}</span>
                </div>
              </div>

              {/* Prazo */}
              <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-slate-500">Prazo: {t.prazo}</span>
                <button className="px-2 py-1 rounded text-slate-300 hover:bg-slate-700 text-xs">Detalhes</button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}