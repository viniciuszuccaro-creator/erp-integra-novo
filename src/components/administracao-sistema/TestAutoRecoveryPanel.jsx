/**
 * TestAutoRecoveryPanel v1.0
 * Testes de auto-recovery com diferentes estratégias
 * Regra-Mãe: validação de resilência
 */
import { useState } from 'react';
import { Activity, TrendingUp, Play } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useAutoRecovery from '@/components/lib/useAutoRecovery';

const STRATEGIES = ['LINEAR', 'EXPONENTIAL', 'FIBONACCI'];

export default function TestAutoRecoveryPanel() {
  const [selectedStrategy, setSelectedStrategy] = useState('EXPONENTIAL');
  const [isCircuitOpen, setIsCircuitOpen] = useState(false);
  const [recoveryData, setRecoveryData] = useState(null);

  const { recoveryLogs, currentAttempt, maxAttempts } = useAutoRecovery(
    isCircuitOpen,
    'TestEntity',
    {
      strategy: selectedStrategy,
      maxAttempts: 5,
      onRecoverySuccess: () => {
        setRecoveryData({
          status: 'success',
          recoveredAt: new Date().toISOString(),
          attempts: currentAttempt,
        });
        setIsCircuitOpen(false);
      },
    }
  );

  const runRecoveryTest = async () => {
    setRecoveryData(null);
    setIsCircuitOpen(true);
  };

  const calculateDelays = () => {
    const delays = [];
    for (let i = 0; i < 5; i++) {
      let delay = 0;
      if (selectedStrategy === 'LINEAR') {
        delay = 1000 * (i + 1);
      } else if (selectedStrategy === 'EXPONENTIAL') {
        delay = 1000 * Math.pow(2, i);
      } else if (selectedStrategy === 'FIBONACCI') {
        const fib = [1, 1, 2, 3, 5, 8, 13];
        delay = 1000 * fib[Math.min(i, 6)];
      }
      delays.push(delay);
    }
    return delays;
  };

  const delays = calculateDelays();

  return (
    <div className="w-full space-y-4">
      <Card className="w-full p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-purple-600" />
          Teste de Auto-Recovery
        </h3>

        <div className="mb-4">
          <label className="text-sm font-semibold text-slate-700 block mb-2">Estratégia</label>
          <div className="flex gap-2">
            {STRATEGIES.map(strategy => (
              <Button
                key={strategy}
                onClick={() => setSelectedStrategy(strategy)}
                variant={selectedStrategy === strategy ? 'default' : 'outline'}
                className={selectedStrategy === strategy ? 'bg-purple-600' : ''}
              >
                {strategy}
              </Button>
            ))}
          </div>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-white border border-purple-100">
          <p className="text-sm font-semibold text-slate-700 mb-3">Timeline de Retry</p>
          <div className="space-y-1">
            {delays.map((delay, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span>Tentativa {i + 1}</span>
                <span className="font-mono text-slate-600">{(delay / 1000).toFixed(1)}s</span>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-slate-600 mb-2">Status: {isCircuitOpen ? '⏳ Recuperando...' : '✓ OK'}</p>
          {recoveryData && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200">
              <p className="text-sm font-semibold text-green-700">✅ Recuperado em {recoveryData.attempts} tentativa(s)</p>
            </div>
          )}
        </div>

        <Button
          onClick={runRecoveryTest}
          disabled={isCircuitOpen}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Play className="w-4 h-4 mr-2" />
          Simular Abertura de Circuit
        </Button>
      </Card>
    </div>
  );
}