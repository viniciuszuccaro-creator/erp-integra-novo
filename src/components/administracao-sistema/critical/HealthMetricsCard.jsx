/**
 * HealthMetricsCard v1.0
 * Card reutilizável para métricas de saúde
 * Regra-Mãe: componentes pequenos e focados
 */
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function HealthMetricsCard({
  title,
  value,
  icon,
  trend,
  color = 'text-slate-600'
}) {
  const isTrendPositive = trend?.startsWith('+');

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className={`p-2 rounded-lg ${color} bg-opacity-10`}>
            {React.cloneElement(icon, { className: `w-5 h-5 ${color}` })}
          </span>
          {trend && (
            <div className={`flex items-center gap-1 text-sm font-semibold ${
              isTrendPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {isTrendPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {trend}
            </div>
          )}
        </div>
        <p className="text-sm text-slate-600 mb-1">{title}</p>
        <p className={`text-2xl font-bold ${color}`}>
          {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
        </p>
      </CardContent>
    </Card>
  );
}