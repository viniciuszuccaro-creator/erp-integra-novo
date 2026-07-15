import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, Check, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import PontoForm from "./PontoForm";
import { useWindow } from "@/components/lib/useWindow";
import { useContextoVisual } from "@/components/lib/useContextoVisual";
import { toast } from "sonner";

export default function PontoTab({ pontos, colaboradores }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { openWindow } = useWindow();
  const { grupoAtual, empresaAtual, carimbarContexto } = useContextoVisual();
  const [formData, setFormData] = useState({
    colaborador_id: "",
    colaborador_nome: "",
    data: new Date().toISOString().split('T')[0],
    entrada_manha: "",
    saida_almoco: "",
    retorno_almoco: "",
    saida_tarde: "",
    tipo_dia: "Normal",
    observacoes: "",
    status: "Pendente"
  });

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data) => {
      // Calcular horas trabalhadas
      const calcularHoras = () => {
        if (!data.entrada_manha || !data.saida_tarde) return 0;
        
        const entrada = new Date(`2000-01-01T${data.entrada_manha}`);
        const saida = new Date(`2000-01-01T${data.saida_tarde}`);
        const almoco = data.saida_almoco && data.retorno_almoco 
          ? (new Date(`2000-01-01T${data.retorno_almoco}`) - new Date(`2000-01-01T${data.saida_almoco}`)) / (1000 * 60 * 60)
          : 0;
        
        const horasTotais = (saida - entrada) / (1000 * 60 * 60) - almoco;
        const horasExtras = Math.max(0, horasTotais - 8);
        
        return {
          horas_trabalhadas: horasTotais,
          horas_extras: horasExtras
        };
      };

      const { horas_trabalhadas, horas_extras } = calcularHoras();

      return base44.entities.Ponto.create(carimbarContexto({
        ...data,
        horas_trabalhadas,
        horas_extras
      }, 'empresa_id'));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pontos'] });
      setIsDialogOpen(false);
      resetForm();
    },
  });

  const aprovarMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Ponto.update(id, {
      status: 'Aprovado',
      aprovado_por: 'Sistema'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pontos'] });
    },
  });

  const rejeitarMutation = useMutation({
    mutationFn: ({ id }) => base44.entities.Ponto.update(id, {
      status: 'Rejeitado'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pontos'] });
    },
  });

  const resetForm = () => {
    setFormData({
      colaborador_id: "",
      colaborador_nome: "",
      data: new Date().toISOString().split('T')[0],
      entrada_manha: "",
      saida_almoco: "",
      retorno_almoco: "",
      saida_tarde: "",
      tipo_dia: "Normal",
      observacoes: "",
      status: "Pendente"
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const statusColors = {
    'Pendente': 'bg-yellow-100 text-yellow-700',
    'Aprovado': 'bg-green-100 text-green-700',
    'Rejeitado': 'bg-red-100 text-red-700'
  };

  const tipoDiaColors = {
    'Normal': 'bg-blue-100 text-blue-700',
    'Feriado': 'bg-purple-100 text-purple-700',
    'Fim de Semana': 'bg-gray-100 text-gray-700',
    'Folga': 'bg-cyan-100 text-cyan-700'
  };

  // Agrupar por mês
  const pontosPorMes = pontos.reduce((acc, ponto) => {
    const mes = new Date(ponto.data).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
    if (!acc[mes]) acc[mes] = [];
    acc[mes].push(ponto);
    return acc;
  }, {});

  return (
    <div className="w-full h-full overflow-y-auto space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Card className="px-4 py-2">
            <div className="text-sm text-slate-600">Registros Pendentes</div>
            <div className="text-2xl font-bold text-yellow-600">
              {pontos.filter(p => p.status === 'Pendente').length}
            </div>
          </Card>
          <Card className="px-4 py-2">
            <div className="text-sm text-slate-600">Horas Extras (Mês)</div>
            <div className="text-2xl font-bold text-orange-600">
              {pontos
                .filter(p => new Date(p.data).getMonth() === new Date().getMonth())
                .reduce((sum, p) => sum + (p.horas_extras || 0), 0)
                .toFixed(1)}h
            </div>
          </Card>
        </div>

        <Button 
          className="bg-pink-600 hover:bg-pink-700"
          data-sensitive="true"
          onClick={() => openWindow(PontoForm, {
            windowMode: true,
            onSubmit: async (data) => {
              try {
                await createMutation.mutateAsync(data);
                toast.success("✅ Ponto registrado!");
              } catch (error) {
                toast.error("Erro ao registrar ponto");
              }
            }
          }, {
            title: '🕐 Registrar Ponto',
            width: 900,
            height: 650
          })}
        >
          <Plus className="w-4 h-4 mr-2" />
          Registrar Ponto
        </Button>

      </div>

      <Card className="border-0 shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Data</TableHead>
                <TableHead>Colaborador</TableHead>
                <TableHead>Entrada</TableHead>
                <TableHead>Saída Almoço</TableHead>
                <TableHead>Retorno</TableHead>
                <TableHead>Saída</TableHead>
                <TableHead>Horas</TableHead>
                <TableHead>Extras</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pontos.map((ponto) => (
                <TableRow key={ponto.id} className="hover:bg-slate-50">
                  <TableCell>
                    {new Date(ponto.data).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell className="font-medium">{ponto.colaborador_nome}</TableCell>
                  <TableCell className="font-mono text-sm">{ponto.entrada_manha || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">{ponto.saida_almoco || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">{ponto.retorno_almoco || '-'}</TableCell>
                  <TableCell className="font-mono text-sm">{ponto.saida_tarde || '-'}</TableCell>
                  <TableCell className="font-semibold">
                    {ponto.horas_trabalhadas ? `${ponto.horas_trabalhadas.toFixed(1)}h` : '-'}
                  </TableCell>
                  <TableCell className={ponto.horas_extras > 0 ? "font-semibold text-orange-600" : ""}>
                    {ponto.horas_extras ? `${ponto.horas_extras.toFixed(1)}h` : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={tipoDiaColors[ponto.tipo_dia]}>
                      {ponto.tipo_dia}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[ponto.status]}>
                      {ponto.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {ponto.status === 'Pendente' && (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          data-sensitive="true"
                          onClick={() => aprovarMutation.mutate({ id: ponto.id })}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-sensitive="true"
                          onClick={() => rejeitarMutation.mutate({ id: ponto.id })}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {pontos.length === 0 && (
          <div className="text-center py-12">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-30 text-slate-400" />
            <p className="text-slate-500">Nenhum registro de ponto encontrado</p>
          </div>
        )}
      </Card>
    </div>
  );
}