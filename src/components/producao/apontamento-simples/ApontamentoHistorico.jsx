import React from "react";
import { Clock } from "lucide-react";

export default function ApontamentoHistorico({ apontamentos }) {
  if (!apontamentos || apontamentos.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t">
      <h3 className="font-semibold mb-3 text-sm">Histórico de Apontamentos</h3>
      <div className="space-y-2">
        {apontamentos
          .sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora))
          .slice(0, 10)
          .map((apt, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded text-sm">
              <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">{apt.item_elemento} - {apt.setor}</span>
                  <span className="text-xs text-slate-500">{new Date(apt.data_hora).toLocaleString("pt-BR")}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Produzido: {apt.quantidade_produzida} un ({apt.peso_produzido_kg} kg)
                  {apt.quantidade_refugada > 0 && ` • Refugo: ${apt.quantidade_refugada} un`}
                </p>
                {apt.observacoes && <p className="text-xs text-slate-500 mt-1 italic">{apt.observacoes}</p>}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}