import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import RBACButton from "@/components/lib/RBACButton";

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
               'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

function CalendarioMensal({ dataAtual, eventosVisiveis, onDiaClick, onEventoClick }) {
  const primeiroDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
  const ultimoDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);
  const diasMes = ultimoDia.getDate();
  const diaSemanaInicio = primeiroDia.getDay();
  const hoje = new Date();

  const dias = [];
  for (let i = 0; i < diaSemanaInicio; i++) dias.push(null);
  for (let i = 1; i <= diasMes; i++) dias.push(i);

  const semanas = [];
  for (let i = 0; i < dias.length; i += 7) semanas.push(dias.slice(i, i + 7));

  return (
    <div className="grid grid-cols-7 gap-1">
      {DIAS_SEMANA.map(d => (
        <div key={d} className="text-center font-semibold text-xs text-slate-600 p-2">{d}</div>
      ))}
      {semanas.map((semana, si) => (
        <React.Fragment key={si}>
          {semana.map((dia, di) => {
            if (!dia) return <div key={di} className="min-h-20 p-1 bg-slate-50 rounded" />;
            const dataDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia);
            const ehHoje = dataDia.toDateString() === hoje.toDateString();
            const eventosDia = eventosVisiveis.filter(e => {
              const de = new Date(e.data_inicio);
              return de.getDate() === dia && de.getMonth() === dataAtual.getMonth() && de.getFullYear() === dataAtual.getFullYear();
            });
            return (
              <div
                key={di}
                className={`min-h-20 p-1 border rounded cursor-pointer hover:bg-slate-50 transition-colors ${
                  ehHoje ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200' : 'bg-white border-slate-200'
                }`}
                onClick={() => onDiaClick(dataDia)}
              >
                <div className={`text-xs font-semibold mb-1 ${ehHoje ? 'text-blue-600' : 'text-slate-700'}`}>{dia}</div>
                <div className="space-y-0.5">
                  {eventosDia.slice(0, 3).map(ev => (
                    <div
                      key={ev.id}
                      className="text-xs p-0.5 rounded truncate cursor-pointer hover:opacity-80"
                      style={{ backgroundColor: ev.cor + '25', color: ev.cor }}
                      onClick={e => { e.stopPropagation(); onEventoClick(ev); }}
                    >{ev.titulo}</div>
                  ))}
                  {eventosDia.length > 3 && <div className="text-xs text-slate-400">+{eventosDia.length - 3}</div>}
                </div>
              </div>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
}

function CalendarioSemanal({ dataAtual, eventosVisiveis, onSlotClick, onEventoClick }) {
  const inicio = new Date(dataAtual);
  inicio.setDate(dataAtual.getDate() - dataAtual.getDay());
  const dias = Array.from({ length: 7 }, (_, i) => { const d = new Date(inicio); d.setDate(inicio.getDate() + i); return d; });
  const horas = Array.from({ length: 24 }, (_, i) => i);
  const hoje = new Date();

  return (
    <div className="overflow-x-auto">
      <div className="min-w-full">
        <div className="grid grid-cols-8 gap-1 mb-1">
          <div className="text-xs text-slate-500 p-2 text-right">Hora</div>
          {dias.map((d, i) => (
            <div key={i} className={`text-center p-2 rounded text-xs ${d.toDateString() === hoje.toDateString() ? 'bg-blue-50 font-bold text-blue-600' : ''}`}>
              <div>{DIAS_SEMANA[i]}</div>
              <div className="text-base font-semibold">{d.getDate()}</div>
            </div>
          ))}
        </div>
        {horas.map(hora => (
          <div key={hora} className="grid grid-cols-8 gap-1 border-t">
            <div className="text-xs text-slate-400 p-1 text-right">{hora.toString().padStart(2,'0')}:00</div>
            {dias.map((dia, di) => {
              const evs = eventosVisiveis.filter(e => {
                const de = new Date(e.data_inicio);
                return de.getDate()===dia.getDate() && de.getMonth()===dia.getMonth() && de.getFullYear()===dia.getFullYear() && de.getHours()===hora;
              });
              return (
                <div
                  key={di}
                  className="min-h-10 p-0.5 hover:bg-slate-50 cursor-pointer"
                  onClick={() => { const dh = new Date(dia); dh.setHours(hora,0,0,0); onSlotClick(dh); }}
                >
                  {evs.map(ev => (
                    <div key={ev.id} className="text-xs p-0.5 mb-0.5 rounded truncate text-white cursor-pointer"
                      style={{ backgroundColor: ev.cor }}
                      onClick={e => { e.stopPropagation(); onEventoClick(ev); }}
                    >{ev.titulo}</div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function CalendarioDiario({ dataAtual, eventosVisiveis, onSlotClick, onEventoClick }) {
  const horas = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div className="space-y-1">
      {horas.map(hora => {
        const evs = eventosVisiveis.filter(e => new Date(e.data_inicio).getHours() === hora);
        return (
          <div key={hora} className="flex gap-3 border-b pb-1">
            <div className="w-16 text-right text-xs text-slate-400 pt-2">{hora.toString().padStart(2,'0')}:00</div>
            <div
              className="flex-1 min-h-12 bg-slate-50 rounded p-1 hover:bg-slate-100 cursor-pointer"
              onClick={() => { const dh = new Date(dataAtual); dh.setHours(hora,0,0,0); onSlotClick(dh); }}
            >
              {evs.map(ev => (
                <div key={ev.id} className="p-2 mb-1 rounded text-white cursor-pointer hover:opacity-90"
                  style={{ backgroundColor: ev.cor }}
                  onClick={e => { e.stopPropagation(); onEventoClick(ev); }}
                >
                  <div className="font-semibold text-sm">{ev.titulo}</div>
                  {ev.cliente_nome && <div className="text-xs opacity-90">{ev.cliente_nome}</div>}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AgendaCalendario({
  dataAtual, visualizacao, eventosVisiveis, filtroUsuario, eventos,
  setFiltroUsuario, setVisualizacao, navegarAnterior, navegarProximo, irParaHoje,
  onNovoEvento, onEventoClick, onDiaClick, onSlotClick,
}) {
  const getTitulo = () => {
    if (visualizacao === 'mes') return `${MESES[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`;
    if (visualizacao === 'semana') {
      const ini = new Date(dataAtual); ini.setDate(dataAtual.getDate() - dataAtual.getDay());
      const fim = new Date(ini); fim.setDate(ini.getDate() + 6);
      return `${ini.getDate()} - ${fim.getDate()} de ${MESES[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`;
    }
    return `${dataAtual.getDate()} de ${MESES[dataAtual.getMonth()]} ${dataAtual.getFullYear()}`;
  };

  return (
    <Card className="border-0 shadow-md w-full">
      <CardHeader className="border-b bg-slate-50 p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={navegarAnterior}><ChevronLeft className="w-4 h-4"/></Button>
            <Button variant="outline" size="sm" onClick={irParaHoje}>Hoje</Button>
            <Button variant="outline" size="icon" onClick={navegarProximo}><ChevronRight className="w-4 h-4"/></Button>
            <h2 className="text-base font-semibold">{getTitulo()}</h2>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Select value={filtroUsuario} onValueChange={setFiltroUsuario}>
              <SelectTrigger className="w-36 h-8 text-xs"><SelectValue placeholder="Filtrar usuário"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                {[...new Set(eventos.map(e => e.responsavel))].filter(Boolean).map(r => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-1">
              {['mes','semana','dia'].map(v => (
                <Button key={v} variant={visualizacao===v?'default':'outline'} size="sm"
                  className="h-8 text-xs capitalize" onClick={() => setVisualizacao(v)}>
                  {v === 'mes' ? 'Mês' : v === 'semana' ? 'Semana' : 'Dia'}
                </Button>
              ))}
            </div>
            <RBACButton size="sm" module="Agenda" action="criar" className="bg-blue-600 hover:bg-blue-700 h-8" onClick={onNovoEvento}>
              <Plus className="w-3 h-3 mr-1"/>Novo
            </RBACButton>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 overflow-auto">
        {visualizacao === 'mes' && (
          <CalendarioMensal dataAtual={dataAtual} eventosVisiveis={eventosVisiveis}
            onDiaClick={onDiaClick} onEventoClick={onEventoClick} />
        )}
        {visualizacao === 'semana' && (
          <CalendarioSemanal dataAtual={dataAtual} eventosVisiveis={eventosVisiveis}
            onSlotClick={onSlotClick} onEventoClick={onEventoClick} />
        )}
        {visualizacao === 'dia' && (
          <CalendarioDiario dataAtual={dataAtual} eventosVisiveis={eventosVisiveis}
            onSlotClick={onSlotClick} onEventoClick={onEventoClick} />
        )}
      </CardContent>
    </Card>
  );
}