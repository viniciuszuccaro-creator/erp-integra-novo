import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertCircle, CheckCircle2, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export default function QualityRealtimePanel() {
  const [metrics, setMetrics] = useState([
    {
      id: '1',
      processo: 'Corte & Dobra',
      taxa_conformidade: 98.2,
      producao_dia: 450,
      rejeicoes: 8,
      status: 'ok'
    },
    {
      id: '2',
      processo: 'Armação',
      taxa_conformidade: 94.5,
      producao_dia: 320,
      rejeicoes: 18,
      status: 'alerta'
    },
    {
      id: '3',
      processo: 'Pintura',
      taxa_conformidade: 99.1,
      producao_dia: 280,
      rejeicoes: 2,
      status: 'ok'
    },
    {
      id: '4',
      processo: 'Montagem Final',
      taxa_conformidade: 96.8,
      producao_dia: 210,
      rejeicoes: 7,
      status: 'ok'
    }
  ]);

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {metrics.map((m) => (
        <Card key={m.id} className="bg-white border-slate-200 hover:border-emerald-400 transition">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  m.status === 'ok' ? 'bg-emerald-50' : 'bg-yellow-50'
                }`}>
                  {m.status === 'ok' ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-yellow-600" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">{m.processo}</CardTitle>
                  <p className="text-xs text-slate-600">Produção: {m.producao_dia} unidades</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{m.taxa_conformidade}%</p>
                <p className="text-xs text-red-600">{m.rejeicoes} rejeições</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-2">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-slate-600">Taxa de Conformidade</span>
                <span className="text-xs font-semibold">{m.taxa_conformidade}%</span>
              </div>
              <Progress value={m.taxa_conformidade} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="bg-blue-50 p-2 rounded text-center">
                <p className="text-xs text-blue-700 font-semibold">Produção</p>
                <p className="text-sm font-bold text-blue-900">{m.producao_dia}</p>
              </div>
              <div className="bg-red-50 p-2 rounded text-center">
                <p className="text-xs text-red-700 font-semibold">Rejeições</p>
                <p className="text-sm font-bold text-red-900">{m.rejeicoes}</p>
              </div>
              <div className="bg-emerald-50 p-2 rounded text-center">
                <p className="text-xs text-emerald-700 font-semibold">Taxa Sucesso</p>
                <p className="text-sm font-bold text-emerald-900">{((m.producao_dia - m.rejeicoes) / m.producao_dia * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}