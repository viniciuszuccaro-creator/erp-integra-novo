import React, { useState } from 'react';
import { CheckCircle2, Clock, User, FileCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function InspecaoAuditoriaPanel() {
  const [inspecoes] = useState([
    {
      id: '1',
      tipo: 'Inspeção de Recebimento',
      data: '2026-05-31 14:30',
      inspetor: 'João Silva',
      status: 'aprovado',
      registros: '125 itens ✓',
      resultado: 'Aprovado'
    },
    {
      id: '2',
      tipo: 'Auditoria de Processo',
      data: '2026-05-31 10:15',
      inspetor: 'Maria Santos',
      status: 'pendente',
      registros: 'Armação - Em andamento',
      resultado: 'Aguardando Conclusão'
    },
    {
      id: '3',
      tipo: 'Inspeção Final',
      data: '2026-05-30 16:45',
      inspetor: 'Carlos Mendes',
      status: 'aprovado',
      registros: '89 itens ✓',
      resultado: 'Aprovado'
    },
    {
      id: '4',
      tipo: 'Auditoria Interna',
      data: '2026-05-29 09:00',
      inspetor: 'Ana Costa',
      status: 'rejeitado',
      registros: 'Identificadas 3 não-conformidades',
      resultado: 'Rejeitado - NCR Aberta'
    }
  ]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'aprovado':
        return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'pendente':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'rejeitado':
        return 'bg-red-50 border-red-200 text-red-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto">
      {inspecoes.map((insp) => (
        <Card key={insp.id} className={`border-2 ${getStatusColor(insp.status)}`}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-base">{insp.tipo}</CardTitle>
                <p className="text-xs text-slate-600 mt-1">
                  <span className="flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {insp.data}
                  </span>
                </p>
              </div>
              <Badge className={`text-xs ${
                insp.status === 'aprovado' ? 'bg-emerald-600 hover:bg-emerald-700' :
                insp.status === 'pendente' ? 'bg-blue-600 hover:bg-blue-700' :
                'bg-red-600 hover:bg-red-700'
              }`}>
                {insp.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/50 p-2 rounded">
                <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Inspetor
                </p>
                <p className="text-sm font-semibold text-slate-900">{insp.inspetor}</p>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <p className="text-xs text-slate-600 mb-1 flex items-center gap-1">
                  <FileCheck className="w-3 h-3" />
                  Detalhes
                </p>
                <p className="text-sm font-semibold text-slate-900">{insp.registros}</p>
              </div>
            </div>

            <div className="border-t border-current/20 pt-2">
              <p className={`text-sm font-semibold ${
                insp.status === 'aprovado' ? 'text-emerald-800' :
                insp.status === 'pendente' ? 'text-blue-800' :
                'text-red-800'
              }`}>
                {insp.resultado}
              </p>
            </div>

            <Button variant="outline" size="sm" className="w-full">
              Visualizar Detalhes
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}