import React from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export default function AgendaToolbar({
  visualizacao,
  setVisualizacao,
  filtroUsuario,
  setFiltroUsuario,
  usuarios,
  onNovoEvento,
  onDeleteEvento,
  eventoSelecionado,
}) {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-slate-50">
      {/* Visualização */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Visualização:</span>
        <Select value={visualizacao} onValueChange={setVisualizacao}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="calendario">Calendário</SelectItem>
            <SelectItem value="lista">Lista</SelectItem>
            <SelectItem value="dia">Dia</SelectItem>
            <SelectItem value="semana">Semana</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Filtro de usuário */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-slate-700">Responsável:</span>
        <Select value={filtroUsuario || ""} onValueChange={(v) => setFiltroUsuario(v || null)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={null}>Todos</SelectItem>
            {usuarios.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                {u.full_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-2">
        <Button size="sm" onClick={onNovoEvento}>
          <Plus className="w-4 h-4 mr-1" /> Novo Evento
        </Button>
        {eventoSelecionado && (
          <Button
            size="sm"
            variant="destructive"
            data-permission="Agenda.Evento.excluir"
            onClick={onDeleteEvento}
          >
            <Trash2 className="w-4 h-4 mr-1" /> Deletar
          </Button>
        )}
      </div>
    </div>
  );
}