/**
 * ModuleHealthWidget v1.0
 * Componente reutilizável de saúde por módulo
 * Regra-Mãe: pequeno, focado, w-full, responsivo
 */
import { AlertCircle, TrendingUp, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import useCounterWithNotification from '@/components/lib/useCounterWithNotification';

export default function ModuleHealthWidget({ 
  moduleName = 'Módulo',
  entities = [],
  icon: Icon = Activity,
  color = 'blue'
}) {
  const { counts, circuitState, isProtected } = useCounterWithNotification(entities, {
    autoLoad: true,
    pollInterval: 60000, // 1 min
    enableAlerts: true
  });

  const total = Object.values(counts).reduce((a, b) => a + (b || 0), 0);
  const isHealthy = circuitState !== 'OPEN';
  
  const colors = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
  };

  return (
    <Card className={`w-full p-4 border ${colors[color]} flex items-center justify-between`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Icon className="w-5 h-5 shrink-0" />
          <h3 className="font-semibold text-sm">{moduleName}</h3>
          {!isHealthy && <AlertCircle className="w-4 h-4 text-destructive animate-pulse" />}
        </div>
        <p className="text-xs opacity-70">
          {total} registros {circuitState === 'OPEN' ? '(⏳ Recuperando)' : '✓'}
        </p>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold">{total}</div>
        {isProtected && <TrendingUp className="w-4 h-4 text-amber-600 ml-auto mt-1" />}
      </div>
    </Card>
  );
}