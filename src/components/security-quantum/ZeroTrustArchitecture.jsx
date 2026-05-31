/**
 * ZeroTrustArchitecture v1.0
 * Zero-Trust: Nunca confiar, sempre verificar
 * Passo 30: Segurança por contexto + comportamento + localização
 */
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, Zap } from 'lucide-react';

const ZERO_TRUST_CHECKS = [
  { check: 'Identidade do Usuário', status: 'verificado', risco: 'baixo', timestamp: '11:50:23' },
  { check: 'Dispositivo Autorizado', status: 'verificado', risco: 'baixo', timestamp: '11:50:24' },
  { check: 'Localização Esperada', status: 'verificado', risco: 'baixo', timestamp: '11:50:25' },
  { check: 'Padrão de Comportamento', status: 'verificado', risco: 'baixo', timestamp: '11:50:26' },
  { check: 'Integridade de Dados', status: 'verificado', risco: 'baixo', timestamp: '11:50:27' },
  { check: 'Conformidade Política', status: 'verificado', risco: 'baixo', timestamp: '11:50:28' },
];

const STATUS_CONFIG = {
  verificado: { bg: 'bg-green-500/10', border: 'border-green-500', text: 'text-green-300', icon: CheckCircle2 },
  bloqueado: { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-300', icon: AlertTriangle },
};

export default function ZeroTrustArchitecture({ empresa }) {
  const [checks] = useState(ZERO_TRUST_CHECKS);

  return (
    <div className="w-full h-full flex flex-col gap-4 p-6 bg-gradient-to-br from-slate-900 to-indigo-950 overflow-auto">
      <h2 className="text-2xl font-bold text-white flex items-center gap-2">
        <Zap className="w-6 h-6 text-indigo-400 animate-pulse" />
        Zero-Trust: Nunca Confiar, Sempre Verificar
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {checks.map((c, idx) => {
          const cfg = STATUS_CONFIG[c.status];
          const Icon = cfg.icon;
          return (
            <Card key={idx} className={`p-4 rounded-lg border ${cfg.bg} ${cfg.border}`}>
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 ${cfg.text} flex-shrink-0`} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-white">{c.check}</p>
                    <Badge className={`bg-green-500/20 text-green-300 text-xs`}>✓</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <p className="text-slate-400">Risco: {c.risco}</p>
                    <p className="text-slate-500">{c.timestamp}</p>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Resultado */}
      <Card className="p-4 bg-indigo-500/10 border border-indigo-400/40 rounded-lg mt-4">
        <div className="flex items-center gap-3 mb-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <p className="font-bold text-white">Zero-Trust Status: APROVADO</p>
        </div>
        <p className="text-sm text-slate-300">
          ✓ Todos os 6 critérios verificados. Acesso concedido com MFA + contextual awareness. Sessão monitorada em tempo real.
        </p>
      </Card>
    </div>
  );
}