import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Play, Pause } from 'lucide-react';
import { useContextoVisual } from '@/components/lib/useContextoVisual';

const automacoes = [
  { id: 1, nome: 'Pedido → Produção', gatilho: 'status=aprovado', acao: 'criar OP', status: 'ativo', execucoes: 234 },
  { id: 2, nome: 'Nota Fiscal → Cobrança', gatilho: 'nfe_autorizada', acao: 'gerar boleto', status: 'ativo', execucoes: 512 },
  { id: 3, nome: 'Entrega → Feedback', gatilho: 'status=entregue', acao: 'enviar survey', status: 'pausado', execucoes: 89 },
  { id: 4, nome: 'Churn Detection', gatilho: 'dias_sem_comprar>60', acao: 'alerta gerente', status: 'ativo', execucoes: 45 },
];

export default function DashboardAutomacaoFluxosWidget() {
  const [selectedId, setSelectedId] = useState(null);
  const { empresaAtual } = useContextoVisual();

  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" /> Automações Ativas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {automacoes.map((auto) => (
            <div
              key={auto.id}
              className="p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => setSelectedId(selectedId === auto.id ? null : auto.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1">
                  <span className="font-medium text-sm">{auto.nome}</span>
                  <Badge variant={auto.status === 'ativo' ? 'default' : 'outline'} className="text-xs">
                    {auto.status === 'ativo' ? '● Ativo' : '◯ Pausado'}
                  </Badge>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {auto.status === 'ativo' ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>

              {selectedId === auto.id && (
                <div className="text-xs text-slate-600 space-y-1 mt-2 pt-2 border-t border-slate-100">
                  <div>
                    <span className="font-semibold">Gatilho:</span> {auto.gatilho}
                  </div>
                  <div>
                    <span className="font-semibold">Ação:</span> {auto.acao}
                  </div>
                  <div>
                    <span className="font-semibold">Execuções:</span> {auto.execucoes} vez(es)
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
          <strong>💡 Q4 2026:</strong> Automações visuais via triggers e fluxos de trabalho inteligentes.
        </div>
      </CardContent>
    </Card>
  );
}