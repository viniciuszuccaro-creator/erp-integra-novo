import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Users, MessageSquare, CheckCircle2, Flag, Clock, AlertCircle } from 'lucide-react';

export default function ActivityFeed() {
  const [filter, setFilter] = useState('todos');

  const atividades = [
    {
      id: 'A001', tipo: 'comentario', usuario: 'Ana Costa', empresa: 'Zuccaro SP',
      descricao: 'comentou em "Plano Comercial Q3 2026"', detalhe: 'Precisamos revisar as projeções de vendas',
      icone: MessageSquare, timestamp: 'Agora', cor: 'text-blue-400'
    },
    {
      id: 'A002', tipo: 'tarefa', usuario: 'Você', empresa: 'Zuccaro SP',
      descricao: 'criou tarefa "Preparar relatório de Estoque"', detalhe: null,
      icone: Flag, timestamp: '15 min', cor: 'text-yellow-400'
    },
    {
      id: 'A003', tipo: 'conclusao', usuario: 'João Silva', empresa: 'Zuccaro RJ',
      descricao: 'concluiu tarefa "Aprovar inversões Q3"', detalhe: null,
      icone: CheckCircle2, timestamp: '1h', cor: 'text-emerald-400'
    },
    {
      id: 'A004', tipo: 'documento', usuario: 'Carlos M.', empresa: 'Zuccaro SP',
      descricao: 'atualizou documento "Manual de Qualidade v4.2"', detalhe: null,
      icone: FileText, timestamp: '2h', cor: 'text-purple-400'
    },
    {
      id: 'A005', tipo: 'compartilhamento', usuario: 'Você', empresa: 'Zuccaro Grupo',
      descricao: 'compartilhou documento com 3 usuários', detalhe: '"Apresentação Resultados Maio"',
      icone: Users, timestamp: '3h', cor: 'text-cyan-400'
    },
    {
      id: 'A006', tipo: 'alerta', usuario: 'Sistema', empresa: 'Zuccaro SP',
      descricao: 'tarefa "Revisar Plano Q3" vencerá amanhã', detalhe: 'Prazo: 02/06',
      icone: AlertCircle, timestamp: '4h', cor: 'text-red-400'
    },
  ];

  const IconComponent = ({ tipo }) => {
    const atividade = atividades.find(a => a.tipo === tipo);
    if (!atividade) return null;
    const Icon = atividade.icone;
    return <Icon className={`w-4 h-4 ${atividade.cor}`} />;
  };

  const filtradas = atividades.filter(a => {
    if (filter === 'minhas') return a.usuario === 'Você' || a.usuario === 'Sistema';
    if (filter === 'tarefas') return ['tarefa', 'conclusao'].includes(a.tipo);
    if (filter === 'documentos') return a.tipo === 'documento' || a.tipo === 'compartilhamento';
    return true;
  });

  return (
    <div className="w-full h-full overflow-auto space-y-3 p-1">
      {/* Filtros */}
      <div className="flex gap-2 sticky top-0 bg-slate-900 pt-1 pb-2 z-10">
        {['todos', 'minhas', 'tarefas', 'documentos'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-2 text-sm rounded-lg font-semibold whitespace-nowrap ${filter === f ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}>
            {f === 'todos' ? 'Tudo' : f === 'minhas' ? 'Minhas Ações' : f === 'tarefas' ? 'Tarefas' : 'Documentos'}
          </button>
        ))}
      </div>

      {/* Timeline de Atividades */}
      <div className="space-y-3">
        {filtradas.map((ativ) => {
          const Icon = ativ.icone;
          return (
            <Card key={ativ.id} className="bg-slate-800 border-slate-700 hover:border-slate-600 transition-colors">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {/* Ícone */}
                  <div className="pt-1 shrink-0">
                    <div className="p-2 rounded-lg bg-slate-700/50">
                      <Icon className={`w-4 h-4 ${ativ.cor}`} />
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-white text-sm">{ativ.usuario}</p>
                      <span className="text-xs text-slate-500">•</span>
                      <p className="text-xs text-slate-400">{ativ.empresa}</p>
                    </div>
                    <p className="text-sm text-slate-300 mb-1">{ativ.descricao}</p>
                    {ativ.detalhe && (
                      <p className="text-xs text-slate-500 italic">"{ativ.detalhe}"</p>
                    )}
                    <p className="text-xs text-slate-500 mt-2">{ativ.timestamp}</p>
                  </div>

                  {/* Menu */}
                  <button className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white text-xs shrink-0">⋯</button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}