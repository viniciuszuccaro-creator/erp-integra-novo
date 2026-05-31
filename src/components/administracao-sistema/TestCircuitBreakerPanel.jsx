/**
 * TestCircuitBreakerPanel v1.0
 * Painel visual para testar circuit breaker
 * Regra-Mãe: w-full, responsivo, intuitivo
 */
import { useState } from 'react';
import { Play, RotateCcw, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import useSimulate429s from '@/components/lib/useSimulate429s';
import useCounterWithNotification from '@/components/lib/useCounterWithNotification';

export default function TestCircuitBreakerPanel() {
  const { simulate429, getSimulationLog, clearSimulationLog, simulationCount } = useSimulate429s();
  const { circuitState } = useCounterWithNotification(['TestEntity']);
  const [testConfig, setTestConfig] = useState({
    errorCount: 5,
    delayBetweenErrors: 500,
  });

  const runTest = async () => {
    await simulate429({
      entityName: 'TestEntity',
      errorCount: testConfig.errorCount,
      delayBetweenErrors: testConfig.delayBetweenErrors,
      shouldTriggerCircuitBreaker: testConfig.errorCount >= 3,
    });
  };

  const stateColor = {
    CLOSED: 'text-green-600',
    OPEN: 'text-red-600',
    HALF_OPEN: 'text-amber-600',
  };

  return (
    <div className="w-full space-y-4">
      <Card className="w-full p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Teste do Circuit Breaker
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Quantidade de Erros</label>
            <input
              type="number"
              min="1"
              max="20"
              value={testConfig.errorCount}
              onChange={(e) => setTestConfig({ ...testConfig, errorCount: parseInt(e.target.value) })}
              className="w-full mt-2 px-3 py-2 border border-blue-200 rounded-lg"
            />
            <p className="text-xs text-slate-500 mt-1">
              {testConfig.errorCount >= 3 ? '✓ Vai ativar circuit breaker' : 'Sem ativar circuit'}
            </p>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-700">Delay Entre Erros (ms)</label>
            <input
              type="number"
              min="100"
              max="5000"
              step="100"
              value={testConfig.delayBetweenErrors}
              onChange={(e) => setTestConfig({ ...testConfig, delayBetweenErrors: parseInt(e.target.value) })}
              className="w-full mt-2 px-3 py-2 border border-blue-200 rounded-lg"
            />
          </div>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-white border border-blue-100">
          <p className="text-sm text-slate-600 mb-2">Estado do Circuit Breaker</p>
          <p className={`text-lg font-bold ${stateColor[circuitState] || 'text-slate-600'}`}>
            {circuitState || 'UNKNOWN'}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={runTest}
            className="bg-blue-600 hover:bg-blue-700 flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Executar Teste
          </Button>
          <Button
            onClick={clearSimulationLog}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Limpar Logs
          </Button>
        </div>

        {simulationCount > 0 && (
          <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
            <p className="text-sm font-semibold text-slate-700">
              {simulationCount} simulação(ões) executada(s)
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}