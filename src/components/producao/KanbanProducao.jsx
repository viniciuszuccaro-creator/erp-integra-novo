import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  Clock, 
  User, 
  Package,
  AlertCircle,
  CheckCircle,
  Eye
} from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

/**
 * Kanban de Produção
 * Visualização e movimentação de OPs por status
 */
export default function KanbanProducao({ onViewOP }) {
  const queryClient = useQueryClient();
  const { filterInContext, grupoAtual, empresaAtual } = useContextoVisual();
  const contextoKey = `${grupoAtual?.id || 'sem-grupo'}-${empresaAtual?.id || 'sem-empresa'}`;

  const { data: ops = [] } = useQuery({
    queryKey: ['ops-kanban', contextoKey],
    queryFn: () => filterInContext('OrdemProducao', {}, '-data_emissao'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ opId, novoStatus }) => 
      base44.entities.OrdemProducao.update(opId, { 
        status: novoStatus,
        historico_status: [
          {
            status_anterior: ops.find(op => op.id === opId)?.status,
            status_novo: novoStatus,
            data_hora: new Date().toISOString(),
            usuario: 'Sistema - Kanban'
          }
        ]
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ops-kanban'] });
    }
  });

  const colunas = [
    {
      id: 'aguardando_material',
      titulo: 'Aguardando Material',
      status: ['Aguardando Matéria-Prima'],
      cor: 'border-yellow-300 bg-yellow-50'
    },
    {
      id: 'em_producao',
      titulo: 'Em Produção',
      status: ['Em Corte', 'Em Dobra', 'Em Armação'],
      cor: 'border-blue-300 bg-blue-50'
    },
    {
      id: 'inspecao',
      titulo: 'Inspeção',
      status: ['Em Conferência'],
      cor: 'border-purple-300 bg-purple-50'
    },
    {
      id: 'pronto',
      titulo: 'Pronto p/ Expedir',
      status: ['Pronta para Expedição'],
      cor: 'border-green-300 bg-green-50'
    }
  ];

  const getOpsPorColuna = (statusArray) => {
    return ops.filter(op => statusArray.includes(op.status));
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceColuna = colunas.find(c => c.id === result.source.droppableId);
    const destColuna = colunas.find(c => c.id === result.destination.droppableId);

    if (sourceColuna.id === destColuna.id) return;

    const opId = result.draggableId;
    const novoStatus = destColuna.status[0]; // Pega o primeiro status da coluna destino

    updateStatusMutation.mutate({ opId, novoStatus });
  };

  return (
    <div className="p-6">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-4 gap-4">
          {colunas.map((coluna) => {
            const opsColuna = getOpsPorColuna(coluna.status);

            return (
              <div key={coluna.id}>
                <Card className={`border-2 ${coluna.cor}`}>
                  <CardHeader className="pb-3 bg-white/80">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span>{coluna.titulo}</span>
                      <Badge variant="outline" className="ml-2">
                        {opsColuna.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  
                  <Droppable droppableId={coluna.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[600px] p-3 space-y-2 ${
                          snapshot.isDraggingOver ? 'bg-blue-50' : ''
                        }`}
                      >
                        {opsColuna.map((op, index) => (
                          <Draggable
                            key={op.id}
                            draggableId={op.id}
                            index={index}
                          >
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`${snapshot.isDragging ? 'opacity-50' : ''}`}
                              >
                                <Card className="bg-white hover:shadow-md transition-shadow cursor-move">
                                  <CardContent className="p-3">
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1">
                                        <p className="font-semibold text-sm">
                                          {op.numero_op}
                                        </p>
                                        <p className="text-xs text-slate-600">
                                          {op.cliente_nome}
                                        </p>
                                      </div>
                                      <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          onViewOP?.(op);
                                        }}
                                        className="h-6 w-6"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </Button>
                                    </div>

                                    <div className="space-y-1">
                                      {op.prioridade === 'Urgente' && (
                                        <Badge className="bg-red-600 text-xs">
                                          Urgente
                                        </Badge>
                                      )}
                                      
                                      <div className="flex items-center gap-1 text-xs text-slate-600">
                                        <User className="w-3 h-3" />
                                        <span>{op.operador_responsavel || 'Sem operador'}</span>
                                      </div>

                                      <div className="flex items-center gap-1 text-xs text-slate-600">
                                        <Package className="w-3 h-3" />
                                        <span>{op.itens_producao?.length || 0} itens</span>
                                      </div>

                                      {op.data_prevista_conclusao && (
                                        <div className="flex items-center gap-1 text-xs text-slate-600">
                                          <Clock className="w-3 h-3" />
                                          <span>
                                            {new Date(op.data_prevista_conclusao).toLocaleDateString('pt-BR')}
                                          </span>
                                        </div>
                                      )}

                                      {op.alerta_falta_estoque && (
                                        <div className="flex items-center gap-1 text-xs text-red-600">
                                          <AlertCircle className="w-3 h-3" />
                                          <span>Falta material</span>
                                        </div>
                                      )}

                                      {op.percentual_conclusao > 0 && (
                                        <div className="mt-2">
                                          <div className="flex justify-between text-xs mb-1">
                                            <span className="text-slate-600">Progresso</span>
                                            <span className="font-semibold">{op.percentual_conclusao}%</span>
                                          </div>
                                          <div className="w-full bg-slate-200 rounded-full h-1.5">
                                            <div 
                                              className="bg-blue-600 h-1.5 rounded-full transition-all"
                                              style={{ width: `${op.percentual_conclusao}%` }}
                                            />
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}

                        {opsColuna.length === 0 && (
                          <div className="text-center py-12 text-slate-400">
                            <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Nenhuma OP</p>
                          </div>
                        )}
                      </div>
                    )}
                  </Droppable>
                </Card>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}