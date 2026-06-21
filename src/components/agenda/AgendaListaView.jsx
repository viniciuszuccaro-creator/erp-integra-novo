import React from "react";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AgendaListaView({ eventos, filtroUsuario, onEventoClick }) {
  const eventosFiltrados = filtroUsuario
    ? eventos.filter((e) => e.responsavel_id === filtroUsuario)
    : eventos;

  const eventosSorted = [...eventosFiltrados].sort(
    (a, b) => new Date(a.data_inicio) - new Date(b.data_inicio)
  );

  const getStatusColor = (status) => {
    const colors = {
      Agendado: "bg-blue-50 text-blue-700",
      Confirmado: "bg-green-50 text-green-700",
      "Em Andamento": "bg-yellow-50 text-yellow-700",
      Concluído: "bg-slate-50 text-slate-700",
      Cancelado: "bg-red-50 text-red-700",
    };
    return colors[status] || "bg-slate-50 text-slate-700";
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-slate-50">
        <h3 className="font-semibold text-slate-900">
          {eventosSorted.length} Eventos {filtroUsuario && "do Responsável"}
        </h3>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {eventosSorted.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-500">
            Nenhum evento encontrado
          </div>
        ) : (
          <div className="divide-y">
            {eventosSorted.map((evento) => (
              <button
                key={evento.id}
                onClick={() => onEventoClick(evento)}
                className="w-full text-left p-4 hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{evento.titulo}</h4>
                  <Badge className={getStatusColor(evento.status)}>
                    {evento.status}
                  </Badge>
                </div>
                <div className="space-y-1 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {new Date(evento.data_inicio).toLocaleDateString("pt-BR")}
                  </div>
                  {!evento.dia_inteiro && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {evento.hora_inicio} - {evento.hora_fim}
                    </div>
                  )}
                  {evento.local && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {evento.local}
                    </div>
                  )}
                  {evento.participantes?.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {evento.participantes.length} participantes
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}