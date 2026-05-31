import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { User, Clock, TrendingUp, AlertCircle } from 'lucide-react';

export default function ResourceAllocationDashboard() {
  const [collaborators, setCollaborators] = useState([
    { id: '1', name: 'João Silva', cargo: 'Programador Senior', status: 'alocado', utilizacao: 95, custo_hora: 150, empresa: 'SP' },
    { id: '2', name: 'Maria Santos', cargo: 'Designer', status: 'disponivel', utilizacao: 0, custo_hora: 120, empresa: 'SP' },
    { id: '3', name: 'Pedro Costa', cargo: 'Gerente Projeto', status: 'em_projeto', utilizacao: 100, custo_hora: 200, empresa: 'MG' },
    { id: '4', name: 'Ana Paula', cargo: 'Analista QA', status: 'alocado', utilizacao: 87, custo_hora: 110, empresa: 'SP' },
    { id: '5', name: 'Carlos Mendes', cargo: 'Dev Junior', status: 'disponivel', utilizacao: 30, custo_hora: 80, empresa: 'MG' },
  ]);

  const handleDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    
    const newStatus = destination.droppableId;
    setCollaborators(prev => prev.map(c => c.id === draggableId ? { ...c, status: newStatus } : c));
  };

  const statusConfig = {
    disponivel: { bg: 'bg-blue-500/20', border: 'border-blue-500/50', text: 'text-blue-400', label: 'Disponível' },
    alocado: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/50', text: 'text-emerald-400', label: 'Alocado' },
    em_projeto: { bg: 'bg-amber-500/20', border: 'border-amber-500/50', text: 'text-amber-400', label: 'Em Projeto' },
  };

  const groups = {
    disponivel: collaborators.filter(c => c.status === 'disponivel'),
    alocado: collaborators.filter(c => c.status === 'alocado'),
    em_projeto: collaborators.filter(c => c.status === 'em_projeto'),
  };

  const utilizacaoData = collaborators.map(c => ({ name: c.name, utilizacao: c.utilizacao }));
  const statusData = [
    { name: 'Disponível', value: groups.disponivel.length },
    { name: 'Alocado', value: groups.alocado.length },
    { name: 'Em Projeto', value: groups.em_projeto.length },
  ];
  const colors = ['#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      {/* KPIs */}
      <div className="flex-shrink-0 grid grid-cols-4 gap-3 px-6 py-4 bg-white/5 border-b border-white/10">
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Utilização Média</div>
          <div className="text-2xl font-bold text-emerald-400 mt-1">87.3%</div>
          <Badge className="mt-2 bg-emerald-500/20 text-emerald-400 border-0">↑ 5.2%</Badge>
        </Card>
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Custo/Hora Médio</div>
          <div className="text-2xl font-bold text-blue-400 mt-1">R$ 132</div>
          <Badge className="mt-2 bg-blue-500/20 text-blue-400 border-0">5 colaboradores</Badge>
        </Card>
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Taxa Realoque</div>
          <div className="text-2xl font-bold text-amber-400 mt-1">60%</div>
          <Badge className="mt-2 bg-amber-500/20 text-amber-400 border-0">3 realocações</Badge>
        </Card>
        <Card className="bg-white/10 border-white/20 p-4">
          <div className="text-sm text-slate-400">Pessoal Disponível</div>
          <div className="text-2xl font-bold text-cyan-400 mt-1">2</div>
          <Badge className="mt-2 bg-cyan-500/20 text-cyan-400 border-0">Pronto para alocar</Badge>
        </Card>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* Gráficos */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="bg-white/10 border-white/20 p-4">
            <h3 className="text-sm font-semibold text-white mb-4">Utilização por Colaborador</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={utilizacaoData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }} />
                <Bar dataKey="utilizacao" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="bg-white/10 border-white/20 p-4">
            <h3 className="text-sm font-semibold text-white mb-4">Distribuição de Status</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={80} fill="#8884d8" dataKey="value">
                  {colors.map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #ffffff20', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Kanban */}
        <Card className="bg-white/10 border-white/20 p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Alocação em Tempo Real (Drag & Drop)</h3>
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-3 gap-4">
              {['disponivel', 'alocado', 'em_projeto'].map(status => (
                <Droppable droppableId={status} key={status}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`p-3 rounded-lg border-2 min-h-96 ${statusConfig[status].bg} ${statusConfig[status].border} transition-all ${
                        snapshot.isDraggingOver ? 'opacity-100' : 'opacity-75'
                      }`}
                    >
                      <h4 className={`text-sm font-semibold ${statusConfig[status].text} mb-3`}>{statusConfig[status].label}</h4>
                      <div className="space-y-2">
                        {groups[status].map((collab, idx) => (
                          <Draggable key={collab.id} draggableId={collab.id} index={idx}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`bg-white/10 border border-white/20 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all ${
                                  snapshot.isDragging ? 'shadow-lg opacity-100' : ''
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <User className="w-4 h-4 text-slate-400" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">{collab.name}</p>
                                    <p className="text-xs text-slate-400 truncate">{collab.cargo}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge className="bg-blue-500/20 text-blue-400 text-xs border-0">{collab.empresa}</Badge>
                                  <div className="flex items-center gap-1 ml-auto">
                                    <TrendingUp className="w-3 h-3 text-emerald-400" />
                                    <span className="text-xs text-slate-300">{collab.utilizacao}%</span>
                                  </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">R$ {collab.custo_hora}/h</p>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      </div>
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        </Card>

        {/* Alertas */}
        <Card className="bg-amber-500/10 border-amber-500/30 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-400">Alerta: Falta de Pessoal</h4>
              <p className="text-xs text-slate-400 mt-1">Operação de SP está com 40% de falta de pessoal. IA recomenda realoque de Carlos Mendes (MG) ou contratação urgente.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}