import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export default function AgendaFormDialog({
  open,
  onOpenChange,
  evento,
  clientes,
  user,
  onSave,
  isLoading,
}) {
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    tipo: "Reunião",
    data_inicio: "",
    hora_inicio: "",
    data_fim: "",
    hora_fim: "",
    dia_inteiro: false,
    local: "",
    cliente_nome: "",
    status: "Agendado",
    prioridade: "Normal",
    lembrete: true,
    tempo_lembrete: 30,
    link_reuniao: "",
    observacoes: "",
    cor: "#3b82f6",
  });

  useEffect(() => {
    if (evento) {
      const dataInicio = new Date(evento.data_inicio);
      const dataFim = new Date(evento.data_fim);
      setForm({
        ...evento,
        data_inicio: dataInicio.toISOString().split("T")[0],
        hora_inicio: dataInicio.toTimeString().slice(0, 5),
        data_fim: dataFim.toISOString().split("T")[0],
        hora_fim: dataFim.toTimeString().slice(0, 5),
      });
    } else {
      const hoje = new Date().toISOString().split("T")[0];
      setForm((prev) => ({
        ...prev,
        data_inicio: hoje,
        data_fim: hoje,
        hora_inicio: "09:00",
        hora_fim: "10:00",
      }));
    }
  }, [evento, open]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    await onSave(form);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-96 overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{evento ? "Editar Evento" : "Novo Evento"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Título e Tipo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Título</Label>
              <Input
                value={form.titulo}
                onChange={(e) => handleChange("titulo", e.target.value)}
                placeholder="Ex: Reunião com cliente"
              />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => handleChange("tipo", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Reunião", "Ligação", "Visita", "Tarefa", "Follow-up", "Evento", "Lembrete"].map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Data e Hora */}
          <div className="grid grid-cols-4 gap-2">
            <div>
              <Label>Data Início</Label>
              <Input
                type="date"
                value={form.data_inicio}
                onChange={(e) => handleChange("data_inicio", e.target.value)}
              />
            </div>
            <div>
              <Label>Hora Início</Label>
              <Input
                type="time"
                value={form.hora_inicio}
                onChange={(e) => handleChange("hora_inicio", e.target.value)}
                disabled={form.dia_inteiro}
              />
            </div>
            <div>
              <Label>Data Fim</Label>
              <Input
                type="date"
                value={form.data_fim}
                onChange={(e) => handleChange("data_fim", e.target.value)}
              />
            </div>
            <div>
              <Label>Hora Fim</Label>
              <Input
                type="time"
                value={form.hora_fim}
                onChange={(e) => handleChange("hora_fim", e.target.value)}
                disabled={form.dia_inteiro}
              />
            </div>
          </div>

          {/* Dia inteiro */}
          <div className="flex items-center gap-2">
            <Checkbox
              checked={form.dia_inteiro}
              onCheckedChange={(v) => handleChange("dia_inteiro", v)}
            />
            <Label>Evento de dia inteiro</Label>
          </div>

          {/* Local e Cliente */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Local</Label>
              <Input
                value={form.local}
                onChange={(e) => handleChange("local", e.target.value)}
                placeholder="Ex: Sala de Reunião A"
              />
            </div>
            <div>
              <Label>Cliente</Label>
              <Select value={form.cliente_nome} onValueChange={(v) => handleChange("cliente_nome", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.nome_fantasia || c.razao_social}>
                      {c.nome_fantasia || c.razao_social}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status e Prioridade */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => handleChange("status", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Agendado", "Confirmado", "Em Andamento", "Concluído", "Cancelado", "Adiado"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Prioridade</Label>
              <Select value={form.prioridade} onValueChange={(v) => handleChange("prioridade", v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["Baixa", "Normal", "Alta", "Urgente"].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div>
            <Label>Descrição</Label>
            <Textarea
              value={form.descricao}
              onChange={(e) => handleChange("descricao", e.target.value)}
              placeholder="Detalhes do evento..."
              rows={3}
            />
          </div>

          {/* Lembrete */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.lembrete}
                onCheckedChange={(v) => handleChange("lembrete", v)}
              />
              <Label>Lembrete ativo</Label>
            </div>
            {form.lembrete && (
              <div className="flex items-center gap-2">
                <Label>Minutos antes:</Label>
                <Input
                  type="number"
                  value={form.tempo_lembrete}
                  onChange={(e) => handleChange("tempo_lembrete", parseInt(e.target.value))}
                  className="w-20"
                />
              </div>
            )}
          </div>

          {/* Link de reunião */}
          <div>
            <Label>Link de Reunião (Meet, Zoom, etc)</Label>
            <Input
              value={form.link_reuniao}
              onChange={(e) => handleChange("link_reuniao", e.target.value)}
              placeholder="https://..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}