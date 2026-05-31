/**
 * Monitor429RateLimit v1.0
 * Monitoramento em tempo real de rate limits (429s)
 * Regra-Mãe: proteção contra sobrecarga
 */
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { AlertTriangle, CheckCircle2, Clock, Zap, TrendingDown } from 'lucide-react';

export default function Monitor429RateLimit() {
  const [circuitState, setCircuitState] = useState('CLOSED');
  const [failureCount, setFailureCount] = useState(0);
  const [nextAttemptTime, setNextAttemptTime] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Fetch histórico de 429s
  const { data: erros429 = [], refetch } = useQuery({
    queryKey: ['429-errors'],
    queryFn: () => base44.entities.AuditLog.filter(
      { 
        entidade: 'RateLimitError',
        tipo_auditoria: 'erro'
      },
      '-data_hora',
      50
    ),
    staleTime: 10000,
  });

  // Monitorar status do circuit breaker globalmente
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        // Tentar ler status do circuit breaker do localStorage
        const cbState = JSON.parse(localStorage.getItem('circuitBreakerState') || '{}');
        setCircuitState(cbState.state || 'CLOSED');
        setFailureCount(cbState.failureCount || 0);
        setNextAttemptTime(cbState.nextAttempt ? new Date(cbState.nextAttempt) : null);
      } catch (_) {}
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Countdown para próxima tentativa
  useEffect(() => {
    if (!nextAttemptTime) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, (new Date(nextAttemptTime) - now) / 1000);
      setCountdown(Math.ceil(remaining));
      if (remaining <= 0) setNextAttemptTime(null);
    }, 100);
    return () => clearInterval(interval);
  }, [nextAttemptTime]);

  // Contar 429s por hora
  const now = new Date();
  const oneHourAgo = new Date(now - 3600000);
  const erros429Hora = erros429.filter(e => new Date(e.data_hora) > oneHourAgo);

  const statusIcon = {
    CLOSED: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    OPEN: <AlertTriangle className="w-5 h-5 text-red-600" />,
    HALF_OPEN: <Clock className="w-5 h-5 text-orange-600" />,
  };

  const statusColor = {
    CLOSED: 'bg-green-50 border-green-200',
    OPEN: 'bg-red-50 border-red-200',
    HALF_OPEN: 'bg-orange-50 border-orange-200',
  };

  return (
    <div className="w-full h-full space-y-4 overflow-auto p-4">
      {/* Alert se circuit aberto */}
      {circuitState === 'OPEN' && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 ml-2">
            <strong>Circuit Breaker ABERTO!</strong> Sistema pausado por {countdown}s para evitar sobrecarga (429).
          </AlertDescription>
        </Alert>
      )}

      {/* Status do Circuit Breaker */}
      <Card className={`border-2 ${statusColor[circuitState]}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Circuit Breaker Status</CardTitle>
            {statusIcon[circuitState]}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600 mb-1">Estado</p>
              <Badge className={
                circuitState === 'CLOSED' ? 'bg-green-100 text-green-800' :
                circuitState === 'OPEN' ? 'bg-red-100 text-red-800' :
                'bg-orange-100 text-orange-800'
              }>
                {circuitState}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-slate-600 mb-1">Falhas</p>
              <p className="text-2xl font-bold">{failureCount}/3</p>
            </div>
          </div>
          
          {nextAttemptTime && (
            <div>
              <p className="text-sm text-slate-600 mb-2">Próxima tentativa em:</p>
              <div className="text-3xl font-bold text-orange-600">{countdown}s</div>
              <Progress value={(3 - countdown / 30) * 100} className="mt-2 h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Taxa de 429s */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Rate Limit (429s) — Última Hora</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600">Total</p>
              <p className="text-2xl font-bold">{erros429Hora.length}</p>
            </div>
            <div className="p-3 bg-orange-50 rounded">
              <p className="text-xs text-slate-600">Taxa/Min</p>
              <p className="text-2xl font-bold">{(erros429Hora.length / 60).toFixed(2)}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded">
              <p className="text-xs text-slate-600">Última</p>
              <p className="text-sm font-mono">
                {erros429Hora.length > 0 
                  ? new Date(erros429Hora[0].data_hora).toLocaleTimeString('pt-BR')
                  : '—'}
              </p>
            </div>
          </div>
          
          {erros429Hora.length > 5 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800 ml-2">
                ⚠️ Alta taxa de 429s! {erros429Hora.length} erros na última hora.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Histórico de 429s */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Histórico (Últimas 50)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 max-h-64 overflow-y-auto">
          {erros429.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Sem erros 429 registrados</p>
          ) : (
            erros429.slice(0, 20).map((erro, i) => (
              <div key={i} className="p-2 bg-slate-50 rounded border-l-2 border-orange-400 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-slate-600">
                    {new Date(erro.data_hora).toLocaleTimeString('pt-BR')}
                  </span>
                  <Badge className="bg-orange-100 text-orange-800">429</Badge>
                </div>
                <p className="text-slate-600">{erro.descricao}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Guia de Ação */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">O que fazer?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-slate-700">
          <p>✓ <strong>CLOSED</strong> — Sistema operacional, reqs normais</p>
          <p>⚠️ <strong>HALF_OPEN</strong> — Testando reconexão, aguarde</p>
          <p>✗ <strong>OPEN</strong> — Bloqueado temporariamente. Espere o countdown</p>
          <p className="pt-2 text-xs text-slate-600">Desabilite debounce em contadores se problema persistir</p>
        </CardContent>
      </Card>
    </div>
  );
}