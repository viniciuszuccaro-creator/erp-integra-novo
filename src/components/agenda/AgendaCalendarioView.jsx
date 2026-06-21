import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function AgendaCalendarioView({
  dataAtual,
  setDataAtual,
  eventos,
  onEventoClick,
  filtroUsuario,
}) {
  const diasMes = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0).getDate();
  const primeiroDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1).getDay();
  const dias = Array.from({ length: 42 }, (_, i) => {
    const dia = i - primeiroDia + 1;
    return dia > 0 && dia <= diasMes ? dia : null;
  });

  const handlePrevMes = () => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() - 1));
  };

  const handleProxMes = () => {
    setDataAtual(new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1));
  };

  const getEventosDia = (dia) => {
    const data = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia);
    return eventos.filter((e) => {
      const dataEvento = new Date(e.data_inicio);
      return (
        dataEvento.getFullYear() === data.getFullYear() &&
        dataEvento.getMonth() === data.getMonth() &&
        dataEvento.getDate() === data.getDate() &&
        (!filtroUsuario || e.responsavel_id === filtroUsuario)
      );
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handlePrevMes}
          className="p-1 hover:bg-slate-100 rounded"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold">
          {dataAtual.toLocaleDateString("pt-BR", {
            month: "long",
            year: "numeric",
          })}
        </h3>
        <button
          onClick={handleProxMes}
          className="p-1 hover:bg-slate-100 rounded"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"].map((d) => (
          <div key={d} className="text-center text-xs font-semibold text-slate-600">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 flex-1 overflow-y-auto">
        {dias.map((dia, idx) => (
          <div
            key={idx}
            className="border rounded min-h-16 p-1 bg-slate-50 overflow-hidden text-xs"
          >
            {dia && (
              <>
                <div className="font-semibold text-slate-700">{dia}</div>
                <div className="space-y-0.5">
                  {getEventosDia(dia).slice(0, 2).map((e) => (
                    <button
                      key={e.id}
                      onClick={() => onEventoClick(e)}
                      className="w-full bg-blue-100 text-blue-700 p-0.5 rounded truncate hover:bg-blue-200 text-left"
                      title={e.titulo}
                    >
                      {e.titulo}
                    </button>
                  ))}
                  {getEventosDia(dia).length > 2 && (
                    <div className="text-slate-500">
                      +{getEventosDia(dia).length - 2}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}