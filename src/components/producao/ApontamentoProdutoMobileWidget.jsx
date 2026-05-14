import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, CheckCircle, AlertCircle, Plus } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

export default function ApontamentoProdutoMobileWidget() {
  const [apontamentos, setApontamentos] = useState([
    { id: 1, op: 'OP-001', produto: 'Bitola 10mm', qtd: 500, status: 'apontado', usuario: 'João Silva', hora: '09:45' },
    { id: 2, op: 'OP-002', produto: 'Armado Padrão', qtd: 300, status: 'apontado', usuario: 'Maria Santos', hora: '10:12' },
    { id: 3, op: 'OP-003', produto: 'Corte e Dobra', qtd: 150, status: 'pendente', usuario: 'Carlos', hora: '-' },
  ]);
  const { empresaAtual } = useContextoVisual();

  const statusConfig = {
    apontado: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    pendente: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50' },
  };

  return (
    <Card className="col-span-full lg:col-span-2 h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-600" /> Apontamentos Mobile
        </CardTitle>
        <CardDescription>
          App de produção com QR scan e apontamentos em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {apontamentos.map((apt) => {
            const Config = statusConfig[apt.status];
            const Icon = Config.icon;
            return (
              <div
                key={apt.id}
                className={`p-3 rounded-lg border border-slate-200 ${Config.bg}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${Config.color}`} />
                      <span className="font-semibold text-sm">{apt.op}</span>
                    </div>
                    <p className="text-xs text-slate-600 ml-6">{apt.produto}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {apt.qtd} un
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 ml-6">
                  <span>{apt.usuario}</span>
                  <span>{apt.hora}</span>
                </div>
              </div>
            );
          })}
        </div>

        <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Apontamento
        </Button>

        <div className="mt-3 p-2 text-xs text-slate-500 border-t pt-3">
          <strong>📱 Ciclo 19 (Jan 2027):</strong> App mobile com QR code, biometria, sincronização offline e banco de dados local.
        </div>
      </CardContent>
    </Card>
  );
}