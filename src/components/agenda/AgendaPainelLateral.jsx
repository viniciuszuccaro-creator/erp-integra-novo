import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, MapPin, Users, Video, CheckCircle, Bell, Calendar } from "lucide-react";

const TIPO_ICON = {
  "Reunião": Users,
  "Visita": MapPin,
  "Ligação": Bell,
  "Follow-up": Clock,
  "Tarefa": CheckCircle,
};

const STATUS_COLOR = {
  Agendado: "bg-blue-100 text-blue-700",
  Confirmado: "bg-green-100 text-green-700",
  "Em Andamento": "bg-yellow-100 text-yellow-700",
  Concluído: "bg-gray-100 text-gray-700",
  Cancelado: "bg-red-100 text-red-700",
};

function formatHora(dt) {
  try { return new Date(dt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }); } catch { return ""; }
}

export default function AgendaPainelLateral({ eventos = [], onEventoClick, dataAtual }) {
  const data = dataAtual || new Date();

  const eventosHoje = useMemo(() => {
    return eventos
      .filter(e => {
        const d = new Date(e.data_inicio);
        return d.toDateString() === data.toDateString();
      })
      .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio));
  }, [eventos, data]);

  const proximosEventos = useMemo(() => {
    const amanha = new Date(data);
    amanha.setDate(amanha.getDate() + 1);
    const fim = new Date(data);
    fim.setDate(fim.getDate() + 7);
    return eventos
      .filter(e => {
        const d = new Date(e.data_inicio);
        return d >= amanha && d <= fim && e.status !== 'Cancelado' && e.status !== 'Concluído';
      })
      .sort((a, b) => new Date(a.data_inicio) - new Date(b.data_inicio))
      .slice(0, 5);
  }, [eventos, data]);

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Hoje */}
      <Card className="border shadow-sm flex-1">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Hoje — {data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'short' })}
            {eventosHoje.length > 0 && (
              <Badge className="ml-auto bg-blue-100 text-blue-700 text-xs">{eventosHoje.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 overflow-auto">
          {eventosHoje.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-4">Nenhum evento hoje</p>
          ) : (
            eventosHoje.map(e => {
              const Icon = TIPO_ICON[e.tipo] || Clock;
              return (
                <button
                  key={e.id}
                  className="w-full text-left p-2 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-colors"
                  onClick={() => onEventoClick?.(e)}
                >
                  <div className="flex items-start gap-2">
                    <div className="p-1 rounded mt-0.5" style={{ backgroundColor: (e.cor || '#3b82f6') + '20' }}>
                      <Icon className="w-3 h-3" style={{ color: e.cor || '#3b82f6' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{e.titulo}</p>
                      <p className="text-xs text-slate-500">{formatHora(e.data_inicio)} — {formatHora(e.data_fim)}</p>
                      {e.cliente_nome && <p className="text-xs text-slate-400 truncate">{e.cliente_nome}</p>}
                    </div>
                    <Badge className={`text-xs shrink-0 ${STATUS_COLOR[e.status] || 'bg-slate-100 text-slate-600'}`}>
                      {e.status}
                    </Badge>
                  </div>
                  {e.link_reuniao && (
                    <div className="flex items-center gap-1 mt-1 ml-7">
                      <Video className="w-3 h-3 text-blue-500" />
                      <span className="text-xs text-blue-600 truncate">Link reunião</span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Próximos 7 dias */}
      {proximosEventos.length > 0 && (
        <Card className="border shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-slate-500">Próximos 7 dias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {proximosEventos.map(e => (
              <button
                key={e.id}
                className="w-full text-left p-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                onClick={() => onEventoClick?.(e)}
              >
                <p className="text-xs font-medium text-slate-800 truncate">{e.titulo}</p>
                <p className="text-xs text-slate-400">
                  {new Date(e.data_inicio).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })} · {formatHora(e.data_inicio)}
                </p>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}