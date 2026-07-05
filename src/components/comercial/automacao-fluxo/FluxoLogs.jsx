import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function FluxoLogs({ logs }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Logs de Execução</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-8">Nenhuma ação executada ainda</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className={`flex items-start gap-2 p-2 rounded ${
                log.tipo === 'error' ? 'bg-red-50'
                : log.tipo === 'success' ? 'bg-green-50'
                : log.tipo === 'warning' ? 'bg-orange-50'
                : 'bg-slate-50'
              }`}>
                <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm">{log.mensagem}</p>
                  <p className="text-xs text-slate-500">{log.timestamp.toLocaleTimeString('pt-BR')}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}